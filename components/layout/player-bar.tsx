"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Heart,
  ListMusic,
  X,
} from "lucide-react";
import { useState } from "react";
import { usePlayer } from "@/lib/contexts/app-context";
import { cn, formatDuration } from "@/lib/utils";

export function PlayerBar() {
  const {
    currentSong,
    isPlaying,
    shuffle,
    repeat,
    volume,
    progress,
    togglePlay,
    next,
    previous,
    toggleShuffle,
    toggleRepeat,
    setVolume,
    seek,
    toggleLikeSong,
    isSongLiked,
    isPlayerBarVisible,
    closePlayer,
  } = usePlayer();

  const [showQueue, setShowQueue] = useState(false);
  const [muted, setMuted] = useState(false);

  if (!isPlayerBarVisible || !currentSong) {
    return null;
  }

  const progressPercent = (progress / currentSong.duration) * 100;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/90 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div
        className="group relative h-1 w-full cursor-pointer bg-white/10"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const pct = (e.clientX - rect.left) / rect.width;
          seek(Math.floor(pct * currentSong.duration));
        }}
      >
        <div
          className="h-full bg-violet-500 transition-all group-hover:bg-violet-400"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1 px-2 py-2 sm:gap-2 sm:px-3 md:px-4">
        {/* Song info */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg sm:h-12 sm:w-12">
            <Image src={currentSong.cover} alt={currentSong.title} fill className="object-cover" sizes="48px" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-white sm:text-sm">{currentSong.title}</p>
            <Link
              href={`/artist/${currentSong.artistId}`}
              className="truncate text-[11px] text-white/50 hover:underline sm:text-xs"
            >
              {currentSong.artistName}
            </Link>
          </div>
          <button onClick={() => toggleLikeSong(currentSong.id)} className="hidden shrink-0 sm:block">
            <Heart
              size={18}
              className={cn(
                "transition-colors",
                isSongLiked(currentSong.id) ? "fill-violet-500 text-violet-500" : "text-white/40 hover:text-white"
              )}
            />
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-0.5">
          <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
            <button onClick={toggleShuffle} className="hidden sm:block">
              <Shuffle size={16} className={cn(shuffle ? "text-violet-400" : "text-white/40")} />
            </button>
            <button onClick={previous} className="text-white/80 hover:text-white">
              <SkipBack size={18} fill="currentColor" className="sm:hidden" />
              <SkipBack size={20} fill="currentColor" className="hidden sm:block" />
            </button>
            <button
              onClick={togglePlay}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-105 sm:h-10 sm:w-10"
            >
              {isPlaying ? (
                <Pause size={18} fill="currentColor" className="sm:hidden" />
              ) : (
                <Play size={18} fill="currentColor" className="ml-0.5 sm:hidden" />
              )}
              {isPlaying ? (
                <Pause size={20} fill="currentColor" className="hidden sm:block" />
              ) : (
                <Play size={20} fill="currentColor" className="ml-0.5 hidden sm:block" />
              )}
            </button>
            <button onClick={next} className="text-white/80 hover:text-white">
              <SkipForward size={18} fill="currentColor" className="sm:hidden" />
              <SkipForward size={20} fill="currentColor" className="hidden sm:block" />
            </button>
            <button onClick={toggleRepeat} className="hidden sm:block">
              {repeat === "one" ? (
                <Repeat1 size={16} className="text-violet-400" />
              ) : (
                <Repeat size={16} className={cn(repeat === "all" ? "text-violet-400" : "text-white/40")} />
              )}
            </button>
          </div>
          <div className="hidden items-center gap-2 text-[10px] text-white/40 sm:flex sm:text-xs">
            <span>{formatDuration(progress)}</span>
            <span>/</span>
            <span>{formatDuration(currentSong.duration)}</span>
          </div>
        </div>

        {/* Volume & extras */}
        <div className="flex items-center justify-end gap-1 sm:gap-2">
          <button
            onClick={() => toggleLikeSong(currentSong.id)}
            className="shrink-0 sm:hidden"
          >
            <Heart
              size={16}
              className={cn(
                isSongLiked(currentSong.id) ? "fill-violet-500 text-violet-500" : "text-white/40"
              )}
            />
          </button>
          <button onClick={() => setShowQueue(!showQueue)} className="hidden text-white/40 hover:text-white md:block">
            <ListMusic size={18} />
          </button>
          <div className="hidden items-center gap-2 md:flex">
            <button
              onClick={() => {
                setMuted(!muted);
                setVolume(muted ? 80 : 0);
              }}
            >
              {muted || volume === 0 ? (
                <VolumeX size={18} className="text-white/40" />
              ) : (
                <Volume2 size={18} className="text-white/40" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={100}
              value={muted ? 0 : volume}
              onChange={(e) => {
                setMuted(false);
                setVolume(Number(e.target.value));
              }}
              className="h-1 w-16 cursor-pointer appearance-none rounded-full bg-white/20 accent-violet-500 lg:w-20"
            />
          </div>
          <button
            onClick={closePlayer}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close player"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
