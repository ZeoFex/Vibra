import { requireArtistSession } from "@/lib/auth/session";
import { jsonError, jsonOk } from "@/lib/api-utils";

export async function GET() {
  const artist = await requireArtistSession();
  if (!artist) return jsonError("Unauthorized", 401);

  return jsonOk({
    artist: {
      id: artist.id,
      email: artist.email,
      stageName: artist.stageName,
      legalName: artist.legalName,
      genre: artist.genre,
      country: artist.country,
      bio: artist.bio ?? "",
      image: artist.imageUrl ?? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
      status: artist.status,
      emailVerified: artist.emailVerified,
      createdAt: artist.createdAt.toISOString(),
      createdBy: "self" as const,
    },
  });
}
