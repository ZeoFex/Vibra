import { loadAudiusBrowse } from "@/lib/audius";
import { jsonError, jsonOk } from "@/lib/api-utils";
import { loadJamendoBrowse } from "@/lib/jamendo";
import { interleave } from "@/lib/merge-catalog";

const empty = { albums: [], artists: [], songs: [], genres: [] };

export async function GET() {
  try {
    const [audius, jamendo] = await Promise.all([
      loadAudiusBrowse().catch(() => empty),
      loadJamendoBrowse().catch(() => empty),
    ]);
    return jsonOk({
      genres: audius.genres,
      songs: interleave(audius.songs, jamendo.songs),
      albums: interleave(audius.albums, jamendo.albums),
      artists: interleave(audius.artists, jamendo.artists),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load catalog";
    return jsonError(message, 502);
  }
}
