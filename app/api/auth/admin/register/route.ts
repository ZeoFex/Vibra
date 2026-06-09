import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
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
  if (process.env.ADMIN_OPEN_REGISTRATION !== "true") {
    return jsonError("Admin registration is disabled", 403);
  }

  const superAdminExists = await prisma.admin.findFirst({
    where: { role: "super_admin" },
  });
  if (superAdminExists) {
    return jsonError("Super admin already exists. Contact an existing super admin.", 403);
  }

  const body = await parseBody<{ name?: string; email?: string; password?: string }>(request);
  if (!body?.name?.trim() || !body?.email?.trim() || !body?.password) {
    return jsonError("Name, email, and password are required");
  }

  if (body.password.length < 8) {
    return jsonError("Password must be at least 8 characters");
  }

  const email = body.email.trim().toLowerCase();
  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) return jsonError("An admin with this email already exists", 409);

  const passwordHash = await hashPassword(body.password);
  const admin = await prisma.admin.create({
    data: {
      name: body.name.trim(),
      email,
      passwordHash,
      role: "super_admin",
      lastLogin: new Date(),
    },
  });

  const token = await signToken({
    sub: admin.id,
    email: admin.email,
    role: admin.role,
    aud: "admin",
  });
  await setAuthCookie("admin", token);

  return jsonOk({ admin: serializeAdmin(admin) });
}
