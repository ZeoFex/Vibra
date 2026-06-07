"use client";

import { Sidebar, TopBar } from "@/components/layout/sidebar";
import { PlayerBar } from "@/components/layout/player-bar";
import { useAuth } from "@/lib/contexts/app-context";
import { SocialProvider } from "@/lib/contexts/social-context";
import { ChatProvider } from "@/lib/contexts/chat-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center gradient-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <SocialProvider>
      <ChatProvider>
        <div className="flex min-h-screen gradient-bg">
          <Sidebar />
          <div className="flex flex-1 flex-col pb-24">
            <TopBar />
            <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8">{children}</main>
          </div>
          <PlayerBar />
        </div>
      </ChatProvider>
    </SocialProvider>
  );
}
