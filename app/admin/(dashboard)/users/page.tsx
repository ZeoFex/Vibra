"use client";

import { useState } from "react";
import Image from "next/image";
import { MoreHorizontal, Ban, RotateCcw } from "lucide-react";
import { currentUser } from "@/lib/mock-data";
import { PageHeader, StatusBadge, AdminSearchInput, FilterTabs, useConfirmModal } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";

const mockUsers = [
  { ...currentUser, status: "active" as const, playlists: 5, lastActive: "2026-06-06" },
  { ...currentUser, id: "user-2", username: "sarahchen", name: "Sarah Chen", email: "sarah@vibra.app", tier: "premium" as const, status: "active" as const, playlists: 12, lastActive: "2026-06-05", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" },
  { ...currentUser, id: "user-3", username: "spam99", name: "Spam Bot", email: "spam@fake.com", tier: "free" as const, status: "suspended" as const, playlists: 0, lastActive: "2026-05-20", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" },
  { ...currentUser, id: "user-4", username: "emmawilson", name: "Emma Wilson", email: "emma@vibra.app", tier: "premium" as const, status: "active" as const, playlists: 8, lastActive: "2026-06-04", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop" },
];

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "free" | "premium" | "suspended">("all");
  const { confirm, modal } = useConfirmModal();

  const filtered = mockUsers.filter((u) => {
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
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03] text-left text-white/50">
              <th className="p-4">User</th>
              <th className="p-4">Plan</th>
              <th className="p-4">Status</th>
              <th className="p-4">Playlists</th>
              <th className="p-4">Last Active</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <Image src={user.avatar} alt="" width={36} height={36} className="rounded-full" />
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-white/50">@{user.username} · {user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4"><StatusBadge status={user.tier} /></td>
                <td className="p-4"><StatusBadge status={user.status} /></td>
                <td className="p-4 text-white/60">{user.playlists}</td>
                <td className="p-4 text-white/60">{user.lastActive}</td>
                <td className="p-4">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon-sm"><MoreHorizontal size={16} /></Button>
                    {user.status === "active" ? (
                      <Button variant="ghost" size="icon-sm" onClick={() => confirm({ title: "Suspend User", message: `Suspend ${user.name}?`, destructive: true, confirmLabel: "Suspend", onConfirm: () => {} })}>
                        <Ban size={16} className="text-red-400" />
                      </Button>
                    ) : (
                      <Button variant="ghost" size="icon-sm"><RotateCcw size={16} className="text-green-400" /></Button>
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
