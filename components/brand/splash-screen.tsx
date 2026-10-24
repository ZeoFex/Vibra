"use client";

import { useEffect, useState } from "react";
import { VibraLogo } from "@/components/brand/vibra-logo";

export function SplashScreen() {
  const [phase, setPhase] = useState<"show" | "exit" | "gone">("show");

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const visibleFor = reduce ? 600 : 1600;
    const fadeFor = reduce ? 0 : 450;
    const exitTimer = window.setTimeout(() => setPhase("exit"), visibleFor);
    const goneTimer = window.setTimeout(() => setPhase("gone"), visibleFor + fadeFor);
    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(goneTimer);
    };
  }, []);

  if (phase === "gone") return null;

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center bg-[#1a1028] px-6 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] transition-opacity duration-500 ${
        phase === "exit" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      role="status"
      aria-live="polite"
      aria-label="Vibra is loading"
    >
      <div className="splash-mark flex flex-col items-center gap-5 sm:gap-6">
        <VibraLogo
          size={176}
          className="h-28 w-28 rounded-3xl shadow-2xl shadow-violet-600/30 sm:h-36 sm:w-36 md:h-44 md:w-44"
        />
        <p className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Vibra</p>
      </div>
    </div>
  );
}
