import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { requireSuperAdmin } from "@/lib/auth/session";
import { jsonError, jsonOk, parseBody } from "@/lib/api-utils";
import type { AdminRole } from "@/types/admin";

const ALLOWED_ROLES: AdminRole[] = [
  "verification_manager",
  "content_manager",
  "support_admin",
  "finance_admin",
];

function serializeAdmin(admin: {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string | null;
  lastLogin: Date | null;
  createdAt: Date;
}) {
  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    avatar: admin.avatarUrl ?? "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    role: admin.role,
    lastLogin: admin.lastLogin?.toISOString() ?? admin.createdAt.toISOString(),
  };
}

export async function GET() {
  const superAdmin = await requireSuperAdmin();
  if (!superAdmin) return jsonError("Forbidden", 403);

  const admins = await prisma.admin.findMany({
    where: { role: { not: "super_admin" } },
    orderBy: { createdAt: "desc" },
  });

  return jsonOk({ admins: admins.map(serializeAdmin) });
}

export async function POST(request: Request) {
  const superAdmin = await requireSuperAdmin();
  if (!superAdmin) return jsonError("Forbidden", 403);

  const body = await parseBody<{
    name?: string;
    email?: string;
    password?: string;
    role?: AdminRole;
  }>(request);

  if (!body?.name?.trim() || !body?.email?.trim() || !body?.password || !body?.role) {
    return jsonError("Name, email, password, and role are required");
  }

  if (!ALLOWED_ROLES.includes(body.role)) {
    return jsonError("Invalid role for sub-admin");
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
      role: body.role,
      createdById: superAdmin.id,
    },
  });

  return jsonOk({ admin: serializeAdmin(admin) }, 201);
}
