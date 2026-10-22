import { loadAudiusBrowse } from "@/lib/audius";
import { jsonError, jsonOk } from "@/lib/api-utils";

export async function GET() {
  try {
    const browse = await loadAudiusBrowse();
    return jsonOk(browse);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load Audius catalog";
    return jsonError(message, 502);
  }
}
