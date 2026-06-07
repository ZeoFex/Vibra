import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";
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
}

export function SongCard({ song, onPlay, showArtist = true, index }: SongCardProps) {
  return (
    <div className="group flex items-center gap-4 rounded-xl px-3 py-2 transition-colors hover:bg-white/5">
      {index !== undefined && (
        <span className="w-6 text-center text-sm text-white/40">{index}</span>
      )}
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
        <Image src={song.cover} alt={song.title} fill className="object-cover" />
        {onPlay && (
          <button
            onClick={() => onPlay(song)}
            className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <Play size={18} fill="white" className="text-white" />
          </button>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">{song.title}</p>
        {showArtist && (
          <Link href={`/artist/${song.artistId}`} className="truncate text-xs text-white/50 hover:underline">
            {song.artistName}
          </Link>
        )}
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
      <p className="text-xs text-white/50">Artist</p>
    </Link>
  );
}

interface PlaylistCardProps {
  playlist: Playlist;
}

export function PlaylistCard({ playlist }: PlaylistCardProps) {
  return (
    <Link href={`/playlist/${playlist.id}`} className="group block">
      <div className="relative mb-3 aspect-square overflow-hidden rounded-xl">
        <Image src={playlist.cover} alt={playlist.title} fill className="object-cover transition-transform group-hover:scale-105" />
      </div>
      <p className="truncate text-sm font-medium text-white">{playlist.title}</p>
      <p className="truncate text-xs text-white/50">{playlist.description}</p>
    </Link>
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
    <div className={cn("flex gap-4 overflow-x-auto pb-2 scrollbar-hide", className)}>
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
