"use client";

import { useEffect, useState } from "react";
import { clearPendingVoice, readPendingVoice } from "@/lib/client/pending-voice";

type Note = { id: string; audioUrl: string; createdAt: string };

export function MyVoiceNotes() {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const pending = await readPendingVoice().catch(() => null);
      if (pending && pending.size > 0) {
        const body = new FormData();
        body.set("audio", pending, "voice.webm");
        const saved = await fetch("/api/voice-notes", { method: "POST", body });
        if (saved.ok) await clearPendingVoice();
      }
      const res = await fetch("/api/voice-notes");
      if (!res.ok || cancelled) return;
      const data = (await res.json()) as { notes?: Note[] };
      if (!cancelled) setNotes(data.notes ?? []);
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (notes.length === 0) return null;

  return (
    <section className="rounded-2xl border border-violet-400/20 bg-[#1a1028] p-5">
      <h2 className="text-lg font-semibold">Your recording</h2>
      <p className="mt-1 text-sm text-white/50">The voice note you saved before logging in.</p>
      <div className="mt-4 space-y-3">
        {notes.map((note) => (
          <audio key={note.id} controls src={note.audioUrl} className="w-full" preload="none" />
        ))}
      </div>
    </section>
  );
}
