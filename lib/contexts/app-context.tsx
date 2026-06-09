"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import type { Song, DownloadedTrack } from "@/types";
import type { User } from "@/types";

type RepeatMode = "off" | "all" | "one";

interface PlayerState {
  currentSong: Song | null;
  queue: Song[];
  isPlayerBarVisible: boolean;
  isPlaying: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  volume: number;
  progress: number;
  likedSongs: Set<string>;
  likedAlbums: Set<string>;
  likedArtists: Set<string>;
  downloads: Map<string, DownloadedTrack>;
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
  downloadSong: (song: Song) => void;
  removeDownload: (songId: string) => void;
  isDownloaded: (songId: string) => boolean;
  downloadedSongIds: string[];
  closePlayer: () => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PlayerState>({
    currentSong: null,
    queue: [],
    isPlayerBarVisible: false,
    isPlaying: false,
    shuffle: false,
    repeat: "off",
    volume: 80,
    progress: 0,
    likedSongs: new Set(["song-1", "song-3", "song-5"]),
    likedAlbums: new Set(["album-1", "album-3"]),
    likedArtists: new Set(["artist-1", "artist-3"]),
    downloads: new Map([
      ["song-1", { songId: "song-1", downloadedAt: "2026-06-01T10:00:00Z", sizeMb: 8.4 }],
      ["song-5", { songId: "song-5", downloadedAt: "2026-06-02T14:30:00Z", sizeMb: 6.2 }],
      ["song-3", { songId: "song-3", downloadedAt: "2026-06-04T09:00:00Z", sizeMb: 9.1 }],
    ]),
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
      isPlayerBarVisible: true,
      isPlaying: true,
      progress: 0,
    }));
  }, []);

  const closePlayer = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentSong: null,
      isPlaying: false,
      progress: 0,
      isPlayerBarVisible: false,
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

  const downloadSong = useCallback((song: Song) => {
    setState((prev) => {
      const downloads = new Map(prev.downloads);
      downloads.set(song.id, {
        songId: song.id,
        downloadedAt: new Date().toISOString(),
        sizeMb: Math.round((song.duration / 60) * 2.1 * 10) / 10,
      });
      return { ...prev, downloads };
    });
  }, []);

  const removeDownload = useCallback((songId: string) => {
    setState((prev) => {
      const downloads = new Map(prev.downloads);
      downloads.delete(songId);
      return { ...prev, downloads };
    });
  }, []);

  const isDownloaded = useCallback(
    (songId: string) => state.downloads.has(songId),
    [state.downloads]
  );

  const downloadedSongIds = useMemo(
    () => Array.from(state.downloads.keys()),
    [state.downloads]
  );

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
        downloadSong,
        removeDownload,
        isDownloaded,
        downloadedSongIds,
        closePlayer,
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

interface AuthResult {
  ok: boolean;
  error?: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  signup: (name: string, email: string, password: string, avatarUrl: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => void;
  upgradeToPremium: () => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then(async (res) => {
        if (res.ok) {
          const data = (await res.json()) as { user: User };
          setUser(data.user);
        }
      })
      .finally(() => setIsAuthReady(true));
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { user?: User; error?: string };
      if (!res.ok) return { ok: false, error: data.error ?? "Invalid credentials" };
      setUser(data.user!);
      return { ok: true };
    } catch {
      return { ok: false, error: "Unable to reach login service" };
    }
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string, avatarUrl: string): Promise<AuthResult> => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password, avatarUrl }),
      });
      const data = (await res.json()) as { user?: User; error?: string };
      if (!res.ok) return { ok: false, error: data.error ?? "Signup failed" };
      setUser(data.user!);
      return { ok: true };
    } catch {
      return { ok: false, error: "Unable to reach signup service" };
    }
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
  }, []);

  const updateProfile = useCallback((updates: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  }, []);

  const upgradeToPremium = useCallback(async (): Promise<AuthResult> => {
    try {
      const res = await fetch("/api/auth/upgrade-premium", {
        method: "POST",
        credentials: "include",
      });
      const data = (await res.json()) as { user?: User; error?: string };
      if (!res.ok) return { ok: false, error: data.error ?? "Upgrade failed" };
      setUser(data.user!);
      return { ok: true };
    } catch {
      return { ok: false, error: "Unable to upgrade account" };
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAuthReady,
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
