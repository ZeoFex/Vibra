"use client";

import Link from "next/link";
import { Bell, Disc, MessageCircle, UserPlus } from "lucide-react";
import { useNotifications } from "@/lib/contexts/notification-context";
import type { Notification } from "@/types";
import { cn } from "@/lib/utils";

const iconMap = {
  new_release: Disc,
  playlist_update: Disc,
  new_follower: UserPlus,
  system: MessageCircle,
};

export default function NotificationsPage() {
  const { notifications, unreadCount, markAllRead, markRead, enableDeviceAlerts, deviceAlerts } = useNotifications();

  return (
    <div className="mx-auto max-w-2xl space-y-4 pb-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-white/50">{unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="cursor-pointer text-sm text-violet-400 hover:underline">
            Mark all read
          </button>
        )}
      </div>

      {deviceAlerts === "default" && (
        <button
          type="button"
          onClick={() => void enableDeviceAlerts()}
          className="flex w-full cursor-pointer items-center gap-3 rounded-2xl bg-white/5 px-4 py-3 text-left text-sm"
        >
          <Bell size={18} className="text-violet-400" />
          Turn on alerts for this phone or computer
        </button>
      )}

      {notifications.length === 0 ? (
        <div className="rounded-2xl border border-white/10 px-4 py-12 text-center text-sm text-white/50">
          Friend requests and messages will show up here.
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => {
            const Icon = iconMap[notif.type as Notification["type"]] ?? Bell;
            const content = (
              <div
                className={cn(
                  "flex gap-3 rounded-2xl p-3 transition-colors hover:bg-white/5 sm:p-4",
                  !notif.read && "bg-violet-600/10"
                )}
              >
                <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-full", !notif.read ? "bg-violet-600/20" : "bg-white/10")}>
                  <Icon size={18} className={!notif.read ? "text-violet-400" : "text-white/40"} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium">{notif.title}</p>
                    {!notif.read && <span className="h-2 w-2 shrink-0 rounded-full bg-violet-500" />}
                  </div>
                  <p className="mt-0.5 text-sm text-white/60">{notif.message}</p>
                  <p className="mt-1 text-xs text-white/30">
                    {new Date(notif.createdAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
            return notif.link ? (
              <Link key={notif.id} href={notif.link} onClick={() => markRead(notif.id)}>
                {content}
              </Link>
            ) : (
              <button key={notif.id} type="button" className="block w-full cursor-pointer text-left" onClick={() => markRead(notif.id)}>
                {content}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
