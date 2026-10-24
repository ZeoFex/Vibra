import { jsonError, jsonOk } from "@/lib/api-utils";
import { loadJamendoAlbum } from "@/lib/jamendo";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) return jsonError("Invalid album", 400);
  const result = await loadJamendoAlbum(id);
  if (!result) return jsonError("Album not found", 404);
  return jsonOk(result);
}
