import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth/session";
import { jsonError, jsonOk } from "@/lib/api-utils";
import { loadAudiusAlbums, loadAudiusBrowse } from "@/lib/audius";
import { loadJamendoAlbums, loadJamendoBrowse } from "@/lib/jamendo";

export const runtime = "nodejs";

function monthKey(date: Date) {
  return date.toLocaleString("en", { month: "short" });
}

function buckets(dates: Date[]) {
  const map = new Map<string, number>();
  for (const date of dates) {
    const key = monthKey(date);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()].slice(-6).map(([month, value]) => ({ month, value }));
}

function share(rows: { label: string; count: number }[]) {
  const total = rows.reduce((sum, row) => sum + row.count, 0) || 1;
  return rows
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
    .map((row) => ({ label: row.label, pct: Math.round((row.count / total) * 100) }));
}

export async function GET() {
  const admin = await requireAdminSession();
  if (!admin) return jsonError("Unauthorized", 401);

  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const emptyCatalog = { albums: [] as { id: string }[], artists: [] as { id: string; name: string; image: string }[], songs: [] as { id: string; title: string; artistName: string; cover: string; genre?: string; plays?: number }[], genres: [] as { name: string }[] };
  const [users, artists, uploads, listens, premiumUsers, audius, jamendo, audiusAlbums, jamendoAlbums] = await Promise.all([
    prisma.user.findMany({ select: { id: true, createdAt: true, tier: true } }),
    prisma.artist.findMany({ select: { id: true, stageName: true, imageUrl: true, status: true, country: true, createdAt: true, email: true } }),
    prisma.artistUpload.findMany({ select: { id: true, genre: true, albumGroupId: true, albumTitle: true, status: true, submittedAt: true, title: true, artistName: true, coverUrl: true } }),
    prisma.listen.findMany({ select: { songId: true, title: true, artistName: true, cover: true, plays: true, updatedAt: true, userId: true } }),
    prisma.user.count({ where: { tier: "premium" } }),
    loadAudiusBrowse().catch(() => emptyCatalog),
    loadJamendoBrowse().catch(() => emptyCatalog),
    loadAudiusAlbums().catch(() => []),
    loadJamendoAlbums().catch(() => []),
  ]);

  const playBySong = new Map<string, { title: string; artistName: string; cover: string; plays: number }>();
  const listenersToday = new Set<string>();
  const listenersMonth = new Set<string>();
  for (const listen of listens) {
    const current = playBySong.get(listen.songId) ?? { title: listen.title, artistName: listen.artistName, cover: listen.cover, plays: 0 };
    current.plays += listen.plays;
    playBySong.set(listen.songId, current);
    if (listen.updatedAt >= dayAgo) listenersToday.add(listen.userId);
    if (listen.updatedAt >= monthAgo) listenersMonth.add(listen.userId);
  }

  const playByArtist = new Map<string, number>();
  for (const song of playBySong.values()) {
    playByArtist.set(song.artistName, (playByArtist.get(song.artistName) ?? 0) + song.plays);
  }

  const genreCounts = new Map<string, number>();
  const albums = new Set<string>();
  for (const upload of uploads) {
    if (upload.status !== "published") continue;
    genreCounts.set(upload.genre || "Other", (genreCounts.get(upload.genre || "Other") ?? 0) + 1);
    albums.add(upload.albumGroupId || upload.albumTitle);
  }
  for (const song of [...(audius.songs ?? []), ...(jamendo.songs ?? [])]) {
    const genre = song.genre || "Other";
    genreCounts.set(genre, (genreCounts.get(genre) ?? 0) + 1);
  }
  const apiSongs = [...(audius.songs ?? []), ...(jamendo.songs ?? [])];
  const catalogSongs = apiSongs.length;
  const catalogAlbums = audiusAlbums.length + jamendoAlbums.length;
  const apiPlays = apiSongs.reduce((sum, song) => sum + (song.plays || 0), 0);
  const topApiSongs = [...apiSongs].sort((a, b) => (b.plays || 0) - (a.plays || 0)).slice(0, 8);
  const countryCounts = new Map<string, number>();
  for (const artist of artists) {
    if (artist.email === "catalog@vibra.local") continue;
    countryCounts.set(artist.country || "Unknown", (countryCounts.get(artist.country || "Unknown") ?? 0) + 1);
  }

  const realArtists = artists.filter((artist) => artist.email !== "catalog@vibra.local");

  return jsonOk({
    totalUsers: users.length,
    totalArtists: realArtists.length,
    verifiedArtists: realArtists.filter((artist) => artist.status === "active").length,
    pendingApplications: realArtists.filter((artist) => artist.status === "pending").length,
    totalSongs: catalogSongs + uploads.filter((upload) => upload.status === "published").length,
    totalAlbums: catalogAlbums + albums.size,
    audiusSongs: audius.songs?.length ?? 0,
    jamendoSongs: jamendo.songs?.length ?? 0,
    audiusAlbums: audiusAlbums.length,
    jamendoAlbums: jamendoAlbums.length,
    activeSubscriptions: premiumUsers,
    freeUsers: users.length - premiumUsers,
    totalPlays: [...playBySong.values()].reduce((sum, song) => sum + song.plays, 0),
    dailyActiveUsers: listenersToday.size,
    monthlyActiveUsers: listenersMonth.size,
    pendingMusicReviews: uploads.filter((upload) => upload.status === "pending").length,
    userGrowth: buckets(users.map((user) => user.createdAt)),
    artistGrowth: buckets(realArtists.map((artist) => artist.createdAt)),
    streamGrowth: buckets(listens.map((listen) => listen.updatedAt)),
    genres: share([...genreCounts.entries()].map(([label, count]) => ({ label, count }))),
    countries: share([...countryCounts.entries()].map(([label, count]) => ({ label, count }))),
    topSongs: [...playBySong.entries()]
      .map(([id, song]) => ({ id, ...song }))
      .sort((a, b) => b.plays - a.plays)
      .slice(0, 5),
    topArtists: realArtists
      .map((artist) => ({
        id: artist.id,
        name: artist.stageName,
        image: artist.imageUrl || "",
        plays: playByArtist.get(artist.stageName) ?? 0,
      }))
      .sort((a, b) => b.plays - a.plays)
      .slice(0, 5),
    catalog: {
      audiusSongs: audius.songs?.length ?? 0,
      jamendoSongs: jamendo.songs?.length ?? 0,
      audiusArtists: audius.artists?.length ?? 0,
      jamendoArtists: jamendo.artists?.length ?? 0,
      audiusAlbums: audiusAlbums.length,
      jamendoAlbums: jamendoAlbums.length,
      apiPlays,
      songs: topApiSongs.map((song) => ({
        id: song.id,
        title: song.title,
        artistName: song.artistName,
        cover: song.cover,
        plays: song.plays || 0,
        genre: song.genre || "",
        source: song.id.startsWith("jm-") ? "Jamendo" : "Audius",
      })),
      artists: [...(audius.artists ?? []), ...(jamendo.artists ?? [])].slice(0, 12).map((artist) => ({
        id: artist.id,
        name: artist.name,
        image: artist.image,
        source: artist.id.startsWith("jm-") ? "Jamendo" : "Audius",
      })),
    },
  });
}
