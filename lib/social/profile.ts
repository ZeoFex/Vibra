import type { SocialProfile } from "@/types";

const FALLBACK_AVATAR = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop";

export function toSocialProfile(user: {
  id: string;
  name: string;
  username: string | null;
  email: string;
  avatarUrl: string | null;
  bio?: string | null;
}): SocialProfile {
  return {
    id: user.id,
    name: user.name,
    username: user.username ?? user.email.split("@")[0],
    avatar: user.avatarUrl || FALLBACK_AVATAR,
    bio: user.bio ?? undefined,
    likedSongIds: [],
    likedArtistIds: [],
  };
}
