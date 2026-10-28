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
  ChevronDown,
} from "lucide-react";
import { ShareMenu, songShareTarget } from "@/components/layout/share-platform";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePlayer } from "@/lib/contexts/app-context";
import { cn, formatDuration } from "@/lib/utils";

function SpeedButton({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const { playbackRate, cyclePlaybackRate } = usePlayer();
  const label = `${playbackRate}×`;
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        event.preventDefault();
        cyclePlaybackRate();
      }}
      aria-label={`Playback speed ${label}`}
      className={cn(
        "cursor-pointer rounded-full border px-2 font-semibold tabular-nums",
        playbackRate === 1 ? "border-white/20 text-white" : "border-violet-300 bg-violet-500/20 text-violet-100",
        size === "sm" && "h-6 text-[10px]",
        size === "md" && "h-7 text-xs",
        size === "lg" && "h-9 text-sm"
      )}
    >
      {label}
    </button>
  );
}

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
  const [tint, setTint] = useState("rgb(18, 12, 28)");
  const [screenTint, setScreenTint] = useState("rgb(72, 24, 48)");
  const [credits, setCredits] = useState({ composer: "", songwriter: "" });

  useEffect(() => {
    if (!currentSong?.cover) return;
    let cancelled = false;
    const img = new window.Image();
    const source = currentSong.cover.startsWith("http")
      ? `/api/music/artwork?url=${encodeURIComponent(currentSong.cover)}`
      : currentSong.cover;
    img.onload = () => {
      if (cancelled) return;
      const canvas = document.createElement("canvas");
      const size = 24;
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) return;
      context.drawImage(img, 0, 0, size, size);
      let data: Uint8ClampedArray;
      try {
        data = context.getImageData(0, 0, size, size).data;
      } catch {
        return;
      }
      let r = 0;
      let g = 0;
      let b = 0;
      let count = 0;
      for (let i = 0; i < data.length; i += 16) {
        const red = data[i];
        const green = data[i + 1];
        const blue = data[i + 2];
        const max = Math.max(red, green, blue);
        const min = Math.min(red, green, blue);
        if (max < 28 || max - min < 16) continue;
        r += red;
        g += green;
        b += blue;
        count += 1;
      }
      if (!count) return;
      const red = r / count;
      const green = g / count;
      const blue = b / count;
      setTint(`rgb(${Math.round(red * 0.42)}, ${Math.round(green * 0.42)}, ${Math.round(blue * 0.42)})`);
      setScreenTint(`rgb(${Math.round(red * 0.72)}, ${Math.round(green * 0.55)}, ${Math.round(blue * 0.62)})`);
    };
    img.src = source;
    return () => {
      cancelled = true;
    };
  }, [currentSong?.cover]);

  useEffect(() => {
    if (!showNowPlaying || !currentSong) return;
    let cancelled = false;
    setCredits({ composer: currentSong.producers || "", songwriter: currentSong.songwriters || "" });
    fetch(`/api/music/song/${encodeURIComponent(currentSong.id)}`)
      .then(async (response) => {
        if (!response.ok || cancelled) return;
        const data = (await response.json()) as { song?: { producers?: string; songwriters?: string; artistName?: string } };
        if (cancelled || !data.song) return;
        setCredits({
          composer: data.song.producers || data.song.artistName || currentSong.artistName,
          songwriter: data.song.songwriters || data.song.artistName || currentSong.artistName,
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [showNowPlaying, currentSong]);

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
      className="fixed bottom-[var(--tab-bar-height)] left-0 right-0 z-50 overflow-hidden lg:bottom-0 lg:border-t lg:border-white/10 lg:!bg-black/90 lg:pb-[env(safe-area-inset-bottom,0px)] lg:backdrop-blur-xl"
      style={{ backgroundColor: tint }}
    >
      <div
        className="group relative h-0.5 w-full cursor-pointer bg-white/15 lg:h-1 lg:bg-white/10"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const pct = (e.clientX - rect.left) / rect.width;
          seek(Math.floor(pct * currentSong.duration));
        }}
      >
        <div
          className="h-full bg-white transition-all lg:bg-violet-500 lg:group-hover:bg-violet-400"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div
        className="grid cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-1 px-3 py-1.5 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:gap-y-2 sm:px-4 sm:py-2"
        onClick={() => setShowNowPlaying(true)}
      >
        {/* Song info */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="relative h-9 w-9 shrink-0 cursor-pointer overflow-hidden rounded sm:h-12 sm:w-12 sm:rounded-lg"
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
        <div className="col-span-2 hidden flex-col items-center gap-0.5 sm:col-span-1 sm:col-start-2 sm:row-start-1 sm:flex" onClick={(event) => event.stopPropagation()}>
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
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-105 sm:h-10 sm:w-10"
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
            <SpeedButton />
          </div>
          <div className="hidden items-center gap-2 text-[10px] text-white/40 sm:flex sm:text-xs">
            <span>{formatDuration(progress)}</span>
            <span>/</span>
            <span>{formatDuration(currentSong.duration)}</span>
          </div>
        </div>

        {/* Volume & extras */}
        <div
          className="flex items-center justify-end gap-1 sm:col-start-3 sm:gap-2"
          onClick={(event) => {
            if (event.target !== event.currentTarget) event.stopPropagation();
          }}
        >
          <div className="flex items-center gap-0.5 sm:hidden" onClick={(event) => event.stopPropagation()}>
            <button type="button" onClick={toggleShuffle} aria-label="Shuffle" className="cursor-pointer p-0.5">
              <Shuffle size={14} className={cn(shuffle ? "text-violet-200" : "text-white/70")} />
            </button>
            <button type="button" onClick={previous} aria-label="Previous" className="cursor-pointer p-0.5 text-white">
              <SkipBack size={16} fill="currentColor" />
            </button>
            <button
              type="button"
              aria-label={isPlaying ? "Pause" : "Play"}
              onClick={togglePlay}
              className="flex h-7 w-7 cursor-pointer items-center justify-center text-white"
            >
              {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
            </button>
            <button type="button" onClick={next} aria-label="Next" className="cursor-pointer p-0.5 text-white">
              <SkipForward size={16} fill="currentColor" />
            </button>
            <button type="button" onClick={toggleRepeat} aria-label="Repeat" className="cursor-pointer p-0.5">
              {repeat === "one" ? (
                <Repeat1 size={14} className="text-violet-200" />
              ) : (
                <Repeat size={14} className={cn(repeat === "all" ? "text-violet-200" : "text-white/70")} />
              )}
            </button>
            <SpeedButton size="sm" />
            <button type="button" onClick={() => toggleLikeSong(currentSong)} aria-label="Favorite" className="cursor-pointer p-0.5">
              <Heart size={15} className={cn(isSongLiked(currentSong.id) ? "fill-violet-200 text-violet-200" : "text-white/70")} />
            </button>
          </div>
          <button
            onClick={() => toggleLikeSong(currentSong)}
            className="hidden shrink-0 cursor-pointer sm:block"
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
            className="hidden h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white sm:flex"
            aria-label="Close player"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {mounted && showNowPlaying && createPortal(
        <div className="fixed inset-0 z-[80] overflow-y-auto lg:hidden" style={{ backgroundColor: screenTint }}>
          <div className="mx-auto flex min-h-dvh max-w-lg flex-col px-4 pb-10 pt-[max(0.75rem,env(safe-area-inset-top))]">
            <div className="flex items-center justify-between">
              <button type="button" onClick={() => setShowNowPlaying(false)} aria-label="Close" className="cursor-pointer p-2 text-white">
                <ChevronDown size={26} />
              </button>
              <p className="truncate px-3 text-sm font-semibold text-white">{currentSong.albumTitle || "Now playing"}</p>
              <span className="w-10" />
            </div>
            <div className="relative mx-auto mt-4 aspect-square w-full max-w-md overflow-hidden rounded-md shadow-2xl">
              <Image src={currentSong.cover} alt={currentSong.title} fill className="object-cover" sizes="480px" />
            </div>
            <div className="mt-6 flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-2xl font-bold text-white">{currentSong.title}</h2>
                <p className="truncate text-sm text-white/75">{currentSong.artistName}</p>
              </div>
              <button type="button" onClick={() => toggleLikeSong(currentSong)} aria-label="Favorite" className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/40">
                <Heart size={18} className={isSongLiked(currentSong.id) ? "fill-white text-white" : "text-white"} />
              </button>
            </div>
            <button
              type="button"
              className="mt-4 h-1 w-full cursor-pointer rounded-full bg-white/25"
              onClick={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                const ratio = (event.clientX - rect.left) / rect.width;
                seek(Math.floor(ratio * currentSong.duration));
              }}
            >
              <span className="block h-full rounded-full bg-white" style={{ width: `${progressPercent}%` }} />
            </button>
            <div className="mt-1 flex justify-between text-xs text-white/70">
              <span>{formatDuration(progress)}</span>
              <span>-{formatDuration(Math.max(currentSong.duration - progress, 0))}</span>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <button type="button" onClick={toggleShuffle} aria-label="Shuffle" className="cursor-pointer p-2">
                <Shuffle size={22} className={cn(shuffle ? "text-white" : "text-white/70")} />
              </button>
              <button type="button" onClick={previous} aria-label="Previous" className="cursor-pointer p-2 text-white">
                <SkipBack size={32} fill="currentColor" />
              </button>
              <button
                type="button"
                onClick={togglePlay}
                className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-full bg-white text-black"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause size={30} fill="currentColor" /> : <Play size={30} fill="currentColor" className="ml-1" />}
              </button>
              <button type="button" onClick={next} aria-label="Next" className="cursor-pointer p-2 text-white">
                <SkipForward size={32} fill="currentColor" />
              </button>
              <button type="button" onClick={toggleRepeat} aria-label="Repeat" className="cursor-pointer p-2">
                {repeat === "one" ? (
                  <Repeat1 size={22} className="text-white" />
                ) : (
                  <Repeat size={22} className={cn(repeat === "all" ? "text-white" : "text-white/70")} />
                )}
              </button>
              <SpeedButton size="lg" />
            </div>
            <div className="mt-4 flex items-center justify-between text-white/80">
              <ShareMenu target={songShareTarget(currentSong)} iconOnly />
              <button type="button" onClick={() => setShowQueue((value) => !value)} aria-label="Queue" className="cursor-pointer p-2">
                <ListMusic size={20} />
              </button>
            </div>
            <div className="mt-8 space-y-3 pb-6">
              <section className="rounded-2xl bg-black/45 p-4">
                <h3 className="text-lg font-bold text-white">Credits</h3>
                <p className="mt-4 text-xs text-white/50">Composer</p>
                <p className="text-base font-medium text-white">{credits.composer || currentSong.artistName}</p>
                <p className="mt-3 text-xs text-white/50">Songwriter</p>
                <p className="text-base font-medium text-white">{credits.songwriter || currentSong.artistName}</p>
              </section>
              <section className="rounded-2xl bg-black/45 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">More songs</h3>
                  <Link href="/songs" onClick={() => setShowNowPlaying(false)} className="text-sm font-semibold text-white">
                    See all
                  </Link>
                </div>
                <div className="space-y-2">
                  {tracks.filter((song) => song.id !== currentSong.id).slice(0, 4).map((song) => (
                    <button
                      key={song.id}
                      type="button"
                      onClick={() => play(song, tracks)}
                      className="flex w-full cursor-pointer items-center gap-3 rounded-xl py-1 text-left"
                    >
                      <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md">
                        <Image src={song.cover} alt="" fill className="object-cover" sizes="48px" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-white">{song.title}</span>
                        <span className="block truncate text-xs text-white/55">{song.artistName}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>,
        document.body
      )}
      {mounted && showNowPlaying && createPortal(
        <div className="pointer-events-none fixed inset-0 z-[60] hidden lg:block">
          <div className="pointer-events-auto absolute bottom-[var(--app-chrome-bottom)] left-64 right-0 top-0 flex overflow-hidden bg-zinc-950">
          <div className="h-full min-h-0 min-w-0 overflow-y-auto px-8 py-6">
            <div className="flex items-end gap-6">
              <div className="relative h-44 w-44 shrink-0 overflow-hidden rounded-md shadow-lg">
                <Image src={currentSong.cover} alt={currentSong.albumTitle || currentSong.title} fill className="object-cover" sizes="176px" />
              </div>
              <div className="min-w-0 pb-1">
                <p className="text-sm font-medium text-white/80">{currentSong.genre || "Album"}</p>
                <h2 className="mt-1 line-clamp-3 text-5xl font-extrabold leading-none tracking-tight text-white">
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
              <button type="button" onClick={togglePlay} className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-violet-500 text-white" aria-label={isPlaying ? "Pause" : "Play"}>
                {isPlaying ? <Pause size={26} fill="currentColor" /> : <Play size={26} fill="currentColor" className="ml-1" />}
              </button>
              <button type="button" onClick={toggleShuffle} aria-label="Shuffle" className="cursor-pointer">
                <Shuffle size={22} className={cn(shuffle ? "text-violet-300" : "text-white/60")} />
              </button>
              <button type="button" onClick={toggleRepeat} aria-label="Repeat" className="cursor-pointer">
                {repeat === "one" ? <Repeat1 size={22} className="text-violet-300" /> : <Repeat size={22} className={cn(repeat === "all" ? "text-violet-300" : "text-white/60")} />}
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
                  <li key={`desk-${song.id}-${index}`}>
                    <button type="button" onClick={() => play(song, tracks)} className={cn("grid w-full cursor-pointer grid-cols-[2rem_1fr_auto] items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-white/5", active && "text-violet-300")}>
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
              <button type="button" onClick={() => setShowNowPlaying(false)} className="cursor-pointer text-white/60 hover:text-white" aria-label="Close">
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
          <button type="button" onClick={() => setShowNowPlaying(false)} className="absolute right-4 top-4 cursor-pointer text-white/70 hover:text-white xl:hidden" aria-label="Close">
            <X size={20} />
          </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
