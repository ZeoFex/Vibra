"use client";

import Link from "next/link";
import { BarChart3, Bell, Clock, Settings, SquarePen, UserPlus, Users } from "lucide-react";
import { useAuth } from "@/lib/contexts/app-context";
import { useSocial } from "@/lib/contexts/social-context";
import { useChat } from "@/lib/contexts/chat-context";

export function ProfileSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const { friends } = useSocial();
  const { conversations } = useChat();
  if (!open) return null;

  const initial = (user?.name || user?.email || "V").trim().charAt(0).toUpperCase();
  const rows = [
    { href: "/stats", label: "Listening stats", icon: BarChart3 },
    { href: "/social", label: "Social", icon: Users },
    { href: "/library?tab=recent", label: "Recents", icon: Clock },
    { href: "/notifications", label: "Your Updates", icon: Bell },
    { href: "/profile", label: "Settings and privacy", icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-[80] lg:hidden">
      <button type="button" aria-label="Close profile" className="absolute inset-0 bg-black/50" onClick={onClose} />
      <aside className="relative flex h-full w-[min(22rem,88vw)] flex-col overflow-y-auto bg-[#161616] px-4 pb-8 pt-[max(1rem,env(safe-area-inset-top))]">
        <Link href="/profile" onClick={onClose} className="flex items-center gap-3 rounded-xl p-2 hover:bg-white/5">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#5b21b6] text-lg font-bold text-violet-100">
            {initial}
          </span>
          <span>
            <span className="block font-semibold text-white">{user?.name || "Your profile"}</span>
            <span className="text-sm text-white/50">View profile</span>
          </span>
        </Link>
        <div className="mt-4 space-y-1">
          {rows.map(({ href, label, icon: Icon }) => (
            <Link key={label} href={href} onClick={onClose} className="flex items-center gap-3 rounded-xl px-2 py-3 text-sm font-medium text-white hover:bg-white/5">
              <Icon size={20} className="text-white/80" />
              {label}
            </Link>
          ))}
        </div>
        <div className="mt-4 flex gap-6 px-2">
          <Link href="/notifications" onClick={onClose} className="flex flex-col items-center gap-2 text-xs text-white/70">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#5b21b6] text-sm font-bold text-violet-100">{initial}</span>
            Activity
          </Link>
          <Link href="/social/find" onClick={onClose} className="flex flex-col items-center gap-2 text-xs text-white/70">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white">
              <UserPlus size={18} />
            </span>
            Invite friends
          </Link>
        </div>
        <div className="mt-6 flex items-center justify-between px-2">
          <Link href="/social/messages" onClick={onClose} className="text-lg font-bold text-white">
            Messages
          </Link>
          <Link href="/social/find" onClick={onClose} aria-label="New message" className="text-white/70">
            <SquarePen size={18} />
          </Link>
        </div>
        <div className="mt-3 space-y-1">
          {conversations.slice(0, 6).map(({ friend, lastMessage }) => (
            <Link
              key={friend.id}
              href={`/social/messages/${friend.id}`}
              onClick={onClose}
              className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-white/5"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-900 text-sm font-semibold text-violet-100">
                {friend.name.charAt(0).toUpperCase()}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-white">{friend.name}</span>
                <span className="block truncate text-xs text-white/45">{lastMessage?.content || "Say hello"}</span>
              </span>
            </Link>
          ))}
          {friends.length === 0 && <p className="px-2 text-sm text-white/45">No messages yet.</p>}
        </div>
        <Link href="/social/find" onClick={onClose} className="mt-2 flex items-center gap-3 rounded-xl px-2 py-2 text-sm text-white hover:bg-white/5">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
            <SquarePen size={16} />
          </span>
          New message
        </Link>
      </aside>
    </div>
  );
}
