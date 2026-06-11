import type { Album, Song } from "@/types";

export const ARTIST_ALBUM_ID_PREFIX = "artist-album-";

export interface UploadAlbumSource {
  id: string;
  artistId: string;
  artistName: string;
  albumTitle: string;
  releaseType?: string | null;
  albumGroupId?: string | null;
  trackNumber?: number | null;
  genre: string;
  cover: string;
  releaseDate: string;
  title: string;
}

function normalizeReleaseType(value?: string | null): Album["type"] {
  const normalized = (value ?? "album").toLowerCase();
  if (normalized === "single" || normalized === "ep") return normalized;
  if (normalized === "album") return "album";
  return "album";
}

function stripReleasePrefix(albumTitle: string): string {
  const match = albumTitle.match(/^(Single|Album|EP|Mixtape|Compilation|Live Album|Remix):\s*(.+)$/i);
  return match ? match[2].trim() : albumTitle.trim();
}

function groupKey(upload: UploadAlbumSource): string {
  if (upload.albumGroupId) return upload.albumGroupId;
  return `legacy:${upload.artistId}:${upload.albumTitle}`;
}

export function uploadToSong(upload: UploadAlbumSource): Song {
  const albumId = upload.albumGroupId
    ? `${ARTIST_ALBUM_ID_PREFIX}${upload.albumGroupId}`
    : `album-${upload.id}`;

  return {
    id: upload.id,
    title: upload.title,
    artistId: upload.artistId,
    artistName: upload.artistName,
    albumId,
    albumTitle: stripReleasePrefix(upload.albumTitle),
    cover: upload.cover,
    duration: 180,
    genre: upload.genre,
    plays: 0,
    releaseDate: upload.releaseDate,
    trackNumber: upload.trackNumber ?? undefined,
    audioUrl: undefined,
  };
}

export function buildAlbumsAndSingles(
  uploads: UploadAlbumSource[]
): { albums: Album[]; singles: Song[]; songs: Song[] } {
  const songs = uploads.map(uploadToSong);
  const groups = new Map<string, UploadAlbumSource[]>();

  for (const upload of uploads) {
    const type = upload.releaseType ?? (upload.albumTitle.startsWith("Single:") ? "single" : "album");
    if (type === "single") continue;

    const key = groupKey(upload);
    const list = groups.get(key) ?? [];
    list.push(upload);
    groups.set(key, list);
  }

  const albums: Album[] = [];
  const singles: Song[] = songs.filter((song) => {
    const upload = uploads.find((u) => u.id === song.id);
    const type = upload?.releaseType ?? (upload?.albumTitle.startsWith("Single:") ? "single" : "album");
    return type === "single";
  });

  for (const [key, groupUploads] of groups) {
    const sorted = [...groupUploads].sort(
      (a, b) => (a.trackNumber ?? 999) - (b.trackNumber ?? 999)
    );
    const first = sorted[0];
    const albumGroupId = first.albumGroupId ?? key.replace("legacy:", "");
    const albumId = `${ARTIST_ALBUM_ID_PREFIX}${albumGroupId}`;

    albums.push({
      id: albumId,
      title: stripReleasePrefix(first.albumTitle),
      artistId: first.artistId,
      artistName: first.artistName,
      cover: first.cover,
      releaseDate: first.releaseDate,
      genre: first.genre,
      trackCount: sorted.length,
      type: normalizeReleaseType(first.releaseType),
    });
  }

  albums.sort(
    (a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
  );

  return { albums, singles, songs };
}

export function getSongsForAlbum(albumId: string, songs: Song[]): Song[] {
  return songs
    .filter((song) => song.albumId === albumId)
    .sort((a, b) => (a.trackNumber ?? 999) - (b.trackNumber ?? 999));
}
