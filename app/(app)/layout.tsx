"use client";

import { Sidebar, TopBar } from "@/components/layout/sidebar";
import { PlayerBar } from "@/components/layout/player-bar";
import { useAuth, usePlayer } from "@/lib/contexts/app-context";
import { SocialProvider } from "@/lib/contexts/social-context";
import { ChatProvider } from "@/lib/contexts/chat-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAuthReady } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isPlayerBarVisible } = usePlayer();

  useEffect(() => {
    if (!isAuthReady) return;
    if (!isAuthenticated) {
      const redirect = encodeURIComponent(pathname);
      router.replace(`/login?redirect=${redirect}`);
    }
  }, [isAuthenticated, isAuthReady, pathname, router]);

  if (!isAuthReady || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center gradient-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <SocialProvider>
      <ChatProvider>
        <div className="flex min-h-screen min-h-dvh gradient-bg">
          <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
          <div className={cn("flex min-w-0 flex-1 flex-col", isPlayerBarVisible && "pb-app")}>
            <TopBar onMenuClick={() => setMobileOpen(true)} />
            <main className="flex-1 overflow-x-hidden overflow-y-auto px-3 py-4 sm:px-4 sm:py-6 md:px-8">
              {children}
            </main>
          </div>
          <PlayerBar />
        </div>
      </ChatProvider>
    </SocialProvider>
  );
}
