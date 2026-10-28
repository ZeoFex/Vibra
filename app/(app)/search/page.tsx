"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search as SearchIcon, X } from "lucide-react";
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
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const { play } = usePlayer();

  useEffect(() => {
    fetch("/api/music/browse")
      .then(async (res) => {
        const data = (await res.json()) as { artists?: Artist[]; albums?: Album[]; genres?: AudiusGenre[] };
        const seenArtists = new Set<string>();
        setArtists((Array.isArray(data.artists) ? data.artists : []).filter((artist) => {
          const key = artist.name.toLowerCase();
          if (seenArtists.has(key)) return false;
          seenArtists.add(key);
          return true;
        }));
        const seenAlbums = new Set<string>();
        setAlbums((Array.isArray(data.albums) ? data.albums : []).filter((album) => {
          if (seenAlbums.has(album.id)) return false;
          seenAlbums.add(album.id);
          return true;
        }));
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
      import("@/lib/client/network").then(({ checkOnline }) => checkOnline()).then((online) => {
        if (!online) {
          setSearching(false);
          return;
        }
      fetch(`/api/music/search?q=${encodeURIComponent(q)}`)
        .then(async (res) => {
          const data = (await res.json()) as { songs?: Song[] };
          setSongs(Array.isArray(data.songs) ? data.songs : []);
        })
        .catch(() => setSongs([]))
        .finally(() => setSearching(false));
      });
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
        <SearchIcon size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
        <Input
          placeholder="Search songs, artists, albums..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSuggestionsOpen(true);
          }}
          className="pl-11 pr-11"
        />
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              setSuggestionsOpen(false);
            }}
            className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
          >
            <X size={14} />
          </button>
        )}
        {suggestionsOpen && query.trim().length >= 1 && songs.length > 0 && (
          <div className="mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-white/10 bg-[#1a1028] p-2">
            {songs.slice(0, 8).map((song, index) => (
              <button
                key={`${song.id}-suggest-${index}`}
                type="button"
                onClick={() => {
                  setSuggestionsOpen(false);
                  setQuery(song.title);
                  play(song, songs);
                }}
                className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-white/10"
              >
                {song.cover ? <img src={song.cover} alt="" className="h-10 w-10 rounded object-cover" /> : <span className="h-10 w-10 rounded bg-white/10" />}
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{song.title}</span>
                  <span className="block truncate text-xs text-white/50">{song.artistName}</span>
                </span>
              </button>
            ))}
          </div>
        )}
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
                <div key={`${artist.name}-${i}`}>
                  <p className="mb-2 text-center text-xs font-bold text-white/40">#{i + 1}</p>
                  <ArtistCard artist={artist} />
                </div>
              ))}
            </div>
          </section>

          <section>
            <SectionHeader title="Albums" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {albums.map((album, i) => (
                <AlbumCard key={`${album.id}-${i}`} album={album} />
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
                {results.artists.map((artist, i) => (
                  <ArtistCard key={`${artist.name}-${i}`} artist={artist} />
                ))}
              </div>
            </section>
          )}
          {results.albums.length > 0 && (
            <section>
              <SectionHeader title="Albums" />
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {results.albums.map((album, i) => (
                  <AlbumCard key={`${album.id}-result-${i}`} album={album} />
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
                    key={`${song.id}-result-${i}`}
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
