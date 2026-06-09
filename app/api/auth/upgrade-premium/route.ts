import { prisma } from "@/lib/prisma";
import { requireUserSession } from "@/lib/auth/session";
import { jsonError, jsonOk } from "@/lib/api-utils";

export async function POST() {
  const user = await requireUserSession();
  if (!user) return jsonError("Unauthorized", 401);

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { tier: "premium" },
  });

  return jsonOk({
    user: {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      username: updated.username ?? updated.email.split("@")[0],
      avatar: updated.avatarUrl ?? "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop",
      bio: updated.bio ?? undefined,
      tier: updated.tier,
      followers: 0,
      following: 0,
      createdAt: updated.createdAt.toISOString().slice(0, 10),
    },
    message: "Premium activated (payment integration coming soon)",
  });
}
