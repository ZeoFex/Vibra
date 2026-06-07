"use client";

import { use, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Check, X, MessageSquare, Shield, Ban, FileText } from "lucide-react";
import { notFound } from "next/navigation";
import { useAdmin } from "@/lib/contexts/admin-context";
import { PageHeader, StatusBadge, useConfirmModal } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";

export default function VerificationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { applications, updateApplicationStatus } = useAdmin();
  const [note, setNote] = useState("");
  const { confirm, modal } = useConfirmModal();
  const app = applications.find((a) => a.id === id);

  if (!app) notFound();

  return (
    <div className="space-y-6">
      {modal}
      <Link href="/admin/verification" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white">
        <ArrowLeft size={16} /> Back to applications
      </Link>

      <PageHeader
        title={app.stageName}
        description={`Application from ${app.legalName} · ${app.country}`}
        actions={<StatusBadge status={app.status} />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="mb-4 font-semibold">Artist Information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Stage Name", app.stageName],
                ["Legal Name", app.legalName],
                ["Email", app.email],
                ["Phone", app.phone],
                ["Country", app.country],
                ["Record Label", app.recordLabel ?? "Independent"],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-white/40">{label}</p>
                  <p className="text-sm font-medium">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <p className="text-xs text-white/40">Bio</p>
              <p className="mt-1 text-sm text-white/70">{app.bio}</p>
            </div>
            {app.socialLinks.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-white/40">Social Links</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {app.socialLinks.map((l) => (
                    <span key={l.platform} className="rounded-lg bg-white/5 px-3 py-1 text-xs">{l.platform}</span>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="mb-4 font-semibold">Documents</h2>
            <div className="space-y-2">
              {app.documents.map((doc) => (
                <div key={doc.name} className="flex items-center gap-3 rounded-lg bg-white/5 p-3">
                  <FileText size={18} className="text-violet-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{doc.name}</p>
                    <p className="text-xs text-white/40">{doc.type} · {doc.uploadedAt}</p>
                  </div>
                  <Button variant="ghost" size="sm">View</Button>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="mb-4 font-semibold">Application History</h2>
            <div className="space-y-3">
              {app.history.map((h, i) => (
                <div key={i} className="flex gap-3 border-l-2 border-violet-600/30 pl-4">
                  <div>
                    <p className="text-sm font-medium">{h.action}</p>
                    <p className="text-xs text-white/40">{h.by} · {new Date(h.at).toLocaleString()}</p>
                    {h.note && <p className="mt-1 text-xs text-white/60">{h.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 text-center">
            <Image src={app.profilePhoto} alt="" width={120} height={120} className="mx-auto rounded-full" />
            <p className="mt-4 font-semibold">{app.stageName}</p>
            <p className="text-sm text-white/50">{app.sampleSongUrls.length} sample tracks</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 space-y-3">
            <h3 className="font-semibold">Actions</h3>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Admin note..."
              className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500"
              rows={3}
            />
            <Button className="w-full gap-1" onClick={() => confirm({ title: "Approve", message: `Approve ${app.stageName}?`, onConfirm: () => updateApplicationStatus(app.id, "approved", note) })}>
              <Check size={16} /> Approve
            </Button>
            <Button variant="premium" className="w-full gap-1" onClick={() => confirm({ title: "Verify Artist", message: `Mark ${app.stageName} as verified?`, onConfirm: () => updateApplicationStatus(app.id, "verified", note) })}>
              <Shield size={16} /> Mark Verified
            </Button>
            <Button variant="secondary" className="w-full gap-1" onClick={() => updateApplicationStatus(app.id, "needs_more_info", note || "Please provide additional documents")}>
              <MessageSquare size={16} /> Request Info
            </Button>
            <Button variant="destructive" className="w-full gap-1" onClick={() => confirm({ title: "Reject", message: `Reject ${app.stageName}?`, destructive: true, onConfirm: () => updateApplicationStatus(app.id, "rejected", note) })}>
              <X size={16} /> Reject
            </Button>
            <Button variant="ghost" className="w-full gap-1 text-red-400" onClick={() => confirm({ title: "Suspend", message: `Suspend ${app.stageName}?`, destructive: true, onConfirm: () => updateApplicationStatus(app.id, "suspended", note) })}>
              <Ban size={16} /> Suspend
            </Button>
          </div>

          {app.adminNotes.length > 0 && (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <h3 className="mb-2 text-sm font-semibold">Admin Notes</h3>
              {app.adminNotes.map((n, i) => (
                <p key={i} className="text-xs text-white/60">• {n}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
