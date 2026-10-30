"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type Theme = "dark" | "light";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("vibra-theme", theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark");
  }, []);

  const light = theme === "light";

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
      className="app-chrome fixed left-4 z-40 inline-flex h-10 w-10 items-center justify-center rounded-full border shadow-lg lg:left-[17.5rem]"
      style={{ bottom: "calc(var(--app-chrome-bottom) + 0.75rem)" }}
    >
      {light ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
}
