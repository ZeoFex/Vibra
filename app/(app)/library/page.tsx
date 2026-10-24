"use client";

import { useState } from "react";
import { Heart, Clock, Disc, Users, ListMusic, Plus, Download, Trash2, HardDrive } from "lucide-react";
import { usePlayer } from "@/lib/contexts/app-context";
import { usePlaylists } from "@/lib/contexts/playlist-context";
import { useRouter } from "next/navigation";
import { SectionHeader, SongCard, AlbumCard, ArtistCard, PlaylistCard, DownloadControl } from "@/components/music/music-cards";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/utils";
import type { Song } from "@/types";

const tabs = [
  { id: "playlists", label: "Playlists", icon: ListMusic },
  { id: "liked", label: "Liked Songs", icon: Heart },
  { id: "albums", label: "Albums", icon: Disc },
  { id: "artists", label: "Artists", icon: Users },
  { id: "recent", label: "Recently Played", icon: Clock },
  { id: "downloads", label: "Downloads", icon: Download },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<TabId>("playlists");
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const { play, savedSongs, savedAlbums, savedArtists, recentSongs, savedDownloads, downloads, removeDownload, downloadedSongIds } = usePlayer();
  const { playlists, createPlaylist } = usePlaylists();
  const router = useRouter();

  function submitPlaylist() {
    const playlist = createPlaylist(title);
    setTitle("");
    setCreating(false);
    router.push(`/playlist/${playlist.id}`);
  }

  const likedSongList = savedSongs;
  const likedAlbumList = savedAlbums;
  const likedArtistList = savedArtists;

  const downloadedSongs = savedDownloads
    .map((song) => ({ song, meta: downloads.get(song.id) }))
    .filter((item): item is { song: Song; meta: NonNullable<typeof item.meta> } => !!item.meta);

  const totalDownloadSize = downloadedSongs.reduce((acc, d) => acc + d.meta.sizeMb, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold sm:text-2xl">Your Library</h1>
        <Button variant="secondary" size="sm" className="w-full gap-1 sm:w-auto" onClick={() => setCreating(true)}>
          <Plus size={16} />
          Create Playlist
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto scroll-pl-safe pb-2 scrollbar-hide scroll-snap-x -mx-1 px-1">
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
            {id === "downloads" && downloadedSongIds.length > 0 && (
              <span className="rounded-full bg-violet-600 px-1.5 text-xs text-white">
                {downloadedSongIds.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {creating && (
        <form
          className="flex flex-col gap-3 rounded-xl bg-white/5 p-4 sm:flex-row sm:items-center"
          onSubmit={(event) => {
            event.preventDefault();
            submitPlaylist();
          }}
        >
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Playlist name"
            className="h-11 flex-1 rounded-md bg-white/10 px-3 text-sm outline-none"
            autoFocus
          />
          <Button type="submit" size="sm">Create</Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setCreating(false)}>Cancel</Button>
        </form>
      )}

      {activeTab === "playlists" && (
        playlists.length === 0 ? (
          <div className="py-16 text-center">
            <ListMusic size={40} className="mx-auto mb-3 text-white/20" />
            <p className="text-white/70">No playlists yet</p>
            <p className="mt-1 text-sm text-white/40">Create one and add songs to it.</p>
            <Button className="mt-4 gap-1" onClick={() => setCreating(true)}>
              <Plus size={16} />
              Create Playlist
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {playlists.map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
        )
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
        likedAlbumList.length === 0 ? (
          <p className="text-white/50">No liked albums yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {likedAlbumList.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        )
      )}

      {activeTab === "artists" && (
        likedArtistList.length === 0 ? (
          <p className="text-white/50">No liked artists yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
            {likedArtistList.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        )
      )}

      {activeTab === "recent" && (
        recentSongs.length === 0 ? (
          <p className="text-white/50">Songs you play will show up here.</p>
        ) : (
          <div className="space-y-1">
            {recentSongs.map((song, index) => (
              <SongCard key={song.id} song={song} index={index + 1} onPlay={() => play(song, recentSongs)} />
            ))}
          </div>
        )
      )}

      {activeTab === "downloads" && (
        <div className="space-y-6">
          <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
            <HardDrive size={24} className="text-violet-400" />
            <div>
              <p className="font-medium">{downloadedSongs.length} downloaded tracks</p>
              <p className="text-sm text-white/50">{totalDownloadSize.toFixed(1)} MB used</p>
            </div>
          </div>

          {downloadedSongs.length === 0 ? (
            <div className="py-12 text-center">
              <Download size={40} className="mx-auto mb-3 text-white/20" />
              <p className="text-white/50">No downloads yet</p>
              <p className="mt-1 text-sm text-white/30">Download songs to listen offline</p>
            </div>
          ) : (
            <div className="space-y-1">
              {downloadedSongs.map(({ song, meta }, i) => (
                <div key={song.id} className="group flex items-center gap-2 rounded-xl hover:bg-white/5">
                  <div className="flex-1">
                    <SongCard
                      song={song}
                      index={i + 1}
                      showDownload={false}
                      onPlay={() => play(song, downloadedSongs.map((d) => d.song))}
                    />
                  </div>
                  <div className="hidden shrink-0 pr-2 text-xs text-white/40 sm:block">
                    <p>{meta.sizeMb} MB</p>
                    <p>{new Date(meta.downloadedAt).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={() => removeDownload(song.id)}
                    className="mr-2 rounded-lg p-2 text-white/50 hover:bg-red-600/20 hover:text-red-400"
                    title="Remove download"
                    aria-label="Remove download"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <section>
              <SectionHeader title="Available to Download" subtitle="From your liked songs" />
              <div className="space-y-1">
                {likedSongList
                  .filter((s) => !downloads.has(s.id))
                  .slice(0, 5)
                  .map((song) => (
                    <DownloadRow key={song.id} song={song} />
                  ))}
              </div>
            </section>
        </div>
      )}
    </div>
  );
}

function DownloadRow({ song }: { song: Song }) {
  const { isDownloaded } = usePlayer();

  if (isDownloaded(song.id)) return null;

  return (
    <div className="flex items-center justify-between rounded-xl px-3 py-2 hover:bg-white/5">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{song.title}</p>
        <p className="truncate text-xs text-white/50">{song.artistName} · {formatDuration(song.duration)}</p>
      </div>
      <DownloadControl song={song} />
    </div>
  );
}
