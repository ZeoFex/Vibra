import { prisma } from "@/lib/prisma";
import { requireUserSession } from "@/lib/auth/session";
import { jsonError, jsonOk } from "@/lib/api-utils";
import { toSocialProfile } from "@/lib/social/profile";
import { notifyUser } from "@/lib/notifications";
import type { ChatMessage } from "@/types";

function toMessage(message: {
  id: string;
  content: string;
  createdAt: Date;
  sender: { id: string; name: string; username: string | null; email: string; avatarUrl: string | null };
}): ChatMessage {
  const sender = toSocialProfile(message.sender);
  return {
    id: message.id,
    senderId: sender.id,
    senderName: sender.name,
    senderAvatar: sender.avatar,
    senderUsername: sender.username,
    content: message.content,
    createdAt: message.createdAt.toISOString(),
  };
}

export async function GET() {
  const me = await requireUserSession();
  if (!me) return jsonError("Unauthorized", 401);

  const [direct, community] = await Promise.all([
    prisma.directMessage.findMany({
      where: { OR: [{ senderId: me.id }, { recipientId: me.id }] },
      include: { sender: true },
      orderBy: { createdAt: "asc" },
      take: 400,
    }),
    prisma.communityMessage.findMany({
      include: { sender: true },
      orderBy: { createdAt: "asc" },
      take: 200,
    }),
  ]);

  const threads: Record<string, ChatMessage[]> = {};
  for (const message of direct) {
    const otherId = message.senderId === me.id ? message.recipientId : message.senderId;
    threads[otherId] = [...(threads[otherId] ?? []), toMessage(message)];
  }

  return jsonOk({ threads, community: community.map(toMessage) });
}

export async function POST(request: Request) {
  const me = await requireUserSession();
  if (!me) return jsonError("Unauthorized", 401);
  const body = (await request.json()) as { toUserId?: string; content?: string; community?: boolean };
  const content = body.content?.trim() ?? "";
  if (!content) return jsonError("Write a message", 400);

  if (body.community) {
    await prisma.communityMessage.create({ data: { senderId: me.id, content } });
    return jsonOk({ ok: true });
  }

  const toUserId = body.toUserId?.trim();
  if (!toUserId) return jsonError("Choose a friend", 400);
  const friendship = await prisma.friendRequest.findFirst({
    where: {
      status: "accepted",
      OR: [
        { fromId: me.id, toId: toUserId },
        { fromId: toUserId, toId: me.id },
      ],
    },
  });
  if (!friendship) return jsonError("You can message friends only", 403);
  await prisma.directMessage.create({ data: { senderId: me.id, recipientId: toUserId, content } });
  await notifyUser({
    userId: toUserId,
    type: "system",
    title: "New message",
    message: `${me.name}: ${content.slice(0, 80)}`,
    link: `/social/messages/${me.id}`,
  });
  return jsonOk({ ok: true });
}
