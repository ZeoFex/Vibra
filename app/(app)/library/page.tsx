"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Clock, Disc, Users, ListMusic, Plus } from "lucide-react";
import { playlists } from "@/lib/mock-data";
import { songs } from "@/lib/mock-data/songs";
import { albums } from "@/lib/mock-data/albums";
import { artists } from "@/lib/mock-data/artists";
import { usePlayer } from "@/lib/contexts/app-context";
import { SectionHeader, SongCard, AlbumCard, ArtistCard, PlaylistCard } from "@/components/music/music-cards";
import { Button } from "@/components/ui/button";

const tabs = [
  { id: "playlists", label: "Playlists", icon: ListMusic },
  { id: "liked", label: "Liked Songs", icon: Heart },
  { id: "albums", label: "Albums", icon: Disc },
  { id: "artists", label: "Artists", icon: Users },
  { id: "recent", label: "Recently Played", icon: Clock },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<TabId>("playlists");
  const { play, isSongLiked, isAlbumLiked, isArtistLiked, likedSongs, likedAlbums, likedArtists } = usePlayer();

  const likedSongList = songs.filter((s) => isSongLiked(s.id));
  const likedAlbumList = albums.filter((a) => isAlbumLiked(a.id));
  const likedArtistList = artists.filter((a) => isArtistLiked(a.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Library</h1>
        <Button variant="secondary" size="sm" className="gap-1">
          <Plus size={16} />
          Create Playlist
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === id ? "bg-white text-black" : "bg-white/10 text-white/70 hover:bg-white/20"
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {activeTab === "playlists" && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {playlists.map((p) => (
            <PlaylistCard key={p.id} playlist={p} />
          ))}
        </div>
      )}

      {activeTab === "liked" && (
        <div className="space-y-1">
          {likedSongList.length === 0 ? (
            <p className="text-white/50">No liked songs yet. Tap the heart on any track.</p>
          ) : (
            likedSongList.map((song, i) => (
              <SongCard key={song.id} song={song} index={i + 1} onPlay={() => play(song, likedSongList)} />
            ))
          )}
        </div>
      )}

      {activeTab === "albums" && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {likedAlbumList.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </div>
      )}

      {activeTab === "artists" && (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
          {likedArtistList.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </div>
      )}

      {activeTab === "recent" && (
        <div className="space-y-1">
          {songs.slice(0, 6).map((song, i) => (
            <SongCard key={song.id} song={song} index={i + 1} onPlay={() => play(song, songs)} />
          ))}
        </div>
      )}
    </div>
  );
}
