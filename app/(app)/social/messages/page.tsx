"use client";

import Link from "next/link";
import Image from "next/image";
import { MessageCircle, Users, ChevronRight } from "lucide-react";
import { useChat } from "@/lib/contexts/chat-context";
import { useSocial } from "@/lib/contexts/social-context";
import { cn } from "@/lib/utils";

function formatPreviewTime(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function MessagesPage() {
  const { conversations } = useChat();
  const { friends } = useSocial();

  return (
    <div className="space-y-6">
      <Link
        href="/social/community"
        className="flex items-center gap-4 rounded-xl border border-violet-600/30 bg-gradient-to-r from-violet-600/20 to-fuchsia-600/10 p-4 transition-colors hover:from-violet-600/30"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-600/30">
          <Users size={22} className="text-violet-400" />
        </div>
        <div className="flex-1">
          <p className="font-semibold">Vibra Community</p>
          <p className="text-sm text-white/50">Join the public chat — share thoughts with everyone</p>
        </div>
        <ChevronRight size={18} className="text-white/40" />
      </Link>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Private Messages</h2>
        <p className="mb-4 text-sm text-white/50">
          Chat with your connected friends
        </p>

        {friends.length === 0 ? (
          <div className="flex flex-col items-center rounded-xl border border-white/10 bg-white/5 py-12 text-center">
            <MessageCircle size={40} className="mb-3 text-white/20" />
            <p className="text-white/50">No friends yet</p>
            <p className="mt-1 text-sm text-white/30">Accept friend requests to start chatting</p>
            <Link href="/social/find" className="mt-4 text-sm text-violet-400 hover:underline">
              Find friends →
            </Link>
          </div>
        ) : conversations.length === 0 ? (
          <div className="space-y-2">
            {friends.map((friend) => (
              <Link
                key={friend.id}
                href={`/social/messages/${friend.id}`}
                className="flex items-center gap-4 rounded-xl p-4 transition-colors hover:bg-white/5"
              >
                <Image src={friend.avatar} alt={friend.name} width={48} height={48} className="rounded-full" />
                <div className="flex-1">
                  <p className="font-medium">{friend.name}</p>
                  <p className="text-sm text-white/50">@{friend.username}</p>
                </div>
                <MessageCircle size={18} className="text-white/30" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map(({ friend, lastMessage, unreadCount }) => (
              <Link
                key={friend.id}
                href={`/social/messages/${friend.id}`}
                className="flex items-center gap-4 rounded-xl p-4 transition-colors hover:bg-white/5"
              >
                <div className="relative shrink-0">
                  <Image src={friend.avatar} alt={friend.name} width={48} height={48} className="rounded-full" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-600 px-1 text-xs font-bold">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn("font-medium", unreadCount > 0 && "text-white")}>{friend.name}</p>
                    {lastMessage && (
                      <span className="shrink-0 text-xs text-white/30">
                        {formatPreviewTime(lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  <p className="truncate text-sm text-white/50">
                    {lastMessage ? lastMessage.content : "Start a conversation"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
