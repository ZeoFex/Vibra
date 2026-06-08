"use client";

import { useState, useRef } from "react";
import { Send } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types";
import { EmojiPicker, EmojiToggleButton } from "@/components/chat/emoji-picker";

function formatTime(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

interface MessageListProps {
  messages: ChatMessage[];
  currentUserId: string;
  className?: string;
}

export function MessageList({ messages, currentUserId, className }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className={cn("flex flex-1 items-center justify-center text-sm text-white/40", className)}>
        No messages yet. Say hello!
      </div>
    );
  }

  return (
    <div className={cn("flex flex-1 flex-col gap-3 overflow-y-auto p-4", className)}>
      {messages.map((msg) => {
        const isOwn = msg.senderId === currentUserId;
        return (
          <div key={msg.id} className={cn("flex gap-2", isOwn ? "flex-row-reverse" : "flex-row")}>
            {!isOwn && (
              <Image
                src={msg.senderAvatar}
                alt={msg.senderName}
                width={32}
                height={32}
                className="mt-1 shrink-0 rounded-full"
              />
            )}
            <div className={cn("max-w-[75%]", isOwn ? "items-end" : "items-start")}>
              {!isOwn && (
                <p className="mb-1 text-xs text-white/40">
                  {msg.senderName}{" "}
                  <span className="text-white/25">@{msg.senderUsername}</span>
                </p>
              )}
              <div
                className={cn(
                  "rounded-2xl px-4 py-2.5 text-sm",
                  isOwn
                    ? "rounded-br-md bg-violet-600 text-white"
                    : "rounded-bl-md bg-white/10 text-white/90"
                )}
              >
                {msg.content}
              </div>
              <p className={cn("mt-1 text-xs text-white/30", isOwn && "text-right")}>
                {formatTime(msg.createdAt)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface ChatInputProps {
  onSend: (content: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ChatInput({ onSend, placeholder = "Type a message...", disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue("");
    setEmojiOpen(false);
  };

  const insertEmoji = (emoji: string) => {
    const input = inputRef.current;
    if (!input) {
      setValue((prev) => prev + emoji);
      return;
    }

    const start = input.selectionStart ?? value.length;
    const end = input.selectionEnd ?? value.length;
    const next = value.slice(0, start) + emoji + value.slice(end);
    setValue(next);

    requestAnimationFrame(() => {
      input.focus();
      const cursor = start + emoji.length;
      input.setSelectionRange(cursor, cursor);
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative border-t border-white/10 bg-black/40 p-4 backdrop-blur-xl"
    >
      <EmojiPicker
        open={emojiOpen}
        onSelect={insertEmoji}
        onClose={() => setEmojiOpen(false)}
      />

      <div className="flex min-w-0 gap-2">
        <EmojiToggleButton
          active={emojiOpen}
          onClick={() => setEmojiOpen((prev) => !prev)}
          disabled={disabled}
        />
        <input
          ref={inputRef}
          name="message"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50 sm:px-4"
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="shrink-0 rounded-xl bg-violet-600 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-500 disabled:opacity-50 sm:px-5"
          aria-label="Send message"
        >
          <Send size={18} className="sm:hidden" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </div>
    </form>
  );
}
