"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { notificationDrafts } from "@/lib/mock-data/admin";
import { PageHeader, StatusBadge } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";

export default function NotificationsAdminPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("all");

  return (
    <div className="space-y-6">
      <PageHeader title="Notification Center" description="Send platform notifications to users and artists" />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
          <h2 className="font-semibold">Compose Notification</h2>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Notification title"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message..."
            rows={4}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <select
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm focus:outline-none"
          >
            <option value="all">All Users</option>
            <option value="free">Free Users</option>
            <option value="premium">Premium Users</option>
            <option value="artists">Artists Only</option>
          </select>
          <Button className="gap-1"><Send size={16} /> Send Notification</Button>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="mb-4 font-semibold">Recent Notifications</h2>
          <div className="space-y-3">
            {notificationDrafts.map((n) => (
              <div key={n.id} className="rounded-lg bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{n.title}</p>
                  <StatusBadge status={n.status} />
                </div>
                <p className="mt-1 text-sm text-white/50">{n.message}</p>
                <p className="mt-2 text-xs text-white/40">Audience: {n.audience} · {n.type.replace(/_/g, " ")}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
