"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type {
  AdminUser,
  ArtistApplication,
  MusicReviewItem,
  ModerationReport,
  SupportTicket,
  AdminActivityLog,
  ArtistPayout,
  VerificationStatus,
  MusicReviewStatus,
  ReportStatus,
  TicketStatus,
  PayoutStatus,
} from "@/types/admin";
import {
  artistApplications as initialApplications,
  musicReviewQueue as initialMusicQueue,
  moderationReports as initialReports,
  supportTickets as initialTickets,
  activityLogs as initialLogs,
  artistPayouts as initialPayouts,
} from "@/lib/mock-data/admin";

interface AdminContextValue {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  applications: ArtistApplication[];
  musicQueue: MusicReviewItem[];
  reports: ModerationReport[];
  tickets: SupportTicket[];
  activityLogs: AdminActivityLog[];
  payouts: ArtistPayout[];
  updateApplicationStatus: (id: string, status: VerificationStatus, note?: string) => void;
  updateMusicStatus: (id: string, status: MusicReviewStatus, note?: string) => void;
  updateReportStatus: (id: string, status: ReportStatus, note?: string) => void;
  updateTicketStatus: (id: string, status: TicketStatus) => void;
  replyToTicket: (ticketId: string, content: string, isInternal?: boolean) => void;
  updatePayoutStatus: (id: string, status: PayoutStatus, note?: string) => void;
  logAction: (action: string, target: string, targetType: string, reason?: string) => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [applications, setApplications] = useState(initialApplications);
  const [musicQueue, setMusicQueue] = useState(initialMusicQueue);
  const [reports, setReports] = useState(initialReports);
  const [tickets, setTickets] = useState(initialTickets);
  const [activityLogs, setActivityLogs] = useState(initialLogs);
  const [payouts, setPayouts] = useState(initialPayouts);

  useEffect(() => {
    const stored = localStorage.getItem("vibra-admin");
    if (stored) setAdmin(JSON.parse(stored));
  }, []);

  const logAction = useCallback(
    (action: string, target: string, targetType: string, reason?: string) => {
      if (!admin) return;
      const log: AdminActivityLog = {
        id: `log-${Date.now()}`,
        adminId: admin.id,
        adminName: admin.name,
        action,
        target,
        targetType,
        reason,
        createdAt: new Date().toISOString(),
      };
      setActivityLogs((prev) => [log, ...prev]);
    },
    [admin]
  );

  const login = useCallback(async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 600));
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        return { ok: false, error: data.error ?? "Invalid admin credentials" };
      }
      const data = (await res.json()) as { admin: AdminUser };
      setAdmin(data.admin);
      localStorage.setItem("vibra-admin", JSON.stringify(data.admin));
      return { ok: true };
    } catch {
      return { ok: false, error: "Unable to reach admin login service" };
    }
  }, []);

  const logout = useCallback(() => {
    setAdmin(null);
    localStorage.removeItem("vibra-admin");
  }, []);

  const updateApplicationStatus = useCallback(
    (id: string, status: VerificationStatus, note?: string) => {
      setApplications((prev) =>
        prev.map((app) => {
          if (app.id !== id) return app;
          const historyEntry = {
            action: `Status changed to ${status}`,
            by: admin?.name ?? "Admin",
            at: new Date().toISOString(),
            note,
          };
          return {
            ...app,
            status,
            adminNotes: note ? [...app.adminNotes, note] : app.adminNotes,
            history: [...app.history, historyEntry],
          };
        })
      );
      const app = applications.find((a) => a.id === id);
      logAction(`Application ${status}`, app?.stageName ?? id, "application", note);
    },
    [admin, applications, logAction]
  );

  const updateMusicStatus = useCallback(
    (id: string, status: MusicReviewStatus, note?: string) => {
      setMusicQueue((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, status, adminNotes: note ? [...item.adminNotes, note] : item.adminNotes }
            : item
        )
      );
      const item = musicQueue.find((m) => m.id === id);
      logAction(`Song ${status}`, item?.title ?? id, "song", note);
    },
    [musicQueue, logAction]
  );

  const updateReportStatus = useCallback(
    (id: string, status: ReportStatus, note?: string) => {
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
      const report = reports.find((r) => r.id === id);
      logAction(`Report ${status}`, report?.target ?? id, "report", note);
    },
    [reports, logAction]
  );

  const updateTicketStatus = useCallback(
    (id: string, status: TicketStatus) => {
      setTickets((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t
        )
      );
      logAction(`Ticket ${status}`, id, "ticket");
    },
    [logAction]
  );

  const replyToTicket = useCallback(
    (ticketId: string, content: string, isInternal = false) => {
      setTickets((prev) =>
        prev.map((t) => {
          if (t.id !== ticketId) return t;
          return {
            ...t,
            updatedAt: new Date().toISOString(),
            messages: [
              ...t.messages,
              {
                id: `msg-${Date.now()}`,
                from: admin?.name ?? "Admin",
                content,
                isInternal,
                createdAt: new Date().toISOString(),
              },
            ],
          };
        })
      );
    },
    [admin]
  );

  const updatePayoutStatus = useCallback(
    (id: string, status: PayoutStatus, note?: string) => {
      setPayouts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, status, adminNote: note ?? p.adminNote } : p
        )
      );
      const payout = payouts.find((p) => p.id === id);
      logAction(`Payout ${status}`, payout?.artistName ?? id, "payout", note);
    },
    [payouts, logAction]
  );

  return (
    <AdminContext.Provider
      value={{
        admin,
        isAuthenticated: !!admin,
        login,
        logout,
        applications,
        musicQueue,
        reports,
        tickets,
        activityLogs,
        payouts,
        updateApplicationStatus,
        updateMusicStatus,
        updateReportStatus,
        updateTicketStatus,
        replyToTicket,
        updatePayoutStatus,
        logAction,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
