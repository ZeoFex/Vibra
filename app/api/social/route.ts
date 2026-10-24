import { prisma } from "@/lib/prisma";
import { requireUserSession } from "@/lib/auth/session";
import { jsonError, jsonOk } from "@/lib/api-utils";
import { toSocialProfile } from "@/lib/social/profile";

export async function GET() {
  const me = await requireUserSession();
  if (!me) return jsonError("Unauthorized", 401);

  const [requests, users] = await Promise.all([
    prisma.friendRequest.findMany({
      where: { OR: [{ fromId: me.id }, { toId: me.id }] },
      include: { from: true, to: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      where: { id: { not: me.id } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  const friends = requests
    .filter((request) => request.status === "accepted")
    .map((request) => toSocialProfile(request.fromId === me.id ? request.to : request.from));

  const incoming = requests
    .filter((request) => request.toId === me.id)
    .map((request) => ({
      id: request.id,
      from: toSocialProfile(request.from),
      toUserId: request.toId,
      status: request.status,
      createdAt: request.createdAt.toISOString(),
    }));

  return jsonOk({
    friends,
    incoming,
    people: users.map(toSocialProfile),
    sentIds: requests.filter((request) => request.fromId === me.id && request.status === "pending").map((request) => request.toId),
  });
}
