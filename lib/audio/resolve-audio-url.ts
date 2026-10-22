import type { Song } from "@/types";
import { getDemoAudioUrl } from "@/lib/audio/demo-tracks";
import { getUploadAudioPath } from "@/lib/audio/constants";

function isPlayableUrl(value: string): boolean {
  return (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("blob:") ||
    value.startsWith("/api/")
  );
}

function toAbsoluteAudioUrl(url: string): string {
  if (url.startsWith("/") && typeof window !== "undefined") {
    return `${window.location.origin}${url}`;
  }
  return url;
}

export async function resolveAudioUrl(song: Song): Promise<string | null> {
  if (song.audioUrl && isPlayableUrl(song.audioUrl)) {
    return toAbsoluteAudioUrl(song.audioUrl);
  }

  if (!song.id.startsWith("song-")) {
    return toAbsoluteAudioUrl(getUploadAudioPath(song.id));
  }

  return getDemoAudioUrl(song.id);
}

export function getAudioDurationFromFile(file: File): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio();
    const url = URL.createObjectURL(file);

    const cleanup = () => URL.revokeObjectURL(url);

    audio.addEventListener(
      "loadedmetadata",
      () => {
        const duration = Number.isFinite(audio.duration) ? Math.round(audio.duration) : 180;
        cleanup();
        resolve(Math.max(duration, 1));
      },
      { once: true }
    );

    audio.addEventListener(
      "error",
      () => {
        cleanup();
        resolve(180);
      },
      { once: true }
    );

    audio.src = url;
  });
}
