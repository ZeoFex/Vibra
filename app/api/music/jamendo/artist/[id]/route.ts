import { jsonError, jsonOk } from "@/lib/api-utils";
import { loadJamendoArtist } from "@/lib/jamendo";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) return jsonError("Invalid artist", 400);
  const result = await loadJamendoArtist(id);
  if (!result) return jsonError("Artist not found", 404);
  return jsonOk(result);
}
