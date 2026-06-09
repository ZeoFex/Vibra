import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";
import { setAuthCookie } from "@/lib/auth/cookies";
import { jsonError, jsonOk, parseBody } from "@/lib/api-utils";

function serializeAdmin(admin: {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string | null;
  lastLogin: Date | null;
}) {
  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    avatar: admin.avatarUrl ?? "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    role: admin.role,
    lastLogin: admin.lastLogin?.toISOString() ?? new Date().toISOString(),
  };
}

export async function POST(request: Request) {
  const body = await parseBody<{ email?: string; password?: string }>(request);
  if (!body?.email?.trim() || !body?.password) {
    return jsonError("Invalid credentials", 401);
  }

  const email = body.email.trim().toLowerCase();
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin || !(await verifyPassword(body.password, admin.passwordHash))) {
    return jsonError("Invalid credentials", 401);
  }

  await prisma.admin.update({
    where: { id: admin.id },
    data: { lastLogin: new Date() },
  });

  const token = await signToken({
    sub: admin.id,
    email: admin.email,
    role: admin.role,
    aud: "admin",
  });
  await setAuthCookie("admin", token);

  return jsonOk({ admin: serializeAdmin({ ...admin, lastLogin: new Date() }) });
}
