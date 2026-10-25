"use client";

import { useEffect, useState } from "react";
import { Crown, Users } from "lucide-react";
import { PageHeader, StatusBadge } from "@/components/admin/ui";

type Listener = { id: string; name: string; email: string; tier: string; lastActive: string };

export default function SubscriptionsPage() {
  const [users, setUsers] = useState<Listener[]>([]);

  useEffect(() => {
    fetch("/api/admin/users", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data?.users) setUsers(data.users); })
      .catch(() => undefined);
  }, []);

  const premium = users.filter((user) => user.tier === "premium");
  const free = users.length - premium.length;

  return (
    <div className="space-y-8">
      <PageHeader title="Subscriptions" description="Listener plans stored on each account" />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <Crown size={20} className="text-violet-400" />
          <p className="mt-3 text-2xl font-bold">{premium.length}</p>
          <p className="text-sm text-white/50">Premium listeners</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <Users size={20} className="text-violet-400" />
          <p className="mt-3 text-2xl font-bold">{free}</p>
          <p className="text-sm text-white/50">Free listeners</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03] text-left text-white/50">
              <th className="p-4">User</th>
              <th className="p-4">Plan</th>
              <th className="p-4">Last active</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-white/5">
                <td className="p-4">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-white/50">{user.email}</p>
                </td>
                <td className="p-4"><StatusBadge status={user.tier} /></td>
                <td className="p-4 text-white/60">{user.lastActive}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
