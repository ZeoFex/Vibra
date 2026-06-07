"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdmin } from "@/lib/contexts/admin-context";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAdmin();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await login(email, password);
    setLoading(false);
    if (result.ok) router.push("/admin");
    else setError(result.error ?? "Invalid admin credentials");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.15),transparent_50%)]" />

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600">
            <Shield size={28} />
          </div>
          <h1 className="text-2xl font-bold">Vibra Admin</h1>
          <p className="mt-2 text-sm text-white/50">Secure access for authorized personnel only</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm">
          {error && (
            <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</div>
          )}
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm text-white/70">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@vibra.app" required />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-white/70">Password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
          </div>
          <Button type="submit" className="mt-6 w-full gap-2" disabled={loading}>
            <Lock size={16} />
            {loading ? "Authenticating..." : "Sign in to Admin"}
          </Button>

          <p className="mt-6 text-xs text-white/40">
            Use a demo admin email with the password set in{" "}
            <code className="text-white/50">.env.local</code> as{" "}
            <code className="text-white/50">VIBRA_ADMIN_DEMO_PASSWORD</code>.
          </p>
        </form>

        <p className="mt-6 text-center text-sm text-white/40">
          <Link href="/home" className="text-violet-400 hover:underline">← Back to Vibra</Link>
        </p>
      </div>
    </div>
  );
}
