import { loadAudiusAlbums } from "@/lib/audius";
import { jsonError, jsonOk } from "@/lib/api-utils";
import { loadJamendoAlbums } from "@/lib/jamendo";
import { interleave } from "@/lib/merge-catalog";
import { loadPublishedCatalog } from "@/lib/music/published-catalog";

export async function GET() {
  try {
    const [jamendo, audius, published] = await Promise.all([
      loadJamendoAlbums().catch(() => []),
      loadAudiusAlbums().catch(() => []),
      loadPublishedCatalog().catch(() => ({ songs: [], albums: [], artists: [] })),
    ]);
    return jsonOk({ albums: [...published.albums, ...interleave(audius, jamendo)] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load albums";
    return jsonError(message, 502);
  }
}
