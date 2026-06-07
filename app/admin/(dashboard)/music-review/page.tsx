"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, X, Edit, Star, AlertTriangle } from "lucide-react";
import { useAdmin } from "@/lib/contexts/admin-context";
import { PageHeader, StatusBadge, FilterTabs, useConfirmModal } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import type { MusicReviewStatus } from "@/types/admin";

export default function MusicReviewPage() {
  const { musicQueue, updateMusicStatus } = useAdmin();
  const [filter, setFilter] = useState<MusicReviewStatus | "all">("all");
  const { confirm, modal } = useConfirmModal();

  const filtered = filter === "all" ? musicQueue : musicQueue.filter((m) => m.status === filter);

  const tabs = [
    { id: "all" as const, label: "All", count: musicQueue.length },
    { id: "pending" as const, label: "Pending", count: musicQueue.filter((m) => m.status === "pending").length },
    { id: "approved" as const, label: "Approved", count: musicQueue.filter((m) => m.status === "approved").length },
    { id: "rejected" as const, label: "Rejected", count: musicQueue.filter((m) => m.status === "rejected").length },
  ];

  return (
    <div className="space-y-6">
      {modal}
      <PageHeader title="Music Upload Review" description="Review artist uploads before they go public" />

      <FilterTabs tabs={tabs} active={filter} onChange={setFilter} />

      <div className="space-y-4">
        {filtered.map((item) => (
          <div key={item.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex flex-col gap-4 sm:flex-row">
              <Image src={item.coverArt} alt="" width={100} height={100} className="rounded-lg shrink-0" />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <StatusBadge status={item.status} />
                  {item.explicit && <StatusBadge status="explicit" />}
                </div>
                <p className="text-sm text-white/50">{item.artistName} · {item.album} · {item.genre}</p>
                <div className="mt-3 grid gap-2 text-xs text-white/60 sm:grid-cols-2">
                  <span>Release: {item.releaseDate}</span>
                  <span>Copyright: {item.copyrightConfirmed ? "Confirmed" : "Not confirmed"}</span>
                  <span>Submitted: {new Date(item.submittedAt).toLocaleDateString()}</span>
                  <span>Audio: {item.audioUrl}</span>
                </div>
                {item.lyrics && (
                  <p className="mt-3 rounded-lg bg-white/5 p-3 text-xs text-white/50 italic">&ldquo;{item.lyrics.slice(0, 120)}...&rdquo;</p>
                )}
              </div>
              <div className="flex shrink-0 flex-col gap-2">
                {item.status === "pending" && (
                  <>
                    <Button size="sm" className="gap-1" onClick={() => confirm({ title: "Approve Song", message: `Publish "${item.title}"?`, onConfirm: () => updateMusicStatus(item.id, "approved") })}>
                      <Check size={14} /> Approve
                    </Button>
                    <Button variant="secondary" size="sm" className="gap-1" onClick={() => updateMusicStatus(item.id, "changes_requested", "Cover art needs update")}>
                      <Edit size={14} /> Request Changes
                    </Button>
                    <Button variant="destructive" size="sm" className="gap-1" onClick={() => confirm({ title: "Reject Song", message: `Reject "${item.title}"?`, destructive: true, onConfirm: () => updateMusicStatus(item.id, "rejected") })}>
                      <X size={14} /> Reject
                    </Button>
                  </>
                )}
                {item.status === "approved" && (
                  <Button variant="secondary" size="sm" className="gap-1">
                    <Star size={14} /> Feature on Homepage
                  </Button>
                )}
                <Button variant="ghost" size="sm" className="gap-1 text-red-400">
                  <AlertTriangle size={14} /> Remove
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
