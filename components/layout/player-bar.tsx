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
  Maximize2,
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
  } = usePlayer();

  const [showQueue, setShowQueue] = useState(false);
  const [muted, setMuted] = useState(false);

  if (!currentSong) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/80 px-4 py-3 backdrop-blur-xl">
        <p className="text-center text-sm text-white/40">Select a song to start playing</p>
      </div>
    );
  }

  const progressPercent = (progress / currentSong.duration) * 100;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/90 backdrop-blur-xl">
      {/* Progress bar */}
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

      <div className="flex items-center gap-2 px-3 py-2 md:gap-4 md:px-4">
        {/* Song info */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
            <Image src={currentSong.cover} alt={currentSong.title} fill className="object-cover" />
          </div>
          <div className="min-w-0 hidden sm:block">
            <p className="truncate text-sm font-medium text-white">{currentSong.title}</p>
            <Link href={`/artist/${currentSong.artistId}`} className="truncate text-xs text-white/50 hover:underline">
              {currentSong.artistName}
            </Link>
          </div>
          <button
            onClick={() => toggleLikeSong(currentSong.id)}
            className="hidden sm:block"
          >
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
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2 md:gap-4">
            <button onClick={toggleShuffle} className="hidden md:block">
              <Shuffle size={16} className={cn(shuffle ? "text-violet-400" : "text-white/40")} />
            </button>
            <button onClick={previous} className="text-white/80 hover:text-white">
              <SkipBack size={20} fill="currentColor" />
            </button>
            <button
              onClick={togglePlay}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-105"
            >
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
            </button>
            <button onClick={next} className="text-white/80 hover:text-white">
              <SkipForward size={20} fill="currentColor" />
            </button>
            <button onClick={toggleRepeat} className="hidden md:block">
              {repeat === "one" ? (
                <Repeat1 size={16} className="text-violet-400" />
              ) : (
                <Repeat size={16} className={cn(repeat === "all" ? "text-violet-400" : "text-white/40")} />
              )}
            </button>
          </div>
          <div className="hidden items-center gap-2 text-xs text-white/40 md:flex">
            <span>{formatDuration(progress)}</span>
            <span>/</span>
            <span>{formatDuration(currentSong.duration)}</span>
          </div>
        </div>

        {/* Volume & extras */}
        <div className="flex flex-1 items-center justify-end gap-2">
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
              className="h-1 w-20 cursor-pointer appearance-none rounded-full bg-white/20 accent-violet-500"
            />
          </div>
          <button className="hidden text-white/40 hover:text-white lg:block">
            <Maximize2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
