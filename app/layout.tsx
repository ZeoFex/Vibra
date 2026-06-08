import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider, PlayerProvider } from "@/lib/contexts/app-context";
import { ArtistAuthProvider } from "@/lib/contexts/artist-auth-context";
import { ArtistUploadProvider } from "@/lib/contexts/artist-upload-context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full min-h-dvh bg-black text-white">
        <AuthProvider>
          <ArtistAuthProvider>
            <ArtistUploadProvider>
              <PlayerProvider>{children}</PlayerProvider>
            </ArtistUploadProvider>
          </ArtistAuthProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
