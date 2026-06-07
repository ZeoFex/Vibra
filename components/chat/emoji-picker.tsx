"use client";

import { useRef, useEffect } from "react";
import { Smile } from "lucide-react";
import EmojiPickerReact, { Theme, EmojiStyle } from "emoji-picker-react";
import type { EmojiClickData } from "emoji-picker-react";
import { cn } from "@/lib/utils";

interface EmojiPickerProps {
  open: boolean;
  onSelect: (emoji: string) => void;
  onClose: () => void;
  className?: string;
}

export function EmojiPicker({ open, onSelect, onClose, className }: EmojiPickerProps) {
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onClose]);

  if (!open) return null;

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onSelect(emojiData.emoji);
  };

  return (
    <div
      ref={pickerRef}
      className={cn(
        "absolute bottom-full left-0 z-50 mb-2 overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/50",
        className
      )}
    >
      <EmojiPickerReact
        onEmojiClick={handleEmojiClick}
        theme={Theme.DARK}
        emojiStyle={EmojiStyle.NATIVE}
        lazyLoadEmojis
        autoFocusSearch={false}
        width={320}
        height={400}
        searchPlaceHolder="Search all emojis..."
        previewConfig={{ showPreview: true }}
      />
    </div>
  );
}

interface EmojiToggleButtonProps {
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function EmojiToggleButton({ active, onClick, disabled }: EmojiToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl border border-white/10 transition-colors",
        active ? "bg-violet-600/30 text-violet-400" : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white",
        disabled && "opacity-50"
      )}
      aria-label="Open emoji picker"
    >
      <Smile size={20} />
    </button>
  );
}
