"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShieldCheck,
  Music,
  Users,
  Mic2,
  Flag,
  Headphones,
  CreditCard,
  Wallet,
  ListMusic,
  Star,
  Bell,
  ScrollText,
  BarChart3,
  ArrowLeft,
  LogOut,
  Menu,
  X,
  Search,
  ChevronDown,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAdmin } from "@/lib/contexts/admin-context";
import { hasPermission, ADMIN_ROLE_LABELS, type AdminRole } from "@/types/admin";

const navItems: { href: string; label: string; icon: React.ComponentType<{ size?: number }>; permission: string }[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, permission: "overview" },
  { href: "/admin/verification", label: "Verification", icon: ShieldCheck, permission: "verification" },
  { href: "/admin/music-review", label: "Music Review", icon: Music, permission: "music-review" },
  { href: "/admin/users", label: "Users", icon: Users, permission: "users" },
  { href: "/admin/artists", label: "Artists", icon: Mic2, permission: "artists" },
  { href: "/admin/artist-accounts", label: "Reviewers", icon: UserPlus, permission: "sub-admins" },
  { href: "/admin/reports", label: "Reports", icon: Flag, permission: "reports" },
  { href: "/admin/support", label: "Support", icon: Headphones, permission: "support" },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard, permission: "subscriptions" },
  { href: "/admin/payouts", label: "Payouts", icon: Wallet, permission: "payouts" },
  { href: "/admin/playlists", label: "Playlists", icon: ListMusic, permission: "playlists" },
  { href: "/admin/featured", label: "Featured", icon: Star, permission: "featured" },
  { href: "/admin/notifications", label: "Notifications", icon: Bell, permission: "notifications" },
  { href: "/admin/activity", label: "Activity Logs", icon: ScrollText, permission: "activity" },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3, permission: "analytics" },
];

function filterNav(role: AdminRole) {
  return navItems.filter((item) => hasPermission(role, item.permission));
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, logout, isAuthenticated, isAuthReady } = useAdmin();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  if (!isAuthReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    router.replace("/admin/login");
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  const filteredNav = filterNav(admin!.role);

  const NavLinks = () => (
    <nav className="flex-1 space-y-0.5 overflow-y-auto">
      {filteredNav.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active ? "bg-violet-600/20 text-violet-300" : "text-white/60 hover:bg-white/5 hover:text-white"
            )}
          >
            <Icon size={18} />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white">
      {/* Sidebar desktop */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-white/10 bg-black/40 lg:flex">
        <div className="flex flex-col p-4 h-full">
          <Link href="/home" className="mb-4 flex items-center gap-2 text-sm text-white/40 hover:text-white">
            <ArrowLeft size={16} />
            Back to Vibra
          </Link>
          <div className="mb-6 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 font-bold">
              V
            </div>
            <div>
              <p className="font-bold">Vibra Admin</p>
              <p className="text-xs text-white/40">Control Center</p>
            </div>
          </div>
          <NavLinks />
          <div className="mt-auto border-t border-white/10 pt-4">
            <div className="flex items-center gap-3 rounded-lg px-2 py-2">
              <Image src={admin!.avatar} alt="" width={32} height={32} className="rounded-full" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{admin!.name}</p>
                <p className="truncate text-xs text-violet-400">{ADMIN_ROLE_LABELS[admin!.role]}</p>
              </div>
            </div>
            <button onClick={() => { void logout().then(() => router.push("/admin/login")); }} className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/50 hover:bg-white/5 hover:text-white">
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex h-full w-[min(18rem,85vw)] flex-col bg-zinc-950 p-4">
            <button onClick={() => setMobileOpen(false)} className="absolute right-4 top-4"><X size={20} /></button>
            <div className="mb-6 mt-8 font-bold">Vibra Admin</div>
            <NavLinks />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/80 backdrop-blur-xl">
          <div className="flex items-center gap-2 px-3 py-3 sm:gap-4 sm:px-4 md:px-6">
            <button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 hover:bg-white/10 lg:hidden" aria-label="Open menu">
              <Menu size={20} />
            </button>
            <button
              onClick={() => setMobileSearchOpen((v) => !v)}
              className="rounded-lg p-2 hover:bg-white/10 md:hidden"
              aria-label="Toggle search"
            >
              <Search size={20} />
            </button>
            <div className="relative hidden max-w-md flex-1 md:block">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                placeholder="Search users, artists, songs..."
                className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-4 text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div className="relative ml-auto">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/10"
              >
                <Image src={admin!.avatar} alt="" width={28} height={28} className="rounded-full" />
                <ChevronDown size={14} className="text-white/40" />
              </button>
              {profileOpen && (
                <>
                  <div className="fixed inset-0" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-white/10 bg-zinc-900 py-2 shadow-xl">
                    <div className="border-b border-white/10 px-4 pb-3">
                      <p className="font-medium">{admin!.name}</p>
                      <p className="text-xs text-white/50">{admin!.email}</p>
                      <p className="mt-1 text-xs text-violet-400">{ADMIN_ROLE_LABELS[admin!.role]}</p>
                    </div>
                    <button onClick={() => { void logout().then(() => router.push("/admin/login")); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-white/60 hover:bg-white/5 hover:text-white">
                      <LogOut size={16} />
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          {mobileSearchOpen && (
            <div className="border-t border-white/10 px-3 pb-3 md:hidden">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  placeholder="Search users, artists, songs..."
                  className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-4 text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>
          )}
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-3 sm:p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
