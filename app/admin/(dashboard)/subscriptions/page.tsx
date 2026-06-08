"use client";

import { Crown, DollarSign, TrendingUp } from "lucide-react";
import { PageHeader, StatusBadge } from "@/components/admin/ui";
import { formatNumber } from "@/lib/utils";

const subscriptionStats = [
  { label: "Premium Subscribers", value: "312,500", icon: Crown },
  { label: "Free Users", value: "937,500", icon: TrendingUp },
  { label: "Monthly Revenue", value: "$3.1M", icon: DollarSign },
];

const recentSubscriptions = [
  { user: "Sarah Chen", plan: "Premium", amount: "$9.99", date: "2026-06-05", status: "active", provider: "Stripe" },
  { user: "Marcus Lee", plan: "Premium", amount: "$9.99", date: "2026-06-04", status: "active", provider: "Stripe" },
  { user: "Emma Wilson", plan: "Premium", amount: "$9.99", date: "2026-06-03", status: "cancelled", provider: "Paystack" },
  { user: "James Park", plan: "Family", amount: "$14.99", date: "2026-06-02", status: "active", provider: "Stripe" },
  { user: "Failed User", plan: "Premium", amount: "$9.99", date: "2026-06-01", status: "failed", provider: "Stripe" },
];

export default function SubscriptionsPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Subscriptions & Payments" description="Stripe · Paystack · Revenue analytics · Refunds" />

      <div className="grid gap-4 sm:grid-cols-3">
        {subscriptionStats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <Icon size={20} className="text-violet-400" />
            <p className="mt-3 text-2xl font-bold">{value}</p>
            <p className="text-sm text-white/50">{label}</p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03] text-left text-white/50">
              <th className="p-4">User</th>
              <th className="p-4">Plan</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Provider</th>
              <th className="p-4">Date</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {recentSubscriptions.map((sub, i) => (
              <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="p-4 font-medium">{sub.user}</td>
                <td className="p-4">{sub.plan}</td>
                <td className="p-4 text-white/60">{sub.amount}</td>
                <td className="p-4 text-white/60">{sub.provider}</td>
                <td className="p-4 text-white/60">{sub.date}</td>
                <td className="p-4"><StatusBadge status={sub.status === "failed" ? "rejected" : sub.status === "cancelled" ? "suspended" : "approved"} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
