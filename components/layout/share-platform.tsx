"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Copy, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Album, Song } from "@/types";

export type ShareTarget = {
  title: string;
  text: string;
  path: string;
};

function absoluteUrl(path: string) {
  if (typeof window === "undefined") return path;
  if (path.startsWith("http")) return path;
  return `${window.location.origin}${path.startsWith("/") ? path : `/${path}`}`;
}

export function songShareTarget(song: Song): ShareTarget {
  return {
    title: song.title,
    text: `${song.title} · ${song.artistName} on Vibra`,
    path: `/listen/${encodeURIComponent(song.id)}`,
  };
}

export function albumShareTarget(album: Album): ShareTarget {
  const kind = album.type === "ep" ? "EP" : album.type === "single" ? "single" : "album";
  return {
    title: album.title,
    text: `${album.title} · ${kind} by ${album.artistName} on Vibra`,
    path: `/album/${encodeURIComponent(album.id)}`,
  };
}

export function platformShareTarget(): ShareTarget {
  return { title: "Vibra", text: "Listen with me on Vibra", path: "/" };
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex h-11 w-11 cursor-pointer touch-manipulation items-center justify-center rounded-full transition hover:bg-white/10 sm:h-12 sm:w-12"
    >
      {children}
    </button>
  );
}

export function ShareMenu({
  target,
  compact = false,
  iconOnly = false,
}: {
  target: ShareTarget;
  compact?: boolean;
  iconOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hint, setHint] = useState("");
  const [mounted, setMounted] = useState(false);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!panel.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  const url = absoluteUrl(target.path);
  const message = `${target.text} ${url}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const openShare = (href: string) => {
    window.open(href, "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  const copyThen = async (label: string) => {
    await copyLink();
    setHint(`Link copied. Paste it in ${label}.`);
  };

  const sheet = (
    <>
      <p className="px-1 text-sm font-semibold">Share on Vibra</p>
      <p className="truncate px-1 pb-3 text-xs text-white/45">{target.title}</p>
      <div className="grid grid-cols-4 justify-items-center gap-1 sm:gap-2">
        <IconButton label="WhatsApp" onClick={() => openShare(`https://wa.me/?text=${encodeURIComponent(message)}`)}>
          <svg viewBox="0 0 24 24" className="h-11 w-11" aria-hidden><circle cx="12" cy="12" r="12" fill="#25D366" /><path fill="#fff" d="M12 5.8A6.2 6.2 0 0 0 6.7 15l-.5 2.4 2.5-.5A6.2 6.2 0 1 0 12 5.8zm3.4 8.4c-.1.4-.7.7-1 .8-.3 0-.6.1-1.9-.4-1.6-.6-2.6-2.2-2.7-2.3-.1-.1-.7-.9-.7-1.7s.4-1.2.6-1.4c.1-.1.3-.2.5-.2h.4c.1 0 .3 0 .4.3.2.5.6 1.6.6 1.7.1.1 0 .2-.1.4l-.3.3c-.1.1-.2.2-.1.4.1.2.5.8 1.1 1.3.7.6 1.3.8 1.5.9.2.1.3 0 .4-.1l.5-.6c.1-.2.3-.1.5-.1.2.1 1.2.6 1.4.7.2.1.3.1.4.2.1.2 0 .6-.1.9z" /></svg>
        </IconButton>
        <IconButton label="Facebook" onClick={() => openShare(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`)}>
          <svg viewBox="0 0 24 24" className="h-11 w-11" aria-hidden><circle cx="12" cy="12" r="12" fill="#1877F2" /><path fill="#fff" d="M13.4 18.5v-5.6h1.9l.3-2.2h-2.2V9.3c0-.6.2-1.1 1.1-1.1h1.2V6.2c-.2 0-1 0-1.8.1-1.8.1-3 1.1-3 3.1v1.3H9.2v2.2h1.7v5.6h2.5z" /></svg>
        </IconButton>
        <IconButton label="Snapchat" onClick={() => void copyThen("Snapchat")}>
          <svg viewBox="0 0 24 24" className="h-11 w-11" aria-hidden><circle cx="12" cy="12" r="12" fill="#FFFC00" /><path fill="#000" d="M12 5.2c1.8 0 3.2 1.3 3.2 3.4 0 .5.1 1.1.3 1.5.2.3.5.4.8.5.5.1.7.4.6.8-.2.6-1 .8-1.5 1-.3.1-.4.3-.3.6.2.5.8.8 1.4 1 .4.1.6.4.4.7-.3.6-1.3.9-2.2.9-.3 0-.5.2-.6.5-.2.6-.8 1-1.9 1s-1.7-.4-1.9-1c-.1-.3-.3-.5-.6-.5-.9 0-1.9-.3-2.2-.9-.2-.3 0-.6.4-.7.6-.2 1.2-.5 1.4-1 .1-.3 0-.5-.3-.6-.5-.2-1.3-.4-1.5-1-.1-.4.1-.7.6-.8.3-.1.6-.2.8-.5.2-.4.3-1 .3-1.5 0-2.1 1.4-3.4 3.2-3.4z" /></svg>
        </IconButton>
        <IconButton label="Telegram" onClick={() => openShare(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(target.text)}`)}>
          <svg viewBox="0 0 24 24" className="h-11 w-11" aria-hidden><circle cx="12" cy="12" r="12" fill="#229ED9" /><path fill="#fff" d="M17.6 7.3 15.4 17c-.2.8-.7 1-1.4.6l-3.1-2.3-1.5 1.4c-.2.2-.3.3-.6.3l.2-3.1 5.6-5.1c.2-.2 0-.3-.3-.1l-7 4.4-3-.9c-.7-.2-.7-.7.1-1.1l11.7-4.5c.6-.2 1.1.1 1.1.6z" /></svg>
        </IconButton>
        <IconButton label="TikTok" onClick={() => void copyThen("TikTok")}>
          <svg viewBox="0 0 24 24" className="h-11 w-11" aria-hidden><circle cx="12" cy="12" r="12" fill="#111" /><path fill="#25F4EE" d="M14 7.2c.6.5 1.3.8 2.1.9v1.7a4.2 4.2 0 0 1-2.1-.7v3.6a3.5 3.5 0 1 1-3.5-3.5c.2 0 .3 0 .5.1v1.8a1.8 1.8 0 1 0 1.2 1.7V7.2H14z" /><path fill="#FE2C55" d="M14.4 7.4c.6.5 1.3.8 2.1.9v1.7a4.2 4.2 0 0 1-2.1-.7v3.6a3.5 3.5 0 1 1-3.5-3.5c.2 0 .3 0 .5.1v1.8a1.8 1.8 0 1 0 1.2 1.7V7.4h1.8z" /><path fill="#fff" d="M14.2 7.3c.6.5 1.3.8 2.1.9v1.7a4.2 4.2 0 0 1-2.1-.7v3.6a3.5 3.5 0 1 1-3.5-3.5c.2 0 .3 0 .5.1v1.8a1.8 1.8 0 1 0 1.2 1.7V7.3h1.8z" /></svg>
        </IconButton>
        <IconButton label="X" onClick={() => openShare(`https://twitter.com/intent/tweet?text=${encodeURIComponent(target.text)}&url=${encodeURIComponent(url)}`)}>
          <svg viewBox="0 0 24 24" className="h-11 w-11" aria-hidden><circle cx="12" cy="12" r="12" fill="#000" /><path fill="#fff" d="M16.8 6.8h-1.6l-2.4 3-2.5-3H7.4l3.6 4.6-3.8 4.8h1.6l2.6-3.3 2.8 3.3h2.8l-3.8-4.5 3.6-4.9z" /></svg>
        </IconButton>
        <IconButton label="Instagram" onClick={() => void copyThen("Instagram")}>
          <svg viewBox="0 0 24 24" className="h-11 w-11" aria-hidden><circle cx="12" cy="12" r="12" fill="#E1306C" /><rect x="7" y="7" width="10" height="10" rx="3" fill="none" stroke="#fff" strokeWidth="1.4" /><circle cx="12" cy="12" r="2.4" fill="none" stroke="#fff" strokeWidth="1.4" /><circle cx="15.2" cy="8.8" r="0.7" fill="#fff" /></svg>
        </IconButton>
        <IconButton label={copied ? "Copied" : "Copy"} onClick={() => void copyLink()}>
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white">
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </span>
        </IconButton>
      </div>
      {hint && <p className="px-1 pt-2 text-xs text-violet-300">{hint}</p>}
    </>
  );

  return (
    <div className="relative" ref={panel} onClick={(event) => event.stopPropagation()}>
      {iconOnly ? (
        <button type="button" aria-label={`Share ${target.title}`} onClick={() => setOpen((value) => !value)} className="flex h-9 w-9 cursor-pointer touch-manipulation items-center justify-center rounded-full bg-[#5b21b6] text-white transition hover:bg-violet-400">
          <Share2 size={16} />
        </button>
      ) : (
        <Button type="button" variant={compact ? "ghost" : "outline"} size="sm" className="cursor-pointer gap-1 px-3" onClick={() => setOpen((value) => !value)}>
          <Share2 size={14} />
          <span className={compact ? "hidden sm:inline" : ""}>Share</span>
        </Button>
      )}
      {open && (
        <div className="absolute right-0 z-50 mt-2 hidden w-72 rounded-2xl border border-white/10 bg-zinc-950 p-3 shadow-2xl sm:block">
          {sheet}
        </div>
      )}
      {open && mounted && createPortal(
        <div className="sm:hidden">
          <button type="button" aria-label="Close share" className="fixed inset-0 z-[80] cursor-pointer bg-black/60" onClick={() => setOpen(false)} />
          <div
            className="fixed inset-x-0 z-[90] max-h-[70dvh] overflow-y-auto rounded-t-3xl border border-white/10 bg-zinc-950 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 shadow-2xl"
            style={{ bottom: "var(--share-lift, 0px)" }}
          >
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-white/20" />
            {sheet}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export function SharePlatform({ compact = false }: { compact?: boolean }) {
  return <ShareMenu target={platformShareTarget()} compact={compact} />;
}
