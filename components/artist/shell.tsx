"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Upload,
  Music,
  User,
  LogOut,
  ArrowLeft,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useArtistAuth } from "@/lib/contexts/artist-auth-context";

const navItems = [
  { href: "/artist/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/artist/upload", label: "Upload Music", icon: Upload },
  { href: "/artist/songs", label: "My Songs", icon: Music },
  { href: "/artist/profile", label: "Profile", icon: User },
];

export function ArtistShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { artist, logout } = useArtistAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavContent = () => (
    <>
      <Link href="/artist/dashboard" className="mb-8 flex items-center gap-2 px-2" onClick={() => setMobileOpen(false)}>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600">
          <span className="text-lg font-bold text-white">V</span>
        </div>
        <div>
          <span className="text-xl font-bold text-white">Vibra</span>
          <p className="text-xs text-white/40">Artist Portal</p>
        </div>
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              pathname === href
                ? "bg-white/10 text-white"
                : "text-white/60 hover:bg-white/5 hover:text-white"
            )}
          >
            <Icon size={20} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto space-y-2 border-t border-white/10 pt-4">
        <div className="flex items-center gap-3 rounded-xl px-3 py-2">
          <Image src={artist?.image ?? ""} alt="" width={32} height={32} className="rounded-full" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{artist?.stageName}</p>
            <p className="truncate text-xs text-white/40">{artist?.email}</p>
          </div>
        </div>
        <Link
          href="/home"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-white/60 hover:bg-white/5 hover:text-white"
        >
          <ArrowLeft size={18} />
          Listener App
        </Link>
        <button
          onClick={() => { logout(); router.push("/artist/login"); }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-white/60 hover:bg-white/5 hover:text-white"
        >
          <LogOut size={18} />
          Log out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen min-h-dvh gradient-bg">
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex h-full w-[min(18rem,85vw)] flex-col bg-zinc-950 p-4">
            <button onClick={() => setMobileOpen(false)} className="absolute right-4 top-4 text-white/60" aria-label="Close menu">
              <X size={20} />
            </button>
            <NavContent />
          </aside>
        </div>
      )}

      <aside className="hidden w-64 shrink-0 flex-col border-r border-white/10 bg-black/40 p-4 backdrop-blur-xl lg:flex">
        <NavContent />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex items-center gap-2 border-b border-white/5 bg-black/40 px-3 py-3 backdrop-blur-xl sm:px-4 md:px-8">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <h1 className="truncate text-base font-semibold sm:text-lg">
            {navItems.find((n) => n.href === pathname)?.label ?? "Artist Portal"}
          </h1>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto px-3 py-4 sm:px-4 sm:py-6 md:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
