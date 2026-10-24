import { prisma } from "@/lib/prisma";
import { requireUserSession } from "@/lib/auth/session";
import { jsonError, jsonOk } from "@/lib/api-utils";
import { notifyUser } from "@/lib/notifications";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const me = await requireUserSession();
  if (!me) return jsonError("Unauthorized", 401);
  const { id } = await context.params;
  const request = await prisma.friendRequest.findUnique({ where: { id } });
  if (!request || request.toId !== me.id) return jsonError("Request not found", 404);
  await prisma.friendRequest.update({ where: { id }, data: { status: "accepted" } });
  await notifyUser({
    userId: request.fromId,
    type: "new_follower",
    title: "Request accepted",
    message: `${me.name} accepted your friend request`,
    link: "/social",
  });
  return jsonOk({ ok: true });
}
