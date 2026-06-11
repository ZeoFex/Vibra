"use client";

import { useMemo, useState } from "react";
import { Disc3 } from "lucide-react";
import { useArtistUploads } from "@/lib/contexts/artist-upload-context";
import { albums as staticAlbums } from "@/lib/mock-data/albums";
import { AlbumCard } from "@/components/music/music-cards";
import { usePlayer } from "@/lib/contexts/app-context";
import type { Album } from "@/types";

const filters = ["All", "Albums", "EPs", "Singles"] as const;
type Filter = (typeof filters)[number];

export default function AlbumsPage() {
  const { publishedAlbums, publishedSingles, getSongsByAlbumId, allSongs } = useArtistUploads();
  const { play } = usePlayer();
  const [filter, setFilter] = useState<Filter>("All");

  const singlesAsAlbums: Album[] = useMemo(
    () =>
      publishedSingles.map((song) => ({
        id: song.albumId,
        title: song.title,
        artistId: song.artistId,
        artistName: song.artistName,
        cover: song.cover,
        releaseDate: song.releaseDate,
        genre: song.genre,
        trackCount: 1,
        type: "single" as const,
      })),
    [publishedSingles]
  );

  const catalog = useMemo(() => {
    const merged = [...publishedAlbums, ...singlesAsAlbums];
    const staticIds = new Set(merged.map((a) => a.id));
    const extras = staticAlbums.filter((a) => !staticIds.has(a.id));
    return [...merged, ...extras].sort(
      (a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
    );
  }, [publishedAlbums, singlesAsAlbums]);

  const filtered = useMemo(() => {
    if (filter === "All") return catalog;
    if (filter === "Singles") return catalog.filter((a) => a.type === "single");
    if (filter === "EPs") return catalog.filter((a) => a.type === "ep");
    return catalog.filter((a) => a.type === "album");
  }, [catalog, filter]);

  const handlePlayAlbum = (album: Album) => {
    const tracks = getSongsByAlbumId(album.id);
    if (tracks[0]) play(tracks[0], tracks.length > 0 ? tracks : allSongs);
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
          <p className="mt-1 text-white/60">Scroll through albums, EPs, and singles from Vibra artists</p>
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

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center text-white/50">
          <Disc3 size={40} className="mx-auto mb-4 opacity-40" />
          No albums in this category yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filtered.map((album) => (
            <AlbumCard key={album.id} album={album} onPlay={() => handlePlayAlbum(album)} />
          ))}
        </div>
      )}
    </div>
  );
}
