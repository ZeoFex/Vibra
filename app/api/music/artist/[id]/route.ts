import { loadAudiusArtist } from "@/lib/audius";
import { jsonError, jsonOk } from "@/lib/api-utils";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const result = await loadAudiusArtist(id);
  if (!result) return jsonError("Artist not found", 404);
  return jsonOk(result);
}
