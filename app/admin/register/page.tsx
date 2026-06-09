"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdmin } from "@/lib/contexts/admin-context";

export default function AdminRegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAdmin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/admin/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Registration failed");
      return;
    }

    await login(email, password);
    router.push("/admin");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600">
            <Shield size={28} />
          </div>
          <h1 className="text-2xl font-bold">Create Super Admin</h1>
          <p className="mt-2 text-sm text-white/50">Set up the first Vibra admin account</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
          {error && (
            <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</div>
          )}
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm text-white/70">Full Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-white/70">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-white/70">Password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
            </div>
          </div>
          <Button type="submit" className="mt-6 w-full gap-2" disabled={loading}>
            <UserPlus size={16} />
            {loading ? "Creating..." : "Create Super Admin"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-white/50">
          Already have an account?{" "}
          <Link href="/admin/login" className="text-violet-400 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
