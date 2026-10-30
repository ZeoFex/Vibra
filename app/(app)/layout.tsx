"use client";

import { OfflineNotice } from "@/components/layout/offline-notice";
import { MobileTabBar, Sidebar, TopBar } from "@/components/layout/sidebar";
import { PlayerBar } from "@/components/layout/player-bar";
import { useAuth, usePlayer } from "@/lib/contexts/app-context";
import { SocialProvider } from "@/lib/contexts/social-context";
import { NotificationProvider } from "@/lib/contexts/notification-context";
import { ChatProvider } from "@/lib/contexts/chat-context";
import { DjChromeProvider } from "@/lib/dj/chrome";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthReady } = useAuth();
  const pathname = usePathname();
  const { isPlayerBarVisible } = usePlayer();
  const studio = pathname.startsWith("/dj");
  const [immersive, setImmersive] = useState(true);
  const fullMixer = studio && immersive;
  const showPlayer = isPlayerBarVisible && !studio;

  useEffect(() => {
    if (studio) setImmersive(true);
  }, [studio, pathname]);

  if (!isAuthReady) {
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
        <DjChromeProvider immersive={fullMixer} setImmersive={setImmersive}>
        <div
          className="flex h-dvh overflow-hidden gradient-bg"
          style={{
            ["--share-lift" as string]: showPlayer
              ? "var(--app-chrome-bottom)"
              : "calc(var(--tab-bar-height) + env(safe-area-inset-bottom, 0px))",
          }}
        >
          {!fullMixer && <Sidebar />}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            {!fullMixer && <TopBar />}
            <main
              className={cn(
                "min-h-0 flex-1 overflow-x-hidden overflow-y-auto",
                fullMixer
                  ? "p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:p-3"
                  : cn(
                      "px-3 py-4 sm:px-4 sm:py-6 md:px-8",
                      showPlayer ? "pb-app" : "pb-[calc(var(--tab-bar-height)+env(safe-area-inset-bottom,0px))]"
                    )
              )}
            >
              {children}
            </main>
          </div>
          {!studio && <PlayerBar />}
          {!fullMixer && <MobileTabBar />}
          <OfflineNotice />
        </div>
        </DjChromeProvider>
      </ChatProvider>
      </NotificationProvider>
    </SocialProvider>
  );
}
