"use client";

import { useEffect, useState } from "react";
import { PageHeader, StatusBadge, AdminSearchInput, FilterTabs, useConfirmModal } from "@/components/admin/ui";

type AdminListener = {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  tier: "free" | "premium";
  status: "active" | "suspended";
  lastActive: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminListener[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "free" | "premium" | "suspended">("all");
  const { modal } = useConfirmModal();

  useEffect(() => {
    fetch("/api/admin/users", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data?.users) setUsers(data.users); })
      .catch(() => undefined);
  }, []);

  const filtered = users.filter((u) => {
    if (filter === "free" && u.tier !== "free") return false;
    if (filter === "premium" && u.tier !== "premium") return false;
    if (filter === "suspended" && u.status !== "suspended") return false;
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {modal}
      <PageHeader title="User Management" description="Manage listeners and platform users" />

      <AdminSearchInput placeholder="Search users..." value={search} onChange={setSearch} />

      <FilterTabs
        tabs={[
          { id: "all" as const, label: "All Users" },
          { id: "free" as const, label: "Free" },
          { id: "premium" as const, label: "Premium" },
          { id: "suspended" as const, label: "Suspended" },
        ]}
        active={filter}
        onChange={setFilter}
      />

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03] text-left text-white/50">
              <th className="p-4">User</th>
              <th className="p-4">Plan</th>
              <th className="p-4">Status</th>
              <th className="p-4">Last Active</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {user.avatar ? (
                      <img src={user.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                    ) : (
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-700 text-sm font-semibold">{user.name.slice(0, 1)}</span>
                    )}
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-white/50">@{user.username} · {user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4"><StatusBadge status={user.tier} /></td>
                <td className="p-4"><StatusBadge status={user.status} /></td>
                <td className="p-4 text-white/60">{user.lastActive}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
