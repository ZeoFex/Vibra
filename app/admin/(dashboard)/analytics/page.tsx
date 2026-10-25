"use client";

import { useEffect, useState } from "react";
import { PageHeader, SimpleBarChart } from "@/components/admin/ui";
import { formatNumber } from "@/lib/utils";

type Overview = {
  totalUsers: number;
  activeSubscriptions: number;
  dailyActiveUsers: number;
  monthlyActiveUsers: number;
  totalPlays: number;
  streamGrowth: { month: string; value: number }[];
  genres: { label: string; pct: number }[];
};

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Overview | null>(null);

  useEffect(() => {
    fetch("/api/admin/overview", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then(setStats)
      .catch(() => undefined);
  }, []);

  const premiumRate = stats && stats.totalUsers > 0
    ? Math.round((stats.activeSubscriptions / stats.totalUsers) * 100)
    : 0;

  return (
    <div className="space-y-8">
      <PageHeader title="Analytics" description="Plays, listeners, and catalog from the live database" />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="mb-4 font-semibold">Plays by month</h2>
          <SimpleBarChart data={stats?.streamGrowth ?? []} labelKey="month" valueKey="value" />
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="mb-4 font-semibold">Catalog genres</h2>
          <div className="space-y-4">
            {(stats?.genres ?? []).length === 0 && <p className="text-sm text-white/40">No uploads yet.</p>}
            {(stats?.genres ?? []).map(({ label, pct }) => (
              <div key={label}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{label}</span><span>{pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-violet-500" style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="mb-4 font-semibold">Listener summary</h2>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between"><dt className="text-white/50">Listeners this month</dt><dd>{formatNumber(stats?.monthlyActiveUsers ?? 0)}</dd></div>
          <div className="flex justify-between"><dt className="text-white/50">Listeners today</dt><dd>{formatNumber(stats?.dailyActiveUsers ?? 0)}</dd></div>
          <div className="flex justify-between"><dt className="text-white/50">Premium share</dt><dd>{premiumRate}%</dd></div>
          <div className="flex justify-between"><dt className="text-white/50">Recorded plays</dt><dd>{formatNumber(stats?.totalPlays ?? 0)}</dd></div>
        </dl>
      </div>
    </div>
  );
}
