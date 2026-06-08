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
  loadArtistAccounts,
  findAccountByEmail,
  addArtistAccount,
  updateArtistAccount,
} from "@/lib/artist-accounts-storage";
import {
  loadArtistStats,
  getStatsForArtist,
  addStatsForUpload,
} from "@/lib/artist-stats-storage";
import { seedArtistAccounts } from "@/lib/mock-data/artist-accounts";

const SESSION_KEY = "vibra-artist-session";

interface RegisterInput {
  email: string;
  password: string;
  stageName: string;
  legalName: string;
  genre: string;
  country: string;
  bio?: string;
}

interface CreateAccountInput {
  email: string;
  password: string;
  stageName: string;
  legalName: string;
  genre: string;
  country: string;
  bio?: string;
  image?: string;
}

interface ArtistAuthContextValue {
  artist: ArtistAccount | null;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  accounts: ArtistAccount[];
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (input: RegisterInput) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<ArtistAccount>) => void;
  createAccountAsAdmin: (input: CreateAccountInput) => ArtistAccount;
  updateAccountStatus: (id: string, status: ArtistAccount["status"]) => void;
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
  const [accounts, setAccounts] = useState<ArtistAccount[]>(seedArtistAccounts);
  const [stats, setStats] = useState<ReturnType<typeof loadArtistStats>>([]);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const loadedAccounts = loadArtistAccounts();
    setAccounts(loadedAccounts);
    setStats(loadArtistStats());

    const sessionId = localStorage.getItem(SESSION_KEY);
    if (sessionId) {
      const match = loadedAccounts.find((a) => a.id === sessionId && a.status === "active");
      if (match) setArtist(match);
    }
    setIsAuthReady(true);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 600));
    const account = findAccountByEmail(email);
    if (!account || account.password !== password) {
      return { ok: false, error: "Invalid email or password." };
    }
    if (account.status === "pending") {
      return {
        ok: false,
        error: "Your account is pending admin approval. Please wait for activation.",
      };
    }
    if (account.status === "suspended") {
      return { ok: false, error: "This account has been suspended. Contact support." };
    }
    setArtist(account);
    localStorage.setItem(SESSION_KEY, account.id);
    return { ok: true };
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    await new Promise((r) => setTimeout(r, 800));
    if (findAccountByEmail(input.email)) {
      return { ok: false, error: "An account with this email already exists." };
    }
    const account: ArtistAccount = {
      id: `artist-acc-${Date.now()}`,
      email: input.email,
      password: input.password,
      stageName: input.stageName,
      legalName: input.legalName,
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
      bio: input.bio ?? "",
      genre: input.genre,
      country: input.country,
      status: "pending",
      createdAt: new Date().toISOString(),
      createdBy: "self",
    };
    addArtistAccount(account);
    setAccounts(loadArtistAccounts());
    return {
      ok: true,
      error: undefined,
    };
  }, []);

  const logout = useCallback(() => {
    setArtist(null);
    localStorage.removeItem(SESSION_KEY);
  }, []);

  const updateProfile = useCallback((updates: Partial<ArtistAccount>) => {
    if (!artist) return;
    const updated = updateArtistAccount(artist.id, updates);
    if (updated) {
      setArtist(updated);
      setAccounts(loadArtistAccounts());
    }
  }, [artist]);

  const createAccountAsAdmin = useCallback((input: CreateAccountInput) => {
    const account: ArtistAccount = {
      id: `artist-acc-${Date.now()}`,
      email: input.email,
      password: input.password,
      stageName: input.stageName,
      legalName: input.legalName,
      image:
        input.image ??
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
      bio: input.bio ?? "",
      genre: input.genre,
      country: input.country,
      status: "active",
      createdAt: new Date().toISOString(),
      createdBy: "admin",
    };
    addArtistAccount(account);
    setAccounts(loadArtistAccounts());
    return account;
  }, []);

  const updateAccountStatus = useCallback((id: string, status: ArtistAccount["status"]) => {
    updateArtistAccount(id, { status });
    setAccounts(loadArtistAccounts());
    if (artist?.id === id && status !== "active") {
      setArtist(null);
      localStorage.removeItem(SESSION_KEY);
    }
  }, [artist]);

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
      accounts,
      login,
      register,
      logout,
      updateProfile,
      createAccountAsAdmin,
      updateAccountStatus,
      getDashboardSummary,
      getArtistStats,
      recordNewUploadStats,
    }),
    [
      artist,
      isAuthReady,
      accounts,
      login,
      register,
      logout,
      updateProfile,
      createAccountAsAdmin,
      updateAccountStatus,
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
