import type { ArtistUpload, Song } from "@/types";

export function uploadToSong(upload: ArtistUpload): Song {
  return {
    id: upload.id,
    title: upload.title,
    artistId: `artist-${upload.uploadedBy}`,
    artistName: upload.artistName,
    albumId: `album-${upload.id}`,
    albumTitle: upload.albumTitle,
    cover: upload.cover,
    duration: upload.duration,
    genre: upload.genre,
    plays: 0,
    releaseDate: upload.releaseDate,
    audioUrl: upload.audioFileName,
  };
}

export function getPublishedSongs(uploads: ArtistUpload[]): Song[] {
  return uploads
    .filter((u) => u.status === "published")
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .map(uploadToSong);
}
