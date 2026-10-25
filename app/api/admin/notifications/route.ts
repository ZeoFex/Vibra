import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth/session";
import { jsonError, jsonOk, parseBody } from "@/lib/api-utils";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireAdminSession();
  if (!admin) return jsonError("Unauthorized", 401);

  const notes = await prisma.appNotification.findMany({
    orderBy: { createdAt: "desc" },
    take: 40,
    include: { user: { select: { name: true, tier: true } } },
  });

  return jsonOk({
    notifications: notes.map((note) => ({
      id: note.id,
      title: note.title,
      message: note.message,
      audience: note.user.tier,
      recipient: note.user.name,
      status: note.read ? "read" : "sent",
      sentAt: note.createdAt.toISOString(),
    })),
  });
}

export async function POST(request: Request) {
  const admin = await requireAdminSession();
  if (!admin) return jsonError("Unauthorized", 401);
  const body = await parseBody<{ title?: string; message?: string; audience?: string }>(request);
  const title = body?.title?.trim();
  const message = body?.message?.trim();
  if (!title || !message) return jsonError("Title and message are required");

  const audience = body?.audience ?? "all";
  if (audience === "artists") return jsonError("Artist accounts do not have an in-app notification inbox yet");

  const users = await prisma.user.findMany({
    where: audience === "premium" || audience === "free" ? { tier: audience } : undefined,
    select: { id: true },
  });
  if (users.length === 0) return jsonError("No listeners match that audience");

  await prisma.appNotification.createMany({
    data: users.map((user) => ({
      userId: user.id,
      type: "platform_update",
      title,
      message,
    })),
  });

  return jsonOk({ sent: users.length });
}
