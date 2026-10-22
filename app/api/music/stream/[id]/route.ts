import { audiusBase } from "@/lib/audius";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  if (!/^[\w-]+$/.test(id)) {
    return new Response("Invalid track", { status: 400 });
  }

  const upstream = await fetch(`${audiusBase()}/tracks/${id}/stream`, {
    redirect: "follow",
    cache: "no-store",
  });

  if (!upstream.ok || !upstream.body) {
    return new Response("Audio unavailable", { status: upstream.status || 502 });
  }

  const type = upstream.headers.get("content-type") || "";
  return new Response(upstream.body, {
    headers: {
      "Content-Type": type.startsWith("audio/") ? type : "audio/mpeg",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
