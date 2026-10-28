import { loadAudiusBrowse } from "@/lib/audius";
import { jsonError, jsonOk } from "@/lib/api-utils";
import { loadJamendoBrowse } from "@/lib/jamendo";
import { interleave } from "@/lib/merge-catalog";
import { loadPublishedCatalog } from "@/lib/music/published-catalog";

const empty = { albums: [], artists: [], songs: [], genres: [] };

function uniqueBy<T>(items: T[], key: (item: T) => string) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const id = key(item);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

export async function GET() {
  try {
    const [audius, jamendo, published] = await Promise.all([
      loadAudiusBrowse().catch(() => empty),
      loadJamendoBrowse().catch(() => empty),
      loadPublishedCatalog().catch(() => ({ songs: [], albums: [], artists: [] })),
    ]);
    const songs = uniqueBy(
      [...published.songs, ...interleave(audius.songs, jamendo.songs)],
      (song) => `${song.title}|${song.artistName}`.toLowerCase()
    );
    const albums = uniqueBy(
      [...published.albums, ...interleave(audius.albums, jamendo.albums)],
      (album) => `${album.title}|${album.artistName}`.toLowerCase()
    );
    const artists = uniqueBy(
      [...published.artists, ...interleave(audius.artists, jamendo.artists)],
      (artist) => artist.name.toLowerCase()
    );
    return jsonOk({
      genres: audius.genres,
      songs,
      albums,
      artists,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load catalog";
    return jsonError(message, 502);
  }
}
