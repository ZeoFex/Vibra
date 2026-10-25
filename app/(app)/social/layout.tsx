"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSocial } from "@/lib/contexts/social-context";
import { useChat } from "@/lib/contexts/chat-context";

const tabs = [
  { href: "/social", label: "Feed", exact: true },
  { href: "/social/find", label: "Find Friends", exact: false },
  { href: "/social/requests", label: "Requests", exact: false },
  { href: "/social/messages", label: "Messages", exact: false },
  { href: "/social/community", label: "Community", exact: false },
];

export default function SocialLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { pendingCount } = useSocial();
  const { totalUnreadMessages } = useChat();

  return (
    <div className="mx-auto max-w-2xl space-y-4 sm:space-y-6">
      <div className="grid grid-cols-5 gap-1.5">
        {tabs.map(({ href, label, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-h-10 items-center justify-center rounded-2xl px-1 py-1.5 text-center text-[11px] font-medium leading-tight transition-colors sm:text-sm",
                active ? "bg-white text-black" : "bg-white/10 text-white/70 hover:bg-white/20"
              )}
            >
              {label}
              {href === "/social/requests" && pendingCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-600 px-1.5 text-xs font-bold text-white">
                  {pendingCount}
                </span>
              )}
              {href === "/social/messages" && totalUnreadMessages > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-600 px-1.5 text-xs font-bold text-white">
                  {totalUnreadMessages}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {children}
    </div>
  );
}
