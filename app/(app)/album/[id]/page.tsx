"use client";

import { use } from "react";
import Image from "next/image";
import { Heart, Share2, Clock } from "lucide-react";
import { getAlbumById } from "@/lib/mock-data/albums";
import { getSongsByAlbum } from "@/lib/mock-data/songs";
import { usePlayer } from "@/lib/contexts/app-context";
import { SongCard, PlayButton } from "@/components/music/music-cards";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";

export default function AlbumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const album = getAlbumById(id);
  const { play, toggleLikeAlbum, isAlbumLiked } = usePlayer();

  if (!album) notFound();

  const albumSongs = getSongsByAlbum(id);
  const totalDuration = albumSongs.reduce((acc, s) => acc + s.duration, 0);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end">
        <div className="relative mx-auto h-48 w-48 shrink-0 overflow-hidden rounded-xl shadow-2xl sm:mx-0 sm:h-64 sm:w-64">
          <Image src={album.cover} alt={album.title} fill className="object-cover" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <p className="text-xs font-medium uppercase tracking-wider text-white/50">{album.type}</p>
          <h1 className="mt-1 text-3xl font-bold md:text-5xl">{album.title}</h1>
          <p className="mt-2 text-sm text-white/60">
            <Link href={`/artist/${album.artistId}`} className="font-medium text-white hover:underline">
              {album.artistName}
            </Link>
            {" · "}{new Date(album.releaseDate).getFullYear()}
            {" · "}{albumSongs.length} songs · {formatDuration(totalDuration)}
          </p>
          <div className="mt-4 flex items-center justify-center gap-3 sm:justify-start">
            <PlayButton
              size="lg"
              onClick={() => albumSongs[0] && play(albumSongs[0], albumSongs)}
            />
            <Button variant="ghost" size="icon" onClick={() => toggleLikeAlbum(album.id)}>
              <Heart
                size={20}
                className={isAlbumLiked(album.id) ? "fill-violet-500 text-violet-500" : ""}
              />
            </Button>
            <Button variant="ghost" size="icon">
              <Share2 size={20} />
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-1">
        {albumSongs.map((song, i) => (
          <SongCard key={song.id} song={song} index={i + 1} onPlay={() => play(song, albumSongs)} />
        ))}
      </div>
    </div>
  );
}
