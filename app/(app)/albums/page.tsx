"use client";

import { useEffect, useMemo, useState } from "react";
import { Disc3 } from "lucide-react";
import { useArtistUploads } from "@/lib/contexts/artist-upload-context";
import { AlbumCard } from "@/components/music/music-cards";
import { Pagination, usePage } from "@/components/ui/pagination";
import { usePlayer } from "@/lib/contexts/app-context";
import type { Album, Song } from "@/types";

const filters = ["All", "Albums", "EPs", "Singles"] as const;
type Filter = (typeof filters)[number];

export default function AlbumsPage() {
  const { publishedAlbums, publishedSingles, getSongsByAlbumId, allSongs } = useArtistUploads();
  const { play } = usePlayer();
  const [filter, setFilter] = useState<Filter>("All");
  const [audiusAlbums, setAudiusAlbums] = useState<Album[]>([]);

  useEffect(() => {
    fetch("/api/music/browse")
      .then(async (res) => {
        const data = (await res.json()) as { albums?: Album[] };
        setAudiusAlbums(Array.isArray(data.albums) ? data.albums : []);
      })
      .catch(() => setAudiusAlbums([]));
  }, []);

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
    const merged = [...publishedAlbums, ...singlesAsAlbums, ...audiusAlbums];
    const seen = new Set<string>();
    return merged.filter((album) => {
      if (seen.has(album.id)) return false;
      seen.add(album.id);
      return true;
    });
  }, [publishedAlbums, singlesAsAlbums, audiusAlbums]);

  const filtered = useMemo(() => {
    if (filter === "All") return catalog;
    if (filter === "Singles") return catalog.filter((a) => a.type === "single");
    if (filter === "EPs") return catalog.filter((a) => a.type === "ep");
    return catalog.filter((a) => a.type === "album");
  }, [catalog, filter]);

  const albumPages = usePage(filtered, 12, filter);

  const handlePlayAlbum = (album: Album) => {
    if (album.id.startsWith("au-pl-")) {
      const playlistId = album.id.slice("au-pl-".length);
      void fetch(`/api/music/playlist/${playlistId}`)
        .then(async (res) => {
          const data = (await res.json()) as { songs?: Song[] };
          const songs = data.songs ?? [];
          if (songs[0]) play(songs[0], songs);
        });
      return;
    }
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
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {albumPages.slice.map((album) => (
              <AlbumCard key={album.id} album={album} onPlay={() => handlePlayAlbum(album)} />
            ))}
          </div>
          <Pagination page={albumPages.page} pageCount={albumPages.pageCount} onPage={albumPages.setPage} />
        </>
      )}
    </div>
  );
}
