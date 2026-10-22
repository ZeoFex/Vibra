function allowedArtworkUrl(value: string): URL | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    const host = url.hostname.toLowerCase();
    if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) return null;
    if (/^(127\.|10\.|192\.168\.|0\.0\.0\.0)/.test(host)) return null;
    return url;
  } catch {
    return null;
  }
}

type Params = { params: Promise<{ src: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { src } = await params;
  let decoded = "";
  try {
    decoded = Buffer.from(src, "base64url").toString("utf8");
  } catch {
    return new Response("Invalid artwork", { status: 400 });
  }

  const target = allowedArtworkUrl(decoded);
  if (!target) return new Response("Invalid artwork", { status: 400 });

  const upstream = await fetch(target, { cache: "no-store" });
  if (!upstream.ok || !upstream.body) {
    return new Response("Artwork unavailable", { status: upstream.status || 502 });
  }

  const type = upstream.headers.get("content-type") || "image/jpeg";
  return new Response(upstream.body, {
    headers: {
      "Content-Type": type.startsWith("image/") ? type : "image/jpeg",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
