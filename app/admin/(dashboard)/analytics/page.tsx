"use client";

import { adminDashboardStats, growthData } from "@/lib/mock-data/admin";
import { PageHeader, SimpleBarChart } from "@/components/admin/ui";
import { formatNumber } from "@/lib/utils";

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Analytics" description="Deep platform analytics and retention metrics" />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="mb-4 font-semibold">Daily Active Users (7 days)</h2>
          <SimpleBarChart
            data={[
              { day: "Mon", value: 42000 },
              { day: "Tue", value: 43500 },
              { day: "Wed", value: 44100 },
              { day: "Thu", value: 45800 },
              { day: "Fri", value: 47200 },
              { day: "Sat", value: 49100 },
              { day: "Sun", value: 48250 },
            ]}
            labelKey="day"
            valueKey="value"
          />
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="mb-4 font-semibold">Retention Metrics</h2>
          <div className="space-y-4">
            {[
              { label: "Day 1 Retention", value: 85 },
              { label: "Day 7 Retention", value: 72.5 },
              { label: "Day 30 Retention", value: 48 },
              { label: "Day 90 Retention", value: 32 },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{label}</span><span>{value}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-violet-500" style={{ width: `${value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="mb-4 font-semibold">Revenue Breakdown</h2>
          <div className="space-y-3">
            {[
              { label: "Premium Subscriptions", amount: "$1.91M", pct: 78 },
              { label: "Family Plans", amount: "$367K", pct: 15 },
              { label: "Student Plans", amount: "$171K", pct: 7 },
            ].map(({ label, amount, pct }) => (
              <div key={label}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{label}</span><span>{amount}</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-fuchsia-500" style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="mb-4 font-semibold">Platform Summary</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-white/50">MAU</dt><dd>{formatNumber(adminDashboardStats.monthlyActiveUsers)}</dd></div>
            <div className="flex justify-between"><dt className="text-white/50">DAU</dt><dd>{formatNumber(adminDashboardStats.dailyActiveUsers)}</dd></div>
            <div className="flex justify-between"><dt className="text-white/50">Premium Rate</dt><dd>25%</dd></div>
            <div className="flex justify-between"><dt className="text-white/50">Churn Rate</dt><dd>3.2%</dd></div>
            <div className="flex justify-between"><dt className="text-white/50">Avg Session</dt><dd>42 min</dd></div>
          </dl>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="mb-4 font-semibold">Stream Volume Trend</h2>
        <SimpleBarChart data={growthData.streams} labelKey="month" valueKey="value" />
      </div>
    </div>
  );
}
