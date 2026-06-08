"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, Check, X, MessageSquare, Ban } from "lucide-react";
import { useAdmin } from "@/lib/contexts/admin-context";
import { PageHeader, StatusBadge, FilterTabs, AdminSearchInput, useConfirmModal } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import type { VerificationStatus } from "@/types/admin";

export default function VerificationListPage() {
  const { applications, updateApplicationStatus } = useAdmin();
  const [filter, setFilter] = useState<VerificationStatus | "all">("all");
  const [search, setSearch] = useState("");
  const { confirm, modal } = useConfirmModal();

  const filtered = applications.filter((a) => {
    if (filter !== "all" && a.status !== filter) return false;
    if (search && !a.stageName.toLowerCase().includes(search.toLowerCase()) && !a.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const tabs = [
    { id: "all" as const, label: "All", count: applications.length },
    { id: "pending" as const, label: "Pending", count: applications.filter((a) => a.status === "pending").length },
    { id: "under_review" as const, label: "Under Review", count: applications.filter((a) => a.status === "under_review").length },
    { id: "needs_more_info" as const, label: "Needs Info", count: applications.filter((a) => a.status === "needs_more_info").length },
    { id: "verified" as const, label: "Verified", count: applications.filter((a) => a.status === "verified").length },
  ];

  return (
    <div className="space-y-6">
      {modal}
      <PageHeader title="Artist Verification" description="Review and approve artist registration applications" />

      <div className="grid gap-4 md:grid-cols-2">
        <AdminSearchInput placeholder="Search by stage name or email..." value={search} onChange={setSearch} />
      </div>

      <FilterTabs tabs={tabs} active={filter} onChange={setFilter} />

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03] text-left text-white/50">
              <th className="p-4">Artist</th>
              <th className="p-4">Country</th>
              <th className="p-4">Submitted</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((app) => (
              <tr key={app.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <Image src={app.profilePhoto} alt="" width={40} height={40} className="rounded-full" />
                    <div>
                      <p className="font-medium">{app.stageName}</p>
                      <p className="text-xs text-white/50">{app.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-white/60">{app.country}</td>
                <td className="p-4 text-white/60">{new Date(app.submittedAt).toLocaleDateString()}</td>
                <td className="p-4"><StatusBadge status={app.status} /></td>
                <td className="p-4">
                  <div className="flex gap-1">
                    <Link href={`/admin/verification/${app.id}`}>
                      <Button variant="ghost" size="icon-sm"><Eye size={16} /></Button>
                    </Link>
                    {app.status === "pending" && (
                      <>
                        <Button variant="ghost" size="icon-sm" onClick={() => confirm({ title: "Approve Artist", message: `Approve ${app.stageName}?`, confirmLabel: "Approve", onConfirm: () => updateApplicationStatus(app.id, "approved") })}>
                          <Check size={16} className="text-green-400" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => confirm({ title: "Reject Application", message: `Reject ${app.stageName}?`, confirmLabel: "Reject", destructive: true, onConfirm: () => updateApplicationStatus(app.id, "rejected", "Does not meet requirements") })}>
                          <X size={16} className="text-red-400" />
                        </Button>
                      </>
                    )}
                    <Button variant="ghost" size="icon-sm" onClick={() => updateApplicationStatus(app.id, "needs_more_info", "Additional documents required")}>
                      <MessageSquare size={16} />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => confirm({ title: "Suspend Artist", message: `Suspend ${app.stageName}?`, confirmLabel: "Suspend", destructive: true, onConfirm: () => updateApplicationStatus(app.id, "suspended") })}>
                      <Ban size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
