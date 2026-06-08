"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ArtistShell } from "@/components/artist/shell";
import { useArtistAuth } from "@/lib/contexts/artist-auth-context";

export default function ArtistPortalLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAuthReady } = useArtistAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthReady) return;
    if (!isAuthenticated) {
      const redirect = encodeURIComponent(pathname);
      router.replace(`/artist/login?redirect=${redirect}`);
    }
  }, [isAuthenticated, isAuthReady, pathname, router]);

  if (!isAuthReady || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center gradient-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  return <ArtistShell>{children}</ArtistShell>;
}
