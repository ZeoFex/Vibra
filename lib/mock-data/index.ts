export * from "./artists";
export * from "./songs";
export * from "./albums";
export * from "./playlists";

import type { Genre, MoodOption, Notification, ActivityItem, User, AdminStats } from "@/types";
import { songs } from "./songs";

export const genres: Genre[] = [
  { id: "genre-1", name: "Electronic", image: "https://images.unsplash.com/photo-1571330737116-fdeefe0719c2?w=300&h=300&fit=crop", color: "#7c3aed" },
  { id: "genre-2", name: "Hip-Hop", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop", color: "#2563eb" },
  { id: "genre-3", name: "Indie", image: "https://images.unsplash.com/photo-1511379938545-c1f69419868d?w=300&h=300&fit=crop", color: "#059669" },
  { id: "genre-4", name: "Rock", image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop", color: "#dc2626" },
  { id: "genre-5", name: "Lo-Fi", image: "https://images.unsplash.com/photo-1514320291840-75555eae2d9?w=300&h=300&fit=crop", color: "#0891b2" },
  { id: "genre-6", name: "Ambient", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop", color: "#6366f1" },
];

export const moods: MoodOption[] = [
  { id: "mood-1", name: "Energetic", emoji: "⚡", gradient: "from-orange-500 to-red-600" },
  { id: "mood-2", name: "Chill", emoji: "🌊", gradient: "from-blue-500 to-cyan-500" },
  { id: "mood-3", name: "Focus", emoji: "🎯", gradient: "from-emerald-500 to-teal-600" },
  { id: "mood-4", name: "Romantic", emoji: "💜", gradient: "from-pink-500 to-purple-600" },
  { id: "mood-5", name: "Party", emoji: "🎉", gradient: "from-violet-500 to-fuchsia-600" },
  { id: "mood-6", name: "Melancholy", emoji: "🌧️", gradient: "from-slate-500 to-blue-800" },
];

export const currentUser: User = {
  id: "user-1",
  name: "Alex Rivera",
  username: "alexrivera",
  email: "alex@vibra.app",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop",
  bio: "Music lover. Always discovering new sounds.",
  tier: "free",
  followers: 142,
  following: 89,
  createdAt: "2025-06-15",
};

export const notifications: Notification[] = [
  {
    id: "notif-1",
    type: "new_release",
    title: "New Release",
    message: "Luna Eclipse just released a new single — Starlight Remix",
    read: false,
    createdAt: "2026-06-05T10:30:00Z",
    link: "/artist/artist-1",
  },
  {
    id: "notif-2",
    type: "new_follower",
    title: "New Follower",
    message: "Sarah Chen started following you",
    read: false,
    createdAt: "2026-06-04T18:45:00Z",
    link: "/profile",
  },
  {
    id: "notif-3",
    type: "playlist_update",
    title: "Playlist Updated",
    message: "Your playlist 'Chill Vibes' was updated with 2 new tracks",
    read: true,
    createdAt: "2026-06-03T14:20:00Z",
    link: "/playlist/playlist-3",
  },
  {
    id: "notif-4",
    type: "new_release",
    title: "New Album",
    message: "Aria Nova released 'Golden Hour EP'",
    read: true,
    createdAt: "2026-06-01T09:00:00Z",
    link: "/album/album-7",
  },
];

export const activityFeed: ActivityItem[] = [
  {
    id: "act-1",
    userId: "user-2",
    userName: "Sarah Chen",
    userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    type: "played",
    target: "Neon Dreams by Luna Eclipse",
    createdAt: "2026-06-05T12:00:00Z",
  },
  {
    id: "act-2",
    userId: "user-3",
    userName: "Marcus Lee",
    userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    type: "created_playlist",
    target: "Summer Road Trip",
    createdAt: "2026-06-05T10:30:00Z",
  },
  {
    id: "act-3",
    userId: "user-4",
    userName: "Emma Wilson",
    userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    type: "liked",
    target: "Midnight Drive by Midnight Pulse",
    createdAt: "2026-06-04T22:15:00Z",
  },
  {
    id: "act-4",
    userId: "user-5",
    userName: "James Park",
    userAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    type: "followed",
    target: "Neon Drift",
    createdAt: "2026-06-04T16:00:00Z",
  },
];

export const adminStats: AdminStats = {
  dailyActiveUsers: 48_250,
  totalUsers: 1_250_000,
  totalSongs: 12_450,
  totalArtists: 3_200,
  revenue: 2_450_000,
  retentionRate: 72.5,
  topSongs: songs.slice(0, 5).map((song, i) => ({
    song,
    plays: song.plays - i * 500_000,
  })),
};

export const recentlyPlayed = ["song-1", "song-2", "song-5", "song-8"];
export const recommendedSongs = ["song-4", "song-7", "song-9", "song-11"];
export const trendingSongs = ["song-2", "song-6", "song-10", "song-1"];
export const topCharts = songs
  .slice()
  .sort((a, b) => b.plays - a.plays)
  .slice(0, 10)
  .map((song, i) => ({ rank: i + 1, song, trend: (["up", "down", "same"] as const)[i % 3] }));

export const aiSuggestions = [
  "Generate a workout playlist",
  "Create a chill evening mix",
  "Songs similar to Neon Dreams",
  "Discover new indie artists",
  "Build a focus playlist for coding",
  "Find music for a road trip",
];
