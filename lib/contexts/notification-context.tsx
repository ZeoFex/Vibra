"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Bell, X } from "lucide-react";
import type { Notification } from "@/types";

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  markAllRead: () => void;
  markRead: (id: string) => void;
  enableDeviceAlerts: () => Promise<void>;
  deviceAlerts: NotificationPermission | "unsupported";
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<Notification[]>([]);
  const [seen, setSeen] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);
  const [deviceAlerts, setDeviceAlerts] = useState<NotificationPermission | "unsupported">("unsupported");

  useEffect(() => {
    setDeviceAlerts(typeof Notification === "undefined" ? "unsupported" : Notification.permission);
  }, []);

  const refresh = useCallback(async () => {
    const response = await fetch("/api/notifications", { credentials: "include" });
    if (!response.ok) return;
    const data = (await response.json()) as { notifications?: Notification[] };
    const next = data.notifications ?? [];
    setNotifications(next);
    setSeen((previous) => {
      if (!ready) return new Set(next.map((item) => item.id));
      const fresh = next.filter((item) => !item.read && !previous.has(item.id));
      if (fresh.length) {
        setToasts((current) => [...fresh, ...current].slice(0, 3));
        if (typeof Notification !== "undefined" && Notification.permission === "granted" && document.hidden) {
          fresh.forEach((item) => {
            const popup = new Notification(item.title, { body: item.message, tag: item.id });
            popup.onclick = () => {
              window.focus();
              if (item.link) router.push(item.link);
            };
          });
        }
      }
      return new Set([...previous, ...next.map((item) => item.id)]);
    });
    setReady(true);
  }, [ready, router]);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 4000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  useEffect(() => {
    if (!toasts.length) return;
    const timer = window.setTimeout(() => setToasts((current) => current.slice(0, -1)), 5000);
    return () => window.clearTimeout(timer);
  }, [toasts]);

  const markRead = useCallback((id: string) => {
    setNotifications((current) => current.map((item) => (item.id === id ? { ...item, read: true } : item)));
    void fetch("/api/notifications", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((current) => current.map((item) => ({ ...item, read: true })));
    void fetch("/api/notifications", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
  }, []);

  const enableDeviceAlerts = useCallback(async () => {
    if (typeof Notification === "undefined") return;
    const permission = await Notification.requestPermission();
    setDeviceAlerts(permission);
  }, []);

  const openToast = (item: Notification) => {
    markRead(item.id);
    setToasts((current) => current.filter((toast) => toast.id !== item.id));
    if (item.link) router.push(item.link);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount: notifications.filter((item) => !item.read).length,
        markAllRead,
        markRead,
        enableDeviceAlerts,
        deviceAlerts,
      }}
    >
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-[max(0.75rem,env(safe-area-inset-top))] z-[120] flex flex-col items-center gap-2 px-3 sm:items-end sm:px-5">
        {toasts.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => openToast(item)}
            className="pointer-events-auto flex w-full max-w-sm cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-zinc-950/95 p-3 text-left shadow-2xl backdrop-blur"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-600">
              <Bell size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{item.title}</span>
              <span className="mt-0.5 block line-clamp-2 text-xs text-white/60">{item.message}</span>
            </span>
            <span
              className="rounded-full p-1 text-white/40"
              onClick={(event) => {
                event.stopPropagation();
                setToasts((current) => current.filter((toast) => toast.id !== item.id));
              }}
            >
              <X size={14} />
            </span>
          </button>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used within NotificationProvider");
  return context;
}
