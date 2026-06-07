"use client";

import Link from "next/link";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import {
  recentlyPlayed,
  recommendedSongs,
  trendingSongs,
  topCharts,
  moods,
  getNewReleases,
  playlists,
  genres,
} from "@/lib/mock-data";
import { getSongById } from "@/lib/mock-data/songs";
import { usePlayer } from "@/lib/contexts/app-context";
import {
  SectionHeader,
  HorizontalScroll,
  SongCard,
  AlbumCard,
  PlaylistCard,
  GenreCard,
} from "@/components/music/music-cards";
import { songs } from "@/lib/mock-data/songs";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const { play } = usePlayer();
  const newReleases = getNewReleases().slice(0, 6);

  const handlePlaySong = (songId: string) => {
    const song = getSongById(songId);
    if (song) play(song, songs);
  };

  return (
    <div className="space-y-10">
      {/* Greeting */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600/30 to-fuchsia-600/20 p-6 md:p-8">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-violet-500/20 blur-3xl" />
        <h1 className="relative text-2xl font-bold md:text-3xl">Good evening</h1>
        <p className="relative mt-1 text-white/60">Discover your next favorite track</p>
        <div className="relative mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {playlists.slice(0, 4).map((p) => (
            <Link
              key={p.id}
              href={`/playlist/${p.id}`}
              className="flex items-center gap-3 rounded-lg bg-white/10 px-3 py-2 transition-colors hover:bg-white/20"
            >
              <div
                className="h-10 w-10 shrink-0 rounded bg-cover bg-center"
                style={{ backgroundImage: `url(${p.cover})` }}
              />
              <span className="truncate text-sm font-medium">{p.title}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recently Played */}
      <section>
        <SectionHeader title="Recently Played" href="/library" />
        <HorizontalScroll>
          {recentlyPlayed.map((id) => {
            const song = getSongById(id);
            if (!song) return null;
            return (
              <div key={id} className="min-w-[200px]">
                <SongCard song={song} onPlay={() => handlePlaySong(id)} />
              </div>
            );
          })}
        </HorizontalScroll>
      </section>

      {/* Recommended */}
      <section>
        <SectionHeader title="Recommended For You" subtitle="Based on your listening history" />
        <div className="grid gap-1">
          {recommendedSongs.map((id, i) => {
            const song = getSongById(id);
            if (!song) return null;
            return (
              <SongCard key={id} song={song} index={i + 1} onPlay={() => handlePlaySong(id)} />
            );
          })}
        </div>
      </section>

      {/* Trending */}
      <section>
        <SectionHeader title="Trending Songs" />
        <HorizontalScroll>
          {trendingSongs.map((id) => {
            const song = getSongById(id);
            if (!song) return null;
            return (
              <div key={id} className="min-w-[160px]">
                <div
                  className="group relative mb-2 aspect-square cursor-pointer overflow-hidden rounded-xl"
                  onClick={() => handlePlaySong(id)}
                >
                  <img src={song.cover} alt={song.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                </div>
                <p className="truncate text-sm font-medium">{song.title}</p>
                <p className="truncate text-xs text-white/50">{song.artistName}</p>
              </div>
            );
          })}
        </HorizontalScroll>
      </section>

      {/* New Releases */}
      <section>
        <SectionHeader title="New Releases" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {newReleases.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </div>
      </section>

      {/* Top Charts */}
      <section>
        <SectionHeader title="Top Charts" />
        <div className="space-y-1">
          {topCharts.slice(0, 5).map(({ rank, song, trend }) => (
            <div key={song.id} className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-white/5">
              <span className="w-6 text-center text-lg font-bold text-white/60">{rank}</span>
              <span className="w-4">
                {trend === "up" && <ArrowUp size={14} className="text-green-400" />}
                {trend === "down" && <ArrowDown size={14} className="text-red-400" />}
                {trend === "same" && <Minus size={14} className="text-white/30" />}
              </span>
              <SongCard song={song} onPlay={() => handlePlaySong(song.id)} />
            </div>
          ))}
        </div>
      </section>

      {/* Mood */}
      <section>
        <SectionHeader title="Based On Your Mood" href="/ai" />
        <HorizontalScroll>
          {moods.map((mood) => (
            <Link
              key={mood.id}
              href={`/ai?mood=${mood.id}`}
              className={cn(
                "flex h-28 min-w-[140px] flex-col items-center justify-center rounded-xl bg-gradient-to-br p-4 transition-transform hover:scale-105",
                mood.gradient
              )}
            >
              <span className="text-3xl">{mood.emoji}</span>
              <span className="mt-2 text-sm font-semibold">{mood.name}</span>
            </Link>
          ))}
        </HorizontalScroll>
      </section>

      {/* Genres */}
      <section>
        <SectionHeader title="Browse Genres" href="/search" />
        <HorizontalScroll>
          {genres.map((genre) => (
            <GenreCard key={genre.id} genre={genre} />
          ))}
        </HorizontalScroll>
      </section>

      {/* Playlists */}
      <section>
        <SectionHeader title="Made For You" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {playlists.map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
      </section>
    </div>
  );
}
