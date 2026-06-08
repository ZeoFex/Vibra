import type { ArtistAccount } from "@/types/artist";

export const DEMO_ARTIST_PASSWORD = "artist123";

export const seedArtistAccounts: ArtistAccount[] = [
  {
    id: "artist-acc-1",
    email: "kofi.wave@vibra.artist",
    password: DEMO_ARTIST_PASSWORD,
    stageName: "Kofi Wave",
    legalName: "Kwame Mensah",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    bio: "Afrobeats artist blending traditional Ghanaian rhythms with modern production.",
    genre: "Afrobeats",
    country: "Ghana",
    status: "active",
    createdAt: "2026-05-01T10:00:00Z",
    createdBy: "admin",
  },
  {
    id: "artist-acc-2",
    email: "zara.bloom@vibra.artist",
    password: DEMO_ARTIST_PASSWORD,
    stageName: "Zara Bloom",
    legalName: "Zara Okonkwo",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    bio: "R&B vocalist known for intimate storytelling and lush harmonies.",
    genre: "R&B",
    country: "Nigeria",
    status: "active",
    createdAt: "2026-05-10T14:00:00Z",
    createdBy: "admin",
  },
];
