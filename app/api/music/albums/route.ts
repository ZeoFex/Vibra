import { loadAudiusAlbums } from "@/lib/audius";
import { jsonError, jsonOk } from "@/lib/api-utils";
import { loadJamendoAlbums } from "@/lib/jamendo";
import { interleave } from "@/lib/merge-catalog";

export async function GET() {
  try {
    const [jamendo, audius] = await Promise.all([
      loadJamendoAlbums().catch(() => []),
      loadAudiusAlbums().catch(() => []),
    ]);
    return jsonOk({ albums: interleave(audius, jamendo) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load albums";
    return jsonError(message, 502);
  }
}
