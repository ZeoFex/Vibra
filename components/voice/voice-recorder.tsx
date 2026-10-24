"use client";

import { useRef, useState } from "react";
import { Mic } from "lucide-react";
import { savePendingVoice } from "@/lib/client/pending-voice";

export function VoiceRecorder() {
  const [hint, setHint] = useState(false);
  const [recording, setRecording] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  const stop = () => {
    recorder.current?.stop();
    recorder.current?.stream.getTracks().forEach((track) => track.stop());
  };

  const start = async () => {
    setError("");
    setSaved(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const media = new MediaRecorder(stream);
      chunks.current = [];
      media.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.current.push(event.data);
      };
      media.onstop = () => {
        const blob = new Blob(chunks.current, { type: media.mimeType || "audio/webm" });
        void savePendingVoice(blob).then(() => setSaved(true));
        setRecording(false);
      };
      recorder.current = media;
      media.start();
      setRecording(true);
      window.setTimeout(() => {
        if (media.state === "recording") stop();
      }, 30_000);
    } catch {
      setError("Allow the microphone so Vibra can record your voice.");
    }
  };

  return (
    <div
      className="group relative flex w-fit flex-col items-center"
      onMouseEnter={() => setHint(true)}
      onMouseLeave={() => setHint(false)}
      onFocus={() => setHint(true)}
      onBlur={() => setHint(false)}
    >
      <div className="relative flex h-14 w-14 items-center justify-center">
        <span className="voice-wave pointer-events-none absolute inset-0 rounded-full border border-violet-300/70" />
        <span className="voice-wave pointer-events-none absolute inset-0 rounded-full border border-fuchsia-300/50 [animation-delay:0.7s]" />
        <span className="voice-wave pointer-events-none absolute inset-0 rounded-full bg-violet-500/25 [animation-delay:1.4s]" />
        <button
          type="button"
          onClick={() => (recording ? stop() : void start())}
          className="relative z-10 flex h-14 w-14 cursor-pointer touch-manipulation items-center justify-center rounded-full border border-violet-300/40 bg-[#241433] text-violet-100 shadow-lg shadow-violet-950/40 transition hover:bg-violet-700/40"
          aria-label={recording ? "Stop recording" : "Record your voice"}
        >
          <Mic size={22} className={recording ? "text-red-300" : ""} />
        </button>
      </div>
      <p
        className={`pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-40 -translate-x-1/2 text-center text-sm text-violet-100 transition ${hint || recording ? "opacity-100" : "opacity-0"}`}
      >
        {recording ? "Recording… tap again to finish" : "Tap to record your voice"}
      </p>
      {saved && (
        <p className="mt-2 text-center text-sm text-violet-200/80">
          Saved. Create an account and log in to hear this recording.
        </p>
      )}
      {error && <p className="mt-2 text-center text-sm text-red-300">{error}</p>}
    </div>
  );
}
