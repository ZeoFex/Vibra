"use client";

import { useState } from "react";
import { UserPlus, Check, Ban, Clock } from "lucide-react";
import { PageHeader, StatusBadge } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useArtistAuth } from "@/lib/contexts/artist-auth-context";
import { genreOptions } from "@/lib/mock-data/artist-uploads";
import type { ArtistAccount } from "@/types/artist";

export default function AdminArtistAccountsPage() {
  const { accounts, createAccountAsAdmin, updateAccountStatus } = useArtistAuth();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    stageName: "",
    legalName: "",
    genre: "Pop",
    country: "",
    bio: "",
  });
  const [created, setCreated] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const account = createAccountAsAdmin(form);
    setCreated(account.email);
    setForm({ email: "", password: "", stageName: "", legalName: "", genre: "Pop", country: "", bio: "" });
    setShowForm(false);
    setTimeout(() => setCreated(null), 5000);
  };

  const statusBadge = (status: ArtistAccount["status"]) => {
    if (status === "active") return <StatusBadge status="approved" />;
    if (status === "pending") return <StatusBadge status="pending" />;
    return <StatusBadge status="rejected" />;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Artist Portal Accounts"
        description="Create and manage artist login credentials for the artist portal"
      />

      {created && (
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
          Account created for <strong>{created}</strong> — artist can log in at /artist/login
        </div>
      )}

      <div className="flex gap-3">
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <UserPlus size={16} />
          {showForm ? "Cancel" : "Create Artist Login"}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
          <h3 className="mb-4 font-semibold">New Artist Account</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-white/50">Email *</label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/50">Password *</label>
              <Input type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/50">Stage Name *</label>
              <Input value={form.stageName} onChange={(e) => setForm({ ...form, stageName: e.target.value })} required />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/50">Legal Name *</label>
              <Input value={form.legalName} onChange={(e) => setForm({ ...form, legalName: e.target.value })} required />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/50">Genre</label>
              <select
                value={form.genre}
                onChange={(e) => setForm({ ...form, genre: e.target.value })}
                className="flex h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white"
              >
                {genreOptions.map((g) => (
                  <option key={g} value={g} className="bg-zinc-900">{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/50">Country</label>
              <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs text-white/50">Bio</label>
              <Input value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
            </div>
          </div>
          <Button type="submit" className="mt-4 gap-2">
            <UserPlus size={16} />
            Create Active Account
          </Button>
          <p className="mt-2 text-xs text-white/40">Admin-created accounts are immediately active.</p>
        </form>
      )}

      <div className="space-y-3">
        {accounts.map((account) => (
          <div key={account.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">{account.stageName}</p>
                {statusBadge(account.status)}
                <span className="text-xs text-white/40 capitalize">via {account.createdBy}</span>
              </div>
              <p className="text-sm text-white/50">{account.email}</p>
              <p className="text-xs text-white/40">{account.genre} · {account.country}</p>
            </div>
            <div className="flex gap-2">
              {account.status === "pending" && (
                <Button size="sm" className="gap-1" onClick={() => updateAccountStatus(account.id, "active")}>
                  <Check size={14} /> Activate
                </Button>
              )}
              {account.status === "active" && (
                <Button variant="ghost" size="sm" className="gap-1 text-red-400" onClick={() => updateAccountStatus(account.id, "suspended")}>
                  <Ban size={14} /> Suspend
                </Button>
              )}
              {account.status === "suspended" && (
                <Button size="sm" className="gap-1" onClick={() => updateAccountStatus(account.id, "active")}>
                  <Check size={14} /> Reactivate
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {accounts.filter((a) => a.status === "pending").length > 0 && (
        <p className="flex items-center gap-2 text-sm text-amber-400">
          <Clock size={16} />
          {accounts.filter((a) => a.status === "pending").length} registration(s) awaiting approval
        </p>
      )}
    </div>
  );
}
