"use client";

import { Users, Music, Mic2, DollarSign, TrendingUp, Activity } from "lucide-react";
import { adminStats } from "@/lib/mock-data";
import { formatNumber } from "@/lib/utils";
import { SongCard } from "@/components/music/music-cards";

const statCards = [
  { label: "Daily Active Users", value: formatNumber(adminStats.dailyActiveUsers), icon: Activity, change: "+12.5%" },
  { label: "Total Users", value: formatNumber(adminStats.totalUsers), icon: Users, change: "+8.2%" },
  { label: "Total Songs", value: formatNumber(adminStats.totalSongs), icon: Music, change: "+156" },
  { label: "Total Artists", value: formatNumber(adminStats.totalArtists), icon: Mic2, change: "+24" },
  { label: "Monthly Revenue", value: `$${formatNumber(adminStats.revenue)}`, icon: DollarSign, change: "+18.3%" },
  { label: "Retention Rate", value: `${adminStats.retentionRate}%`, icon: TrendingUp, change: "+2.1%" },
];

export default function AdminOverviewPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="text-white/50">Platform metrics at a glance</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map(({ label, value, icon: Icon, change }) => (
          <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between">
              <Icon size={20} className="text-violet-400" />
              <span className="text-xs text-green-400">{change}</span>
            </div>
            <p className="mt-3 text-2xl font-bold">{value}</p>
            <p className="text-sm text-white/50">{label}</p>
          </div>
        ))}
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Most Played Songs</h2>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          {adminStats.topSongs.map(({ song, plays }, i) => (
            <div key={song.id} className="flex items-center gap-4 border-b border-white/5 py-2 last:border-0">
              <span className="w-6 text-center text-sm text-white/40">{i + 1}</span>
              <div className="flex-1">
                <SongCard song={song} />
              </div>
              <span className="text-sm text-white/50">{formatNumber(plays)} plays</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
