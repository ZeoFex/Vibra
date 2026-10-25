"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import { Heart } from "lucide-react";
import { getAlbumById as getStaticAlbumById } from "@/lib/mock-data/albums";
import { getSongsByAlbum as getStaticSongsByAlbum } from "@/lib/mock-data/songs";
import { usePlayer } from "@/lib/contexts/app-context";
import { useArtistUploads } from "@/lib/contexts/artist-upload-context";
import { SongCard, PlayButton } from "@/components/music/music-cards";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/utils";
import Link from "next/link";
import type { Album, Song } from "@/types";

export default function AlbumPage({ params }: { params: Promise<{ id: string }> }) {
  const albumId = use(params).id;
  const audiusPlaylistId = albumId.startsWith("au-pl-") ? albumId.slice("au-pl-".length) : "";
  const jamendoAlbumId = albumId.startsWith("jm-al-") ? albumId.slice("jm-al-".length) : "";
  const { getAlbumById, getSongsByAlbumId } = useArtistUploads();
  const { play, toggleLikeAlbum, isAlbumLiked } = usePlayer();
  const [remoteAlbum, setRemoteAlbum] = useState<Album | null>(null);
  const [remoteSongs, setRemoteSongs] = useState<Song[] | null>(null);

  useEffect(() => {
    const url = audiusPlaylistId
      ? `/api/music/playlist/${audiusPlaylistId}`
      : jamendoAlbumId
        ? `/api/music/jamendo/album/${jamendoAlbumId}`
        : "";
    if (!url) return;
    fetch(url)
      .then(async (res) => {
        if (!res.ok) return;
        const data = (await res.json()) as { album?: Album; songs?: Song[] };
        setRemoteAlbum(data.album ?? null);
        setRemoteSongs(data.songs ?? []);
      })
      .catch(() => setRemoteSongs([]));
  }, [audiusPlaylistId, jamendoAlbumId]);

  const album = remoteAlbum ?? getAlbumById(albumId) ?? getStaticAlbumById(albumId);
  if (!album) {
    if ((audiusPlaylistId || jamendoAlbumId) && remoteSongs === null) return <p className="text-white/50">Loading album…</p>;
    return <p className="text-white/50">Album not found.</p>;
  }

  const artistAlbumSongs = remoteSongs ?? getSongsByAlbumId(albumId);
  const albumSongs = artistAlbumSongs.length > 0 ? artistAlbumSongs : getStaticSongsByAlbum(albumId);
  const totalDuration = albumSongs.reduce((acc, s) => acc + s.duration, 0);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end">
        <div className="relative mx-auto h-48 w-48 shrink-0 overflow-hidden rounded-xl shadow-2xl sm:mx-0 sm:h-64 sm:w-64">
          <Image src={album.cover} alt={album.title} fill className="object-cover" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <p className="text-xs font-medium uppercase tracking-wider text-white/50">{album.type}</p>
          <h1 className="mt-1 break-words text-2xl font-bold sm:text-3xl md:text-5xl">{album.title}</h1>
          <p className="mt-2 text-sm text-white/60">
            <Link href={`/artist/${album.artistId}`} className="font-medium text-white hover:underline">
              {album.artistName}
            </Link>
            {" · "}
            {new Date(album.releaseDate).getFullYear()}
            {" · "}
            {albumSongs.length} songs · {formatDuration(totalDuration)}
          </p>
          <div className="mt-4 flex items-center justify-center gap-3 sm:justify-start">
            <PlayButton
              size="lg"
              onClick={() => albumSongs[0] && play(albumSongs[0], albumSongs)}
            />
            <Button variant="ghost" size="icon" onClick={() => toggleLikeAlbum(album)}>
              <Heart
                size={20}
                className={isAlbumLiked(album.id) ? "fill-violet-500 text-violet-500" : ""}
              />
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
