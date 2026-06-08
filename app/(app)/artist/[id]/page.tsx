"use client";

import { use } from "react";
import Image from "next/image";
import { BadgeCheck, Heart, Share2, UserPlus } from "lucide-react";
import { getArtistById } from "@/lib/mock-data/artists";
import { getSongsByArtist } from "@/lib/mock-data/songs";
import { getAlbumsByArtist } from "@/lib/mock-data/albums";
import { usePlayer } from "@/lib/contexts/app-context";
import { SongCard, AlbumCard, PlayButton } from "@/components/music/music-cards";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";
import { notFound } from "next/navigation";

export default function ArtistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const artist = getArtistById(id);
  const { play, toggleLikeArtist, isArtistLiked } = usePlayer();

  if (!artist) notFound();

  const artistSongs = getSongsByArtist(id);
  const artistAlbums = getAlbumsByArtist(id);
  const popularTracks = [...artistSongs].sort((a, b) => b.plays - a.plays).slice(0, 5);
  const singles = artistAlbums.filter((a) => a.type === "single" || a.type === "ep");
  const albums = artistAlbums.filter((a) => a.type === "album");

  return (
    <div>
      <div className="relative mb-8 h-48 overflow-hidden rounded-2xl sm:h-64 md:h-80">
        <Image src={artist.image} alt={artist.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 768px" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6">
          {artist.verified && (
            <div className="mb-2 flex items-center gap-1 text-sm text-violet-400">
              <BadgeCheck size={16} />
              Verified Artist
            </div>
          )}
          <h1 className="break-words text-2xl font-bold sm:text-4xl md:text-6xl">{artist.name}</h1>
          <p className="mt-2 text-sm text-white/60">
            {formatNumber(artist.monthlyListeners)} monthly listeners
          </p>
        </div>
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-2 sm:gap-3">
        <PlayButton
          size="lg"
          onClick={() => popularTracks[0] && play(popularTracks[0], artistSongs)}
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => toggleLikeArtist(artist.id)}
        >
          <Heart
            size={22}
            className={isArtistLiked(artist.id) ? "fill-violet-500 text-violet-500" : ""}
          />
        </Button>
        <Button variant="ghost" size="icon">
          <UserPlus size={22} />
        </Button>
        <Button variant="ghost" size="icon">
          <Share2 size={22} />
        </Button>
      </div>

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-bold">Popular</h2>
        <div className="space-y-1">
          {popularTracks.map((song, i) => (
            <SongCard key={song.id} song={song} index={i + 1} onPlay={() => play(song, artistSongs)} />
          ))}
        </div>
      </section>

      {albums.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-bold">Albums</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {albums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        </section>
      )}

      {singles.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-bold">Singles & EPs</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {singles.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-xl font-bold">About</h2>
        <div className="glass rounded-2xl p-6">
          <p className="text-white/70">{artist.bio}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {artist.genres.map((g) => (
              <span key={g} className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/60">
                {g}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
