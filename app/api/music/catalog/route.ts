import { getSpotifyCatalog } from "@/lib/spotify/cache";
import { spotifyConfig } from "@/lib/spotify/catalog";
import { jsonError, jsonOk } from "@/lib/api-utils";

export async function GET() {
  const { key } = spotifyConfig();
  if (!key) return jsonError("Spotify API key is not configured", 500);

  try {
    const catalog = await getSpotifyCatalog();
    return jsonOk(catalog);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load Spotify catalog";
    return jsonError(message, 502);
  }
}
