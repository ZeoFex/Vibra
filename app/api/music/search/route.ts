import { searchAudiusTracks } from "@/lib/audius";
import { jsonOk } from "@/lib/api-utils";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (query.length < 2) return jsonOk({ songs: [] });

  const songs = await searchAudiusTracks(query);
  return jsonOk({ songs });
}
