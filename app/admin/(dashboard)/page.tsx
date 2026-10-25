"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users, Mic2, ShieldCheck, Music, Disc, CreditCard,
  Activity, TrendingUp, BadgeCheck,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { PageHeader, StatCard, SimpleBarChart } from "@/components/admin/ui";

type Overview = {
  totalUsers: number;
  totalArtists: number;
  verifiedArtists: number;
  pendingApplications: number;
  totalSongs: number;
  totalAlbums: number;
  activeSubscriptions: number;
  totalPlays: number;
  dailyActiveUsers: number;
  monthlyActiveUsers: number;
  pendingMusicReviews: number;
  userGrowth: { month: string; value: number }[];
  artistGrowth: { month: string; value: number }[];
  streamGrowth: { month: string; value: number }[];
  genres: { label: string; pct: number }[];
  countries: { label: string; pct: number }[];
  topSongs: { id: string; title: string; artistName: string; cover: string; plays: number }[];
  topArtists: { id: string; name: string; image: string; plays: number }[];
  catalog: {
    audiusSongs: number; jamendoSongs: number;
    audiusArtists: number; jamendoArtists: number;
    audiusAlbums: number; jamendoAlbums: number;
    apiPlays: number;
    songs: { id: string; title: string; artistName: string; cover: string; plays: number; genre: string; source: string }[];
    artists: { id: string; name: string; image: string; source: string }[];
  };
};

const empty: Overview = {
  totalUsers: 0, totalArtists: 0, verifiedArtists: 0, pendingApplications: 0,
  totalSongs: 0, totalAlbums: 0, activeSubscriptions: 0, totalPlays: 0,
  dailyActiveUsers: 0, monthlyActiveUsers: 0, pendingMusicReviews: 0,
  userGrowth: [], artistGrowth: [], streamGrowth: [], genres: [], countries: [],
  topSongs: [], topArtists: [],
  catalog: { audiusSongs: 0, jamendoSongs: 0, audiusArtists: 0, jamendoArtists: 0, audiusAlbums: 0, jamendoAlbums: 0, apiPlays: 0, songs: [], artists: [] },
};

export default function AdminOverviewPage() {
  const [s, setStats] = useState<Overview>(empty);

  useEffect(() => {
    fetch("/api/admin/users", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const list = data?.users ?? [];
        if (!list.length) return;
        setStats((current) => ({
          ...current,
          totalUsers: list.length,
          activeSubscriptions: list.filter((user: { tier: string }) => user.tier === "premium").length,
        }));
      })
      .catch(() => undefined);

    Promise.all([
      fetch("/api/music/browse").then((res) => (res.ok ? res.json() : null)).catch(() => null),
      fetch("/api/music/albums").then((res) => (res.ok ? res.json() : null)).catch(() => null),
    ]).then(([browse, albums]) => {
      const songs = browse?.songs ?? [];
      const artists = browse?.artists ?? [];
      const albumList = albums?.albums ?? browse?.albums ?? [];
      const audiusSongs = songs.filter((song: { id: string }) => String(song.id).startsWith("au-")).length;
      const jamendoSongs = songs.filter((song: { id: string }) => String(song.id).startsWith("jm-")).length;
      const audiusArtists = artists.filter((artist: { id: string }) => String(artist.id).startsWith("au-")).length;
      const jamendoArtists = artists.filter((artist: { id: string }) => String(artist.id).startsWith("jm-")).length;
      const audiusAlbums = albumList.filter((album: { id: string }) => String(album.id).startsWith("au-")).length;
      const jamendoAlbums = albumList.filter((album: { id: string }) => String(album.id).startsWith("jm-")).length;
      const apiPlays = songs.reduce((sum: number, song: { plays?: number }) => sum + (song.plays || 0), 0);
      setStats((current) => ({
        ...current,
        catalog: {
          ...current.catalog,
          audiusSongs,
          jamendoSongs,
          audiusArtists,
          jamendoArtists,
          audiusAlbums,
          jamendoAlbums,
          apiPlays,
          songs: [...songs]
            .sort((a: { plays?: number }, b: { plays?: number }) => (b.plays || 0) - (a.plays || 0))
            .slice(0, 8)
            .map((song: { id: string; title: string; artistName: string; cover: string; plays?: number; genre?: string }) => ({
              id: song.id,
              title: song.title,
              artistName: song.artistName,
              cover: song.cover,
              plays: song.plays || 0,
              genre: song.genre || "",
              source: song.id.startsWith("jm-") ? "Jamendo" : "Audius",
            })),
        },
      }));
    });

    fetch("/api/admin/overview", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        setStats((current) => ({
          ...empty,
          ...data,
          totalUsers: data.totalUsers || current.totalUsers,
          catalog: {
            ...empty.catalog,
            ...current.catalog,
            ...(data.catalog ?? {}),
            audiusSongs: data.catalog?.audiusSongs || current.catalog.audiusSongs,
            jamendoSongs: data.catalog?.jamendoSongs || current.catalog.jamendoSongs,
            audiusAlbums: data.catalog?.audiusAlbums || current.catalog.audiusAlbums,
            jamendoAlbums: data.catalog?.jamendoAlbums || current.catalog.jamendoAlbums,
            audiusArtists: data.catalog?.audiusArtists || current.catalog.audiusArtists,
            jamendoArtists: data.catalog?.jamendoArtists || current.catalog.jamendoArtists,
            apiPlays: data.catalog?.apiPlays || current.catalog.apiPlays,
            songs: data.catalog?.songs?.length ? data.catalog.songs : current.catalog.songs,
          },
        }));
      })
      .catch(() => undefined);
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Overview Dashboard"
        description="Platform health, growth, and key metrics at a glance"
        actions={
          <>
            <Link href="/admin/verification" className="rounded-lg bg-violet-600 px-3 py-2 text-center text-sm font-medium hover:bg-violet-500 sm:px-4">
              <span className="sm:hidden">{s.pendingApplications} Pending</span>
              <span className="hidden sm:inline">{s.pendingApplications} Pending Applications</span>
            </Link>
            <Link href="/admin/music-review" className="rounded-lg border border-white/10 px-3 py-2 text-center text-sm hover:bg-white/5 sm:px-4">
              <span className="sm:hidden">{s.pendingMusicReviews} Reviews</span>
              <span className="hidden sm:inline">{s.pendingMusicReviews} Music Reviews</span>
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value={formatNumber(s.totalUsers)} icon={Users} />
        <StatCard label="Total Artists" value={formatNumber(s.totalArtists)} icon={Mic2} />
        <StatCard label="Verified Artists" value={formatNumber(s.verifiedArtists)} icon={BadgeCheck} />
        <StatCard label="Pending Applications" value={String(s.pendingApplications)} icon={ShieldCheck} />
        <StatCard label="Catalog songs" value={formatNumber(s.catalog.audiusSongs + s.catalog.jamendoSongs)} icon={Music} />
        <StatCard label="Catalog albums" value={formatNumber(s.catalog.audiusAlbums + s.catalog.jamendoAlbums)} icon={Disc} />
        <StatCard label="Catalog artists" value={formatNumber(s.catalog.audiusArtists + s.catalog.jamendoArtists)} icon={Mic2} />
        <StatCard label="Plays reported by APIs" value={formatNumber(s.catalog.apiPlays)} icon={Activity} />
        <StatCard label="Premium Listeners" value={formatNumber(s.activeSubscriptions)} icon={CreditCard} />
        <StatCard label="Total Plays" value={formatNumber(s.totalPlays)} icon={Activity} />
        <StatCard label="Listeners Today" value={formatNumber(s.dailyActiveUsers)} icon={Activity} />
        <StatCard label="Listeners This Month" value={formatNumber(s.monthlyActiveUsers)} icon={TrendingUp} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="mb-4 font-semibold">User Growth</h2>
          <SimpleBarChart data={s.userGrowth} labelKey="month" valueKey="value" />
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="mb-4 font-semibold">Artist Growth</h2>
          <SimpleBarChart data={s.artistGrowth} labelKey="month" valueKey="value" />
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="mb-4 font-semibold">Plays Over Time</h2>
          <SimpleBarChart data={s.streamGrowth} labelKey="month" valueKey="value" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="mb-4 font-semibold">Top Genres</h2>
          <div className="space-y-3">
            {s.genres.map(({ label, pct }) => (
              <div key={label}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{label}</span><span className="text-white/50">{pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-violet-500" style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="mb-4 font-semibold">Top Countries</h2>
          <div className="space-y-3">
            {s.countries.map(({ label, pct }) => (
              <div key={label}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{label}</span><span className="text-white/50">{pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-fuchsia-500" style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="mb-4 font-semibold">Most Played Songs</h2>
          {s.topSongs.length === 0 && <p className="text-sm text-white/40">No plays recorded yet.</p>}
          {s.topSongs.map((song, i) => (
            <div key={song.id} className="flex items-center gap-3 border-b border-white/5 py-2 last:border-0">
              <span className="w-5 text-sm text-white/40">{i + 1}</span>
              <div className="flex-1">
                <p className="text-sm font-medium">{song.title}</p>
                <p className="text-xs text-white/50">{song.artistName}</p>
              </div>
              <span className="text-xs text-white/50">{formatNumber(song.plays)}</span>
            </div>
          ))}
        </section>
        <section className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="mb-4 font-semibold">Most Played Artists</h2>
          {s.topArtists.length === 0 && <p className="text-sm text-white/40">No artist plays recorded yet.</p>}
          {s.topArtists.map((artist, i) => (
            <div key={artist.id} className="flex items-center gap-3 border-b border-white/5 py-3 last:border-0">
              <span className="w-5 text-sm text-white/40">{i + 1}</span>
              {artist.image ? (
                <img src={artist.image} alt="" className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-700 text-sm">{artist.name.slice(0, 1)}</span>
              )}
              <div className="flex-1">
                <p className="text-sm font-medium">{artist.name}</p>
                <p className="text-xs text-white/50">{formatNumber(artist.plays)} plays</p>
              </div>
            </div>
          ))}
        </section>
      </div>

      <section className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="mb-1 font-semibold">Live catalog</h2>
        <p className="mb-4 text-sm text-white/45">Audius and Jamendo, loaded from their APIs alongside the Vibra database.</p>
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-white/5 p-4"><p className="text-2xl font-bold">{formatNumber(s.catalog.audiusSongs)}</p><p className="text-xs text-white/50">Audius songs</p></div>
          <div className="rounded-lg bg-white/5 p-4"><p className="text-2xl font-bold">{formatNumber(s.catalog.jamendoSongs)}</p><p className="text-xs text-white/50">Jamendo songs</p></div>
          <div className="rounded-lg bg-white/5 p-4"><p className="text-2xl font-bold">{formatNumber(s.catalog.audiusAlbums)}</p><p className="text-xs text-white/50">Audius albums</p></div>
          <div className="rounded-lg bg-white/5 p-4"><p className="text-2xl font-bold">{formatNumber(s.catalog.jamendoAlbums)}</p><p className="text-xs text-white/50">Jamendo albums</p></div>
        </div>
        <h3 className="mb-3 text-sm font-medium text-white/70">Most played songs from the APIs</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {s.catalog.songs.map((song) => (
            <div key={song.id} className="flex items-center gap-3 rounded-lg bg-white/5 p-2">
              {song.cover ? <img src={song.cover} alt="" className="h-10 w-10 rounded object-cover" /> : <span className="h-10 w-10 rounded bg-white/10" />}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{song.title}</p>
                <p className="truncate text-xs text-white/45">{song.artistName} · {song.source}{song.genre ? ` · ${song.genre}` : ""}</p>
              </div>
              <span className="text-xs text-white/50">{formatNumber(song.plays || 0)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
