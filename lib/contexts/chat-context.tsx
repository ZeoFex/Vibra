"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { ChatMessage, SocialProfile } from "@/types";
import { useAuth } from "@/lib/contexts/app-context";
import { useSocial } from "@/lib/contexts/social-context";
import { checkOnline } from "@/lib/client/network";

interface ConversationPreview {
  friend: SocialProfile;
  lastMessage?: ChatMessage;
  unreadCount: number;
}

interface ChatContextValue {
  communityMessages: ChatMessage[];
  sendCommunityMessage: (content: string) => void;
  getPrivateMessages: (friendId: string) => ChatMessage[];
  sendPrivateMessage: (friendId: string, content: string) => void;
  conversations: ConversationPreview[];
  markConversationRead: (friendId: string) => void;
  totalUnreadMessages: number;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { friends, isFriend } = useSocial();
  const [threads, setThreads] = useState<Record<string, ChatMessage[]>>({});
  const [communityMessages, setCommunityMessages] = useState<ChatMessage[]>([]);
  const [readAt, setReadAt] = useState<Record<string, string>>({});

  const refresh = useCallback(async () => {
    const response = await fetch("/api/social/messages", { credentials: "include" });
    if (!response.ok) return;
    const data = (await response.json()) as { threads?: Record<string, ChatMessage[]>; community?: ChatMessage[] };
    setThreads(data.threads ?? {});
    setCommunityMessages(data.community ?? []);
  }, []);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 4000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const sendPrivateMessage = useCallback(
    (friendId: string, content: string) => {
      if (!isFriend(friendId) || !content.trim()) return;
      void checkOnline().then((online) => {
        if (!online) return;
      void fetch("/api/social/messages", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUserId: friendId, content: content.trim() }),
      }).then(() => refresh());
      setReadAt((prev) => ({ ...prev, [friendId]: new Date().toISOString() }));
      });
    },
    [isFriend, refresh]
  );

  const sendCommunityMessage = useCallback(
    (content: string) => {
      if (!content.trim()) return;
      void checkOnline().then((online) => {
        if (!online) return;
      void fetch("/api/social/messages", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ community: true, content: content.trim() }),
      }).then(() => refresh());
      });
    },
    [refresh]
  );

  const getPrivateMessages = useCallback((friendId: string) => threads[friendId] ?? [], [threads]);
  const markConversationRead = useCallback((friendId: string) => {
    setReadAt((prev) => ({ ...prev, [friendId]: new Date().toISOString() }));
  }, []);

  const conversations = useMemo((): ConversationPreview[] => {
    return friends
      .map((friend) => {
        const messages = threads[friend.id] ?? [];
        const lastMessage = messages[messages.length - 1];
        const lastRead = readAt[friend.id];
        const unreadCount = messages.filter(
          (message) => message.senderId !== user?.id && (!lastRead || message.createdAt > lastRead)
        ).length;
        return { friend, lastMessage, unreadCount };
      })
      .sort((a, b) => (b.lastMessage?.createdAt ?? "").localeCompare(a.lastMessage?.createdAt ?? ""));
  }, [friends, threads, readAt, user?.id]);

  const totalUnreadMessages = conversations.reduce((sum, conversation) => sum + conversation.unreadCount, 0);

  return (
    <ChatContext.Provider
      value={{
        communityMessages,
        sendCommunityMessage,
        getPrivateMessages,
        sendPrivateMessage,
        conversations,
        markConversationRead,
        totalUnreadMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}
