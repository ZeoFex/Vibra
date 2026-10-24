import type { Album, Artist, Song } from "@/types";

const API = "https://api.jamendo.com/v3.0";
const COVER_FALLBACK = "https://images.unsplash.com/photo-1511379938545-c1f69419868d?w=400&h=400&fit=crop";

type JamendoTrack = {
  id?: string;
  name?: string;
  duration?: number;
  releasedate?: string;
  artist_id?: string;
  artist_name?: string;
  album_id?: string;
  album_name?: string;
  album_image?: string;
  image?: string;
  audio?: string;
  musicinfo?: { tags?: { genres?: string[] } };
};

type JamendoAlbum = {
  id?: string;
  name?: string;
  releasedate?: string;
  artist_id?: string;
  artist_name?: string;
  image?: string;
};

type JamendoArtist = {
  id?: string;
  name?: string;
  image?: string;
  joindate?: string;
};

type JamendoBody<T> = { results?: T[] };

function clientId(): string {
  return process.env.JAMENDO_CLIENT_ID?.trim() ?? "";
}

function artworkPath(url: string | undefined): string {
  if (!url) return COVER_FALLBACK;
  return `/api/music/artwork/${Buffer.from(url, "utf8").toString("base64url")}`;
}

async function jamendoGet<T>(path: string, params: Record<string, string>): Promise<T[] | null> {
  const id = clientId();
  if (!id) return null;
  const query = new URLSearchParams({ client_id: id, format: "json", ...params });
  const response = await fetch(`${API}${path}?${query}`, {
    headers: { Accept: "application/json", "User-Agent": "Vibra/1.0" },
    cache: "no-store",
  });
  if (!response.ok) return null;
  const body = (await response.json()) as JamendoBody<T>;
  return body.results ?? [];
}

export function toJamendoSong(track: JamendoTrack): Song | null {
  if (!track.id || !track.name || !track.audio) return null;
  const genre = track.musicinfo?.tags?.genres?.[0];
  return {
    id: `jm-${track.id}`,
    title: track.name,
    artistId: track.artist_id ? `jm-${track.artist_id}` : "jm-artist",
    artistName: track.artist_name || "Unknown artist",
    albumId: track.album_id ? `jm-al-${track.album_id}` : `jm-al-${track.id}`,
    albumTitle: track.album_name || track.name,
    cover: artworkPath(track.album_image || track.image),
    duration: Math.max(1, Math.round(track.duration || 0)),
    genre: genre || "Music",
    plays: 0,
    releaseDate: (track.releasedate || "").slice(0, 10),
    audioUrl: `/api/music/jamendo/stream/${encodeURIComponent(track.id)}`,
  };
}

function toJamendoAlbum(album: JamendoAlbum): Album | null {
  if (!album.id || !album.name) return null;
  return {
    id: `jm-al-${album.id}`,
    title: album.name,
    artistId: album.artist_id ? `jm-${album.artist_id}` : "jm-artist",
    artistName: album.artist_name || "Unknown artist",
    cover: artworkPath(album.image),
    releaseDate: (album.releasedate || "").slice(0, 10),
    genre: "Music",
    trackCount: 0,
    type: "album",
  };
}

function toJamendoArtist(artist: JamendoArtist): Artist | null {
  if (!artist.id || !artist.name) return null;
  return {
    id: `jm-${artist.id}`,
    name: artist.name,
    image: artworkPath(artist.image),
    bio: "",
    monthlyListeners: 0,
    genres: [],
    verified: false,
  };
}

export async function searchJamendoTracks(query: string): Promise<Song[]> {
  const results = await jamendoGet<JamendoTrack>("/tracks/", {
    search: query,
    limit: "50",
    audioformat: "mp32",
    include: "musicinfo",
  });
  return (results ?? []).map(toJamendoSong).filter((song): song is Song => song !== null);
}

export async function loadJamendoBrowse(): Promise<{ albums: Album[]; artists: Artist[]; songs: Song[] }> {
  const [tracks, albums, artists] = await Promise.all([
    jamendoGet<JamendoTrack>("/tracks/", {
      order: "popularity_total",
      limit: "50",
      audioformat: "mp32",
      include: "musicinfo",
    }),
    jamendoGet<JamendoAlbum>("/albums/", { order: "popularity_total", limit: "40" }),
    jamendoGet<JamendoArtist>("/artists/", { order: "popularity_total", limit: "40" }),
  ]);

  return {
    songs: (tracks ?? []).map(toJamendoSong).filter((song): song is Song => song !== null),
    albums: (albums ?? []).map(toJamendoAlbum).filter((album): album is Album => album !== null),
    artists: (artists ?? []).map(toJamendoArtist).filter((artist): artist is Artist => artist !== null),
  };
}

export async function loadJamendoAlbums(): Promise<Album[]> {
  const albums = await jamendoGet<JamendoAlbum>("/albums/", { order: "popularity_total", limit: "50" });
  return (albums ?? []).map(toJamendoAlbum).filter((album): album is Album => album !== null);
}

export async function loadJamendoAlbum(albumId: string): Promise<{ album: Album; songs: Song[] } | null> {
  const [albums, tracks] = await Promise.all([
    jamendoGet<JamendoAlbum>("/albums/", { id: albumId }),
    jamendoGet<JamendoTrack>("/tracks/", { album_id: albumId, limit: "50", audioformat: "mp32", include: "musicinfo" }),
  ]);
  const album = albums?.[0] ? toJamendoAlbum(albums[0]) : null;
  if (!album) return null;
  const songs = (tracks ?? []).map(toJamendoSong).filter((song): song is Song => song !== null);
  const type: Album["type"] = songs.length <= 1 ? "single" : songs.length <= 6 ? "ep" : "album";
  return { album: { ...album, trackCount: songs.length, type }, songs };
}

export async function loadJamendoArtist(artistId: string): Promise<{ artist: Artist; songs: Song[] } | null> {
  const [artists, tracks] = await Promise.all([
    jamendoGet<JamendoArtist>("/artists/", { id: artistId }),
    jamendoGet<JamendoTrack>("/tracks/", {
      artist_id: artistId,
      order: "popularity_total",
      limit: "50",
      audioformat: "mp32",
      include: "musicinfo",
    }),
  ]);
  const artist = artists?.[0] ? toJamendoArtist(artists[0]) : null;
  if (!artist) return null;
  const songs = (tracks ?? []).map(toJamendoSong).filter((song): song is Song => song !== null);
  return { artist, songs };
}

export function jamendoAudioAllowed(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    const host = parsed.hostname.toLowerCase();
    return host === "jamendo.com" || host.endsWith(".jamendo.com");
  } catch {
    return false;
  }
}

export async function jamendoStreamUrl(trackId: string): Promise<string | null> {
  for (const audioformat of ["flac", "mp32"]) {
    const tracks = await jamendoGet<JamendoTrack>("/tracks/", { id: trackId, audioformat });
    const audio = tracks?.[0]?.audio;
    if (audio && jamendoAudioAllowed(audio)) return audio;
  }
  return null;
}
