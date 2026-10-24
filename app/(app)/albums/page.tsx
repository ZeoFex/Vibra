"use client";

import { useEffect, useMemo, useState } from "react";
import { Disc3 } from "lucide-react";
import { AlbumCard } from "@/components/music/music-cards";
import { usePlayer } from "@/lib/contexts/app-context";
import type { Album, Song } from "@/types";

const filters = ["All", "Albums", "EPs", "Singles"] as const;
type Filter = (typeof filters)[number];

export default function AlbumsPage() {
  const { play } = usePlayer();
  const [filter, setFilter] = useState<Filter>("All");
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/music/albums")
      .then(async (res) => {
        const data = (await res.json()) as { albums?: Album[] };
        setAlbums(Array.isArray(data.albums) ? data.albums : []);
      })
      .catch(() => setAlbums([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (filter === "All") return albums;
    if (filter === "Singles") return albums.filter((album) => album.type === "single");
    if (filter === "EPs") return albums.filter((album) => album.type === "ep");
    return albums.filter((album) => album.type === "album");
  }, [albums, filter]);

  const handlePlayAlbum = (album: Album) => {
    const audiusId = album.id.startsWith("au-pl-") ? album.id.slice("au-pl-".length) : "";
    const jamendoId = album.id.startsWith("jm-al-") ? album.id.slice("jm-al-".length) : "";
    const url = audiusId
      ? `/api/music/playlist/${audiusId}`
      : jamendoId
        ? `/api/music/jamendo/album/${jamendoId}`
        : "";
    if (!url) return;
    void fetch(url)
      .then(async (res) => {
        const data = (await res.json()) as { songs?: Song[] };
        const songs = data.songs ?? [];
        if (songs[0]) play(songs[0], songs);
      });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-violet-400">
            <Disc3 size={22} />
            <span className="text-sm font-medium uppercase tracking-wide">Browse</span>
          </div>
          <h1 className="text-2xl font-bold md:text-3xl">Albums</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                filter === item ? "bg-violet-600 text-white" : "bg-white/10 text-white/60 hover:bg-white/15"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-white/50">Loading albums…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center text-white/50">
          <Disc3 size={40} className="mx-auto mb-4 opacity-40" />
          No albums in this category yet.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {filtered.map((album) => (
              <AlbumCard key={album.id} album={album} onPlay={() => handlePlayAlbum(album)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
