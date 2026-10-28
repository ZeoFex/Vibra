import { prisma } from "@/lib/prisma";
import { buildAlbumsAndSingles } from "@/lib/album-utils";
import { getUploadAudioPath } from "@/lib/audio/constants";
import type { Album, Artist, Song } from "@/types";

export async function loadPublishedCatalog(): Promise<{ songs: Song[]; albums: Album[]; artists: Artist[] }> {
  const uploads = await prisma.artistUpload.findMany({
    where: { status: "published" },
    orderBy: { submittedAt: "desc" },
    take: 300,
  });

  const sources = uploads.map((upload) => ({
    id: upload.id,
    artistId: upload.artistId,
    artistName: upload.artistName,
    albumTitle: upload.albumTitle,
    releaseType: upload.releaseType,
    albumGroupId: upload.albumGroupId,
    trackNumber: upload.trackNumber,
    genre: upload.genre,
    cover: upload.coverUrl,
    releaseDate: upload.releaseDate.toISOString().slice(0, 10),
    title: upload.title,
  }));

  const { albums, songs } = buildAlbumsAndSingles(sources);
  const byId = new Map(uploads.map((upload) => [upload.id, upload]));
  const songsWithAudio = songs.map((song) => {
    const upload = byId.get(song.id);
    return {
      ...song,
      duration: upload?.duration ?? song.duration,
      audioUrl: upload?.audioUrl || (upload ? getUploadAudioPath(upload.id) : undefined),
      producers: upload?.producers,
      songwriters: upload?.songwriters ?? undefined,
    };
  });

  const artists = new Map<string, Artist>();
  for (const song of songsWithAudio) {
    if (artists.has(song.artistName)) continue;
    artists.set(song.artistName, {
      id: `upload-artist-${encodeURIComponent(song.artistName)}`,
      name: song.artistName,
      image: song.cover,
      bio: "",
      monthlyListeners: 0,
      genres: song.genre ? [song.genre] : [],
      verified: true,
    });
  }

  return { songs: songsWithAudio, albums, artists: [...artists.values()] };
}
