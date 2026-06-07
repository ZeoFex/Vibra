import type { Artist } from "@/types";

export const artists: Artist[] = [
  {
    id: "artist-1",
    name: "Luna Eclipse",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    bio: "Electronic pop artist blending ethereal vocals with deep synth layers. Luna has captivated audiences worldwide with her immersive live performances.",
    monthlyListeners: 4_200_000,
    genres: ["Electronic", "Pop", "Synthwave"],
    verified: true,
  },
  {
    id: "artist-2",
    name: "Midnight Pulse",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    bio: "Hip-hop producer and rapper known for cinematic beats and introspective lyrics that resonate with a generation.",
    monthlyListeners: 8_500_000,
    genres: ["Hip-Hop", "R&B"],
    verified: true,
  },
  {
    id: "artist-3",
    name: "Aria Nova",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    bio: "Classically trained vocalist turned indie sensation. Aria's haunting melodies and poetic songwriting have earned critical acclaim.",
    monthlyListeners: 2_100_000,
    genres: ["Indie", "Alternative", "Folk"],
    verified: true,
  },
  {
    id: "artist-4",
    name: "Neon Drift",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
    bio: "DJ and producer pushing the boundaries of house and techno. Neon Drift's sets are legendary at festivals worldwide.",
    monthlyListeners: 5_600_000,
    genres: ["House", "Techno", "Electronic"],
    verified: true,
  },
  {
    id: "artist-5",
    name: "Solace",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop",
    bio: "Ambient and lo-fi artist creating soundscapes for focus, relaxation, and introspection.",
    monthlyListeners: 3_800_000,
    genres: ["Lo-Fi", "Ambient", "Chill"],
    verified: false,
  },
  {
    id: "artist-6",
    name: "Voltage",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    bio: "Rock band with electrifying energy and anthemic choruses. Voltage has headlined major festivals across three continents.",
    monthlyListeners: 6_200_000,
    genres: ["Rock", "Alternative"],
    verified: true,
  },
];

export function getArtistById(id: string): Artist | undefined {
  return artists.find((a) => a.id === id);
}
