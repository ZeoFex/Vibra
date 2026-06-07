"use client";

import { Crown, Users, TrendingUp } from "lucide-react";
import { formatNumber } from "@/lib/utils";

const subscriptionStats = [
  { label: "Premium Subscribers", value: "312,500", icon: Crown, pct: 25 },
  { label: "Free Users", value: "937,500", icon: Users, pct: 75 },
  { label: "Conversion Rate", value: "25%", icon: TrendingUp, pct: 25 },
];

const recentSubscriptions = [
  { user: "Sarah Chen", plan: "Premium", amount: "$9.99", date: "2026-06-05", status: "active" },
  { user: "Marcus Lee", plan: "Premium", amount: "$9.99", date: "2026-06-04", status: "active" },
  { user: "Emma Wilson", plan: "Premium", amount: "$9.99", date: "2026-06-03", status: "cancelled" },
  { user: "James Park", plan: "Premium", amount: "$9.99", date: "2026-06-02", status: "active" },
];

export default function AdminSubscriptionsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Subscriptions</h1>
        <p className="text-white/50">Manage premium plans and billing</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {subscriptionStats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-5">
            <Icon size={20} className="text-violet-400" />
            <p className="mt-3 text-2xl font-bold">{value}</p>
            <p className="text-sm text-white/50">{label}</p>
          </div>
        ))}
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Recent Subscriptions</h2>
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-left text-white/50">
                <th className="p-4">User</th>
                <th className="p-4">Plan</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentSubscriptions.map((sub, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4 font-medium">{sub.user}</td>
                  <td className="p-4">{sub.plan}</td>
                  <td className="p-4 text-white/60">{sub.amount}</td>
                  <td className="p-4 text-white/60">{sub.date}</td>
                  <td className="p-4">
                    <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${sub.status === "active" ? "bg-green-600/20 text-green-400" : "bg-red-600/20 text-red-400"}`}>
                      {sub.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Revenue Summary</h2>
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <p className="text-sm text-white/50">Monthly Recurring Revenue</p>
              <p className="text-2xl font-bold">${formatNumber(3_121_875)}</p>
            </div>
            <div>
              <p className="text-sm text-white/50">Annual Run Rate</p>
              <p className="text-2xl font-bold">${formatNumber(37_462_500)}</p>
            </div>
            <div>
              <p className="text-sm text-white/50">Churn Rate</p>
              <p className="text-2xl font-bold">3.2%</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
