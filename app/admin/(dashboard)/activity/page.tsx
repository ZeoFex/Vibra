"use client";

import { useAdmin } from "@/lib/contexts/admin-context";
import { PageHeader } from "@/components/admin/ui";

export default function ActivityLogsPage() {
  const { activityLogs } = useAdmin();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Activity Logs"
        description="Audit trail of all sensitive admin actions"
      />

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <p className="mb-4 text-xs text-white/40">
          2FA preparation · Login history · Full audit trail enabled
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-white/50">
                <th className="p-3">Admin</th>
                <th className="p-3">Action</th>
                <th className="p-3">Target</th>
                <th className="p-3">Type</th>
                <th className="p-3">Reason</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {activityLogs.map((log) => (
                <tr key={log.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="p-3 font-medium">{log.adminName}</td>
                  <td className="p-3">{log.action}</td>
                  <td className="p-3 text-white/70">{log.target}</td>
                  <td className="p-3"><span className="rounded bg-white/5 px-2 py-0.5 text-xs capitalize">{log.targetType}</span></td>
                  <td className="p-3 text-white/50">{log.reason ?? "—"}</td>
                  <td className="p-3 text-white/50">{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
