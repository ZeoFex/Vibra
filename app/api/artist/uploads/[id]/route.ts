import { prisma } from "@/lib/prisma";
import { requireArtistSession } from "@/lib/auth/session";
import { jsonError, jsonOk, parseBody } from "@/lib/api-utils";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const artist = await requireArtistSession();
  if (!artist) return jsonError("Unauthorized", 401);

  const { id } = await params;
  const body = await parseBody<{ lyrics?: string }>(request);

  const existing = await prisma.artistUpload.findFirst({
    where: { id, artistId: artist.id },
  });
  if (!existing) return jsonError("Upload not found", 404);

  const upload = await prisma.artistUpload.update({
    where: { id },
    data: { lyrics: body?.lyrics?.trim() || null },
  });

  return jsonOk({
    upload: {
      id: upload.id,
      lyrics: upload.lyrics ?? "",
    },
  });
}
