"use client";

import { use, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useChat } from "@/lib/contexts/chat-context";
import { useSocial } from "@/lib/contexts/social-context";
import { useAuth } from "@/lib/contexts/app-context";
import { MessageList, ChatInput } from "@/components/chat/chat-ui";
import { socialProfiles } from "@/lib/mock-data/social";

export default function PrivateChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { isFriend, friends } = useSocial();
  const { getPrivateMessages, sendPrivateMessage, markConversationRead } = useChat();

  const friend = friends.find((f) => f.id === id) ?? socialProfiles.find((p) => p.id === id);
  const messages = getPrivateMessages(id);
  const currentUserId = user?.id ?? "user-1";

  useEffect(() => {
    if (!isFriend(id)) {
      router.replace("/social/messages");
      return;
    }
    markConversationRead(id);
  }, [id, isFriend, markConversationRead, router]);

  const sortedMessages = useMemo(
    () => [...messages].sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [messages]
  );

  if (!friend || !isFriend(id)) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="-mx-4 flex flex-col md:-mx-8" style={{ height: "calc(100vh - 220px)" }}>
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
        <Link href="/social/messages" className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white">
          <ArrowLeft size={20} />
        </Link>
        <Image src={friend.avatar} alt={friend.name} width={36} height={36} className="rounded-full" />
        <div>
          <p className="font-medium">{friend.name}</p>
          <p className="text-xs text-white/40">@{friend.username}</p>
        </div>
      </div>

      <MessageList messages={sortedMessages} currentUserId={currentUserId} className="flex-1" />

      <ChatInput
        onSend={(content) => sendPrivateMessage(id, content)}
        placeholder={`Message @${friend.username}...`}
      />
    </div>
  );
}
