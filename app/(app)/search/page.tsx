"use client";

import { useState, useMemo } from "react";
import { Search as SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { songs, artists, albums, genres } from "@/lib/mock-data";
import { usePlayer } from "@/lib/contexts/app-context";
import {
  SectionHeader,
  SongCard,
  AlbumCard,
  ArtistCard,
  GenreCard,
  HorizontalScroll,
} from "@/components/music/music-cards";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const { play } = usePlayer();

  const results = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.toLowerCase();
    return {
      songs: songs.filter(
        (s) => s.title.toLowerCase().includes(q) || s.artistName.toLowerCase().includes(q)
      ),
      artists: artists.filter((a) => a.name.toLowerCase().includes(q)),
      albums: albums.filter(
        (a) => a.title.toLowerCase().includes(q) || a.artistName.toLowerCase().includes(q)
      ),
    };
  }, [query]);

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
              {artists.map((artist) => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
            </div>
          </section>

          <section>
            <SectionHeader title="All Albums" />
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
          {results.songs.length > 0 && (
            <section>
              <SectionHeader title="Songs" />
              <div className="space-y-1">
                {results.songs.map((song, i) => (
                  <SongCard
                    key={song.id}
                    song={song}
                    index={i + 1}
                    onPlay={() => play(song, results.songs)}
                  />
                ))}
              </div>
            </section>
          )}
          {results.songs.length === 0 && results.artists.length === 0 && results.albums.length === 0 && (
            <p className="text-center text-white/50">No results for &ldquo;{query}&rdquo;</p>
          )}
        </div>
      )}
    </div>
  );
}
