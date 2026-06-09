import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";
import { setAuthCookie } from "@/lib/auth/cookies";
import { jsonError, jsonOk, parseBody } from "@/lib/api-utils";

function serializeUser(user: {
  id: string;
  name: string;
  email: string;
  username: string | null;
  avatarUrl: string | null;
  bio: string | null;
  tier: string;
  createdAt: Date;
}) {
  return {
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
  };
}

export async function POST(request: Request) {
  const body = await parseBody<{ email?: string; password?: string }>(request);
  if (!body?.email?.trim() || !body?.password) {
    return jsonError("Invalid credentials", 401);
  }

  const email = body.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
    return jsonError("Invalid credentials", 401);
  }

  const token = await signToken({ sub: user.id, email: user.email, aud: "user" });
  await setAuthCookie("user", token);

  return jsonOk({ user: serializeUser(user) });
}
