"use client";

import { useEffect, useState } from "react";

type Listen = { songId: string; title: string; artistName: string; cover: string; plays: number };

export default function ListeningStatsPage() {
  const [listens, setListens] = useState<Listen[]>([]);
  const [totalPlays, setTotalPlays] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/listens")
      .then(async (response) => {
        if (!response.ok) return;
        const data = (await response.json()) as { listens?: Listen[]; totalPlays?: number };
        setListens(data.listens ?? []);
        setTotalPlays(data.totalPlays ?? 0);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Listening stats</h1>
        <p className="mt-1 text-sm text-violet-200/70">
          {loading ? "Loading your plays…" : `${totalPlays} play${totalPlays === 1 ? "" : "s"} across ${listens.length} song${listens.length === 1 ? "" : "s"}.`}
        </p>
      </div>
      {!loading && listens.length === 0 && (
        <p className="rounded-3xl border border-violet-400/15 bg-[#241433]/45 p-6 text-sm text-violet-100/70">
          Play a song and it will show up here with how many times you have listened to it.
        </p>
      )}
      <ol className="space-y-2">
        {listens.map((listen, index) => (
          <li key={listen.songId} className="flex items-center gap-3 rounded-2xl border border-violet-400/15 bg-[#241433]/45 px-3 py-3">
            <span className="w-6 shrink-0 text-center text-sm text-white/40">{index + 1}</span>
            {listen.cover ? (
              <img src={listen.cover} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
            ) : (
              <span className="h-12 w-12 shrink-0 rounded-lg bg-[#5b21b6]/40" />
            )}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-white">{listen.title}</span>
              <span className="block truncate text-xs text-violet-200/60">{listen.artistName}</span>
            </span>
            <span className="shrink-0 text-sm font-semibold text-violet-100">
              {listen.plays} {listen.plays === 1 ? "play" : "plays"}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
