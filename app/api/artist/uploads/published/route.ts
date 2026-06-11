import { prisma } from "@/lib/prisma";
import { jsonOk } from "@/lib/api-utils";
import { buildAlbumsAndSingles } from "@/lib/album-utils";

export async function GET() {
  const uploads = await prisma.artistUpload.findMany({
    where: { status: "published" },
    orderBy: [{ albumGroupId: "asc" }, { trackNumber: "asc" }, { submittedAt: "desc" }],
    take: 200,
  });

  const sources = uploads.map((u) => ({
    id: u.id,
    artistId: u.artistId,
    artistName: u.artistName,
    albumTitle: u.albumTitle,
    releaseType: u.releaseType,
    albumGroupId: u.albumGroupId,
    trackNumber: u.trackNumber,
    genre: u.genre,
    cover: u.coverUrl,
    releaseDate: u.releaseDate.toISOString().slice(0, 10),
    title: u.title,
  }));

  const { albums, singles, songs } = buildAlbumsAndSingles(sources);

  const songsWithDuration = songs.map((song) => {
    const upload = uploads.find((u) => u.id === song.id);
    return {
      ...song,
      duration: upload?.duration ?? 180,
      audioUrl: upload?.audioFileName,
    };
  });

  return jsonOk({ songs: songsWithDuration, albums, singles: songsWithDuration.filter((s) => singles.some((x) => x.id === s.id)) });
}
