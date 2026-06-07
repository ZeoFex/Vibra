import type { Playlist } from "@/types";

export const playlists: Playlist[] = [
  {
    id: "playlist-1",
    title: "Daily Mix 1",
    description: "Made for you based on Luna Eclipse, Neon Drift, and more",
    cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop",
    ownerId: "user-1",
    ownerName: "Vibra",
    songIds: ["song-1", "song-4", "song-7", "song-11"],
    isPublic: false,
    createdAt: "2026-01-01",
    updatedAt: "2026-06-01",
  },
  {
    id: "playlist-2",
    title: "Workout Energy",
    description: "High-energy tracks to power your workout",
    cover: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop",
    ownerId: "user-1",
    ownerName: "Alex Rivera",
    songIds: ["song-2", "song-6", "song-10", "song-12"],
    isPublic: true,
    createdAt: "2025-12-15",
    updatedAt: "2026-05-20",
  },
  {
    id: "playlist-3",
    title: "Chill Vibes",
    description: "Relax and unwind with these mellow tracks",
    cover: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
    ownerId: "user-1",
    ownerName: "Alex Rivera",
    songIds: ["song-3", "song-5", "song-8", "song-9"],
    isPublic: true,
    createdAt: "2025-11-20",
    updatedAt: "2026-04-10",
  },
  {
    id: "playlist-4",
    title: "Focus Flow",
    description: "Deep focus music for productivity",
    cover: "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=400&h=400&fit=crop",
    ownerId: "user-1",
    ownerName: "Alex Rivera",
    songIds: ["song-5", "song-9"],
    isPublic: false,
    createdAt: "2026-02-01",
    updatedAt: "2026-05-15",
  },
  {
    id: "playlist-5",
    title: "Top Hits 2026",
    description: "The biggest songs of the year",
    cover: "https://images.unsplash.com/photo-1619983081563-430f63602796?w=400&h=400&fit=crop",
    ownerId: "vibra",
    ownerName: "Vibra",
    songIds: ["song-1", "song-2", "song-4", "song-6", "song-10"],
    isPublic: true,
    createdAt: "2026-01-01",
    updatedAt: "2026-06-05",
  },
];

export function getPlaylistById(id: string): Playlist | undefined {
  return playlists.find((p) => p.id === id);
}

export function getUserPlaylists(userId: string): Playlist[] {
  return playlists.filter((p) => p.ownerId === userId || p.ownerId === "vibra");
}
