"use client";

import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import { PageHeader, StatusBadge } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";

type Note = { id: string; title: string; message: string; audience: string; recipient: string; status: string; sentAt: string };

export default function NotificationsAdminPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("all");
  const [notes, setNotes] = useState<Note[]>([]);
  const [error, setError] = useState("");

  function load() {
    fetch("/api/admin/notifications", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data?.notifications) setNotes(data.notifications); })
      .catch(() => undefined);
  }

  useEffect(() => { load(); }, []);

  async function send() {
    setError("");
    const res = await fetch("/api/admin/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ title, message, audience }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Could not send");
      return;
    }
    setTitle("");
    setMessage("");
    load();
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Notification Center" description="Messages delivered to listener accounts" />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="font-semibold">Compose Notification</h2>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Notification title" className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message..." rows={4} className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
          <select value={audience} onChange={(e) => setAudience(e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm focus:outline-none">
            <option value="all">All listeners</option>
            <option value="free">Free listeners</option>
            <option value="premium">Premium listeners</option>
          </select>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button className="gap-1" onClick={send}><Send size={16} /> Send Notification</Button>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="mb-4 font-semibold">Recent Notifications</h2>
          {notes.length === 0 && <p className="text-sm text-white/40">No notifications have been sent.</p>}
          <div className="space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="rounded-lg bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{note.title}</p>
                  <StatusBadge status={note.status} />
                </div>
                <p className="mt-1 text-sm text-white/50">{note.message}</p>
                <p className="mt-2 text-xs text-white/40">{note.recipient} · {note.audience} · {new Date(note.sentAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
