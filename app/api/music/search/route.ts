import { searchAudiusTracks } from "@/lib/audius";
import { jsonOk } from "@/lib/api-utils";
import { searchJamendoTracks } from "@/lib/jamendo";
import { interleave } from "@/lib/merge-catalog";
import { loadPublishedCatalog } from "@/lib/music/published-catalog";
import type { Song } from "@/types";

function mergeSongs(audius: Song[], jamendo: Song[]): Song[] {
  const seen = new Set<string>();
  const songs: Song[] = [];
  for (const song of interleave(audius, jamendo)) {
    const key = `${song.title}|${song.artistName}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    songs.push(song);
  }
  return songs;
}

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (query.length < 2) return jsonOk({ songs: [] });

  const [jamendo, audius, published] = await Promise.all([
    searchJamendoTracks(query).catch(() => [] as Song[]),
    searchAudiusTracks(query).catch(() => [] as Song[]),
    loadPublishedCatalog().catch(() => ({ songs: [] as Song[], albums: [], artists: [] })),
  ]);
  const needle = query.toLowerCase();
  const local = published.songs.filter((song) =>
    `${song.title} ${song.artistName} ${song.albumTitle} ${song.songwriters ?? ""}`.toLowerCase().includes(needle)
  );
  return jsonOk({ songs: [...local, ...mergeSongs(audius, jamendo)] });
}
