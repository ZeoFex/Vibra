"use client";

import { useState } from "react";
import { Check, X, AlertTriangle, ArrowUp } from "lucide-react";
import { useAdmin } from "@/lib/contexts/admin-context";
import { PageHeader, StatusBadge, FilterTabs, useConfirmModal } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import type { ReportStatus } from "@/types/admin";

export default function ReportsPage() {
  const { reports, updateReportStatus } = useAdmin();
  const [filter, setFilter] = useState<ReportStatus | "all">("all");
  const { confirm, modal } = useConfirmModal();

  const filtered = filter === "all" ? reports : reports.filter((r) => r.status === filter);

  return (
    <div className="space-y-6">
      {modal}
      <PageHeader title="Reports & Moderation" description="Review reported content and handle moderation cases" />

      <FilterTabs
        tabs={[
          { id: "all" as const, label: "All", count: reports.length },
          { id: "open" as const, label: "Open", count: reports.filter((r) => r.status === "open").length },
          { id: "investigating" as const, label: "Investigating", count: reports.filter((r) => r.status === "investigating").length },
          { id: "resolved" as const, label: "Resolved", count: reports.filter((r) => r.status === "resolved").length },
        ]}
        active={filter}
        onChange={setFilter}
      />

      <div className="space-y-3">
        {filtered.map((report) => (
          <div key={report.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-white/5 px-2 py-0.5 text-xs capitalize">{report.type.replace(/_/g, " ")}</span>
                  <StatusBadge status={report.status} />
                  <StatusBadge status={report.priority} />
                </div>
                <h3 className="mt-2 font-semibold">{report.target}</h3>
                <p className="mt-1 text-sm text-white/50">Reported by {report.reportedBy} · {new Date(report.createdAt).toLocaleDateString()}</p>
                <p className="mt-2 text-sm text-white/70"><strong>Reason:</strong> {report.reason}</p>
                <p className="mt-1 text-sm text-white/60">{report.description}</p>
              </div>
              <div className="flex flex-col gap-2">
                <Button size="sm" variant="secondary" className="gap-1" onClick={() => updateReportStatus(report.id, "investigating")}>
                  <AlertTriangle size={14} /> Investigate
                </Button>
                <Button size="sm" className="gap-1" onClick={() => confirm({ title: "Resolve Report", message: "Mark as resolved?", onConfirm: () => updateReportStatus(report.id, "resolved") })}>
                  <Check size={14} /> Resolve
                </Button>
                <Button size="sm" variant="ghost" className="gap-1" onClick={() => updateReportStatus(report.id, "dismissed")}>
                  <X size={14} /> Dismiss
                </Button>
                <Button size="sm" variant="destructive" className="gap-1" onClick={() => confirm({ title: "Remove Content", message: "Remove reported content?", destructive: true, onConfirm: () => updateReportStatus(report.id, "resolved", "Content removed") })}>
                  Remove Content
                </Button>
                <Button size="sm" variant="ghost" className="gap-1 text-orange-400">
                  <ArrowUp size={14} /> Escalate
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
