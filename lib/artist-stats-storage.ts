import type { ArtistSongStats } from "@/types/artist";
import { seedArtistStats } from "@/lib/mock-data/artist-stats";

const STATS_KEY = "vibra-artist-stats";

export function loadArtistStats(): ArtistSongStats[] {
  if (typeof window === "undefined") return seedArtistStats;
  try {
    const stored = localStorage.getItem(STATS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as ArtistSongStats[];
      if (parsed.length > 0) return parsed;
    }
  } catch {
    /* fall through */
  }
  return seedArtistStats;
}

export function saveArtistStats(stats: ArtistSongStats[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function getStatsForArtist(artistId: string): ArtistSongStats[] {
  return loadArtistStats().filter((s) => s.artistId === artistId);
}

export function addStatsForUpload(
  uploadId: string,
  artistId: string,
  title: string,
  cover: string
): ArtistSongStats {
  const entry: ArtistSongStats = {
    uploadId,
    artistId,
    title,
    cover,
    views: 0,
    plays: 0,
    downloads: 0,
    likes: 0,
    saves: 0,
    updatedAt: new Date().toISOString(),
  };
  const stats = loadArtistStats();
  saveArtistStats([entry, ...stats]);
  return entry;
}
