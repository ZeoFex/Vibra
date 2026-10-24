"use client";

import Image from "next/image";
import { PlaylistMenu } from "@/components/music/playlist-menu";
import Link from "next/link";
import { useEffect, useState, type MouseEvent } from "react";
import { Download, Pause, Play } from "lucide-react";
import { ShareMenu, songShareTarget } from "@/components/layout/share-platform";
import { cn, formatNumber } from "@/lib/utils";
import { usePlayer } from "@/lib/contexts/app-context";
import type { Song, Album, Artist, Playlist } from "@/types";

interface PlayButtonProps {
  onClick?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function PlayButton({ onClick, className, size = "md" }: PlayButtonProps) {
  const sizes = { sm: "h-10 w-10", md: "h-12 w-12", lg: "h-14 w-14" };
  const iconSizes = { sm: 16, md: 20, lg: 24 };
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-center rounded-full bg-violet-600 text-white shadow-lg shadow-violet-600/40 transition-all hover:scale-105 hover:bg-violet-500",
        sizes[size],
        className
      )}
    >
      <Play size={iconSizes[size]} fill="currentColor" className="ml-0.5" />
    </button>
  );
}

interface SongCardProps {
  song: Song;
  onPlay?: (song: Song) => void;
  showArtist?: boolean;
  index?: number;
  showDownload?: boolean;
  showShare?: boolean;
}

export function DownloadControl({ song }: { song: Song }) {
  const { downloadSong, isDownloaded } = usePlayer();
  const downloaded = isDownloaded(song.id);
  const [progress, setProgress] = useState<number | null>(null);

  useEffect(() => {
    if (progress === null) return;
    if (progress >= 100) {
      downloadSong(song);
      setProgress(null);
      return;
    }
    const timer = window.setTimeout(() => setProgress((value) => (value === null ? null : value + 12)), 90);
    return () => window.clearTimeout(timer);
  }, [progress, downloadSong, song]);

  if (downloaded || progress !== null && progress >= 100) {
    const radius = 8;
    const length = 2 * Math.PI * radius;
    return (
      <span className="relative flex h-8 w-8 shrink-0 items-center justify-center" aria-label="Downloaded">
        <svg className="h-6 w-6 -rotate-90" viewBox="0 0 24 24">
          <circle
            cx="12"
            cy="12"
            r={radius}
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-violet-400"
            strokeDasharray={length}
            strokeDashoffset={0}
            strokeLinecap="round"
          />
        </svg>
        <Download size={12} className="absolute text-violet-400" />
      </span>
    );
  }

  if (progress !== null) {
    const radius = 8;
    const length = 2 * Math.PI * radius;
    const offset = length - (Math.min(progress, 100) / 100) * length;
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center" aria-label="Downloading">
        <svg className="h-6 w-6 -rotate-90" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r={radius} stroke="currentColor" strokeWidth="2" fill="none" className="text-white/20" />
          <circle
            cx="12"
            cy="12"
            r={radius}
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-violet-400"
            strokeDasharray={length}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
      </span>
    );
  }

  return (
    <button
      type="button"
      aria-label="Download"
      onClick={(event) => {
        event.stopPropagation();
        setProgress(8);
      }}
      className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-white/80 transition hover:bg-[#5b21b6] hover:text-white"
    >
      <Download size={16} />
    </button>
  );
}

export function SongCard({ song, onPlay, showArtist = true, index, showDownload = true, showShare = true }: SongCardProps) {
  const { currentSong, isPlaying, togglePlay } = usePlayer();
  const active = currentSong?.id === song.id;
  const playing = active && isPlaying;

  function onThumbnailClick(event: MouseEvent) {
    event.stopPropagation();
    if (active) togglePlay();
    else onPlay?.(song);
  }

  return (
    <div
      className={cn(
        "group flex w-full min-w-0 items-center gap-2 rounded-xl py-2 sm:gap-3 sm:px-2",
        onPlay && "cursor-pointer"
      )}
      onClick={onPlay ? () => onPlay(song) : undefined}
      role={onPlay ? "button" : undefined}
      tabIndex={onPlay ? 0 : undefined}
      onKeyDown={
        onPlay
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onPlay(song);
              }
            }
          : undefined
      }
    >
      {index !== undefined && (
        <span className="hidden w-5 shrink-0 text-center text-sm text-white/40 sm:inline sm:w-6">{index}</span>
      )}
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
        {song.cover.startsWith("/api/") ? (
          <img src={song.cover} alt="" className="h-full w-full object-cover" />
        ) : (
          <Image src={song.cover} alt={song.title} fill className="object-cover" />
        )}
        {onPlay && (
          <button
            type="button"
            aria-label={playing ? "Pause" : "Play"}
            onClick={onThumbnailClick}
            className={cn(
              "absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 transition hover:bg-[#5b21b6]",
              playing ? "opacity-100" : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
            )}
          >
            {playing ? (
              <Pause size={18} fill="white" className="text-white" />
            ) : (
              <Play size={18} fill="white" className="ml-0.5 text-white" />
            )}
          </button>
        )}
      </div>
      <div className="min-w-0 flex-1 overflow-hidden">
        <p className="truncate text-sm font-medium text-white">{song.title}</p>
        {showArtist && (
          <Link
            href={`/artist/${song.artistId}`}
            onClick={(e) => e.stopPropagation()}
            className="block truncate text-xs text-white/50 hover:underline"
          >
            {song.artistName}
          </Link>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {showDownload && <DownloadControl song={song} />}
        {showShare && <ShareMenu target={songShareTarget(song)} iconOnly />}
      </div>
    </div>
  );
}

interface AlbumCardProps {
  album: Album;
  onPlay?: () => void;
}

export function AlbumCard({ album, onPlay }: AlbumCardProps) {
  return (
    <Link href={`/album/${album.id}`} className="group block">
      <div className="relative mb-3 aspect-square overflow-hidden rounded-xl">
        <Image src={album.cover} alt={album.title} fill className="object-cover transition-transform group-hover:scale-105" />
        {onPlay && (
          <div
            className="absolute bottom-2 right-2 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-y-0 translate-y-2"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onPlay(); }}
          >
            <PlayButton size="sm" />
          </div>
        )}
      </div>
      <p className="truncate text-sm font-medium text-white">{album.title}</p>
      <p className="truncate text-xs text-white/50">{album.artistName}</p>
    </Link>
  );
}

interface ArtistCardProps {
  artist: Artist;
}

export function ArtistCard({ artist }: ArtistCardProps) {
  return (
    <Link href={`/artist/${artist.id}`} className="group block text-center">
      <div className="relative mx-auto mb-3 aspect-square w-full max-w-[180px] overflow-hidden rounded-full">
        <Image src={artist.image} alt={artist.name} fill className="object-cover transition-transform group-hover:scale-105" />
      </div>
      <p className="truncate text-sm font-medium text-white">{artist.name}</p>
      <p className="text-xs text-white/50">{formatNumber(artist.monthlyListeners)} plays</p>
    </Link>
  );
}

interface PlaylistCardProps {
  playlist: Playlist;
}

export function PlaylistCard({ playlist }: PlaylistCardProps) {
  return (
    <div className="group relative">
      <Link href={`/playlist/${playlist.id}`} className="block">
        <div className="relative mb-3 aspect-square overflow-hidden rounded-xl bg-white/10">
          {playlist.cover ? (
            <Image src={playlist.cover} alt={playlist.title} fill className="object-cover transition-transform group-hover:scale-105" />
          ) : null}
        </div>
        <p className="truncate pr-8 text-sm font-medium text-white">{playlist.title}</p>
        <p className="truncate text-xs text-white/50">{playlist.songIds.length} songs</p>
      </Link>
      <div className="absolute bottom-0 right-0">
        <PlaylistMenu playlistId={playlist.id} />
      </div>
    </div>
  );
}

interface SectionHeaderProps {
  title: string;
  href?: string;
  subtitle?: string;
}

export function SectionHeader({ title, href, subtitle }: SectionHeaderProps) {
  return (
    <div className="mb-4 flex items-end justify-between">
      <div>
        <h2 className="text-xl font-bold text-white md:text-2xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-white/50">{subtitle}</p>}
      </div>
      {href && (
        <Link href={href} className="text-sm text-white/50 transition-colors hover:text-white">
          See all
        </Link>
      )}
    </div>
  );
}

interface HorizontalScrollProps {
  children: React.ReactNode;
  className?: string;
}

export function HorizontalScroll({ children, className }: HorizontalScrollProps) {
  return (
    <div className={cn("flex gap-3 overflow-x-auto scroll-pl-safe pb-2 scrollbar-hide scroll-snap-x sm:gap-4 -mx-1 px-1 sm:-mx-0 sm:px-0", className)}>
      {children}
    </div>
  );
}

interface GenreCardProps {
  genre: { id: string; name: string; image: string; color: string };
}

export function GenreCard({ genre }: GenreCardProps) {
  return (
    <Link
      href={`/search?genre=${genre.name}`}
      className="group relative h-32 min-w-[160px] overflow-hidden rounded-xl md:min-w-[180px]"
    >
      <Image src={genre.image} alt={genre.name} fill className="object-cover transition-transform group-hover:scale-110" />
      <div
        className="absolute inset-0 mix-blend-multiply opacity-70"
        style={{ backgroundColor: genre.color }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <p className="absolute bottom-3 left-3 text-lg font-bold text-white">{genre.name}</p>
    </Link>
  );
}
