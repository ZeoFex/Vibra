"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { FriendRequest, SocialProfile } from "@/types";

interface SocialContextValue {
  friends: SocialProfile[];
  friendRequests: FriendRequest[];
  pendingCount: number;
  ready: boolean;
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

export function SocialProvider({ children }: { children: ReactNode }) {
  const [friends, setFriends] = useState<SocialProfile[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [people, setPeople] = useState<SocialProfile[]>([]);
  const [sentRequestIds, setSentRequestIds] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    const response = await fetch("/api/social", { credentials: "include" });
    if (!response.ok) return;
    const data = (await response.json()) as {
      friends?: SocialProfile[];
      incoming?: FriendRequest[];
      people?: SocialProfile[];
      sentIds?: string[];
    };
    setFriends(data.friends ?? []);
    setFriendRequests(data.incoming ?? []);
    setPeople(data.people ?? []);
    setSentRequestIds(new Set(data.sentIds ?? []));
    setReady(true);
  }, []);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 5000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const friendIds = useMemo(() => new Set(friends.map((friend) => friend.id)), [friends]);
  const pendingCount = friendRequests.filter((request) => request.status === "pending").length;

  const searchUsers = useCallback(
    (query: string) => {
      const term = query.trim().toLowerCase();
      if (!term) return [];
      return people.filter(
        (person) =>
          !friendIds.has(person.id) &&
          (person.username.toLowerCase().includes(term) || person.name.toLowerCase().includes(term))
      );
    },
    [people, friendIds]
  );

  const recommendations = useMemo(
    () =>
      people
        .filter((person) => !friendIds.has(person.id) && !sentRequestIds.has(person.id))
        .slice(0, 8)
        .map((profile) => ({ profile, reason: "Member of Vibra", score: 1 })),
    [people, friendIds, sentRequestIds]
  );

  const sendFriendRequest = useCallback((profile: SocialProfile) => {
    setSentRequestIds((prev) => new Set(prev).add(profile.id));
    void fetch("/api/social/requests", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toUserId: profile.id }),
    }).then(() => refresh());
  }, [refresh]);

  const acceptRequest = useCallback((requestId: string) => {
    void fetch(`/api/social/requests/${requestId}/accept`, { method: "POST", credentials: "include" }).then(() => refresh());
  }, [refresh]);

  const declineRequest = useCallback((requestId: string) => {
    void fetch(`/api/social/requests/${requestId}/decline`, { method: "POST", credentials: "include" }).then(() => refresh());
  }, [refresh]);

  const isFriend = useCallback((userId: string) => friendIds.has(userId), [friendIds]);
  const hasPendingRequest = useCallback(
    (userId: string) => friendRequests.some((request) => request.from.id === userId && request.status === "pending"),
    [friendRequests]
  );
  const hasSentRequest = useCallback((userId: string) => sentRequestIds.has(userId), [sentRequestIds]);

  return (
    <SocialContext.Provider
      value={{
        friends,
        friendRequests,
        pendingCount,
        ready,
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
