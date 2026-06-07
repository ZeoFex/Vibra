"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { SocialProfile, FriendRequest } from "@/types";
import {
  initialFriendRequests,
  searchProfilesByUsername,
  getRecommendations,
} from "@/lib/mock-data/social";
import { initialFriends } from "@/lib/mock-data/chat";
import { usePlayer } from "@/lib/contexts/app-context";

interface SocialContextValue {
  friends: SocialProfile[];
  friendRequests: FriendRequest[];
  pendingCount: number;
  searchUsers: (query: string) => SocialProfile[];
  recommendations: { profile: SocialProfile; reason: string; score: number }[];
  sendFriendRequest: (profile: SocialProfile) => void;
  acceptRequest: (requestId: string) => void;
  declineRequest: (requestId: string) => void;
  isFriend: (userId: string) => boolean;
  hasPendingRequest: (userId: string) => boolean;
  hasSentRequest: (userId: string) => boolean;
}

const SocialContext = createContext<SocialContextValue | null>(null);

const CURRENT_USER_ID = "user-1";

export function SocialProvider({ children }: { children: ReactNode }) {
  const { likedSongs, likedArtists } = usePlayer();
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>(initialFriendRequests);
  const [friends, setFriends] = useState<SocialProfile[]>(initialFriends);
  const [sentRequestIds, setSentRequestIds] = useState<Set<string>>(new Set());

  const likedSongIds = useMemo(() => Array.from(likedSongs), [likedSongs]);
  const likedArtistIds = useMemo(() => Array.from(likedArtists), [likedArtists]);
  const friendIds = useMemo(() => friends.map((f) => f.id), [friends]);

  const pendingCount = friendRequests.filter((r) => r.status === "pending").length;

  const recommendations = useMemo(
    () =>
      getRecommendations(likedSongIds, likedArtistIds, [
        ...friendIds,
        ...sentRequestIds,
        ...friendRequests.filter((r) => r.status === "pending").map((r) => r.from.id),
      ], CURRENT_USER_ID),
    [likedSongIds, likedArtistIds, friendIds, sentRequestIds, friendRequests]
  );

  const searchUsers = useCallback(
    (query: string) => {
      const results = searchProfilesByUsername(query, CURRENT_USER_ID);
      return results.filter(
        (p) => !friendIds.includes(p.id) && !sentRequestIds.has(p.id)
      );
    },
    [friendIds, sentRequestIds]
  );

  const sendFriendRequest = useCallback((profile: SocialProfile) => {
    setSentRequestIds((prev) => new Set(prev).add(profile.id));
  }, []);

  const acceptRequest = useCallback((requestId: string) => {
    setFriendRequests((prev) => {
      const req = prev.find((r) => r.id === requestId);
      if (req) {
        setFriends((f) => [...f, req.from]);
      }
      return prev.map((r) =>
        r.id === requestId ? { ...r, status: "accepted" as const } : r
      );
    });
  }, []);

  const declineRequest = useCallback((requestId: string) => {
    setFriendRequests((prev) =>
      prev.map((r) =>
        r.id === requestId ? { ...r, status: "declined" as const } : r
      )
    );
  }, []);

  const isFriend = useCallback(
    (userId: string) => friends.some((f) => f.id === userId),
    [friends]
  );

  const hasPendingRequest = useCallback(
    (userId: string) =>
      friendRequests.some((r) => r.from.id === userId && r.status === "pending"),
    [friendRequests]
  );

  const hasSentRequest = useCallback(
    (userId: string) => sentRequestIds.has(userId),
    [sentRequestIds]
  );

  return (
    <SocialContext.Provider
      value={{
        friends,
        friendRequests,
        pendingCount,
        searchUsers,
        recommendations,
        sendFriendRequest,
        acceptRequest,
        declineRequest,
        isFriend,
        hasPendingRequest,
        hasSentRequest,
      }}
    >
      {children}
    </SocialContext.Provider>
  );
}

export function useSocial() {
  const ctx = useContext(SocialContext);
  if (!ctx) throw new Error("useSocial must be used within SocialProvider");
  return ctx;
}
