import type { ArtistUpload, Song } from "@/types";
import { buildAlbumsAndSingles, uploadToSong, type UploadAlbumSource } from "@/lib/album-utils";

function toUploadSource(upload: ArtistUpload): UploadAlbumSource {
  return {
    id: upload.id,
    artistId: upload.uploadedBy,
    artistName: upload.artistName,
    albumTitle: upload.albumTitle,
    releaseType: upload.releaseType,
    albumGroupId: upload.albumGroupId,
    trackNumber: upload.trackNumber,
    genre: upload.genre,
    cover: upload.cover,
    releaseDate: upload.releaseDate,
    title: upload.title,
  };
}

export function uploadToSongFromArtistUpload(upload: ArtistUpload): Song {
  const song = uploadToSong(toUploadSource(upload));
  return {
    ...song,
    duration: upload.duration,
    audioUrl: upload.audioFileName,
  };
}

export function getPublishedCatalog(uploads: ArtistUpload[]) {
  const published = uploads
    .filter((u) => u.status === "published")
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  const sources = published.map(toUploadSource);
  const { albums, singles, songs } = buildAlbumsAndSingles(sources);

  const songsWithMeta = published.map(uploadToSongFromArtistUpload);

  return { albums, singles: songsWithMeta.filter((s) => singles.some((x) => x.id === s.id)), songs: songsWithMeta };
}

export function getPublishedSongs(uploads: ArtistUpload[]): Song[] {
  return getPublishedCatalog(uploads).songs;
}

// Backwards-compatible export used by artist-upload-context
export { uploadToSongFromArtistUpload as uploadToSong };
