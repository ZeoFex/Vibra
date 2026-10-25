"use client";

import { OfflineNotice } from "@/components/layout/offline-notice";
import { MobileTabBar, Sidebar, TopBar } from "@/components/layout/sidebar";
import { PlayerBar } from "@/components/layout/player-bar";
import { useAuth, usePlayer } from "@/lib/contexts/app-context";
import { SocialProvider } from "@/lib/contexts/social-context";
import { NotificationProvider } from "@/lib/contexts/notification-context";
import { ChatProvider } from "@/lib/contexts/chat-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAuthReady } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
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
      <NotificationProvider>
      <ChatProvider>
        <div
          className="flex h-dvh overflow-hidden gradient-bg"
          style={{
            ["--share-lift" as string]: isPlayerBarVisible
              ? "var(--app-chrome-bottom)"
              : "calc(var(--tab-bar-height) + env(safe-area-inset-bottom, 0px))",
          }}
        >
          <Sidebar />
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <TopBar />
            <main
              className={cn(
                "min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-3 py-4 sm:px-4 sm:py-6 md:px-8",
                isPlayerBarVisible ? "pb-app" : "pb-[calc(var(--tab-bar-height)+env(safe-area-inset-bottom,0px))]"
              )}
            >
              {children}
            </main>
          </div>
          <PlayerBar />
          <MobileTabBar />
          <OfflineNotice />
        </div>
      </ChatProvider>
      </NotificationProvider>
    </SocialProvider>
  );
}
