import { prisma } from "@/lib/prisma";
import { requireUserSession } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { passwordRequirements } from "@/lib/auth/password-requirements";
import { jsonError, jsonOk } from "@/lib/api-utils";
import type { UserPreferences } from "@/types";

const defaults: UserPreferences = {
  emailNotifications: true,
  newMusic: true,
  friendActivity: true,
  privateProfile: false,
  explicitContent: true,
  autoplay: true,
  highQuality: false,
};

function preferencesOf(value: unknown): UserPreferences {
  const stored = value && typeof value === "object" ? (value as Partial<UserPreferences>) : {};
  return { ...defaults, ...stored };
}

export function publicUser(user: {
  id: string;
  name: string;
  email: string;
  username: string | null;
  avatarUrl: string | null;
  bio: string | null;
  tier: string;
  createdAt: Date;
  preferences: unknown;
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
    preferences: preferencesOf(user.preferences),
  };
}

export async function PATCH(request: Request) {
  const me = await requireUserSession();
  if (!me) return jsonError("Unauthorized", 401);
  const body = (await request.json()) as {
    name?: string;
    bio?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
    preferences?: Partial<UserPreferences>;
  };

  const data: {
    name?: string;
    bio?: string | null;
    email?: string;
    passwordHash?: string;
    preferences?: Record<string, boolean>;
  } = {};

  if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim();
  if (typeof body.bio === "string") data.bio = body.bio.trim() || null;

  const changingSecret = Boolean(body.email?.trim() && body.email.trim().toLowerCase() !== me.email) || Boolean(body.newPassword);
  if (changingSecret) {
    if (!body.currentPassword || !(await verifyPassword(body.currentPassword, me.passwordHash))) {
      return jsonError("Current password is incorrect", 400);
    }
  }

  if (body.email?.trim()) {
    const email = body.email.trim().toLowerCase();
    if (!email.includes("@")) return jsonError("Enter a valid email", 400);
    const taken = await prisma.user.findFirst({ where: { email, NOT: { id: me.id } } });
    if (taken) return jsonError("That email is already in use", 409);
    data.email = email;
  }

  if (body.newPassword) {
    const failed = passwordRequirements.find((rule) => !rule.test(body.newPassword!));
    if (failed) return jsonError(failed.label, 400);
    data.passwordHash = await hashPassword(body.newPassword);
  }

  if (body.preferences) {
    data.preferences = { ...preferencesOf(me.preferences), ...body.preferences } as Record<string, boolean>;
  }

  const updated = await prisma.user.update({
    where: { id: me.id },
    data: {
      ...data,
      preferences: data.preferences,
    },
  });
  return jsonOk({ user: publicUser(updated) });
}
