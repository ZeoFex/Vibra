"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import type { Album, Artist, Song, DownloadedTrack } from "@/types";
import type { User } from "@/types";
import { resolveAudioUrl } from "@/lib/audio/resolve-audio-url";
import { reportOffline } from "@/lib/client/network";

type RepeatMode = "off" | "all" | "one";

function pickNextIndex(index: number, length: number, shuffle: boolean, repeat: RepeatMode) {
  if (length <= 0) return -1;
  if (shuffle && length > 1) {
    let next = index;
    while (next === index) next = Math.floor(Math.random() * length);
    return next;
  }
  const next = index + 1;
  if (next < length) return next;
  if (repeat === "all") return 0;
  return -1;
}

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
  savedSongs: Song[];
  savedAlbums: Album[];
  savedArtists: Artist[];
  recentSongs: Song[];
  savedDownloads: Song[];
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
  toggleLikeSong: (song: Song) => void;
  toggleLikeAlbum: (album: Album) => void;
  toggleLikeArtist: (artist: Artist) => void;
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const nextRef = useRef<() => void>(() => {});
  const previousRef = useRef<() => void>(() => {});
  const loadedSongIdRef = useRef<string | null>(null);

  const [state, setState] = useState<PlayerState>({
    currentSong: null,
    queue: [],
    isPlayerBarVisible: false,
    isPlaying: false,
    shuffle: false,
    repeat: "off",
    volume: 80,
    progress: 0,
    likedSongs: new Set(),
    likedAlbums: new Set(),
    likedArtists: new Set(),
    savedSongs: [],
    savedAlbums: [],
    savedArtists: [],
    recentSongs: [],
    savedDownloads: [],
    downloads: new Map(),
  });
  const downloadsRef = useRef(state.downloads);
  useEffect(() => {
    downloadsRef.current = state.downloads;
  }, [state.downloads]);

  const libraryReady = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("vibra-library");
      if (raw) {
        const data = JSON.parse(raw) as {
          songs?: Song[];
          albums?: Album[];
          artists?: Artist[];
          recent?: Song[];
          downloads?: { song: Song; downloadedAt: string; sizeMb: number }[];
        };
        const songs = data.songs ?? [];
        const albums = data.albums ?? [];
        const artists = data.artists ?? [];
        const storedDownloads = data.downloads ?? [];
        const downloads = new Map(
          storedDownloads.map((item) => [item.song.id, { songId: item.song.id, downloadedAt: item.downloadedAt, sizeMb: item.sizeMb }])
        );
        setState((prev) => ({
          ...prev,
          savedSongs: songs,
          savedAlbums: albums,
          savedArtists: artists,
          recentSongs: data.recent ?? [],
          savedDownloads: storedDownloads.map((item) => item.song),
          downloads,
          likedSongs: new Set(songs.map((song) => song.id)),
          likedAlbums: new Set(albums.map((album) => album.id)),
          likedArtists: new Set(artists.map((artist) => artist.id)),
        }));
      }
    } catch {
      /* keep the empty library */
    }
    libraryReady.current = true;
  }, []);

  useEffect(() => {
    if (!libraryReady.current) return;
    localStorage.setItem(
      "vibra-library",
      JSON.stringify({
        songs: state.savedSongs,
        albums: state.savedAlbums,
        artists: state.savedArtists,
        recent: state.recentSongs,
        downloads: state.savedDownloads
          .map((song) => {
            const meta = state.downloads.get(song.id);
            return meta ? { song, downloadedAt: meta.downloadedAt, sizeMb: meta.sizeMb } : null;
          })
          .filter((item) => item !== null),
      })
    );
  }, [state.savedSongs, state.savedAlbums, state.savedArtists, state.recentSongs, state.savedDownloads, state.downloads]);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = "auto";
      audioRef.current.loop = false;
      audioRef.current.preservesPitch = true;
    }
    const audio = audioRef.current;
    const onTimeUpdate = () => {
      if ("mediaSession" in navigator && Number.isFinite(audio.duration) && audio.duration > 0) {
        try {
          navigator.mediaSession.setPositionState({
            duration: audio.duration,
            playbackRate: audio.playbackRate || 1,
            position: Math.min(audio.currentTime, audio.duration),
          });
        } catch {
          /* position can throw if the browser is not ready */
        }
      }
      setState((prev) => {
        if (!prev.currentSong || loadedSongIdRef.current !== prev.currentSong.id) return prev;
        return { ...prev, progress: Math.floor(audio.currentTime) };
      });
    };

    if ("mediaSession" in navigator) {
      navigator.mediaSession.setActionHandler("play", () => setState((prev) => ({ ...prev, isPlaying: true })));
      navigator.mediaSession.setActionHandler("pause", () => setState((prev) => ({ ...prev, isPlaying: false })));
      navigator.mediaSession.setActionHandler("nexttrack", () => nextRef.current());
      navigator.mediaSession.setActionHandler("previoustrack", () => previousRef.current());
    }

    const onEnded = () => {
      setState((prev) => {
        if (!prev.currentSong) return prev;

        if (prev.repeat === "one") {
          audio.currentTime = 0;
          void audio.play();
          return { ...prev, progress: 0, isPlaying: true };
        }

        if (!prev.queue.length) {
          return { ...prev, isPlaying: false, progress: 0 };
        }

        const idx = prev.queue.findIndex((s) => s.id === prev.currentSong!.id);
        const nextIdx = pickNextIndex(idx, prev.queue.length, prev.shuffle, prev.repeat);
        if (nextIdx < 0) return { ...prev, isPlaying: false, progress: 0 };
        const upcoming = prev.queue[nextIdx];
        if (upcoming.id === prev.currentSong.id) {
          audio.currentTime = 0;
          void audio.play().catch(() => {});
        }

        return {
          ...prev,
          currentSong: prev.queue[nextIdx],
          progress: 0,
          isPlaying: true,
        };
      });
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = state.volume / 100;
  }, [state.volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!state.currentSong) {
      audio.pause();
      audio.removeAttribute("src");
      loadedSongIdRef.current = null;
      return;
    }

    if (loadedSongIdRef.current === state.currentSong.id) return;

    let cancelled = false;
    loadedSongIdRef.current = null;

    void (async () => {
      const url = await resolveAudioUrl(state.currentSong!);
      if (cancelled || !url) {
        if (!cancelled) setState((prev) => ({ ...prev, isPlaying: false }));
        return;
      }

      audio.src = url;
      audio.load();
      loadedSongIdRef.current = state.currentSong!.id;

      const onLoaded = () => {
        if (cancelled) return;
        if (Number.isFinite(audio.duration) && audio.duration > 0) {
          setState((prev) => {
            if (!prev.currentSong || prev.currentSong.id !== loadedSongIdRef.current) return prev;
            return {
              ...prev,
              currentSong: { ...prev.currentSong, duration: Math.round(audio.duration) },
            };
          });
        }
        setState((prev) => {
          if (!prev.currentSong || prev.currentSong.id !== loadedSongIdRef.current) return prev;
          if (prev.isPlaying) void audio.play().catch(() => {});
          return prev;
        });
      };

      audio.addEventListener("loadedmetadata", onLoaded, { once: true });
    })();

    return () => {
      cancelled = true;
    };
  }, [state.currentSong?.id]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.loop = state.repeat === "one";
  }, [state.repeat]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !state.currentSong || loadedSongIdRef.current !== state.currentSong.id) return;

    if (state.isPlaying) void audio.play().catch(() => {});
    else audio.pause();
  }, [state.isPlaying, state.currentSong?.id]);

  useEffect(() => {
    const song = state.currentSong;
    if (!song) return;
    if (typeof navigator !== "undefined" && navigator.onLine === false) return;
    void fetch("/api/listens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        songId: song.id,
        title: song.title,
        artistName: song.artistName,
        cover: song.cover,
      }),
    });
  }, [state.currentSong?.id]);

  const play = useCallback((song: Song, queue?: Song[]) => {
    if (!downloadsRef.current.has(song.id) && typeof navigator !== "undefined" && navigator.onLine === false) {
      reportOffline();
      return;
    }
    setState((prev) => ({
      ...prev,
      currentSong: song,
      queue: queue ?? (prev.queue.length ? prev.queue : [song]),
      isPlayerBarVisible: true,
      isPlaying: true,
      progress: 0,
      recentSongs: [song, ...prev.recentSongs.filter((item) => item.id !== song.id)].slice(0, 30),
    }));
  }, []);

  const closePlayer = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
    }
    loadedSongIdRef.current = null;
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
      const nextIdx = pickNextIndex(idx, prev.queue.length, prev.shuffle, prev.repeat);
      if (nextIdx < 0) return { ...prev, isPlaying: false };
      const currentSong = prev.queue[nextIdx];
      if (currentSong.id === prev.currentSong.id && audioRef.current) {
        audioRef.current.currentTime = 0;
        void audioRef.current.play().catch(() => {});
      }
      return {
        ...prev,
        currentSong,
        progress: 0,
        isPlaying: true,
        recentSongs: [currentSong, ...prev.recentSongs.filter((item) => item.id !== currentSong.id)].slice(0, 30),
      };
    });
  }, []);

  const previous = useCallback(() => {
    setState((prev) => {
      if (!prev.queue.length || !prev.currentSong) return prev;
      if (prev.progress > 3) {
        if (audioRef.current) audioRef.current.currentTime = 0;
        return { ...prev, progress: 0 };
      }
      const idx = prev.queue.findIndex((s) => s.id === prev.currentSong!.id);
      const prevIdx = idx <= 0 ? prev.queue.length - 1 : idx - 1;
      const currentSong = prev.queue[prevIdx];
      return {
        ...prev,
        currentSong,
        progress: 0,
        isPlaying: true,
        recentSongs: [currentSong, ...prev.recentSongs.filter((item) => item.id !== currentSong.id)].slice(0, 30),
      };
    });
  }, []);

  useEffect(() => {
    nextRef.current = next;
    previousRef.current = previous;
  }, [next, previous]);

  useEffect(() => {
    const song = state.currentSong;
    if (!song || typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    const cover = song.cover
      ? song.cover.startsWith("http")
        ? song.cover
        : `${window.location.origin}${song.cover.startsWith("/") ? song.cover : `/${song.cover}`}`
      : `${window.location.origin}/vibra-logo-clear.png`;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: song.title,
      artist: song.artistName,
      album: song.albumTitle || "Vibra",
      artwork: [{ src: cover, sizes: "512x512" }],
    });
    navigator.mediaSession.playbackState = state.isPlaying ? "playing" : "paused";
    document.title = `${song.title} — ${song.artistName}`;
    return () => {
      document.title = "Vibra — Feel Every Beat";
    };
  }, [state.currentSong, state.isPlaying]);

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
    const audio = audioRef.current;
    if (!audio || !loadedSongIdRef.current) return;
    const wasPlaying = !audio.paused;
    const max = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : progress;
    const target = Math.min(Math.max(progress, 0), Math.max(max - 0.25, 0));
    audio.currentTime = target;
    if (wasPlaying) void audio.play().catch(() => {});
    setState((prev) => ({ ...prev, progress: Math.floor(audio.currentTime || target), isPlaying: wasPlaying }));
  }, []);

  const toggleLikeSong = useCallback((song: Song) => {
    setState((prev) => {
      const liked = new Set(prev.likedSongs);
      if (liked.has(song.id)) {
        liked.delete(song.id);
        return { ...prev, likedSongs: liked, savedSongs: prev.savedSongs.filter((item) => item.id !== song.id) };
      }
      liked.add(song.id);
      return { ...prev, likedSongs: liked, savedSongs: [song, ...prev.savedSongs.filter((item) => item.id !== song.id)] };
    });
  }, []);

  const toggleLikeAlbum = useCallback((album: Album) => {
    setState((prev) => {
      const liked = new Set(prev.likedAlbums);
      if (liked.has(album.id)) {
        liked.delete(album.id);
        return { ...prev, likedAlbums: liked, savedAlbums: prev.savedAlbums.filter((item) => item.id !== album.id) };
      }
      liked.add(album.id);
      return { ...prev, likedAlbums: liked, savedAlbums: [album, ...prev.savedAlbums.filter((item) => item.id !== album.id)] };
    });
  }, []);

  const toggleLikeArtist = useCallback((artist: Artist) => {
    setState((prev) => {
      const liked = new Set(prev.likedArtists);
      if (liked.has(artist.id)) {
        liked.delete(artist.id);
        return { ...prev, likedArtists: liked, savedArtists: prev.savedArtists.filter((item) => item.id !== artist.id) };
      }
      liked.add(artist.id);
      return { ...prev, likedArtists: liked, savedArtists: [artist, ...prev.savedArtists.filter((item) => item.id !== artist.id)] };
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
      return {
        ...prev,
        downloads,
        savedDownloads: [song, ...prev.savedDownloads.filter((item) => item.id !== song.id)],
      };
    });
  }, []);

  const removeDownload = useCallback((songId: string) => {
    setState((prev) => {
      const downloads = new Map(prev.downloads);
      downloads.delete(songId);
      return { ...prev, downloads, savedDownloads: prev.savedDownloads.filter((song) => song.id !== songId) };
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
