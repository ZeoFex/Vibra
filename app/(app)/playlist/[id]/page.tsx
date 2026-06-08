"use client";

import { use } from "react";
import Image from "next/image";
import { Heart, Share2, MoreHorizontal } from "lucide-react";
import { getPlaylistById } from "@/lib/mock-data/playlists";
import { getSongById } from "@/lib/mock-data/songs";
import { usePlayer } from "@/lib/contexts/app-context";
import { SongCard, PlayButton } from "@/components/music/music-cards";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/utils";
import { notFound } from "next/navigation";

export default function PlaylistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const playlist = getPlaylistById(id);
  const { play } = usePlayer();

  if (!playlist) notFound();

  const playlistSongs = playlist.songIds
    .map((sid) => getSongById(sid))
    .filter(Boolean) as NonNullable<ReturnType<typeof getSongById>>[];

  const totalDuration = playlistSongs.reduce((acc, s) => acc + s.duration, 0);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end">
        <div className="relative mx-auto h-48 w-48 shrink-0 overflow-hidden rounded-xl shadow-2xl sm:mx-0 sm:h-56 sm:w-56">
          <Image src={playlist.cover} alt={playlist.title} fill className="object-cover" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <p className="text-xs font-medium uppercase tracking-wider text-white/50">Playlist</p>
          <h1 className="mt-1 text-3xl font-bold md:text-5xl">{playlist.title}</h1>
          <p className="mt-2 text-sm text-white/60">{playlist.description}</p>
          <p className="mt-2 text-sm text-white/40">
            {playlist.ownerName} · {playlistSongs.length} songs · {formatDuration(totalDuration)}
          </p>
          <div className="mt-4 flex items-center justify-center gap-3 sm:justify-start">
            <PlayButton
              size="lg"
              onClick={() => playlistSongs[0] && play(playlistSongs[0], playlistSongs)}
            />
            <Button variant="ghost" size="icon">
              <Heart size={20} />
            </Button>
            <Button variant="ghost" size="icon">
              <Share2 size={20} />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreHorizontal size={20} />
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-4 hidden grid-cols-[auto_1fr_auto] gap-4 border-b border-white/10 px-3 pb-2 text-xs text-white/40 sm:grid">
        <span>#</span>
        <span>Title</span>
        <span>Duration</span>
      </div>

      <div className="space-y-1">
        {playlistSongs.map((song, i) => (
          <div
            key={song.id}
            className="group flex items-center gap-2 rounded-xl px-1 hover:bg-white/5 sm:grid sm:grid-cols-[2rem_1fr_auto] sm:gap-4 sm:px-3"
          >
            <span className="hidden w-6 text-center text-sm text-white/40 sm:block">{i + 1}</span>
            <div className="min-w-0 flex-1">
              <SongCard song={song} onPlay={() => play(song, playlistSongs)} />
            </div>
            <span className="shrink-0 pr-2 text-xs text-white/40 sm:pr-3 sm:text-sm">
              {formatDuration(song.duration)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
