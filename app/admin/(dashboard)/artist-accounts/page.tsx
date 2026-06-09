"use client";

import { useCallback, useEffect, useState } from "react";
import { UserPlus } from "lucide-react";
import { PageHeader } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdmin } from "@/lib/contexts/admin-context";
import { ADMIN_ROLE_LABELS, type AdminRole, type AdminUser } from "@/types/admin";

const REVIEWER_ROLES: AdminRole[] = [
  "verification_manager",
  "content_manager",
  "support_admin",
  "finance_admin",
];

export default function AdminSubAdminsPage() {
  const { admin } = useAdmin();
  const [subAdmins, setSubAdmins] = useState<AdminUser[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "verification_manager" as AdminRole,
  });

  const isSuperAdmin = admin?.role === "super_admin";

  const loadSubAdmins = useCallback(async () => {
    if (!isSuperAdmin) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/auth/admin/sub-admins", { credentials: "include" });
      if (res.ok) {
        const data = (await res.json()) as { admins: AdminUser[] };
        setSubAdmins(data.admins);
      }
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    loadSubAdmins();
  }, [loadSubAdmins]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth/admin/sub-admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to create reviewer");
      return;
    }
    setCreated(form.email);
    setForm({ name: "", email: "", password: "", role: "verification_manager" });
    setShowForm(false);
    await loadSubAdmins();
    setTimeout(() => setCreated(null), 5000);
  };

  if (!isSuperAdmin) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center text-white/50">
        Only the super admin can manage reviewer accounts.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reviewer Accounts"
        description="Create sub-admin accounts for content review, verification, and support"
      />

      {created && (
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
          Reviewer account created for <strong>{created}</strong> — they can sign in at /admin/login
        </div>
      )}

      <Button onClick={() => setShowForm(!showForm)} className="gap-2">
        <UserPlus size={16} />
        {showForm ? "Cancel" : "Create Reviewer"}
      </Button>

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
          {error && (
            <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</div>
          )}
          <h3 className="mb-4 font-semibold">New Reviewer Account</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-white/50">Full Name *</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/50">Email *</label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/50">Password *</label>
              <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/50">Role *</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as AdminRole })}
                className="flex h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white"
              >
                {REVIEWER_ROLES.map((role) => (
                  <option key={role} value={role} className="bg-zinc-900">
                    {ADMIN_ROLE_LABELS[role]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Button type="submit" className="mt-4 gap-2">
            <UserPlus size={16} />
            Create Reviewer
          </Button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-white/50">Loading reviewers...</p>
      ) : (
        <div className="space-y-3">
          {subAdmins.length === 0 ? (
            <p className="text-sm text-white/50">No reviewer accounts yet.</p>
          ) : (
            subAdmins.map((sub) => (
              <div key={sub.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div>
                  <p className="font-medium">{sub.name}</p>
                  <p className="text-sm text-white/50">{sub.email}</p>
                  <p className="text-xs text-white/40">{ADMIN_ROLE_LABELS[sub.role]}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
