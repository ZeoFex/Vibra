import { prisma } from "@/lib/prisma";
import { jsonOk } from "@/lib/api-utils";

export async function GET() {
  const uploads = await prisma.artistUpload.findMany({
    where: { status: "published" },
    orderBy: { submittedAt: "desc" },
    take: 50,
  });

  const songs = uploads.map((u) => ({
    id: u.id,
    title: u.title,
    artistId: u.artistId,
    artistName: u.artistName,
    albumId: `album-${u.id}`,
    albumTitle: u.albumTitle,
    cover: u.coverUrl,
    duration: u.duration,
    genre: u.genre,
    plays: 0,
    releaseDate: u.releaseDate.toISOString().slice(0, 10),
    audioUrl: u.audioFileName,
  }));

  return jsonOk({ songs });
}
