"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { ChatMessage, SocialProfile } from "@/types";
import {
  initialPrivateMessages,
  initialCommunityMessages,
  communityAutoReplies,
} from "@/lib/mock-data/chat";
import { socialProfiles } from "@/lib/mock-data/social";
import { useAuth } from "@/lib/contexts/app-context";
import { useSocial } from "@/lib/contexts/social-context";

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

function createMessage(
  sender: { id: string; name: string; avatar: string; username: string },
  content: string
): ChatMessage {
  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    senderId: sender.id,
    senderName: sender.name,
    senderAvatar: sender.avatar,
    senderUsername: sender.username,
    content,
    createdAt: new Date().toISOString(),
  };
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { friends, isFriend } = useSocial();
  const [privateMessages, setPrivateMessages] = useState<Record<string, ChatMessage[]>>(initialPrivateMessages);
  const [communityMessages, setCommunityMessages] = useState<ChatMessage[]>(initialCommunityMessages);
  const [readAt, setReadAt] = useState<Record<string, string>>({});

  const currentUser = useMemo(
    () => ({
      id: user?.id ?? "user-1",
      name: user?.name ?? "Alex Rivera",
      avatar: user?.avatar ?? "",
      username: user?.username ?? "alexrivera",
    }),
    [user]
  );

  const sendPrivateMessage = useCallback(
    (friendId: string, content: string) => {
      if (!isFriend(friendId) || !content.trim()) return;
      const msg = createMessage(currentUser, content.trim());
      setPrivateMessages((prev) => ({
        ...prev,
        [friendId]: [...(prev[friendId] ?? []), msg],
      }));
      setReadAt((prev) => ({ ...prev, [friendId]: new Date().toISOString() }));

      const friend = friends.find((f) => f.id === friendId);
      if (friend) {
        setTimeout(() => {
          const reply = communityAutoReplies[Math.floor(Math.random() * communityAutoReplies.length)];
          setPrivateMessages((prev) => ({
            ...prev,
            [friendId]: [...(prev[friendId] ?? []), createMessage(friend, reply)],
          }));
        }, 1500);
      }
    },
    [currentUser, friends, isFriend]
  );

  const sendCommunityMessage = useCallback(
    (content: string) => {
      if (!content.trim()) return;
      const msg = createMessage(currentUser, content.trim());
      setCommunityMessages((prev) => [...prev, msg]);

      setTimeout(() => {
        const randomUser = socialProfiles[Math.floor(Math.random() * socialProfiles.length)];
        if (randomUser.id !== currentUser.id) {
          const replies = [
            "Love this take!",
            "Same energy 🙌",
            "Couldn't have said it better",
            "Facts!",
          ];
          setCommunityMessages((prev) => [
            ...prev,
            createMessage(
              randomUser,
              replies[Math.floor(Math.random() * replies.length)]
            ),
          ]);
        }
      }, 2000);
    },
    [currentUser]
  );

  const getPrivateMessages = useCallback(
    (friendId: string) => privateMessages[friendId] ?? [],
    [privateMessages]
  );

  const markConversationRead = useCallback((friendId: string) => {
    setReadAt((prev) => ({ ...prev, [friendId]: new Date().toISOString() }));
  }, []);

  const conversations = useMemo((): ConversationPreview[] => {
    return friends.map((friend) => {
      const messages = privateMessages[friend.id] ?? [];
      const lastMessage = messages[messages.length - 1];
      const lastRead = readAt[friend.id];
      const unreadCount = lastRead
        ? messages.filter(
            (m) => m.senderId !== currentUser.id && m.createdAt > lastRead
          ).length
        : messages.filter((m) => m.senderId !== currentUser.id).length;

      return { friend, lastMessage, unreadCount };
    }).sort((a, b) => {
      const aTime = a.lastMessage?.createdAt ?? "";
      const bTime = b.lastMessage?.createdAt ?? "";
      return bTime.localeCompare(aTime);
    });
  }, [friends, privateMessages, readAt, currentUser.id]);

  const totalUnreadMessages = useMemo(
    () => conversations.reduce((acc, c) => acc + c.unreadCount, 0),
    [conversations]
  );

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
