"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search as SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Album, Artist, Song } from "@/types";
import type { AudiusGenre } from "@/lib/audius";
import { usePlayer } from "@/lib/contexts/app-context";
import {
  SectionHeader,
  SongCard,
  AlbumCard,
  ArtistCard,
  GenreCard,
  HorizontalScroll,
} from "@/components/music/music-cards";

function SearchPage() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [songs, setSongs] = useState<Song[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [genres, setGenres] = useState<AudiusGenre[]>([]);
  const [searching, setSearching] = useState(false);
  const { play } = usePlayer();

  useEffect(() => {
    fetch("/api/music/browse")
      .then(async (res) => {
        const data = (await res.json()) as { artists?: Artist[]; albums?: Album[]; genres?: AudiusGenre[] };
        setArtists(Array.isArray(data.artists) ? data.artists : []);
        setAlbums(Array.isArray(data.albums) ? data.albums : []);
        setGenres(Array.isArray(data.genres) ? data.genres : []);
      })
      .catch(() => {
        setArtists([]);
        setAlbums([]);
        setGenres([]);
      });
  }, []);

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setSongs([]);
      setSearching(false);
      return;
    }

    const handle = setTimeout(() => {
      setSearching(true);
      fetch(`/api/music/search?q=${encodeURIComponent(q)}`)
        .then(async (res) => {
          const data = (await res.json()) as { songs?: Song[] };
          setSongs(Array.isArray(data.songs) ? data.songs : []);
        })
        .catch(() => setSongs([]))
        .finally(() => setSearching(false));
    }, 300);

    return () => clearTimeout(handle);
  }, [query]);

  const results = query.trim().length < 2
    ? null
    : {
        songs,
        artists: artists.filter((a) => a.name.toLowerCase().includes(query.trim().toLowerCase())),
        albums: albums.filter(
          (a) =>
            a.title.toLowerCase().includes(query.trim().toLowerCase()) ||
            a.artistName.toLowerCase().includes(query.trim().toLowerCase())
        ),
      };

  return (
    <div className="space-y-8">
      <div className="relative">
        <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
        <Input
          placeholder="Search songs, artists, albums..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-11"
        />
      </div>

      {!results ? (
        <>
          <section>
            <SectionHeader title="Browse All" />
            <HorizontalScroll>
              {genres.map((genre) => (
                <GenreCard key={genre.id} genre={genre} />
              ))}
            </HorizontalScroll>
          </section>

          <section>
            <SectionHeader title="Popular Artists" />
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {artists.map((artist, i) => (
                <div key={artist.id}>
                  <p className="mb-2 text-center text-xs font-bold text-white/40">#{i + 1}</p>
                  <ArtistCard artist={artist} />
                </div>
              ))}
            </div>
          </section>

          <section>
            <SectionHeader title="Albums" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {albums.map((album) => (
                <AlbumCard key={album.id} album={album} />
              ))}
            </div>
          </section>
        </>
      ) : (
        <div className="space-y-8">
          {results.artists.length > 0 && (
            <section>
              <SectionHeader title="Artists" />
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
                {results.artists.map((artist) => (
                  <ArtistCard key={artist.id} artist={artist} />
                ))}
              </div>
            </section>
          )}
          {results.albums.length > 0 && (
            <section>
              <SectionHeader title="Albums" />
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {results.albums.map((album) => (
                  <AlbumCard key={album.id} album={album} />
                ))}
              </div>
            </section>
          )}
          {searching && <p className="text-sm text-white/50">Searching…</p>}
          {results.songs.length > 0 && (
            <section>
              <SectionHeader title="Songs" />
              <div className="space-y-1">
                {results.songs.map((song, i) => (
                  <SongCard
                    key={song.id}
                    song={song}
                    index={i + 1}
                    showShare
                    onPlay={() => play(song, results.songs)}
                  />
                ))}
              </div>
            </section>
          )}
          {!searching && results.songs.length === 0 && results.artists.length === 0 && results.albums.length === 0 && (
            <p className="text-center text-white/50">No results for &ldquo;{query}&rdquo;</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPageWithParams() {
  return (
    <Suspense fallback={<div className="h-12" />}>
      <SearchPage />
    </Suspense>
  );
}
