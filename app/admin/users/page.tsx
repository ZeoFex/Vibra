"use client";

import Image from "next/image";
import { Search, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { currentUser } from "@/lib/mock-data";

const mockUsers = [
  currentUser,
  { ...currentUser, id: "user-2", username: "sarahchen", name: "Sarah Chen", email: "sarah@vibra.app", tier: "premium" as const, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" },
  { ...currentUser, id: "user-3", username: "marcuslee", name: "Marcus Lee", email: "marcus@vibra.app", tier: "free" as const, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" },
  { ...currentUser, id: "user-4", username: "emmawilson", name: "Emma Wilson", email: "emma@vibra.app", tier: "premium" as const, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop" },
];

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-white/50">{mockUsers.length} users shown</p>
        </div>
        <Button>Add User</Button>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
        <Input placeholder="Search users..." className="pl-9" />
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-left text-white/50">
              <th className="p-4">User</th>
              <th className="p-4">Email</th>
              <th className="p-4">Plan</th>
              <th className="p-4">Followers</th>
              <th className="p-4">Joined</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {mockUsers.map((user) => (
              <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <Image src={user.avatar} alt={user.name} width={32} height={32} className="rounded-full" />
                    <span className="font-medium">{user.name}</span>
                  </div>
                </td>
                <td className="p-4 text-white/60">{user.email}</td>
                <td className="p-4">
                  <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${user.tier === "premium" ? "bg-violet-600/20 text-violet-300" : "bg-white/10 text-white/60"}`}>
                    {user.tier}
                  </span>
                </td>
                <td className="p-4 text-white/60">{user.followers}</td>
                <td className="p-4 text-white/60">{user.createdAt}</td>
                <td className="p-4">
                  <Button variant="ghost" size="icon-sm"><MoreHorizontal size={16} /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
