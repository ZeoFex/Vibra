"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search as SearchIcon } from "lucide-react";
import { usePlayer } from "@/lib/contexts/app-context";
import {
  SectionHeader,
  HorizontalScroll,
  SongCard,
  AlbumCard,
  ArtistCard,
  GenreCard,
} from "@/components/music/music-cards";
import { Input } from "@/components/ui/input";
import type { Album, Artist, Song } from "@/types";
import type { AudiusGenre } from "@/lib/audius";

export default function HomePage() {
  const { play } = usePlayer();
  const [genres, setGenres] = useState<AudiusGenre[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [greeting, setGreeting] = useState("Welcome");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else if (hour < 21) setGreeting("Good evening");
    else setGreeting("Good night");
  }, []);

  useEffect(() => {
    fetch("/api/music/browse")
      .then(async (res) => {
        const data = (await res.json()) as {
          genres?: AudiusGenre[];
          songs?: Song[];
          albums?: Album[];
          artists?: Artist[];
        };
        setGenres(Array.isArray(data.genres) ? data.genres : []);
        setSongs(Array.isArray(data.songs) ? data.songs : []);
        setAlbums(Array.isArray(data.albums) ? data.albums : []);
        setArtists(Array.isArray(data.artists) ? data.artists : []);
      })
      .catch(() => {
        setGenres([]);
        setSongs([]);
        setAlbums([]);
        setArtists([]);
      });
  }, []);

  const trending = songs.slice(0, 12);
  const albumList = albums.slice(0, 12);
  const artistList = artists.slice(0, 12);

  const playCatalogAlbum = (album: Album) => {
    const audiusId = album.id.startsWith("au-pl-") ? album.id.slice("au-pl-".length) : "";
    const jamendoId = album.id.startsWith("jm-al-") ? album.id.slice("jm-al-".length) : "";
    const url = audiusId
      ? `/api/music/playlist/${audiusId}`
      : jamendoId
        ? `/api/music/jamendo/album/${jamendoId}`
        : "";
    if (!url) return;
    void fetch(url)
      .then(async (res) => {
        const data = (await res.json()) as { songs?: Song[] };
        const tracks = data.songs ?? [];
        if (tracks[0]) play(tracks[0], tracks);
      });
  };

  return (
    <div className="space-y-8 sm:space-y-10">
      <form action="/search" className="relative">
        <SearchIcon size={18} className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-violet-200" />
        <Input
          name="q"
          placeholder="Search songs, artists, albums..."
          className="h-12 rounded-full border-violet-400/20 bg-[#1a1028] pl-12 text-base shadow-none backdrop-blur-none"
          required
          minLength={2}
        />
      </form>

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600/30 to-fuchsia-600/20 p-6 md:p-8">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-violet-500/20 blur-3xl" />
        <h1 className="relative text-2xl font-bold md:text-3xl">{greeting}</h1>
        <p className="relative mt-1 text-white/60">Discover your next favorite track</p>
        <div className="relative mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {albums.slice(0, 4).map((album) => (
            <Link
              key={album.id}
              href={`/album/${album.id}`}
              className="flex items-center gap-3 rounded-lg bg-white/10 px-3 py-2 transition-colors hover:bg-white/20"
            >
              <div
                className="h-10 w-10 shrink-0 rounded bg-cover bg-center"
                style={{ backgroundImage: album.cover ? `url(${album.cover})` : undefined }}
              />
              <span className="truncate text-sm font-medium">{album.title}</span>
            </Link>
          ))}
        </div>
      </div>

      <section>
        <SectionHeader title="Trending Songs" />
        <div className="grid gap-1">
          {trending.map((song, i) => (
            <SongCard
              key={song.id}
              song={song}
              index={i + 1}
              showShare
              onPlay={() => play(song, songs)}
            />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="Albums" href="/albums" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {albumList.map((album) => (
            <AlbumCard key={album.id} album={album} onPlay={() => playCatalogAlbum(album)} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="Popular Artists" href="/search" />
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {artistList.map((artist, i) => (
            <div key={artist.id}>
              <p className="mb-2 text-center text-xs font-bold text-white/40">#{i + 1}</p>
              <ArtistCard artist={artist} />
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="Browse Genres" href="/search" />
        <HorizontalScroll>
          {genres.map((genre) => (
            <GenreCard key={genre.id} genre={genre} />
          ))}
        </HorizontalScroll>
      </section>
    </div>
  );
}
