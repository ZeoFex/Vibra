import type { Album, Song } from "@/types";
import { getDemoAudioUrl } from "@/lib/audio/demo-tracks";

type Json = Record<string, unknown>;

const QUERIES = ["pop", "hip hop", "rock", "r&b", "electronic", "afrobeats"];

function readEnv(name: string): string {
  return process.env[name]?.trim().replace(/^["']|["']$/g, "") ?? "";
}

export function spotifyConfig() {
  const key = readEnv("SPOTIFYMUSIC_API_X-RapidAPI_Key") || readEnv("SPOTIFY_RAPIDAPI_KEY");
  const raw = readEnv("Gateway_URL") || readEnv("SPOTIFY_API_HOST");
  let host = raw.replace(/^https?:\/\//, "").replace(/\/$/, "").toLowerCase();
  if (!host.endsWith(".p.rapidapi.com")) host = "spotify23.p.rapidapi.com";
  return { key, host };
}

async function spotifyGet(path: string): Promise<Json | null> {
  const { key, host } = spotifyConfig();
  if (!key) return null;

  const response = await fetch(`https://${host}${path}`, {
    headers: {
      "X-RapidAPI-Key": key,
      "X-RapidAPI-Host": host,
      Accept: "application/json",
      "User-Agent": "Vibra/1.0",
    },
    cache: "no-store",
  });

  if (response.status === 429) {
    const error = new Error("Spotify rate limit");
    (error as Error & { status?: number }).status = 429;
    throw error;
  }
  if (!response.ok) return null;
  return (await response.json()) as Json;
}

function asRecord(value: unknown): Json | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Json) : null;
}

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function coverFrom(node: Json | null): string {
  if (!node) return "";
  const art = asRecord(node.coverArt) ?? asRecord(node.images) ?? node;
  const sources = art?.sources ?? art?.items;
  if (!Array.isArray(sources)) return text(art?.url);
  let best = "";
  let width = 0;
  for (const source of sources) {
    const record = asRecord(source);
    const nested = record ? asRecord(record.sources) : null;
    const url = text(record?.url) || text(asRecord(Array.isArray(record?.sources) ? record.sources[0] : nested)?.url);
    const candidate = url || (Array.isArray(record?.sources) ? text(asRecord(record.sources[0])?.url) : "");
    const w = Number(record?.width ?? 0);
    if (candidate && w >= width) {
      best = candidate;
      width = w;
    }
  }
  return best;
}

function mapTrack(data: Json, genre: string): Song | null {
  const id = text(data.id);
  const title = text(data.name);
  const durationMs = Number(asRecord(data.duration)?.totalMilliseconds ?? 0);
  if (!id || !title || durationMs <= 0) return null;

  const album = asRecord(data.albumOfTrack);
  const artists = asRecord(data.artists);
  const artistItems = Array.isArray(artists?.items) ? artists.items : [];
  const firstArtist = asRecord(artistItems[0]);
  const profile = asRecord(firstArtist?.profile);
  const artistName = text(profile?.name) || "Unknown artist";
  const artistId = text(firstArtist?.uri).split(":").pop() || `artist-${id}`;
  const albumId = text(album?.id) || text(album?.uri).split(":").pop() || `album-${id}`;

  return {
    id: `sp-${id}`,
    title,
    artistId: `sp-${artistId}`,
    artistName,
    albumId: `sp-${albumId}`,
    albumTitle: text(album?.name) || title,
    cover: coverFrom(album) || coverFrom(data),
    duration: durationMs > 0 ? Math.round(durationMs / 1000) : 180,
    genre,
    plays: 0,
    releaseDate: "",
    audioUrl: getDemoAudioUrl(id),
  };
}

function walkTracks(node: unknown, genre: string, found: Song[]) {
  if (!node || found.length > 400) return;
  if (Array.isArray(node)) {
    for (const item of node) walkTracks(item, genre, found);
    return;
  }
  const record = asRecord(node);
  if (!record) return;
  const data = asRecord(record.data) ?? record;
  const track = asRecord(data.track) ?? data;
  const mapped = mapTrack(track, genre);
  if (mapped) found.push(mapped);
  for (const value of Object.values(record)) {
    if (value && typeof value === "object") walkTracks(value, genre, found);
  }
}

function albumFrom(data: Json, genre: string): Album | null {
  const id = text(data.id) || text(data.uri).split(":").pop();
  const title = text(data.name);
  if (!id || !title || !data.coverArt) return null;
  const artists = asRecord(data.artists);
  const first = asRecord(Array.isArray(artists?.items) ? artists.items[0] : null);
  const date = asRecord(data.date);
  return {
    id: `sp-${id}`,
    title,
    artistId: `sp-${text(first?.uri).split(":").pop() || id}`,
    artistName: text(asRecord(first?.profile)?.name) || "Unknown artist",
    cover: coverFrom(data),
    releaseDate: text(date?.year),
    genre,
    trackCount: 0,
    type: "album",
  };
}

export async function loadSpotifyCatalog(): Promise<{ songs: Song[]; albums: Album[] }> {
  const songs: Song[] = [];
  const albums: Album[] = [];
  const seen = new Set<string>();
  const albumIds: string[] = [];
  const playlistIds: string[] = [];

  const pushSong = (song: Song) => {
    if (seen.has(song.id)) return;
    seen.add(song.id);
    songs.push(song);
  };

  try {
    for (const query of QUERIES) {
      const params = new URLSearchParams({
        q: query,
        type: "multi",
        offset: "0",
        limit: "10",
        numberOfTopResults: "5",
      });
      const payload = await spotifyGet(`/search/?${params.toString()}`);
      if (!payload) continue;

      const tracks = asRecord(payload.tracks);
      for (const item of Array.isArray(tracks?.items) ? tracks.items : []) {
        const data = asRecord(asRecord(item)?.data);
        if (!data) continue;
        const song = mapTrack(data, query);
        if (song) pushSong(song);
      }

      const albumGroup = asRecord(payload.albums);
      for (const item of Array.isArray(albumGroup?.items) ? albumGroup.items : []) {
        const data = asRecord(asRecord(item)?.data);
        if (!data) continue;
        const album = albumFrom(data, query);
        const rawId = text(data.id) || text(data.uri).split(":").pop();
        if (album) albums.push(album);
        if (rawId) albumIds.push(rawId);
      }

      const playlistGroup = asRecord(payload.playlists);
      for (const item of Array.isArray(playlistGroup?.items) ? playlistGroup.items : []) {
        const data = asRecord(asRecord(item)?.data);
        const rawId = text(data?.uri).split(":").pop();
        if (rawId) playlistIds.push(rawId);
      }
    }

    for (const id of albumIds.slice(0, 4)) {
      const payload = await spotifyGet(`/album_tracks/?id=${id}&offset=0&limit=20`);
      const found: Song[] = [];
      walkTracks(payload, "album", found);
      found.forEach(pushSong);
    }

    for (const id of playlistIds.slice(0, 3)) {
      const payload = await spotifyGet(`/playlist_tracks/?id=${id}&offset=0&limit=20`);
      const found: Song[] = [];
      walkTracks(payload, "playlist", found);
      found.forEach(pushSong);
    }
  } catch (error) {
    if ((error as { status?: number }).status !== 429) throw error;
  }

  return { songs, albums };
}
