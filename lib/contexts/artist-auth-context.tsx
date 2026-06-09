"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ArtistAccount, ArtistDashboardSummary, ArtistSongStats } from "@/types/artist";
import {
  loadArtistStats,
  getStatsForArtist,
  addStatsForUpload,
} from "@/lib/artist-stats-storage";

interface RegisterInput {
  email: string;
  password: string;
  stageName: string;
  legalName: string;
  genre: string;
  country: string;
  bio?: string;
  imageUrl: string;
}

interface ArtistAuthContextValue {
  artist: ArtistAccount | null;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (input: RegisterInput) => Promise<{
    ok: boolean;
    error?: string;
    message?: string;
    pendingVerification?: boolean;
    resent?: boolean;
    verifyUrl?: string;
  }>;
  resendVerification: (email: string) => Promise<{ ok: boolean; error?: string; message?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<ArtistAccount>) => void;
  getDashboardSummary: (artistId: string) => ArtistDashboardSummary;
  getArtistStats: (artistId: string) => ArtistSongStats[];
  recordNewUploadStats: (uploadId: string, artistId: string, title: string, cover: string) => void;
}

const ArtistAuthContext = createContext<ArtistAuthContextValue | null>(null);

function buildSummary(stats: ArtistSongStats[]): ArtistDashboardSummary {
  return {
    totalViews: stats.reduce((s, r) => s + r.views, 0),
    totalPlays: stats.reduce((s, r) => s + r.plays, 0),
    totalDownloads: stats.reduce((s, r) => s + r.downloads, 0),
    totalLikes: stats.reduce((s, r) => s + r.likes, 0),
    monthlyListeners: Math.round(stats.reduce((s, r) => s + r.plays, 0) * 0.42),
    followerGrowth: 12.4,
    songCount: stats.length,
  };
}

export function ArtistAuthProvider({ children }: { children: ReactNode }) {
  const [artist, setArtist] = useState<ArtistAccount | null>(null);
  const [stats, setStats] = useState<ReturnType<typeof loadArtistStats>>([]);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    setStats(loadArtistStats());
    fetch("/api/auth/artist/me", { credentials: "include" })
      .then(async (res) => {
        if (res.ok) {
          const data = (await res.json()) as { artist: ArtistAccount };
          setArtist(data.artist);
        }
      })
      .finally(() => setIsAuthReady(true));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/artist/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { artist?: ArtistAccount; error?: string };
      if (!res.ok) return { ok: false, error: data.error ?? "Login failed" };
      setArtist(data.artist!);
      return { ok: true };
    } catch {
      return { ok: false, error: "Unable to reach artist login service" };
    }
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    try {
      const res = await fetch("/api/auth/artist/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = (await res.json()) as {
        message?: string;
        error?: string;
        pendingVerification?: boolean;
        resent?: boolean;
        verifyUrl?: string;
      };
      if (!res.ok) return { ok: false, error: data.error ?? "Registration failed" };
      return {
        ok: true,
        message: data.message,
        pendingVerification: data.pendingVerification,
        resent: data.resent,
        verifyUrl: data.verifyUrl,
      };
    } catch {
      return { ok: false, error: "Unable to reach registration service" };
    }
  }, []);

  const resendVerification = useCallback(async (email: string) => {
    try {
      const res = await fetch("/api/auth/artist/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { message?: string; error?: string };
      if (!res.ok) return { ok: false, error: data.error ?? "Could not resend verification email" };
      return { ok: true, message: data.message };
    } catch {
      return { ok: false, error: "Unable to reach verification service" };
    }
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/artist/logout", { method: "POST", credentials: "include" });
    setArtist(null);
  }, []);

  const updateProfile = useCallback((updates: Partial<ArtistAccount>) => {
    setArtist((prev) => (prev ? { ...prev, ...updates } : prev));
  }, []);

  const getArtistStats = useCallback(
    (artistId: string) => getStatsForArtist(artistId),
    [stats]
  );

  const getDashboardSummary = useCallback(
    (artistId: string) => buildSummary(getStatsForArtist(artistId)),
    [stats]
  );

  const recordNewUploadStats = useCallback(
    (uploadId: string, artistId: string, title: string, cover: string) => {
      addStatsForUpload(uploadId, artistId, title, cover);
      setStats(loadArtistStats());
    },
    []
  );

  const value = useMemo(
    () => ({
      artist,
      isAuthenticated: !!artist,
      isAuthReady,
      login,
      register,
      resendVerification,
      logout,
      updateProfile,
      getDashboardSummary,
      getArtistStats,
      recordNewUploadStats,
    }),
    [
      artist,
      isAuthReady,
      login,
      register,
      resendVerification,
      logout,
      updateProfile,
      getDashboardSummary,
      getArtistStats,
      recordNewUploadStats,
    ]
  );

  return (
    <ArtistAuthContext.Provider value={value}>{children}</ArtistAuthContext.Provider>
  );
}

export function useArtistAuth() {
  const ctx = useContext(ArtistAuthContext);
  if (!ctx) throw new Error("useArtistAuth must be used within ArtistAuthProvider");
  return ctx;
}
