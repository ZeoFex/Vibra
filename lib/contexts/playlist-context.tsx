"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Playlist, Song } from "@/types";

const STORAGE_KEY = "vibra-user-playlists";

export interface UserPlaylist extends Playlist {
  songs: Song[];
}

interface PlaylistContextValue {
  playlists: UserPlaylist[];
  ready: boolean;
  createPlaylist: (title: string) => UserPlaylist;
  updatePlaylist: (playlistId: string, title: string) => void;
  deletePlaylist: (playlistId: string) => void;
  addSong: (playlistId: string, song: Song) => void;
  removeSong: (playlistId: string, songId: string) => void;
  getPlaylist: (id: string) => UserPlaylist | undefined;
}

const PlaylistContext = createContext<PlaylistContextValue | null>(null);

export function PlaylistProvider({ children }: { children: ReactNode }) {
  const [playlists, setPlaylists] = useState<UserPlaylist[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setPlaylists(JSON.parse(raw) as UserPlaylist[]);
    } catch {
      setPlaylists([]);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(playlists));
  }, [playlists, ready]);

  const createPlaylist = useCallback((title: string) => {
    const now = new Date().toISOString();
    const playlist: UserPlaylist = {
      id: `pl-${crypto.randomUUID()}`,
      title: title.trim() || "New playlist",
      description: "Your playlist",
      cover: "",
      ownerId: "me",
      ownerName: "You",
      songIds: [],
      songs: [],
      isPublic: false,
      createdAt: now,
      updatedAt: now,
    };
    setPlaylists((prev) => [playlist, ...prev]);
    return playlist;
  }, []);

  const addSong = useCallback((playlistId: string, song: Song) => {
    setPlaylists((prev) =>
      prev.map((playlist) => {
        if (playlist.id !== playlistId || playlist.songs.some((item) => item.id === song.id)) return playlist;
        const songs = [...playlist.songs, song];
        return {
          ...playlist,
          songs,
          songIds: songs.map((item) => item.id),
          cover: songs[0]?.cover ?? "",
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, []);

  const removeSong = useCallback((playlistId: string, songId: string) => {
    setPlaylists((prev) =>
      prev.map((playlist) => {
        if (playlist.id !== playlistId) return playlist;
        const songs = playlist.songs.filter((item) => item.id !== songId);
        return {
          ...playlist,
          songs,
          songIds: songs.map((item) => item.id),
          cover: songs[0]?.cover ?? "",
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, []);

  const updatePlaylist = useCallback((playlistId: string, title: string) => {
    const nextTitle = title.trim();
    if (!nextTitle) return;
    setPlaylists((prev) =>
      prev.map((playlist) =>
        playlist.id === playlistId ? { ...playlist, title: nextTitle, updatedAt: new Date().toISOString() } : playlist
      )
    );
  }, []);

  const deletePlaylist = useCallback((playlistId: string) => {
    setPlaylists((prev) => prev.filter((playlist) => playlist.id !== playlistId));
  }, []);

  const getPlaylist = useCallback((id: string) => playlists.find((playlist) => playlist.id === id), [playlists]);

  return (
    <PlaylistContext.Provider value={{ playlists, ready, createPlaylist, updatePlaylist, deletePlaylist, addSong, removeSong, getPlaylist }}>
      {children}
    </PlaylistContext.Provider>
  );
}

export function usePlaylists() {
  const ctx = useContext(PlaylistContext);
  if (!ctx) throw new Error("usePlaylists must be used within PlaylistProvider");
  return ctx;
}
