"use client";

import { useMemo } from "react";
import { Users, Globe } from "lucide-react";
import { useChat } from "@/lib/contexts/chat-context";
import { useAuth } from "@/lib/contexts/app-context";
import { MessageList, ChatInput } from "@/components/chat/chat-ui";

export default function CommunityChatPage() {
  const { communityMessages, sendCommunityMessage } = useChat();
  const { user } = useAuth();
  const currentUserId = user?.id ?? "user-1";

  const sortedMessages = useMemo(
    () => [...communityMessages].sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [communityMessages]
  );

  return (
    <div className="-mx-4 flex flex-col md:-mx-8" style={{ height: "calc(100vh - 220px)" }}>
      <div className="border-b border-white/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600/30">
            <Globe size={20} className="text-violet-400" />
          </div>
          <div>
            <h2 className="font-semibold">Vibra Community</h2>
            <p className="flex items-center gap-1 text-xs text-white/40">
              <Users size={12} />
              Open to all listeners — share your thoughts
            </p>
          </div>
        </div>
      </div>

      <MessageList messages={sortedMessages} currentUserId={currentUserId} className="flex-1" />

      <ChatInput
        onSend={sendCommunityMessage}
        placeholder="Share what's on your mind..."
      />
    </div>
  );
}
