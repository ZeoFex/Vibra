import type { Album } from "@/types";

export const albums: Album[] = [
  {
    id: "album-1",
    title: "Cosmic Waves",
    artistId: "artist-1",
    artistName: "Luna Eclipse",
    cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&h=400&fit=crop",
    releaseDate: "2025-11-15",
    genre: "Electronic",
    trackCount: 12,
    type: "album",
  },
  {
    id: "album-2",
    title: "City Lights",
    artistId: "artist-2",
    artistName: "Midnight Pulse",
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop",
    releaseDate: "2025-10-20",
    genre: "Hip-Hop",
    trackCount: 14,
    type: "album",
  },
  {
    id: "album-3",
    title: "Silent Echoes",
    artistId: "artist-3",
    artistName: "Aria Nova",
    cover: "https://images.unsplash.com/photo-1511379938545-c1f69419868d?w=400&h=400&fit=crop",
    releaseDate: "2025-09-08",
    genre: "Indie",
    trackCount: 10,
    type: "album",
  },
  {
    id: "album-4",
    title: "Frequency",
    artistId: "artist-4",
    artistName: "Neon Drift",
    cover: "https://images.unsplash.com/photo-1571330737116-fdeefe0719c2?w=400&h=400&fit=crop",
    releaseDate: "2025-12-01",
    genre: "House",
    trackCount: 8,
    type: "album",
  },
  {
    id: "album-5",
    title: "Calm Waters",
    artistId: "artist-5",
    artistName: "Solace",
    cover: "https://images.unsplash.com/photo-1514320291840-75555eae2d9?w=400&h=400&fit=crop",
    releaseDate: "2025-08-22",
    genre: "Lo-Fi",
    trackCount: 15,
    type: "album",
  },
  {
    id: "album-6",
    title: "High Voltage",
    artistId: "artist-6",
    artistName: "Voltage",
    cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
    releaseDate: "2025-07-14",
    genre: "Rock",
    trackCount: 11,
    type: "album",
  },
  {
    id: "album-7",
    title: "Golden Hour EP",
    artistId: "artist-3",
    artistName: "Aria Nova",
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop",
    releaseDate: "2026-01-10",
    genre: "Indie",
    trackCount: 5,
    type: "ep",
  },
];

export function getAlbumById(id: string): Album | undefined {
  return albums.find((a) => a.id === id);
}

export function getAlbumsByArtist(artistId: string): Album[] {
  return albums.filter((a) => a.artistId === artistId);
}

export function getNewReleases(): Album[] {
  return [...albums].sort(
    (a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
  );
}
