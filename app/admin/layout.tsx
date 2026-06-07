"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Music,
  Disc,
  Mic2,
  CreditCard,
  BarChart3,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const adminNav = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/artists", label: "Artists", icon: Mic2 },
  { href: "/admin/songs", label: "Songs", icon: Music },
  { href: "/admin/albums", label: "Albums", icon: Disc },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-zinc-950">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-white/10 p-4 lg:flex">
        <Link href="/home" className="mb-6 flex items-center gap-2 text-sm text-white/50 hover:text-white">
          <ArrowLeft size={16} />
          Back to App
        </Link>
        <div className="mb-6">
          <p className="text-xs font-medium uppercase tracking-wider text-violet-400">Admin</p>
          <h1 className="text-lg font-bold">Dashboard</h1>
        </div>
        <nav className="space-y-1">
          {adminNav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                pathname === href ? "bg-violet-600/20 text-violet-300" : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
    </div>
  );
}
