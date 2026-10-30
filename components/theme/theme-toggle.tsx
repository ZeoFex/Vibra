"use client";

import { Moon, Sun } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Theme = "dark" | "light";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("vibra-theme", theme);
}

export function ThemeToggle() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<Theme>("dark");
  const studio = pathname === "/dj" || pathname.startsWith("/dj/");

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark");
  }, []);

  const light = theme === "light";

  if (studio) return null;

  return (
    <button
      type="button"
      aria-pressed={light}
      aria-label={light ? "Switch to dark theme" : "Switch to white theme"}
      onClick={() => {
        const next: Theme = light ? "dark" : "light";
        setTheme(next);
        applyTheme(next);
      }}
      className="app-chrome fixed right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-[100] inline-flex h-10 w-10 items-center justify-center rounded-full border"
    >
      {light ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
}
