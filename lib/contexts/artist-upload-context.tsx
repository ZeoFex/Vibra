"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Album, ArtistUpload, Song } from "@/types";
import { getSongById as getStaticSongById, songs as staticSongs } from "@/lib/mock-data/songs";
import { getAlbumById as getStaticAlbumById } from "@/lib/mock-data/albums";
import { getSongsForAlbum } from "@/lib/album-utils";
import { uploadToSongFromArtistUpload } from "@/lib/artist-upload-utils";

type SubmitUploadInput = Omit<
  ArtistUpload,
  "id" | "status" | "submittedAt" | "uploadedBy" | "duration"
> & { duration?: number };

interface ArtistUploadContextValue {
  uploads: ArtistUpload[];
  publishedSongs: Song[];
  publishedAlbums: Album[];
  publishedSingles: Song[];
  allSongs: Song[];
  allAlbums: Album[];
  isLoading: boolean;
  submitUpload: (input: SubmitUploadInput) => Promise<{ ok: boolean; upload?: ArtistUpload; error?: string }>;
  refreshUploads: () => Promise<void>;
  getSongById: (id: string) => Song | undefined;
  getUploadById: (id: string) => ArtistUpload | undefined;
  getAlbumById: (id: string) => Album | undefined;
  getSongsByAlbumId: (albumId: string) => Song[];
}

const ArtistUploadContext = createContext<ArtistUploadContextValue | null>(null);

export function ArtistUploadProvider({ children }: { children: ReactNode }) {
  const [uploads, setUploads] = useState<ArtistUpload[]>([]);
  const [publishedSongs, setPublishedSongs] = useState<Song[]>([]);
  const [publishedAlbums, setPublishedAlbums] = useState<Album[]>([]);
  const [publishedSingles, setPublishedSingles] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshPublished = useCallback(async () => {
    try {
      const res = await fetch("/api/artist/uploads/published");
      if (res.ok) {
        const data = (await res.json()) as {
          songs: Song[];
          albums: Album[];
          singles: Song[];
        };
        setPublishedSongs(data.songs);
        setPublishedAlbums(data.albums);
        setPublishedSingles(data.singles);
      }
    } catch {
      /* keep existing */
    }
  }, []);

  const refreshUploads = useCallback(async () => {
    try {
      const res = await fetch("/api/artist/uploads", { credentials: "include" });
      if (res.ok) {
        const data = (await res.json()) as { uploads: ArtistUpload[] };
        setUploads(data.uploads);
      }
    } catch {
      /* keep existing */
    }
  }, []);

  useEffect(() => {
    Promise.all([refreshPublished(), refreshUploads()]).finally(() => setIsLoading(false));
  }, [refreshPublished, refreshUploads]);

  const allSongs = useMemo(() => {
    const publishedIds = new Set(publishedSongs.map((s) => s.id));
    return [...publishedSongs, ...staticSongs.filter((s) => !publishedIds.has(s.id))];
  }, [publishedSongs]);

  const allAlbums = useMemo(() => publishedAlbums, [publishedAlbums]);

  const getSongById = useCallback(
    (id: string) => {
      const published = publishedSongs.find((s) => s.id === id);
      if (published) return published;
      return getStaticSongById(id);
    },
    [publishedSongs]
  );

  const getUploadById = useCallback(
    (id: string) => uploads.find((u) => u.id === id),
    [uploads]
  );

  const getAlbumById = useCallback(
    (id: string) => {
      const published = publishedAlbums.find((a) => a.id === id);
      if (published) return published;
      return getStaticAlbumById(id);
    },
    [publishedAlbums]
  );

  const getSongsByAlbumId = useCallback(
    (albumId: string) => getSongsForAlbum(albumId, allSongs),
    [allSongs]
  );

  const submitUpload = useCallback(
    async (input: SubmitUploadInput) => {
      try {
        const res = await fetch("/api/artist/uploads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(input),
        });
        const data = (await res.json()) as { upload?: ArtistUpload; error?: string };
        if (!res.ok) return { ok: false, error: data.error ?? "Upload failed" };
        setUploads((prev) => [data.upload!, ...prev]);
        await refreshPublished();
        return { ok: true, upload: data.upload };
      } catch {
        return { ok: false, error: "Unable to submit upload" };
      }
    },
    [refreshPublished]
  );

  const value = useMemo(
    () => ({
      uploads,
      publishedSongs,
      publishedAlbums,
      publishedSingles,
      allSongs,
      allAlbums,
      isLoading,
      submitUpload,
      refreshUploads,
      getSongById,
      getUploadById,
      getAlbumById,
      getSongsByAlbumId,
    }),
    [
      uploads,
      publishedSongs,
      publishedAlbums,
      publishedSingles,
      allSongs,
      allAlbums,
      isLoading,
      submitUpload,
      refreshUploads,
      getSongById,
      getUploadById,
      getAlbumById,
      getSongsByAlbumId,
    ]
  );

  return (
    <ArtistUploadContext.Provider value={value}>{children}</ArtistUploadContext.Provider>
  );
}

export function useArtistUploads() {
  const ctx = useContext(ArtistUploadContext);
  if (!ctx) throw new Error("useArtistUploads must be used within ArtistUploadProvider");
  return ctx;
}

export { uploadToSongFromArtistUpload as uploadToSong };
