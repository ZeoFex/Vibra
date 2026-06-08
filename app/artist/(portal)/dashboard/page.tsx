"use client";

import Image from "next/image";
import { Eye, Play, Download, Heart, Users, TrendingUp, Music } from "lucide-react";
import { useArtistAuth } from "@/lib/contexts/artist-auth-context";
import { formatNumber } from "@/lib/utils";

export default function ArtistDashboardPage() {
  const { artist, getDashboardSummary, getArtistStats } = useArtistAuth();
  if (!artist) return null;

  const summary = getDashboardSummary(artist.id);
  const stats = getArtistStats(artist.id);

  const cards = [
    { label: "Total Views", value: formatNumber(summary.totalViews), icon: Eye, color: "text-blue-400" },
    { label: "Total Plays", value: formatNumber(summary.totalPlays), icon: Play, color: "text-violet-400" },
    { label: "Downloads", value: formatNumber(summary.totalDownloads), icon: Download, color: "text-emerald-400" },
    { label: "Likes", value: formatNumber(summary.totalLikes), icon: Heart, color: "text-pink-400" },
    { label: "Monthly Listeners", value: formatNumber(summary.monthlyListeners), icon: Users, color: "text-cyan-400" },
    { label: "Follower Growth", value: `+${summary.followerGrowth}%`, icon: TrendingUp, color: "text-amber-400" },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600/30 to-fuchsia-600/20 p-6 md:p-8">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <Image src={artist.image} alt={artist.stageName} width={72} height={72} className="shrink-0 rounded-full ring-4 ring-violet-600/30" />
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">Welcome, {artist.stageName}</h1>
            <p className="mt-1 text-white/60">
              Track your listeners, views, and downloads across {summary.songCount} published songs
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-white/50">{label}</p>
              <Icon size={18} className={color} />
            </div>
            <p className="mt-2 text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <section>
        <h2 className="mb-4 text-xl font-bold">Song Performance</h2>
        {stats.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center text-white/50">
            <Music size={32} className="mx-auto mb-3 opacity-40" />
            No songs yet. Upload your first track to see stats here.
          </div>
        ) : (
          <div className="space-y-3">
            {stats.map((song) => (
              <div key={song.uploadId} className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                  <Image src={song.cover} alt={song.title} fill className="object-cover" sizes="56px" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{song.title}</p>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-white/50 sm:grid-cols-4">
                    <span className="flex items-center gap-1"><Eye size={12} /> {formatNumber(song.views)} views</span>
                    <span className="flex items-center gap-1"><Play size={12} /> {formatNumber(song.plays)} plays</span>
                    <span className="flex items-center gap-1"><Download size={12} /> {formatNumber(song.downloads)} downloads</span>
                    <span className="flex items-center gap-1"><Heart size={12} /> {formatNumber(song.likes)} likes</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
