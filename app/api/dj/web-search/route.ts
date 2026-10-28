import { jsonError, jsonOk } from "@/lib/api-utils";

export const runtime = "nodejs";

interface WebResult {
  title: string;
  url: string;
  snippet: string;
}

function unwrapUrl(href: string) {
  try {
    const absolute = href.startsWith("//") ? `https:${href}` : href;
    const parsed = new URL(absolute);
    const wrapped = parsed.searchParams.get("uddg");
    if (wrapped) return decodeURIComponent(wrapped);
    return absolute;
  } catch {
    return href;
  }
}

function decode(value: string) {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (query.length < 2) return jsonOk({ results: [] as WebResult[] });
  if (query.length > 160) return jsonError("Search is too long");

  const response = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; VibraStudio/1.0)" },
    next: { revalidate: 0 },
  });
  if (!response.ok) return jsonError("The web search did not respond", 502);

  const html = await response.text();
  const results: WebResult[] = [];
  const pattern = /<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
  for (const match of html.matchAll(pattern)) {
    const url = unwrapUrl(match[1]);
    if (!url.startsWith("http")) continue;
    results.push({ title: decode(match[2]), url, snippet: decode(match[3]) });
    if (results.length >= 12) break;
  }

  return jsonOk({ results });
}
