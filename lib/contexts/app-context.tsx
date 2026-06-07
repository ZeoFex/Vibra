"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { Song } from "@/types";
import { currentUser as mockUser } from "@/lib/mock-data";
import type { User } from "@/types";

type RepeatMode = "off" | "all" | "one";

interface PlayerState {
  currentSong: Song | null;
  queue: Song[];
  isPlaying: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  volume: number;
  progress: number;
  likedSongs: Set<string>;
  likedAlbums: Set<string>;
  likedArtists: Set<string>;
}

interface PlayerContextValue extends PlayerState {
  play: (song: Song, queue?: Song[]) => void;
  pause: () => void;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setVolume: (volume: number) => void;
  seek: (progress: number) => void;
  toggleLikeSong: (songId: string) => void;
  toggleLikeAlbum: (albumId: string) => void;
  toggleLikeArtist: (artistId: string) => void;
  isSongLiked: (songId: string) => boolean;
  isAlbumLiked: (albumId: string) => boolean;
  isArtistLiked: (artistId: string) => boolean;
  addToQueue: (song: Song) => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PlayerState>({
    currentSong: null,
    queue: [],
    isPlaying: false,
    shuffle: false,
    repeat: "off",
    volume: 80,
    progress: 0,
    likedSongs: new Set(["song-1", "song-3", "song-5"]),
    likedAlbums: new Set(["album-1", "album-3"]),
    likedArtists: new Set(["artist-1", "artist-3"]),
  });

  useEffect(() => {
    if (!state.isPlaying || !state.currentSong) return;
    const interval = setInterval(() => {
      setState((prev) => {
        if (!prev.currentSong) return prev;
        const newProgress = prev.progress + 1;
        if (newProgress >= prev.currentSong.duration) {
          return { ...prev, progress: 0, isPlaying: false };
        }
        return { ...prev, progress: newProgress };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [state.isPlaying, state.currentSong]);

  const play = useCallback((song: Song, queue?: Song[]) => {
    setState((prev) => ({
      ...prev,
      currentSong: song,
      queue: queue ?? prev.queue.length ? prev.queue : [song],
      isPlaying: true,
      progress: 0,
    }));
  }, []);

  const pause = useCallback(() => {
    setState((prev) => ({ ...prev, isPlaying: false }));
  }, []);

  const togglePlay = useCallback(() => {
    setState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
  }, []);

  const next = useCallback(() => {
    setState((prev) => {
      if (!prev.queue.length || !prev.currentSong) return prev;
      const idx = prev.queue.findIndex((s) => s.id === prev.currentSong!.id);
      let nextIdx = idx + 1;
      if (nextIdx >= prev.queue.length) {
        if (prev.repeat === "all") nextIdx = 0;
        else return { ...prev, isPlaying: false };
      }
      return { ...prev, currentSong: prev.queue[nextIdx], progress: 0, isPlaying: true };
    });
  }, []);

  const previous = useCallback(() => {
    setState((prev) => {
      if (!prev.queue.length || !prev.currentSong) return prev;
      if (prev.progress > 3) return { ...prev, progress: 0 };
      const idx = prev.queue.findIndex((s) => s.id === prev.currentSong!.id);
      const prevIdx = idx <= 0 ? prev.queue.length - 1 : idx - 1;
      return { ...prev, currentSong: prev.queue[prevIdx], progress: 0 };
    });
  }, []);

  const toggleShuffle = useCallback(() => {
    setState((prev) => ({ ...prev, shuffle: !prev.shuffle }));
  }, []);

  const toggleRepeat = useCallback(() => {
    setState((prev) => {
      const modes: RepeatMode[] = ["off", "all", "one"];
      const idx = modes.indexOf(prev.repeat);
      return { ...prev, repeat: modes[(idx + 1) % modes.length] };
    });
  }, []);

  const setVolume = useCallback((volume: number) => {
    setState((prev) => ({ ...prev, volume }));
  }, []);

  const seek = useCallback((progress: number) => {
    setState((prev) => ({ ...prev, progress }));
  }, []);

  const toggleLikeSong = useCallback((songId: string) => {
    setState((prev) => {
      const liked = new Set(prev.likedSongs);
      if (liked.has(songId)) liked.delete(songId);
      else liked.add(songId);
      return { ...prev, likedSongs: liked };
    });
  }, []);

  const toggleLikeAlbum = useCallback((albumId: string) => {
    setState((prev) => {
      const liked = new Set(prev.likedAlbums);
      if (liked.has(albumId)) liked.delete(albumId);
      else liked.add(albumId);
      return { ...prev, likedAlbums: liked };
    });
  }, []);

  const toggleLikeArtist = useCallback((artistId: string) => {
    setState((prev) => {
      const liked = new Set(prev.likedArtists);
      if (liked.has(artistId)) liked.delete(artistId);
      else liked.add(artistId);
      return { ...prev, likedArtists: liked };
    });
  }, []);

  const isSongLiked = useCallback(
    (songId: string) => state.likedSongs.has(songId),
    [state.likedSongs]
  );

  const isAlbumLiked = useCallback(
    (albumId: string) => state.likedAlbums.has(albumId),
    [state.likedAlbums]
  );

  const isArtistLiked = useCallback(
    (artistId: string) => state.likedArtists.has(artistId),
    [state.likedArtists]
  );

  const addToQueue = useCallback((song: Song) => {
    setState((prev) => ({ ...prev, queue: [...prev.queue, song] }));
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        ...state,
        play,
        pause,
        togglePlay,
        next,
        previous,
        toggleShuffle,
        toggleRepeat,
        setVolume,
        seek,
        toggleLikeSong,
        toggleLikeAlbum,
        toggleLikeArtist,
        isSongLiked,
        isAlbumLiked,
        isArtistLiked,
        addToQueue,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  upgradeToPremium: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("vibra-user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const login = useCallback(async (email: string, _password: string) => {
    await new Promise((r) => setTimeout(r, 800));
    const u = { ...mockUser, email };
    setUser(u);
    localStorage.setItem("vibra-user", JSON.stringify(u));
    return true;
  }, []);

  const signup = useCallback(async (name: string, email: string, _password: string) => {
    await new Promise((r) => setTimeout(r, 800));
    const u = { ...mockUser, name, email };
    setUser(u);
    localStorage.setItem("vibra-user", JSON.stringify(u));
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("vibra-user");
  }, []);

  const updateProfile = useCallback((updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem("vibra-user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const upgradeToPremium = useCallback(() => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, tier: "premium" as const };
      localStorage.setItem("vibra-user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        updateProfile,
        upgradeToPremium,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
