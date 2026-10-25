import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth/session";
import { jsonError, jsonOk } from "@/lib/api-utils";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireAdminSession();
  if (!admin) return jsonError("Unauthorized", 401);

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { listens: { select: { updatedAt: true } } },
  });

  return jsonOk({
    users: users.map((user) => {
      const last = user.listens.reduce<Date | null>((latest, listen) => {
        if (!latest || listen.updatedAt > latest) return listen.updatedAt;
        return latest;
      }, null);
      return {
        id: user.id,
        name: user.name,
        username: user.username || user.email.split("@")[0],
        email: user.email,
        avatar: user.avatarUrl || "",
        tier: user.tier,
        status: "active" as const,
        playlists: 0,
        lastActive: (last ?? user.updatedAt).toISOString().slice(0, 10),
      };
    }),
  });
}
