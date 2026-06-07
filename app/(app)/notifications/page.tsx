"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Disc, UserPlus, ListMusic } from "lucide-react";
import { notifications as initialNotifications } from "@/lib/mock-data";
import type { Notification } from "@/types";
import { cn } from "@/lib/utils";

const iconMap = {
  new_release: Disc,
  playlist_update: ListMusic,
  new_follower: UserPlus,
  system: Bell,
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-white/50">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-sm text-violet-400 hover:underline">
            Mark all read
          </button>
        )}
      </div>

      <div className="space-y-2">
        {notifications.map((notif) => {
          const Icon = iconMap[notif.type];
          const content = (
            <div
              className={cn(
                "flex gap-4 rounded-xl p-4 transition-colors hover:bg-white/5",
                !notif.read && "bg-violet-600/10"
              )}
            >
              <div className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                !notif.read ? "bg-violet-600/20" : "bg-white/10"
              )}>
                <Icon size={18} className={!notif.read ? "text-violet-400" : "text-white/40"} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{notif.title}</p>
                  {!notif.read && (
                    <span className="h-2 w-2 rounded-full bg-violet-500" />
                  )}
                </div>
                <p className="mt-0.5 text-sm text-white/60">{notif.message}</p>
                <p className="mt-1 text-xs text-white/30">
                  {new Date(notif.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );

          return notif.link ? (
            <Link key={notif.id} href={notif.link}>{content}</Link>
          ) : (
            <div key={notif.id}>{content}</div>
          );
        })}
      </div>
    </div>
  );
}
