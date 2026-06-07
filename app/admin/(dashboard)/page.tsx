"use client";

import Link from "next/link";
import {
  Users, Mic2, ShieldCheck, Music, Disc, CreditCard, DollarSign,
  Activity, TrendingUp, Flag, Headphones, BadgeCheck,
} from "lucide-react";
import { adminDashboardStats, growthData } from "@/lib/mock-data/admin";
import { adminStats } from "@/lib/mock-data";
import { artists } from "@/lib/mock-data/artists";
import { formatNumber } from "@/lib/utils";
import { PageHeader, StatCard, SimpleBarChart } from "@/components/admin/ui";
import { SongCard } from "@/components/music/music-cards";

export default function AdminOverviewPage() {
  const s = adminDashboardStats;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Overview Dashboard"
        description="Platform health, growth, and key metrics at a glance"
        actions={
          <>
            <Link href="/admin/verification" className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium hover:bg-violet-500">
              {s.pendingApplications} Pending Applications
            </Link>
            <Link href="/admin/music-review" className="rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/5">
              {s.pendingMusicReviews} Music Reviews
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value={formatNumber(s.totalUsers)} change="+8.2%" icon={Users} />
        <StatCard label="Total Artists" value={formatNumber(s.totalArtists)} change="+24" icon={Mic2} />
        <StatCard label="Verified Artists" value={formatNumber(s.verifiedArtists)} change="+18" icon={BadgeCheck} />
        <StatCard label="Pending Applications" value={String(s.pendingApplications)} icon={ShieldCheck} />
        <StatCard label="Total Songs" value={formatNumber(s.totalSongs)} change="+156" icon={Music} />
        <StatCard label="Total Albums" value={formatNumber(s.totalAlbums)} icon={Disc} />
        <StatCard label="Active Subscriptions" value={formatNumber(s.activeSubscriptions)} change="+5.1%" icon={CreditCard} />
        <StatCard label="Total Revenue" value={`$${formatNumber(s.totalRevenue)}`} change="+18.3%" icon={DollarSign} />
        <StatCard label="Daily Active Users" value={formatNumber(s.dailyActiveUsers)} change="+12.5%" icon={Activity} />
        <StatCard label="Monthly Active Users" value={formatNumber(s.monthlyActiveUsers)} change="+9.8%" icon={TrendingUp} />
        <StatCard label="Open Reports" value={String(s.openReports)} icon={Flag} />
        <StatCard label="Open Tickets" value={String(s.openTickets)} icon={Headphones} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="mb-4 font-semibold">User Growth</h2>
          <SimpleBarChart data={growthData.users} labelKey="month" valueKey="value" />
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="mb-4 font-semibold">Artist Growth</h2>
          <SimpleBarChart data={growthData.artists} labelKey="month" valueKey="value" />
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="mb-4 font-semibold">Streams Over Time</h2>
          <SimpleBarChart data={growthData.streams} labelKey="month" valueKey="value" />
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="mb-4 font-semibold">Revenue Over Time</h2>
          <SimpleBarChart data={growthData.revenue} labelKey="month" valueKey="value" formatValue={(v) => `$${(v / 1_000_000).toFixed(1)}M`} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="mb-4 font-semibold">Top Genres</h2>
          <div className="space-y-3">
            {growthData.topGenres.map(({ genre, pct }) => (
              <div key={genre}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{genre}</span><span className="text-white/50">{pct}%</span>
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
            {growthData.topCountries.map(({ country, pct }) => (
              <div key={country}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{country}</span><span className="text-white/50">{pct}%</span>
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
          {adminStats.topSongs.map(({ song, plays }, i) => (
            <div key={song.id} className="flex items-center gap-3 border-b border-white/5 py-2 last:border-0">
              <span className="w-5 text-sm text-white/40">{i + 1}</span>
              <div className="flex-1"><SongCard song={song} /></div>
              <span className="text-xs text-white/50">{formatNumber(plays)}</span>
            </div>
          ))}
        </section>
        <section className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="mb-4 font-semibold">Most Followed Artists</h2>
          {artists.slice(0, 5).map((artist, i) => (
            <div key={artist.id} className="flex items-center gap-3 border-b border-white/5 py-3 last:border-0">
              <span className="w-5 text-sm text-white/40">{i + 1}</span>
              <img src={artist.image} alt="" className="h-10 w-10 rounded-full object-cover" />
              <div className="flex-1">
                <p className="text-sm font-medium">{artist.name}</p>
                <p className="text-xs text-white/50">{formatNumber(artist.monthlyListeners)} listeners</p>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
