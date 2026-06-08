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
import type { ArtistUpload, Song } from "@/types";
import { seedArtistUploads } from "@/lib/mock-data/artist-uploads";
import { getPublishedSongs, uploadToSong } from "@/lib/artist-upload-utils";
import { getSongById as getStaticSongById, songs as staticSongs } from "@/lib/mock-data/songs";

const STORAGE_KEY = "vibra-artist-uploads";

type SubmitUploadInput = Omit<
  ArtistUpload,
  "id" | "status" | "submittedAt" | "uploadedBy" | "duration"
> & { duration?: number };

interface ArtistUploadContextValue {
  uploads: ArtistUpload[];
  publishedSongs: Song[];
  allSongs: Song[];
  submitUpload: (input: SubmitUploadInput, userId: string) => ArtistUpload;
  getSongById: (id: string) => Song | undefined;
  getUploadById: (id: string) => ArtistUpload | undefined;
}

const ArtistUploadContext = createContext<ArtistUploadContextValue | null>(null);

function loadUploads(): ArtistUpload[] {
  if (typeof window === "undefined") return seedArtistUploads;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as ArtistUpload[];
      if (parsed.length > 0) return parsed;
    }
  } catch {
    /* use seed */
  }
  return seedArtistUploads;
}

export function ArtistUploadProvider({ children }: { children: ReactNode }) {
  const [uploads, setUploads] = useState<ArtistUpload[]>(seedArtistUploads);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setUploads(loadUploads());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(uploads));
  }, [uploads, hydrated]);

  const publishedSongs = useMemo(() => getPublishedSongs(uploads), [uploads]);

  const allSongs = useMemo(() => {
    const publishedIds = new Set(publishedSongs.map((s) => s.id));
    const merged = [...publishedSongs, ...staticSongs.filter((s) => !publishedIds.has(s.id))];
    return merged;
  }, [publishedSongs]);

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

  const submitUpload = useCallback((input: SubmitUploadInput, artistAccountId: string) => {
    const upload: ArtistUpload = {
      ...input,
      id: `upload-${Date.now()}`,
      duration: input.duration ?? 180,
      status: "published",
      submittedAt: new Date().toISOString(),
      uploadedBy: artistAccountId,
    };
    setUploads((prev) => [upload, ...prev]);
    return upload;
  }, []);

  const value = useMemo(
    () => ({
      uploads,
      publishedSongs,
      allSongs,
      submitUpload,
      getSongById,
      getUploadById,
    }),
    [uploads, publishedSongs, allSongs, submitUpload, getSongById, getUploadById]
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

export { uploadToSong };
