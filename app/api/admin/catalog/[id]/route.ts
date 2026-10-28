import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth/session";
import { jsonError, jsonOk, parseBody } from "@/lib/api-utils";
import { hasPermission } from "@/types/admin";

export const runtime = "nodejs";

async function allowed() {
  const admin = await requireAdminSession();
  if (!admin || !hasPermission(admin.role, "music-review")) return null;
  return admin;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await allowed())) return jsonError("Unauthorized", 401);
  const { id } = await params;
  const body = await parseBody<{
    title?: string;
    artistName?: string;
    albumTitle?: string;
    songwriters?: string;
    genre?: string;
    scope?: "song" | "album";
  }>(request);
  if (!body) return jsonError("Missing update");

  const current = await prisma.artistUpload.findUnique({ where: { id } });
  if (!current) return jsonError("Upload not found", 404);

  const data = {
    ...(body.title?.trim() ? { title: body.title.trim() } : {}),
    ...(body.artistName?.trim() ? { artistName: body.artistName.trim() } : {}),
    ...(body.albumTitle?.trim() ? { albumTitle: body.albumTitle.trim() } : {}),
    ...(body.genre?.trim() ? { genre: body.genre.trim() } : {}),
    songwriters: body.songwriters?.trim() || null,
  };

  if (body.scope === "album" && current.albumGroupId) {
    await prisma.artistUpload.updateMany({
      where: { albumGroupId: current.albumGroupId },
      data: {
        artistName: data.artistName ?? current.artistName,
        albumTitle: data.albumTitle ?? current.albumTitle,
        genre: data.genre ?? current.genre,
      },
    });
    if (body.title?.trim() || body.songwriters !== undefined) {
      await prisma.artistUpload.update({ where: { id }, data: { title: data.title ?? current.title, songwriters: data.songwriters } });
    }
  } else {
    await prisma.artistUpload.update({ where: { id }, data });
  }

  return jsonOk({ ok: true });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await allowed())) return jsonError("Unauthorized", 401);
  const { id } = await params;
  const scope = new URL(request.url).searchParams.get("scope");
  const current = await prisma.artistUpload.findUnique({ where: { id } });
  if (!current) return jsonError("Upload not found", 404);

  if (scope === "album" && current.albumGroupId) {
    await prisma.artistUpload.deleteMany({ where: { albumGroupId: current.albumGroupId } });
  } else {
    await prisma.artistUpload.delete({ where: { id } });
  }
  return jsonOk({ ok: true });
}
