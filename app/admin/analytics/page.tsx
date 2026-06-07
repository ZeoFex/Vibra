"use client";

import { adminStats } from "@/lib/mock-data";
import { formatNumber } from "@/lib/utils";

const dauHistory = [
  { date: "Jun 1", value: 42000 },
  { date: "Jun 2", value: 43500 },
  { date: "Jun 3", value: 44100 },
  { date: "Jun 4", value: 45800 },
  { date: "Jun 5", value: 47200 },
  { date: "Jun 6", value: 48250 },
];

const maxDau = Math.max(...dauHistory.map((d) => d.value));

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-white/50">Detailed platform metrics and trends</p>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Daily Active Users (7 days)</h2>
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <div className="flex h-48 items-end gap-3">
            {dauHistory.map(({ date, value }) => (
              <div key={date} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-xs text-white/50">{formatNumber(value)}</span>
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-violet-600 to-violet-400"
                  style={{ height: `${(value / maxDau) * 100}%`, minHeight: "8px" }}
                />
                <span className="text-xs text-white/40">{date}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-4 text-lg font-semibold">Retention Metrics</h2>
          <div className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-6">
            {[
              { label: "Day 1 Retention", value: 85 },
              { label: "Day 7 Retention", value: 72.5 },
              { label: "Day 30 Retention", value: 48 },
              { label: "Day 90 Retention", value: 32 },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-white/70">{label}</span>
                  <span className="font-medium">{value}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-violet-500"
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold">Revenue Breakdown</h2>
          <div className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-6">
            {[
              { label: "Premium Subscriptions", value: 78, amount: "$1.91M" },
              { label: "Family Plans", value: 15, amount: "$367K" },
              { label: "Student Plans", value: 7, amount: "$171K" },
            ].map(({ label, value, amount }) => (
              <div key={label}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-white/70">{label}</span>
                  <span className="font-medium">{amount}</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-fuchsia-500"
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Top Genres by Plays</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { genre: "Hip-Hop", plays: "42.5M", pct: 28 },
            { genre: "Electronic", plays: "38.2M", pct: 25 },
            { genre: "Rock", plays: "31.8M", pct: 21 },
            { genre: "Indie", plays: "22.4M", pct: 15 },
            { genre: "Lo-Fi", plays: "15.1M", pct: 10 },
          ].map(({ genre, plays, pct }) => (
            <div key={genre} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex justify-between">
                <span className="font-medium">{genre}</span>
                <span className="text-sm text-white/50">{plays}</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-white/10">
                <div className="h-full rounded-full bg-violet-500" style={{ width: `${pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
