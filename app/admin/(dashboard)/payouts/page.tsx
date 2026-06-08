"use client";

import { useAdmin } from "@/lib/contexts/admin-context";
import { PageHeader, StatusBadge, useConfirmModal } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";

export default function PayoutsPage() {
  const { payouts, updatePayoutStatus } = useAdmin();
  const { confirm, modal } = useConfirmModal();

  return (
    <div className="space-y-6">
      {modal}
      <PageHeader title="Artist Payouts" description="Manage artist earnings and payout approvals" />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm text-white/50">Pending Payouts</p>
          <p className="mt-1 text-2xl font-bold">{payouts.filter((p) => p.status === "pending").length}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm text-white/50">Approved</p>
          <p className="mt-1 text-2xl font-bold">{payouts.filter((p) => p.status === "approved").length}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm text-white/50">Total Paid (Apr-May)</p>
          <p className="mt-1 text-2xl font-bold">${formatNumber(payouts.filter((p) => p.status === "paid").reduce((a, p) => a + p.approvedAmount, 0))}</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[800px] text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03] text-left text-white/50">
              <th className="p-4">Artist</th>
              <th className="p-4">Period</th>
              <th className="p-4">Streams</th>
              <th className="p-4">Estimated</th>
              <th className="p-4">Approved</th>
              <th className="p-4">Method</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {payouts.map((p) => (
              <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="p-4 font-medium">{p.artistName}</td>
                <td className="p-4 text-white/60">{p.period}</td>
                <td className="p-4 text-white/60">{formatNumber(p.totalStreams)}</td>
                <td className="p-4 text-white/60">${formatNumber(p.estimatedEarnings)}</td>
                <td className="p-4 font-medium">${formatNumber(p.approvedAmount)}</td>
                <td className="p-4 text-white/60">{p.paymentMethod}</td>
                <td className="p-4"><StatusBadge status={p.status} /></td>
                <td className="p-4">
                  <div className="flex gap-1">
                    {p.status === "pending" && (
                      <>
                        <Button size="sm" onClick={() => confirm({ title: "Approve Payout", message: `Approve $${p.approvedAmount} for ${p.artistName}?`, onConfirm: () => updatePayoutStatus(p.id, "approved") })}>Approve</Button>
                        <Button size="sm" variant="destructive" onClick={() => updatePayoutStatus(p.id, "rejected")}>Reject</Button>
                      </>
                    )}
                    {p.status === "approved" && (
                      <Button size="sm" onClick={() => confirm({ title: "Mark as Paid", message: `Confirm payment sent to ${p.artistName}?`, onConfirm: () => updatePayoutStatus(p.id, "paid", "Payment processed") })}>Mark Paid</Button>
                    )}
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
