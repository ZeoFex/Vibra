import { requireAdminSession } from "@/lib/auth/session";
import { jsonError, jsonOk } from "@/lib/api-utils";

export async function GET() {
  const admin = await requireAdminSession();
  if (!admin) return jsonError("Unauthorized", 401);

  return jsonOk({
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      avatar: admin.avatarUrl ?? "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
      role: admin.role,
      lastLogin: admin.lastLogin?.toISOString() ?? new Date().toISOString(),
    },
  });
}
