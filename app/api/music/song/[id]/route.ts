import { audiusBase, toSong } from "@/lib/audius";
import { toJamendoSong } from "@/lib/jamendo";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api-utils";
import { getUploadAudioPath } from "@/lib/audio/constants";
import type { Song } from "@/types";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;

  if (id.startsWith("au-") && !id.startsWith("au-pl-") && !id.startsWith("au-album-")) {
    const trackId = id.slice(3);
    const response = await fetch(`${audiusBase()}/tracks/${encodeURIComponent(trackId)}`, { cache: "no-store" });
    if (!response.ok) return jsonError("Song not found", 404);
    const body = (await response.json()) as { data?: Parameters<typeof toSong>[0] };
    const song = body.data ? toSong(body.data) : null;
    if (!song) return jsonError("Song not found", 404);
    return jsonOk({ song });
  }

  if (id.startsWith("jm-") && !id.startsWith("jm-al-")) {
    const trackId = id.slice(3);
    const clientId = process.env.JAMENDO_CLIENT_ID?.trim();
    if (!clientId) return jsonError("Song not found", 404);
    const query = new URLSearchParams({ client_id: clientId, format: "json", id: trackId, audioformat: "mp32" });
    const response = await fetch(`https://api.jamendo.com/v3.0/tracks/?${query}`, { cache: "no-store" });
    if (!response.ok) return jsonError("Song not found", 404);
    const body = (await response.json()) as { results?: Parameters<typeof toJamendoSong>[0][] };
    const song = body.results?.[0] ? toJamendoSong(body.results[0]) : null;
    if (!song) return jsonError("Song not found", 404);
    return jsonOk({ song });
  }

  const upload = await prisma.artistUpload.findFirst({
    where: { id, status: "published" },
    include: { audio: { select: { uploadId: true } } },
  });
  if (!upload) return jsonError("Song not found", 404);
  const song: Song = {
    id: upload.id,
    title: upload.title,
    artistId: upload.artistId,
    artistName: upload.artistName,
    albumId: upload.albumGroupId || upload.id,
    albumTitle: upload.albumTitle,
    cover: upload.coverUrl,
    duration: upload.duration,
    genre: upload.genre,
    plays: 0,
    releaseDate: upload.releaseDate.toISOString().slice(0, 10),
    audioUrl: upload.audioUrl ?? (upload.audio ? getUploadAudioPath(upload.id) : undefined),
  };
  return jsonOk({ song });
}
