"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordField } from "@/components/auth/password-field";
import { AuthSplit } from "@/components/auth/auth-split";
import { VibraLogo } from "@/components/brand/vibra-logo";
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
    <AuthSplit tone="admin">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <VibraLogo size={56} className="mx-auto mb-4 h-14 w-14 rounded-2xl lg:hidden" />
          <h1 className="text-3xl font-bold tracking-tight">Vibra Admin</h1>
          <p className="mt-2 text-sm text-violet-200/70">Secure access for authorized personnel only</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-3xl border border-violet-400/15 bg-[#241433]/45 p-8 shadow-2xl shadow-black/40 backdrop-blur-md">
          {error && (
            <div className="mb-4 rounded-xl border border-red-400/30 bg-red-950/80 px-4 py-2.5 text-sm text-red-200">{error}</div>
          )}
          <div className="space-y-5">
            <div>
              <label htmlFor="admin-email" className="mb-2 block text-sm font-semibold text-white">Email</label>
              <Input id="admin-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@vibra.app" required className="border-violet-400/15 bg-[#0c0714]/70 backdrop-blur-none" />
            </div>
            <PasswordField
              value={password}
              onChange={setPassword}
              id="admin-login-password"
              autoComplete="current-password"
              inputClassName="border-violet-400/15 bg-[#0c0714]/70 backdrop-blur-none"
            />
          </div>
          <Button type="submit" className="mt-7 h-12 w-full gap-2" disabled={loading}>
            <Lock size={16} />
            {loading ? "Authenticating..." : "Sign in to Admin"}
          </Button>

        </form>

        <p className="mt-6 text-center text-sm text-white/50">
          First time setup?{" "}
          <Link href="/admin/register" className="text-violet-400 hover:underline">Create super admin</Link>
        </p>
        <p className="mt-2 text-center text-sm text-white/40">
          <Link href="/home" className="text-violet-400 hover:underline">← Back to Vibra</Link>
        </p>
      </div>
    </AuthSplit>
  );
}
