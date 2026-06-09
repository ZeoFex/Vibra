import { prisma } from "@/lib/prisma";
import { getAuthToken } from "./cookies";
import { verifyToken, type TokenAudience } from "./jwt";

export async function getSession(audience: TokenAudience) {
  const token = await getAuthToken(audience);
  if (!token) return null;
  const payload = await verifyToken(token, audience);
  if (!payload) return null;

  if (audience === "user") {
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    return user ? { type: "user" as const, user } : null;
  }

  if (audience === "admin") {
    const admin = await prisma.admin.findUnique({ where: { id: payload.sub } });
    return admin ? { type: "admin" as const, admin } : null;
  }

  const artist = await prisma.artist.findUnique({ where: { id: payload.sub } });
  return artist ? { type: "artist" as const, artist } : null;
}

export async function requireAdminSession() {
  const session = await getSession("admin");
  if (!session || session.type !== "admin") return null;
  return session.admin;
}

export async function requireSuperAdmin() {
  const admin = await requireAdminSession();
  if (!admin || admin.role !== "super_admin") return null;
  return admin;
}

export async function requireArtistSession() {
  const session = await getSession("artist");
  if (!session || session.type !== "artist") return null;
  return session.artist;
}

export async function requireUserSession() {
  const session = await getSession("user");
  if (!session || session.type !== "user") return null;
  return session.user;
}
