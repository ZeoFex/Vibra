import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { getPasswordValidationError } from "@/lib/auth/password-requirements";
import { signToken } from "@/lib/auth/jwt";
import { setAuthCookie } from "@/lib/auth/cookies";
import { jsonError, jsonOk, parseBody } from "@/lib/api-utils";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop";

export async function POST(request: Request) {
  const body = await parseBody<{ name?: string; email?: string; password?: string; avatarUrl?: string }>(request);
  if (!body?.name?.trim() || !body?.email?.trim() || !body?.password) {
    return jsonError("Name, email, and password are required");
  }

  const passwordError = getPasswordValidationError(body.password);
  if (passwordError) {
    return jsonError(passwordError);
  }

  const email = body.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return jsonError("An account with this email already exists", 409);

  const passwordHash = await hashPassword(body.password);
  const user = await prisma.user.create({
    data: {
      name: body.name.trim(),
      email,
      passwordHash,
      username: email.split("@")[0] + "-" + Date.now().toString(36).slice(-4),
      avatarUrl: body.avatarUrl?.trim() || DEFAULT_AVATAR,
    },
  });

  const token = await signToken({ sub: user.id, email: user.email, aud: "user" });
  await setAuthCookie("user", token);

  return jsonOk({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      avatar: user.avatarUrl ?? DEFAULT_AVATAR,
      bio: user.bio,
      tier: user.tier,
      followers: 0,
      following: 0,
      createdAt: user.createdAt.toISOString().slice(0, 10),
    },
  });
}
