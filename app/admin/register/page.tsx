"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordField } from "@/components/auth/password-field";
import { AuthSplit } from "@/components/auth/auth-split";
import { VibraLogo } from "@/components/brand/vibra-logo";
import { useAdmin } from "@/lib/contexts/admin-context";
import { isPasswordValid } from "@/lib/auth/password-requirements";

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
    if (!isPasswordValid(password)) {
      setError("Please meet all password requirements before registering.");
      return;
    }
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
    <AuthSplit tone="admin">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <VibraLogo size={56} className="mx-auto mb-4 h-14 w-14 rounded-2xl lg:hidden" />
          <h1 className="text-3xl font-bold tracking-tight">Create Super Admin</h1>
          <p className="mt-2 text-sm text-violet-200/70">Set up the first Vibra admin account</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-3xl border border-violet-400/15 bg-[#241433]/45 p-8 shadow-2xl shadow-black/40 backdrop-blur-md">
          {error && (
            <div className="mb-4 rounded-xl border border-red-400/30 bg-red-950/80 px-4 py-2.5 text-sm text-red-200">{error}</div>
          )}
          <div className="space-y-5">
            <div>
              <label htmlFor="admin-name" className="mb-2 block text-sm font-semibold text-white">Full Name</label>
              <Input id="admin-name" value={name} onChange={(e) => setName(e.target.value)} required className="border-violet-400/15 bg-[#0c0714]/70 backdrop-blur-none" />
            </div>
            <div>
              <label htmlFor="admin-email" className="mb-2 block text-sm font-semibold text-white">Email</label>
              <Input id="admin-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="border-violet-400/15 bg-[#0c0714]/70 backdrop-blur-none" />
            </div>
            <PasswordField value={password} onChange={setPassword} id="admin-register-password" inputClassName="border-violet-400/15 bg-[#0c0714]/70 backdrop-blur-none" />
          </div>
          <Button type="submit" className="mt-7 h-12 w-full gap-2" disabled={loading}>
            <UserPlus size={16} />
            {loading ? "Creating..." : "Create Super Admin"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-white/50">
          Already have an account?{" "}
          <Link href="/admin/login" className="text-violet-400 hover:underline">Sign in</Link>
        </p>
      </div>
    </AuthSplit>
  );
}
