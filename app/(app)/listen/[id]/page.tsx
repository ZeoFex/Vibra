"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import { usePlayer } from "@/lib/contexts/app-context";
import { PlayButton } from "@/components/music/music-cards";
import type { Song } from "@/types";

export default function ListenPage({ params }: { params: Promise<{ id: string }> }) {
  const songId = decodeURIComponent(use(params).id);
  const { play } = usePlayer();
  const [song, setSong] = useState<Song | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    fetch(`/api/music/song/${encodeURIComponent(songId)}`)
      .then(async (response) => {
        if (!response.ok) {
          setMissing(true);
          return;
        }
        const data = (await response.json()) as { song?: Song };
        setSong(data.song ?? null);
        if (!data.song) setMissing(true);
      })
      .catch(() => setMissing(true));
  }, [songId]);

  if (missing) return <p className="text-white/50">This Vibra link could not be opened.</p>;
  if (!song) return <p className="text-white/50">Opening song…</p>;

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-6 pt-8 text-center">
      <div className="relative h-56 w-56 overflow-hidden rounded-2xl shadow-2xl sm:h-72 sm:w-72">
        {song.cover.startsWith("/api/") ? (
          <img src={song.cover} alt="" className="h-full w-full object-cover" />
        ) : (
          <Image src={song.cover} alt={song.title} fill className="object-cover" />
        )}
      </div>
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">{song.title}</h1>
        <p className="mt-1 text-white/60">{song.artistName}</p>
      </div>
      <div className="flex items-center gap-3">
        <PlayButton size="lg" onClick={() => play(song, [song])} />
      </div>
    </div>
  );
}
