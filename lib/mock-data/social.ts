import type { SocialProfile, FriendRequest } from "@/types";

export const socialProfiles: SocialProfile[] = [
  {
    id: "user-2",
    username: "sarahchen",
    name: "Sarah Chen",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    bio: "Indie & electronic enthusiast",
    likedSongIds: ["song-1", "song-3", "song-7"],
    likedArtistIds: ["artist-1", "artist-3"],
  },
  {
    id: "user-3",
    username: "marcuslee",
    name: "Marcus Lee",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    bio: "Hip-hop head. Always vibing.",
    likedSongIds: ["song-2", "song-10", "song-6"],
    likedArtistIds: ["artist-2", "artist-6"],
  },
  {
    id: "user-4",
    username: "emmawilson",
    name: "Emma Wilson",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    bio: "Lo-fi beats for late nights",
    likedSongIds: ["song-5", "song-9", "song-3"],
    likedArtistIds: ["artist-5", "artist-3"],
  },
  {
    id: "user-5",
    username: "jamespark",
    name: "James Park",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    bio: "Techno & house all day",
    likedSongIds: ["song-4", "song-11", "song-1"],
    likedArtistIds: ["artist-4", "artist-1"],
  },
  {
    id: "user-6",
    username: "ninaortiz",
    name: "Nina Ortiz",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    bio: "Rock & alternative lover",
    likedSongIds: ["song-6", "song-12", "song-2"],
    likedArtistIds: ["artist-6", "artist-2"],
  },
  {
    id: "user-7",
    username: "davidkim",
    name: "David Kim",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    bio: "Discovering new sounds daily",
    likedSongIds: ["song-8", "song-1", "song-5"],
    likedArtistIds: ["artist-3", "artist-1", "artist-5"],
  },
];

export const initialFriendRequests: FriendRequest[] = [
  {
    id: "fr-1",
    from: socialProfiles[0],
    toUserId: "user-1",
    status: "pending",
    createdAt: "2026-06-05T14:30:00Z",
    matchReason: "You both like Luna Eclipse & Aria Nova",
  },
  {
    id: "fr-2",
    from: socialProfiles[3],
    toUserId: "user-1",
    status: "pending",
    createdAt: "2026-06-04T09:15:00Z",
    matchReason: "Shared taste in Electronic & House",
  },
  {
    id: "fr-3",
    from: socialProfiles[4],
    toUserId: "user-1",
    status: "pending",
    createdAt: "2026-06-03T18:00:00Z",
    matchReason: "Both fans of Midnight Pulse",
  },
];

export function searchProfilesByUsername(query: string, excludeId?: string): SocialProfile[] {
  const q = query.toLowerCase().replace("@", "").trim();
  if (!q) return [];
  return socialProfiles.filter(
    (p) =>
      p.id !== excludeId &&
      (p.username.toLowerCase().includes(q) || p.name.toLowerCase().includes(q))
  );
}

export function getRecommendations(
  likedSongIds: string[],
  likedArtistIds: string[],
  friendIds: string[],
  excludeId?: string
): { profile: SocialProfile; reason: string; score: number }[] {
  return socialProfiles
    .filter((p) => p.id !== excludeId && !friendIds.includes(p.id))
    .map((profile) => {
      const sharedSongs = profile.likedSongIds.filter((id) => likedSongIds.includes(id));
      const sharedArtists = profile.likedArtistIds.filter((id) => likedArtistIds.includes(id));
      const score = sharedSongs.length * 2 + sharedArtists.length * 3;

      let reason = "Suggested for you";
      if (sharedArtists.length > 0 && sharedSongs.length > 0) {
        reason = `${sharedArtists.length} shared artists · ${sharedSongs.length} shared songs`;
      } else if (sharedArtists.length > 0) {
        reason = `${sharedArtists.length} artist${sharedArtists.length > 1 ? "s" : ""} in common`;
      } else if (sharedSongs.length > 0) {
        reason = `${sharedSongs.length} song${sharedSongs.length > 1 ? "s" : ""} in common`;
      }

      return { profile, reason, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);
}
