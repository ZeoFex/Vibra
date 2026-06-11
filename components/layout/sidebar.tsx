"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Home,
  Search,
  Library,
  Sparkles,
  Crown,
  Bell,
  Disc3,
  Users,
  Settings,
  LogOut,
  Mic2,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/contexts/app-context";
import { useSocial } from "@/lib/contexts/social-context";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/library", label: "Library", icon: Library },
  { href: "/albums", label: "Albums", icon: Disc3 },
  { href: "/ai", label: "Vibra AI", icon: Sparkles },
  { href: "/social", label: "Social", icon: Users },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/premium", label: "Premium", icon: Crown },
];

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export function Sidebar({ mobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { pendingCount } = useSocial();

  const NavContent = () => (
    <>
      <Link href="/home" className="mb-8 flex items-center gap-2 px-2" onClick={() => setMobileOpen(false)}>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600">
          <span className="text-lg font-bold text-white">V</span>
        </div>
        <div>
          <span className="text-xl font-bold text-white">Vibra</span>
          <p className="text-xs text-white/40">Feel Every Beat</p>
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
              pathname === href || pathname.startsWith(href + "/")
                ? "bg-white/10 text-white"
                : "text-white/60 hover:bg-white/5 hover:text-white"
            )}
          >
            <Icon size={20} />
            {label}
            {href === "/social" && pendingCount > 0 && (
              <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-600 px-1.5 text-xs font-bold">
                {pendingCount}
              </span>
            )}
          </Link>
        ))}
      </nav>

      <div className="mt-auto space-y-2 border-t border-white/10 pt-4">
        <Link
          href="/artist/login"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-violet-300 transition-colors hover:bg-white/5"
        >
          <Mic2 size={18} />
          For Artists
        </Link>
        <Link
          href="/profile"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-white/5"
        >
          <Image
            src={user?.avatar ?? "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"}
            alt="Profile"
            width={32}
            height={32}
            className="rounded-full"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{user?.name ?? "Guest"}</p>
            <p className="truncate text-xs text-white/40 capitalize">{user?.tier ?? "free"} plan</p>
          </div>
          <Settings size={16} className="text-white/40" />
        </Link>
        <button
          onClick={() => { void logout(); }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut size={18} />
          Log out
        </button>
      </div>
    </>
  );

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex h-full w-[min(18rem,85vw)] flex-col bg-zinc-950 p-4">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-4 top-4 text-white/60"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
            <NavContent />
          </aside>
        </div>
      )}

      <aside className="hidden w-64 shrink-0 flex-col border-r border-white/10 bg-black/40 p-4 backdrop-blur-xl lg:flex">
        <NavContent />
      </aside>
    </>
  );
}

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const pathname = usePathname();
  const titles: Record<string, string> = {
    "/home": "Home",
    "/search": "Search",
    "/library": "Your Library",
    "/albums": "Albums",
    "/ai": "Vibra AI",
    "/social": "Social",
    "/social/messages": "Messages",
    "/social/community": "Community Chat",
    "/social/requests": "Friend Requests",
    "/notifications": "Notifications",
    "/premium": "Premium",
    "/profile": "Profile",
  };
  const title =
    Object.entries(titles)
      .sort(([a], [b]) => b.length - a.length)
      .find(([k]) => pathname === k || pathname.startsWith(k + "/"))?.[1] ?? "Vibra";

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-2 border-b border-white/5 bg-black/40 px-3 py-3 backdrop-blur-xl sm:px-4 md:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-1 sm:gap-2">
        <button
          onClick={onMenuClick}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} className="text-white" />
        </button>
        <Button variant="ghost" size="icon-sm" className="hidden md:flex">
          <ChevronLeft size={18} />
        </Button>
        <Button variant="ghost" size="icon-sm" className="hidden md:flex">
          <ChevronRight size={18} />
        </Button>
        <h1 className="truncate text-base font-semibold text-white sm:text-lg md:text-xl">{title}</h1>
      </div>
      <Link href="/premium" className="shrink-0">
        <Button variant="premium" size="sm" className="gap-1 px-3 sm:px-4">
          <Crown size={14} />
          <span className="hidden sm:inline">Upgrade</span>
        </Button>
      </Link>
    </header>
  );
}
