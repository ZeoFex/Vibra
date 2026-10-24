"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { usePlayer } from "@/lib/contexts/app-context";
import { usePlaylists } from "@/lib/contexts/playlist-context";
import { SongCard, PlayButton } from "@/components/music/music-cards";
import { PlaylistMenu } from "@/components/music/playlist-menu";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/utils";
import type { Song } from "@/types";

export default function PlaylistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { play } = usePlayer();
  const { getPlaylist, addSong, removeSong, ready } = usePlaylists();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Song[]>([]);
  const [searching, setSearching] = useState(false);

  const playlist = getPlaylist(id);

  useEffect(() => {
    if (!ready) return;
    if (new URLSearchParams(window.location.search).get("add") === "1") {
      document.getElementById("playlist-song-search")?.focus();
    }
  }, [ready, id]);

  async function searchSongs(event: React.FormEvent) {
    event.preventDefault();
    const term = query.trim();
    if (term.length < 2) return;
    setSearching(true);
    try {
      const response = await fetch(`/api/music/search?q=${encodeURIComponent(term)}`);
      const body = (await response.json()) as { songs?: Song[] };
      setResults(body.songs ?? []);
    } finally {
      setSearching(false);
    }
  }

  if (!ready) return null;

  if (!playlist) {
    return <p className="text-white/60">This playlist is not on this device.</p>;
  }

  const playlistSongs = playlist.songs;
  const totalDuration = playlistSongs.reduce((acc, song) => acc + song.duration, 0);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end">
        <div className="relative mx-auto h-48 w-48 shrink-0 overflow-hidden rounded-xl bg-white/10 shadow-2xl sm:mx-0 sm:h-56 sm:w-56">
          {playlist.cover ? <Image src={playlist.cover} alt={playlist.title} fill className="object-cover" /> : null}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <p className="text-xs font-medium uppercase tracking-wider text-white/50">Playlist</p>
          <h1 className="mt-1 text-3xl font-bold md:text-5xl">{playlist.title}</h1>
          <p className="mt-2 text-sm text-white/40">
            {playlist.ownerName} · {playlistSongs.length} songs · {formatDuration(totalDuration)}
          </p>
          <div className="mt-4 flex items-center justify-center gap-3 sm:justify-start">
            <PlayButton size="lg" onClick={() => playlistSongs[0] && play(playlistSongs[0], playlistSongs)} />
            <PlaylistMenu playlistId={playlist.id} onDeleted={() => router.push("/library")} />
          </div>
        </div>
      </div>

      <form onSubmit={searchSongs} className="mb-6 flex flex-col gap-2 sm:flex-row">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          id="playlist-song-search"
          placeholder="Search songs to add"
          className="h-11 flex-1 rounded-md bg-white/10 px-3 text-sm outline-none"
        />
        <Button type="submit" disabled={searching}>{searching ? "Searching..." : "Search"}</Button>
      </form>

      {results.length > 0 && (
        <div className="mb-8 space-y-1">
          {results.map((song) => {
            const alreadyAdded = playlistSongs.some((item) => item.id === song.id);
            return (
              <div key={song.id} className="flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <SongCard song={song} onPlay={() => play(song, results)} />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="shrink-0 gap-1"
                  disabled={alreadyAdded}
                  onClick={() => addSong(playlist.id, song)}
                >
                  <Plus size={14} />
                  {alreadyAdded ? "Added" : "Add"}
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {playlistSongs.length === 0 ? (
        <p className="text-white/50">This playlist is empty. Search above and add songs.</p>
      ) : (
        <div className="space-y-1">
          {playlistSongs.map((song, index) => (
            <div key={song.id} className="flex items-center gap-2">
              <span className="hidden w-6 text-center text-sm text-white/40 sm:block">{index + 1}</span>
              <div className="min-w-0 flex-1">
                <SongCard song={song} onPlay={() => play(song, playlistSongs)} />
              </div>
              <span className="shrink-0 text-xs text-white/40">{formatDuration(song.duration)}</span>
              <button
                type="button"
                onClick={() => removeSong(playlist.id, song.id)}
                className="rounded-lg p-2 text-white/40 hover:text-red-400"
                aria-label="Remove from playlist"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
