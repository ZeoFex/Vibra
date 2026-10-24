"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Mic, MoreHorizontal, Pause, Play, Trash2 } from "lucide-react";
import { clearPendingVoice, readPendingVoice } from "@/lib/client/pending-voice";

type Note = { id: string; audioUrl: string; createdAt: string };

function formatWhen(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatClock(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const whole = Math.floor(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}

function RecordingPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  const percent = duration > 0 ? Math.min(100, (current / duration) * 100) : 0;

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) void audio.play();
    else audio.pause();
  }

  function seek(event: MouseEvent<HTMLButtonElement>) {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * duration;
    setCurrent(audio.currentTime);
  }

  return (
    <div className="flex items-center gap-3">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setCurrent(0);
        }}
        onTimeUpdate={(event) => setCurrent(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
      />
      <button
        type="button"
        aria-label={playing ? "Pause" : "Play"}
        onClick={toggle}
        className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#5b21b6] text-violet-100"
      >
        {playing ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
      </button>
      <div className="min-w-0 flex-1">
        <button
          type="button"
          aria-label="Seek"
          onClick={seek}
          className="relative block h-8 w-full cursor-pointer"
        >
          <span className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-violet-950" />
          <span
            className="absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-violet-400"
            style={{ width: `${percent}%` }}
          />
          <span
            className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-2 border-violet-100 bg-[#5b21b6] shadow-md shadow-violet-900/60"
            style={{ left: `calc(${percent}% - 7px)` }}
          />
        </button>
        <div className="flex justify-between text-[11px] text-violet-200/60">
          <span>{formatClock(current)}</span>
          <span>{formatClock(duration)}</span>
        </div>
      </div>
    </div>
  );
}

function RecordingMenu({ onDelete }: { onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointer(event: globalThis.MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="Recording options"
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-violet-200 hover:bg-violet-500/20"
        onClick={() => setOpen((value) => !value)}
      >
        <MoreHorizontal size={18} />
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-36 rounded-xl border border-violet-400/20 bg-[#1a1028] py-1 shadow-xl shadow-black/40">
          <button
            type="button"
            className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm text-red-300 hover:bg-violet-500/15"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default function RecordingsPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const pending = await readPendingVoice().catch(() => null);
        if (pending && pending.size > 0) {
          const body = new FormData();
          body.set("audio", new File([pending], "voice.webm", { type: pending.type || "audio/webm" }));
          const saved = await fetch("/api/voice-notes", { method: "POST", body });
          if (!saved.ok) {
            const data = (await saved.json().catch(() => ({}))) as { error?: string };
            throw new Error(data.error ?? "Could not save your recording.");
          }
          await clearPendingVoice();
        }
        const res = await fetch("/api/voice-notes");
        if (!res.ok) throw new Error("Could not load your recordings.");
        const data = (await res.json()) as { notes?: Note[] };
        if (!cancelled) setNotes(data.notes ?? []);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load your recordings.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function remove(id: string) {
    const previous = notes;
    setNotes((current) => current.filter((note) => note.id !== id));
    const res = await fetch(`/api/voice-notes/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setNotes(previous);
      setError("Could not delete that recording.");
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Recordings</h1>
        <p className="mt-1 text-sm text-violet-200/70">Voice notes you recorded on Vibra.</p>
      </div>
      {loading && <p className="text-sm text-violet-200/60">Loading your recordings…</p>}
      {error && <p className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}
      {!loading && notes.length === 0 && !error && (
        <div className="rounded-3xl border border-violet-400/15 bg-[#241433]/45 p-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5b21b6]/40 text-violet-200">
            <Mic size={20} />
          </div>
          <p className="text-sm text-violet-100/70">
            No recordings yet. Record your voice on the Vibra landing page, then come back here after you log in.
          </p>
        </div>
      )}
      <div className="space-y-3">
        {notes.map((note, index) => (
          <article
            key={note.id}
            className="rounded-3xl border border-violet-400/15 bg-[#241433]/45 p-4 shadow-lg shadow-black/20 backdrop-blur-md"
          >
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#5b21b6] text-violet-100">
                <Mic size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-white">Recording {notes.length - index}</p>
                <p className="text-xs text-violet-200/60">{formatWhen(note.createdAt)}</p>
              </div>
              <RecordingMenu onDelete={() => void remove(note.id)} />
            </div>
            <RecordingPlayer src={note.audioUrl} />
          </article>
        ))}
      </div>
    </div>
  );
}
