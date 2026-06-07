"use client";

import { useState } from "react";
import { useAdmin } from "@/lib/contexts/admin-context";
import { PageHeader, StatusBadge, FilterTabs } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import type { TicketStatus } from "@/types/admin";

export default function SupportPage() {
  const { tickets, updateTicketStatus, replyToTicket } = useAdmin();
  const [filter, setFilter] = useState<TicketStatus | "all">("all");
  const [selectedId, setSelectedId] = useState(tickets[0]?.id ?? "");
  const [reply, setReply] = useState("");
  const [internalNote, setInternalNote] = useState("");

  const filtered = filter === "all" ? tickets : tickets.filter((t) => t.status === filter);
  const selected = tickets.find((t) => t.id === selectedId);

  return (
    <div className="space-y-6">
      <PageHeader title="Support Tickets" description="Handle user and artist support requests" />

      <FilterTabs
        tabs={[
          { id: "all" as const, label: "All", count: tickets.length },
          { id: "open" as const, label: "Open", count: tickets.filter((t) => t.status === "open").length },
          { id: "assigned" as const, label: "Assigned", count: tickets.filter((t) => t.status === "assigned").length },
          { id: "closed" as const, label: "Closed", count: tickets.filter((t) => t.status === "closed").length },
        ]}
        active={filter}
        onChange={setFilter}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-2 lg:col-span-1">
          {filtered.map((ticket) => (
            <button
              key={ticket.id}
              onClick={() => setSelectedId(ticket.id)}
              className={`w-full rounded-xl border p-4 text-left transition-colors ${selectedId === ticket.id ? "border-violet-600/50 bg-violet-600/10" : "border-white/10 bg-white/[0.03] hover:bg-white/5"}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-medium">{ticket.subject}</span>
                <StatusBadge status={ticket.status} />
              </div>
              <p className="mt-1 text-xs text-white/50">{ticket.submitter} · {ticket.category}</p>
            </button>
          ))}
        </div>

        {selected && (
          <div className="lg:col-span-2 rounded-xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-semibold">{selected.subject}</h3>
                <p className="text-sm text-white/50">{selected.submitter} · {selected.submitterEmail}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => updateTicketStatus(selected.id, "assigned")}>Assign</Button>
                <Button size="sm" onClick={() => updateTicketStatus(selected.id, "closed")}>Close</Button>
              </div>
            </div>

            <div className="mt-6 max-h-80 space-y-3 overflow-y-auto">
              {selected.messages.map((msg) => (
                <div key={msg.id} className={`rounded-lg p-3 ${msg.isInternal ? "bg-yellow-500/10 border border-yellow-500/20" : "bg-white/5"}`}>
                  <div className="flex justify-between text-xs text-white/40">
                    <span>{msg.from}{msg.isInternal && " (internal)"}</span>
                    <span>{new Date(msg.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="mt-1 text-sm">{msg.content}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Reply to customer..."
                className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                rows={3}
              />
              <textarea
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                placeholder="Internal note (not visible to customer)..."
                className="w-full rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3 text-sm focus:outline-none"
                rows={2}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => { if (reply) { replyToTicket(selected.id, reply); setReply(""); } }}>Send Reply</Button>
                <Button size="sm" variant="secondary" onClick={() => { if (internalNote) { replyToTicket(selected.id, internalNote, true); setInternalNote(""); } }}>Add Internal Note</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
