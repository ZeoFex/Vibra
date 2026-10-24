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
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
    queue,
    play,
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
  const [showNowPlaying, setShowNowPlaying] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isPlayerBarVisible || !currentSong) {
    return null;
  }

  const progressPercent = (progress / currentSong.duration) * 100;
  const tracks = queue.length ? queue : [currentSong];
  const totalDuration = tracks.reduce((sum, song) => sum + song.duration, 0);
  const year = currentSong.releaseDate ? new Date(currentSong.releaseDate).getFullYear() : null;

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

      <div
        className="grid cursor-pointer grid-cols-[1fr_auto_1fr] items-center gap-1 px-2 py-2 sm:gap-2 sm:px-3 md:px-4"
        onClick={() => setShowNowPlaying(true)}
      >
        {/* Song info */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="relative h-10 w-10 shrink-0 cursor-pointer overflow-hidden rounded-lg sm:h-12 sm:w-12"
            aria-label="Open now playing"
          >
            <Image src={currentSong.cover} alt={currentSong.title} fill className="object-cover" sizes="48px" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-white sm:text-sm">{currentSong.title}</p>
            <Link
              href={`/artist/${currentSong.artistId}`}
              className="truncate text-[11px] text-white/50 hover:underline sm:text-xs"
              onClick={(event) => event.stopPropagation()}
            >
              {currentSong.artistName}
            </Link>
          </div>
          <button type="button" onClick={(event) => { event.stopPropagation(); toggleLikeSong(currentSong); }} aria-label="Favorite" className="hidden shrink-0 cursor-pointer sm:block">
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
        <div className="flex flex-col items-center gap-0.5" onClick={(event) => event.stopPropagation()}>
          <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
            <button type="button" onClick={toggleShuffle} aria-label="Shuffle" className="cursor-pointer">
              <Shuffle size={16} className={cn(shuffle ? "text-violet-400" : "text-white/40")} />
            </button>
            <button type="button" onClick={previous} aria-label="Previous" className="cursor-pointer text-white/80 hover:text-white">
              <SkipBack size={18} fill="currentColor" className="sm:hidden" />
              <SkipBack size={20} fill="currentColor" className="hidden sm:block" />
            </button>
            <button
              onClick={togglePlay}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-105 sm:h-10 sm:w-10"
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
            <button type="button" onClick={next} aria-label="Next" className="cursor-pointer text-white/80 hover:text-white">
              <SkipForward size={18} fill="currentColor" className="sm:hidden" />
              <SkipForward size={20} fill="currentColor" className="hidden sm:block" />
            </button>
            <button type="button" onClick={toggleRepeat} aria-label="Repeat" className="cursor-pointer">
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
        <div
          className="flex items-center justify-end gap-1 sm:gap-2"
          onClick={(event) => {
            if (event.target !== event.currentTarget) event.stopPropagation();
          }}
        >
          <button
            onClick={() => toggleLikeSong(currentSong)}
            className="shrink-0 cursor-pointer sm:hidden"
          >
            <Heart
              size={16}
              className={cn(
                isSongLiked(currentSong.id) ? "fill-violet-500 text-violet-500" : "text-white/40"
              )}
            />
          </button>
          <button type="button" onClick={() => setShowQueue(!showQueue)} className="hidden cursor-pointer text-white/40 hover:text-white md:block">
            <ListMusic size={18} />
          </button>
          <div className="hidden items-center gap-2 md:flex">
            <button
              className="cursor-pointer"
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
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close player"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {mounted && showNowPlaying && createPortal(
        <div className="fixed bottom-[var(--app-chrome-bottom)] right-0 top-0 z-[60] flex bg-zinc-950 lg:left-64">
          <div className="min-h-0 min-w-0 flex-1 overflow-y-auto px-4 py-6 sm:px-8">
            <div className="flex items-end gap-4 sm:gap-6">
              <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-md shadow-lg sm:h-44 sm:w-44">
                <Image src={currentSong.cover} alt={currentSong.albumTitle || currentSong.title} fill className="object-cover" sizes="176px" />
              </div>
              <div className="min-w-0 pb-1">
                <p className="text-sm font-medium text-white/80">{currentSong.genre || "Album"}</p>
                <h2 className="mt-1 line-clamp-2 text-3xl font-extrabold leading-none tracking-tight text-white sm:text-5xl">
                  {currentSong.albumTitle || currentSong.title}
                </h2>
                <p className="mt-3 truncate text-sm text-white/70">
                  <span className="font-semibold text-white">{currentSong.artistName}</span>
                  {year ? ` · ${year}` : ""}
                  {` · ${tracks.length} song${tracks.length === 1 ? "" : "s"}`}
                  {` · ${formatDuration(totalDuration)}`}
                </p>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-4">
              <button
                type="button"
                onClick={togglePlay}
                className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-violet-500 text-white"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause size={26} fill="currentColor" /> : <Play size={26} fill="currentColor" className="ml-1" />}
              </button>
              <button type="button" onClick={toggleShuffle} aria-label="Shuffle" className="cursor-pointer">
                <Shuffle size={22} className={cn(shuffle ? "text-violet-300" : "text-white/60")} />
              </button>
              <button type="button" onClick={toggleRepeat} aria-label="Repeat" className="cursor-pointer">
                {repeat === "one" ? (
                  <Repeat1 size={22} className="text-violet-300" />
                ) : (
                  <Repeat size={22} className={cn(repeat === "all" ? "text-violet-300" : "text-white/60")} />
                )}
              </button>
              <button type="button" onClick={() => toggleLikeSong(currentSong)} aria-label="Favorite" className="cursor-pointer">
                <Heart size={22} className={isSongLiked(currentSong.id) ? "fill-violet-400 text-violet-400" : "text-white/70"} />
              </button>
            </div>
            <div className="mt-6 flex items-center justify-between border-b border-white/10 px-2 pb-2 text-xs uppercase tracking-wide text-white/40">
              <span># Title</span>
              <span>Time</span>
            </div>
            <ol>
              {tracks.map((song, index) => {
                const active = song.id === currentSong.id;
                return (
                  <li key={`${song.id}-${index}`}>
                    <button
                      type="button"
                      onClick={() => play(song, tracks)}
                      className={cn(
                        "grid w-full cursor-pointer grid-cols-[2rem_1fr_auto] items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-white/5",
                        active && "text-violet-300"
                      )}
                    >
                      <span className="text-center text-sm text-white/40">{index + 1}</span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{song.title}</span>
                        <span className="block truncate text-xs text-white/50">{song.artistName}</span>
                      </span>
                      <span className="text-xs text-white/50">{formatDuration(song.duration)}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
          <aside className="hidden w-[340px] shrink-0 flex-col overflow-y-auto border-l border-white/10 bg-black/30 p-4 xl:flex">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="truncate text-sm font-semibold text-white">{currentSong.title}</p>
              <button type="button" onClick={() => setShowNowPlaying(false)} className="text-white/60 hover:text-white" aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <div className="relative aspect-square w-full overflow-hidden rounded-md">
              <Image src={currentSong.cover} alt={currentSong.title} fill className="object-cover" sizes="340px" />
            </div>
            <div className="mt-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-xl font-bold text-white">{currentSong.title}</h3>
                <p className="truncate text-sm text-white/60">{currentSong.artistName}</p>
              </div>
              <button type="button" onClick={() => toggleLikeSong(currentSong)} aria-label="Favorite" className="cursor-pointer">
                <Heart size={20} className={isSongLiked(currentSong.id) ? "fill-violet-400 text-violet-400" : "text-white/70"} />
              </button>
            </div>
          </aside>
          <button
            type="button"
            onClick={() => setShowNowPlaying(false)}
            className="absolute right-4 top-4 text-white/70 hover:text-white xl:hidden"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}
