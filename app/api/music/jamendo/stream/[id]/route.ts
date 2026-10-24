import { jamendoStreamUrl } from "@/lib/jamendo";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) return new Response("Invalid track", { status: 400 });

  const audio = await jamendoStreamUrl(id);
  if (!audio) return new Response("Audio unavailable", { status: 404 });

  return Response.redirect(audio, 302);
}
