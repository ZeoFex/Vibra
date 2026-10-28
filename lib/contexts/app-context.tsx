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

export const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5] as const;

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
  playbackRate: number;
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
  cyclePlaybackRate: () => void;
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
  const nextAudioRef = useRef<HTMLAudioElement | null>(null);
  const rateRef = useRef(1);
  const mixingRef = useRef(false);
  const incomingIdRef = useRef<string | null>(null);
  const loadedSongIdRef = useRef<string | null>(null);

  const [state, setState] = useState<PlayerState>({
    currentSong: null,
    queue: [],
    isPlayerBarVisible: false,
    isPlaying: false,
    shuffle: false,
    repeat: "off",
    playbackRate: 1,
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
  const stateRef = useRef(state);
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

  const stopIncoming = useCallback(() => {
    mixingRef.current = false;
    incomingIdRef.current = null;
    const incoming = nextAudioRef.current;
    if (!incoming) return;
    incoming.pause();
    incoming.removeAttribute("src");
  }, []);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const makeAudio = () => {
      const audio = new Audio();
      audio.preload = "auto";
      audio.loop = false;
      audio.preservesPitch = true;
      return audio;
    };
    if (!audioRef.current) audioRef.current = makeAudio();
    if (!nextAudioRef.current) nextAudioRef.current = makeAudio();
    const audios = [audioRef.current, nextAudioRef.current];
    const onTimeUpdate = (event: Event) => {
      const audio = event.currentTarget as HTMLAudioElement;
      if (audio !== audioRef.current) return;
      const mixLead = 8;
      if (
        Number.isFinite(audio.duration) &&
        audio.duration > mixLead + 2 &&
        audio.duration - audio.currentTime <= mixLead &&
        audio.currentTime > 1 &&
        !mixingRef.current &&
        stateRef.current.repeat === "off" &&
        stateRef.current.isPlaying
      ) {
        const snapshot = stateRef.current;
        const current = snapshot.currentSong;
        if (current && snapshot.queue.length) {
          const idx = snapshot.queue.findIndex((song) => song.id === current.id);
          const nextIdx = pickNextIndex(idx, snapshot.queue.length, snapshot.shuffle, snapshot.repeat);
          const upcoming = nextIdx >= 0 ? snapshot.queue[nextIdx] : null;
          if (upcoming && upcoming.id !== current.id) {
            mixingRef.current = true;
            incomingIdRef.current = upcoming.id;
            void resolveAudioUrl(upcoming).then((url) => {
              const incoming = nextAudioRef.current;
              if (!url || !incoming || !mixingRef.current || incomingIdRef.current !== upcoming.id) return;
              incoming.src = url;
              incoming.currentTime = 0;
              incoming.volume = audioRef.current?.volume ?? 1;
              incoming.playbackRate = rateRef.current;
              incoming.defaultPlaybackRate = rateRef.current;
              void incoming.play().catch(() => {
                mixingRef.current = false;
                incomingIdRef.current = null;
              });
            });
          }
        }
      }
      if (mixingRef.current && Number.isFinite(audio.duration) && audio.duration - audio.currentTime > mixLead + 1) {
        stopIncoming();
      }
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

    const onEnded = (event: Event) => {
      if (event.currentTarget !== audioRef.current) return;
      const incoming = nextAudioRef.current;
      const incomingId = incomingIdRef.current;
      if (mixingRef.current && incoming && incomingId && !incoming.paused) {
        const outgoing = audioRef.current;
        audioRef.current = incoming;
        nextAudioRef.current = outgoing;
        outgoing?.pause();
        outgoing?.removeAttribute("src");
        mixingRef.current = false;
        incomingIdRef.current = null;
        loadedSongIdRef.current = incomingId;
        setState((prev) => {
          const song = prev.queue.find((item) => item.id === incomingId) ?? prev.currentSong;
          if (!song) return prev;
          return {
            ...prev,
            currentSong: song,
            isPlaying: true,
            progress: Math.floor(incoming.currentTime || 0),
            recentSongs: [song, ...prev.recentSongs.filter((item) => item.id !== song.id)].slice(0, 30),
          };
        });
        return;
      }
      setState((prev) => {
        if (!prev.currentSong) return prev;

        if (prev.repeat === "one") {
          const current = audioRef.current;
          if (current) {
            current.currentTime = 0;
            void current.play();
          }
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
          const current = audioRef.current;
          if (current) {
            current.currentTime = 0;
            void current.play().catch(() => {});
          }
        }

        return {
          ...prev,
          currentSong: prev.queue[nextIdx],
          progress: 0,
          isPlaying: true,
        };
      });
    };

    for (const audio of audios) {
      audio.addEventListener("timeupdate", onTimeUpdate);
      audio.addEventListener("ended", onEnded);
    }
    return () => {
      for (const audio of audios) {
        audio.removeEventListener("timeupdate", onTimeUpdate);
        audio.removeEventListener("ended", onEnded);
      }
    };
  }, [stopIncoming]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const level = state.volume / 100;
    audio.volume = level;
    if (nextAudioRef.current) nextAudioRef.current.volume = level;
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
        audio.preservesPitch = true;
        audio.defaultPlaybackRate = rateRef.current;
        audio.playbackRate = rateRef.current;
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
    if (state.repeat !== "off") stopIncoming();
  }, [state.repeat, stopIncoming]);

  useEffect(() => {
    rateRef.current = state.playbackRate;
    const audio = audioRef.current;
    if (!audio) return;
    audio.preservesPitch = true;
    audio.defaultPlaybackRate = state.playbackRate;
    audio.playbackRate = state.playbackRate;
    if (nextAudioRef.current) {
      nextAudioRef.current.preservesPitch = true;
      nextAudioRef.current.defaultPlaybackRate = state.playbackRate;
      nextAudioRef.current.playbackRate = state.playbackRate;
    }
  }, [state.playbackRate, state.currentSong?.id, state.isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !state.currentSong || loadedSongIdRef.current !== state.currentSong.id) return;

    if (state.isPlaying) {
      void audio.play().catch(() => {});
      if (mixingRef.current) void nextAudioRef.current?.play().catch(() => {});
    } else {
      audio.pause();
      nextAudioRef.current?.pause();
    }
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
    stopIncoming();
    setState((prev) => ({
      ...prev,
      currentSong: song,
      queue: queue ?? (prev.queue.length ? prev.queue : [song]),
      isPlayerBarVisible: true,
      isPlaying: true,
      progress: 0,
      recentSongs: [song, ...prev.recentSongs.filter((item) => item.id !== song.id)].slice(0, 30),
    }));
  }, [stopIncoming]);

  const closePlayer = useCallback(() => {
    stopIncoming();
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
  }, [stopIncoming]);

  const pause = useCallback(() => {
    setState((prev) => ({ ...prev, isPlaying: false }));
  }, []);

  const togglePlay = useCallback(() => {
    setState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
  }, []);

  const next = useCallback(() => {
    stopIncoming();
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
  }, [stopIncoming]);

  const previous = useCallback(() => {
    stopIncoming();
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
  }, [stopIncoming]);

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

  const cyclePlaybackRate = useCallback(() => {
    setState((prev) => {
      const index = PLAYBACK_SPEEDS.findIndex((speed) => Math.abs(speed - prev.playbackRate) < 0.01);
      const next = PLAYBACK_SPEEDS[(Math.max(index, 0) + 1) % PLAYBACK_SPEEDS.length];
      rateRef.current = next;
      const audio = audioRef.current;
      const applyRate = (audio: HTMLAudioElement | null) => {
        if (!audio) return;
        audio.preservesPitch = true;
        audio.defaultPlaybackRate = next;
        audio.playbackRate = next;
      };
      applyRate(audioRef.current);
      applyRate(nextAudioRef.current);
      return { ...prev, playbackRate: next };
    });
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
    if (Number.isFinite(audio.duration) && audio.duration - target > 9) stopIncoming();
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
        cyclePlaybackRate,
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
