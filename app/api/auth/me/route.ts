import { requireUserSession } from "@/lib/auth/session";
import { jsonError, jsonOk } from "@/lib/api-utils";

export async function GET() {
  const user = await requireUserSession();
  if (!user) return jsonError("Unauthorized", 401);

  return jsonOk({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username ?? user.email.split("@")[0],
      avatar: user.avatarUrl ?? "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop",
      bio: user.bio ?? undefined,
      tier: user.tier,
      followers: 0,
      following: 0,
      createdAt: user.createdAt.toISOString().slice(0, 10),
    },
  });
}
