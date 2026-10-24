import { prisma } from "@/lib/prisma";
import { requireUserSession } from "@/lib/auth/session";
import { jsonError, jsonOk } from "@/lib/api-utils";

export async function POST(request: Request) {
  const me = await requireUserSession();
  if (!me) return jsonError("Unauthorized", 401);

  const body = (await request.json()) as { toUserId?: string };
  const toUserId = body.toUserId?.trim();
  if (!toUserId || toUserId === me.id) return jsonError("Choose another person", 400);

  const existing = await prisma.friendRequest.findFirst({
    where: {
      OR: [
        { fromId: me.id, toId: toUserId },
        { fromId: toUserId, toId: me.id },
      ],
    },
  });
  if (existing?.status === "accepted") return jsonOk({ ok: true });
  if (existing?.status === "pending") return jsonOk({ ok: true });

  if (existing) {
    await prisma.friendRequest.update({
      where: { id: existing.id },
      data: { fromId: me.id, toId: toUserId, status: "pending" },
    });
  } else {
    await prisma.friendRequest.create({ data: { fromId: me.id, toId: toUserId } });
  }

  const { notifyUser } = await import("@/lib/notifications");
  await notifyUser({
    userId: toUserId,
    type: "new_follower",
    title: "Friend request",
    message: `${me.name} wants to connect on Vibra`,
    link: "/social/requests",
  });

  return jsonOk({ ok: true });
}
