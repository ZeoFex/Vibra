"use client";

import { createContext, useContext } from "react";

interface DjChromeValue {
  immersive: boolean;
  setImmersive: (value: boolean) => void;
}

const DjChromeContext = createContext<DjChromeValue>({
  immersive: false,
  setImmersive: () => {},
});

export function DjChromeProvider({
  immersive,
  setImmersive,
  children,
}: DjChromeValue & { children: React.ReactNode }) {
  return <DjChromeContext.Provider value={{ immersive, setImmersive }}>{children}</DjChromeContext.Provider>;
}

export function useDjChrome() {
  return useContext(DjChromeContext);
}
