"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Home,
  Search,
  Library,
  Crown,
  Bell,
  Disc3,
  Users,
  Settings,
  LogOut,
  Mic,
  Plus,
  Mic2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { ProfileSheet } from "@/components/layout/profile-sheet";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/contexts/app-context";
import { useSocial } from "@/lib/contexts/social-context";
import { useNotifications } from "@/lib/contexts/notification-context";
import { Button } from "@/components/ui/button";
import { VibraLogo } from "@/components/brand/vibra-logo";

const navItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/library", label: "Library", icon: Library },
  { href: "/recordings", label: "Recordings", icon: Mic },
  { href: "/albums", label: "Albums", icon: Disc3 },
  { href: "/ai", label: "Vibra AI", icon: null },
  { href: "/social", label: "Social", icon: Users },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/premium", label: "Premium", icon: Crown },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { pendingCount } = useSocial();
  const { unreadCount } = useNotifications();

  const renderNav = () => (
    <>
      <Link href="/home" className="mb-8 flex items-center gap-3 px-2">
        <VibraLogo size={64} className="h-16 w-16 rounded-2xl" />
        <p className="text-xs text-white/40">Feel Every Beat</p>
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              pathname === href || pathname.startsWith(href + "/")
                ? "bg-white/10 text-white"
                : "text-white/60 hover:bg-white/5 hover:text-white"
            )}
          >
            {href === "/ai" ? <VibraLogo size={20} className="h-5 w-5 rounded-md" /> : Icon && <Icon size={20} />}
            {label}
            {href === "/social" && pendingCount > 0 && (
              <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-600 px-1.5 text-xs font-bold">
                {pendingCount}
              </span>
            )}
            {href === "/notifications" && unreadCount > 0 && (
              <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-600 px-1.5 text-xs font-bold">
                {unreadCount}
              </span>
            )}
          </Link>
        ))}
      </nav>

      <div className="mt-auto space-y-2 border-t border-white/10 pt-4">
        <Link
          href="/artist/login"
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-violet-300 transition-colors hover:bg-white/5"
        >
          <Mic2 size={18} />
          For Artists
        </Link>
        <Link
          href="/profile"
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
    <aside className="hidden h-full w-64 shrink-0 flex-col overflow-hidden border-r border-white/10 bg-black/40 p-4 backdrop-blur-xl lg:flex">
      {renderNav()}
    </aside>
  );
}

const mobileTabs = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/library", label: "Library", icon: Library },
  { href: "/premium", label: "Premium", icon: Crown },
  { href: "/artist/upload", label: "Create", icon: Plus },
];

export function MobileTabBar() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-[60] border-t border-white/10 bg-black/95 px-1 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-xl lg:hidden">
      <div className="grid h-[var(--tab-bar-height)] grid-cols-5">
        {mobileTabs.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-[10px] font-medium",
                active ? "text-white" : "text-white/45"
              )}
            >
              {href === "/premium" ? (
                <VibraLogo size={20} className="h-5 w-5 rounded-md" />
              ) : (
                <Icon size={20} />
              )}
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

const mobileChips = [
  { href: "/home", label: "All", exact: true },
  { href: "/search", label: "Music", exact: false },
  { href: "/albums", label: "Albums", exact: false },
  { href: "/recordings", label: "Recordings", exact: false },
  { href: "/ai", label: "Vibra AI", exact: false },
  { href: "/notifications", label: "Notifications", exact: false },
];

export function TopBar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const initial = (user?.name || user?.email || "V").trim().charAt(0).toUpperCase();

  return (
    <>
    <header className="shrink-0 border-b border-white/5 bg-black/40 backdrop-blur-xl">
    <div className="hidden items-center gap-2 px-4 py-3 md:flex md:px-6">
      <Button variant="ghost" size="icon-sm">
        <ChevronLeft size={18} />
      </Button>
      <Button variant="ghost" size="icon-sm">
        <ChevronRight size={18} />
      </Button>
    </div>
    <div className="flex items-center gap-2 overflow-x-auto px-3 py-3 scrollbar-hide lg:hidden">
      <button
        type="button"
        aria-label="Open profile"
        onClick={() => setProfileOpen(true)}
        className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#5b21b6] text-sm font-bold text-violet-100"
      >
        {initial}
      </button>
      {mobileChips.map((chip) => {
        const active = chip.exact ? pathname === chip.href : pathname === chip.href || pathname.startsWith(chip.href + "/");
        return (
          <Link
            key={chip.href}
            href={chip.href}
            className={cn(
              "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium",
              active ? "bg-white text-black" : "bg-white/10 text-white"
            )}
          >
            {chip.label}
          </Link>
        );
      })}
    </div>
    </header>
    <ProfileSheet open={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
}
