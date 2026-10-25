"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/admin/ui";

type Song = { id: string; title: string; artistName: string; coverArt: string; status: string };

export default function FeaturedPage() {
  const [songs, setSongs] = useState<Song[]>([]);

  useEffect(() => {
    fetch("/api/admin/records", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const published = (data?.musicQueue ?? []).filter((song: Song) => song.status === "approved");
        setSongs(published.slice(0, 12));
      })
      .catch(() => undefined);
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader title="Published catalog" description="Songs that are live on Vibra" />
      {songs.length === 0 && <p className="text-sm text-white/40">No published songs yet.</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        {songs.map((song) => (
          <div key={song.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
            {song.coverArt ? <img src={song.coverArt} alt="" className="h-14 w-14 rounded-lg object-cover" /> : <span className="h-14 w-14 rounded-lg bg-white/10" />}
            <div>
              <p className="font-medium">{song.title}</p>
              <p className="text-xs text-white/50">{song.artistName}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
