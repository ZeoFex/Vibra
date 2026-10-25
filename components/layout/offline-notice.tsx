"use client";

import { useEffect, useState } from "react";

export function OfflineNotice() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const show = () => {
      setMessage("No internet connection. Connect before you play, download, or save.");
      window.setTimeout(() => setMessage(""), 4000);
    };
    const onOffline = () => show();
    window.addEventListener("offline", onOffline);
    window.addEventListener("vibra-offline", onOffline);
    if (!navigator.onLine) show();
    return () => {
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("vibra-offline", onOffline);
    };
  }, []);

  if (!message) return null;
  return (
    <div className="pointer-events-none fixed inset-x-3 top-3 z-[120] rounded-2xl border border-violet-400/20 bg-[#241433] px-4 py-3 text-center text-sm text-violet-100 shadow-xl">
      {message}
    </div>
  );
}
