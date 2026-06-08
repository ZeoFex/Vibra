import Image from "next/image";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThumbnailCardProps {
  title: string;
  cover: string;
  onPlay?: () => void;
  className?: string;
}

export function ThumbnailCard({ title, cover, onPlay, className }: ThumbnailCardProps) {
  return (
    <div className={cn("w-[140px] shrink-0 snap-start sm:min-w-[160px] sm:w-auto sm:max-w-[180px]", className)}>
      <div
        className="group relative mb-2 aspect-square cursor-pointer overflow-hidden rounded-xl"
        onClick={onPlay}
        role={onPlay ? "button" : undefined}
        tabIndex={onPlay ? 0 : undefined}
        onKeyDown={
          onPlay
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") onPlay();
              }
            : undefined
        }
      >
        <Image
          src={cover}
          alt={title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="180px"
        />
        {onPlay && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-600 shadow-lg shadow-violet-600/40">
              <Play size={20} fill="white" className="ml-0.5 text-white" />
            </div>
          </div>
        )}
      </div>
      <p className="truncate text-sm font-medium text-white">{title}</p>
    </div>
  );
}
