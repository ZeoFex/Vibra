import type { Metadata, Viewport } from "next";
import { SplashScreen } from "@/components/brand/splash-screen";
import { AuthProvider, PlayerProvider } from "@/lib/contexts/app-context";
import { PlaylistProvider } from "@/lib/contexts/playlist-context";
import { ArtistAuthProvider } from "@/lib/contexts/artist-auth-context";
import { ArtistUploadProvider } from "@/lib/contexts/artist-upload-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vibra — Feel Every Beat",
  description: "A personalized, immersive, and intelligent music experience.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased dark"
    >
      <body className="min-h-full min-h-dvh bg-black text-white">
        <SplashScreen />
        <AuthProvider>
          <ArtistAuthProvider>
            <ArtistUploadProvider>
              <PlayerProvider>
                <PlaylistProvider>{children}</PlaylistProvider>
              </PlayerProvider>
            </ArtistUploadProvider>
          </ArtistAuthProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
