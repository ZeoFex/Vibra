"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { cn, formatDuration } from "@/lib/utils";

interface AudioPreviewProps {
  src: string;
  fileName: string;
  duration?: number;
  className?: string;
}

export function AudioPreview({ src, fileName, duration, className }: AudioPreviewProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resolvedDuration, setResolvedDuration] = useState(duration ?? 0);

  useEffect(() => {
    const audio = new Audio(src);
    audioRef.current = audio;

    const onTimeUpdate = () => setProgress(Math.floor(audio.currentTime));
    const onLoaded = () => {
      if (Number.isFinite(audio.duration)) setResolvedDuration(Math.round(audio.duration));
    };
    const onEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended", onEnded);
      audioRef.current = null;
    };
  }, [src]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    void audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  };

  const total = resolvedDuration || duration || 0;
  const progressPercent = total > 0 ? (progress / total) * 100 : 0;

  return (
    <div className={cn("rounded-xl border border-violet-500/30 bg-violet-500/10 p-3", className)}>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={togglePlay}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-600 text-white transition-transform hover:scale-105"
          aria-label={isPlaying ? "Pause preview" : "Play preview"}
        >
          {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white">{fileName}</p>
          <p className="text-xs text-white/50">
            {formatDuration(progress)} / {formatDuration(total || 0)}
          </p>
        </div>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
        <div className="h-full bg-violet-500 transition-all" style={{ width: `${progressPercent}%` }} />
      </div>
    </div>
  );
}
