"use client";

import { useEffect, useState } from "react";
import { SectionHeader, SongCard } from "@/components/music/music-cards";
import { usePlayer } from "@/lib/contexts/app-context";
import type { Song } from "@/types";

export default function SongsPage() {
  const { play } = usePlayer();
  const [songs, setSongs] = useState<Song[]>([]);

  useEffect(() => {
    fetch("/api/music/browse")
      .then(async (response) => {
        if (!response.ok) return;
        const data = (await response.json()) as { songs?: Song[] };
        setSongs(data.songs ?? []);
      })
      .catch(() => setSongs([]));
  }, []);

  return (
    <div className="space-y-4">
      <div className="lg:hidden">
        <h1 className="text-2xl font-bold text-white">Songs</h1>
        <p className="mt-1 text-sm text-violet-200/70">All the songs on Vibra.</p>
      </div>
      <div className="hidden lg:block">
        <SectionHeader title="Songs" />
      </div>
      <div className="grid gap-1">
        {songs.map((song, index) => (
          <SongCard key={song.id} song={song} index={index + 1} onPlay={() => play(song, songs)} />
        ))}
      </div>
    </div>
  );
}
