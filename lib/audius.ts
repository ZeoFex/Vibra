import type { Album, Artist, Song } from "@/types";

const DEFAULT_HOST = "https://api.audius.co/v1";
const COVER_FALLBACK = "https://images.unsplash.com/photo-1511379938545-c1f69419868d?w=400&h=400&fit=crop";

export function audiusBase(): string {
  const raw = process.env.AUDIUS_API_URL?.trim() || DEFAULT_HOST;
  return raw.replace(/\/$/, "");
}

type AudiusUser = {
  id?: string;
  name?: string;
  handle?: string;
  bio?: string;
  is_verified?: boolean;
  follower_count?: number;
  profile_picture?: Record<string, string> | null;
};

type AudiusTrack = {
  id?: string;
  title?: string;
  duration?: number;
  genre?: string;
  release_date?: string;
  play_count?: number;
  artwork?: Record<string, string> | null;
  user?: AudiusUser;
};

type AudiusPlaylist = {
  id?: string;
  playlist_name?: string;
  is_album?: boolean;
  track_count?: number;
  total_play_count?: number;
  release_date?: string;
  artwork?: Record<string, string> | null;
  user?: AudiusUser;
};

function artworkUrl(artwork: Record<string, string> | null | undefined): string {
  if (!artwork) return "";
  return artwork["480x480"] || artwork["150x150"] || artwork["1000x1000"] || "";
}

function artworkPath(artwork: Record<string, string> | null | undefined): string {
  const cover = artworkUrl(artwork);
  if (!cover) return COVER_FALLBACK;
  return `/api/music/artwork/${Buffer.from(cover, "utf8").toString("base64url")}`;
}

async function audiusGet<T>(path: string): Promise<T | null> {
  const response = await fetch(`${audiusBase()}${path}`, {
    headers: { Accept: "application/json", "User-Agent": "Vibra/1.0" },
    cache: "no-store",
  });
  if (!response.ok) return null;
  return (await response.json()) as T;
}

export function toSong(track: AudiusTrack): Song | null {
  if (!track.id || !track.title) return null;
  return {
    id: `au-${track.id}`,
    title: track.title,
    artistId: track.user?.id ? `au-${track.user.id}` : "au-artist",
    artistName: track.user?.name || track.user?.handle || "Unknown artist",
    albumId: `au-album-${track.id}`,
    albumTitle: track.title,
    cover: artworkPath(track.artwork),
    duration: Math.max(1, Math.round(track.duration || 0)),
    genre: track.genre || "Music",
    plays: track.play_count || 0,
    releaseDate: (track.release_date || "").slice(0, 10),
    audioUrl: `/api/music/stream/${encodeURIComponent(track.id)}`,
  };
}

function toAlbum(playlist: AudiusPlaylist): Album | null {
  if (!playlist.id || !playlist.playlist_name) return null;
  const trackCount = playlist.track_count || 0;
  return {
    id: `au-pl-${playlist.id}`,
    title: playlist.playlist_name,
    artistId: playlist.user?.id ? `au-${playlist.user.id}` : "au-artist",
    artistName: playlist.user?.name || playlist.user?.handle || "Unknown artist",
    cover: artworkPath(playlist.artwork),
    releaseDate: (playlist.release_date || "").slice(0, 10),
    genre: "Music",
    trackCount,
    type: playlist.is_album || trackCount > 6 ? "album" : trackCount <= 1 ? "single" : "ep",
  };
}

function toArtist(user: AudiusUser, plays: number, genre: string): Artist | null {
  if (!user.id || !user.name) return null;
  return {
    id: `au-${user.id}`,
    name: user.name,
    image: artworkPath(user.profile_picture),
    bio: user.bio || "",
    monthlyListeners: plays,
    genres: genre ? [genre] : [],
    verified: Boolean(user.is_verified),
  };
}

export async function searchAudiusTracks(query: string): Promise<Song[]> {
  const body = await audiusGet<{ data?: AudiusTrack[] }>(
    `/tracks/search?${new URLSearchParams({ query, limit: "20" })}`
  );
  return (body?.data ?? []).map(toSong).filter((song): song is Song => song !== null);
}

const GENRE_COLORS: { name: string; color: string }[] = [
  { name: "Electronic", color: "#7c3aed" },
  { name: "Hip-Hop", color: "#2563eb" },
  { name: "Indie", color: "#059669" },
  { name: "Rock", color: "#dc2626" },
  { name: "Lo-Fi", color: "#0891b2" },
  { name: "Ambient", color: "#6366f1" },
];

export type AudiusGenre = { id: string; name: string; image: string; color: string };

async function genreCover(name: string, color: string): Promise<AudiusGenre> {
  const body = await audiusGet<{ data?: AudiusTrack[] }>(
    `/tracks/search?${new URLSearchParams({ query: name, limit: "1" })}`
  );
  return {
    id: name.toLowerCase(),
    name,
    image: artworkPath(body?.data?.[0]?.artwork),
    color,
  };
}
export async function loadAudiusBrowse(): Promise<{ albums: Album[]; artists: Artist[]; genres: AudiusGenre[]; songs: Song[] }> {
  const [trendingTracks, trendingPlaylists, albumSearch, genres] = await Promise.all([
    audiusGet<{ data?: AudiusTrack[] }>("/tracks/trending?limit=50"),
    audiusGet<{ data?: AudiusPlaylist[] }>("/playlists/trending?limit=40"),
    audiusGet<{ data?: AudiusPlaylist[] }>("/playlists/search?query=album&limit=20"),
    Promise.all(GENRE_COLORS.map((genre) => genreCover(genre.name, genre.color))),
  ]);

  const playlists = [...(trendingPlaylists?.data ?? []), ...(albumSearch?.data ?? [])];
  const seenAlbums = new Set<string>();
  const ranked = playlists
    .map((playlist) => ({ playlist, album: toAlbum(playlist) }))
    .filter((entry): entry is { playlist: AudiusPlaylist; album: Album } => entry.album !== null && !seenAlbums.has(entry.album.id) && (seenAlbums.add(entry.album.id), true))
    .sort((a, b) => (b.playlist.total_play_count || 0) - (a.playlist.total_play_count || 0));
  const albums = ranked.map((entry) => entry.album);

  const byArtist = new Map<string, { user: AudiusUser; plays: number; genre: string }>();
  for (const track of trendingTracks?.data ?? []) {
    const user = track.user;
    if (!user?.id) continue;
    const current = byArtist.get(user.id);
    const plays = (current?.plays ?? 0) + (track.play_count || 0);
    byArtist.set(user.id, { user, plays, genre: current?.genre || track.genre || "" });
  }

  const artists = [...byArtist.values()]
    .sort((a, b) => b.plays - a.plays)
    .map((entry) => toArtist(entry.user, entry.plays, entry.genre))
    .filter((artist): artist is Artist => artist !== null);

  const songs = (trendingTracks?.data ?? [])
    .map(toSong)
    .filter((song): song is Song => song !== null)
    .sort((a, b) => b.plays - a.plays);

  return { albums, artists, genres, songs };
}

export async function loadAudiusPlaylist(playlistId: string): Promise<{ album: Album; songs: Song[] } | null> {
  const [playlistBody, tracksBody] = await Promise.all([
    audiusGet<{ data?: AudiusPlaylist[] | AudiusPlaylist }>(`/playlists?id=${encodeURIComponent(playlistId)}`),
    audiusGet<{ data?: AudiusTrack[] }>(`/playlists/${encodeURIComponent(playlistId)}/tracks?limit=50`),
  ]);
  const raw = playlistBody?.data;
  const playlist = Array.isArray(raw) ? raw[0] : raw;
  const album = playlist ? toAlbum(playlist) : null;
  const songs = (tracksBody?.data ?? []).map(toSong).filter((song): song is Song => song !== null);
  if (!album) return null;
  return { album: { ...album, trackCount: songs.length || album.trackCount }, songs };
}

export async function loadAudiusArtist(userId: string): Promise<{ artist: Artist; songs: Song[] } | null> {
  const [userBody, tracksBody] = await Promise.all([
    audiusGet<{ data?: AudiusUser }>(`/users/${encodeURIComponent(userId)}`),
    audiusGet<{ data?: AudiusTrack[] }>(`/users/${encodeURIComponent(userId)}/tracks?limit=20`),
  ]);
  const songs = (tracksBody?.data ?? [])
    .map(toSong)
    .filter((song): song is Song => song !== null)
    .sort((a, b) => b.plays - a.plays);
  const plays = songs.reduce((sum, song) => sum + song.plays, 0);
  const artist = userBody?.data ? toArtist(userBody.data, plays, songs[0]?.genre || "") : null;
  if (!artist) return null;
  return { artist, songs };
}

export function audiusTrackId(songId: string): string | null {
  return songId.startsWith("au-") && !songId.startsWith("au-pl-") ? songId.slice(3) : null;
}
