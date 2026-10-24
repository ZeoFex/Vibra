"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordField } from "@/components/auth/password-field";
import { useAuth } from "@/lib/contexts/app-context";
import { getSafeRedirect } from "@/lib/auth-redirect";
import { AuthSplit } from "@/components/auth/auth-split";

const fieldClass =
  "h-12 rounded-xl border-violet-400/15 bg-[#0c0714]/70 text-base shadow-none backdrop-blur-none focus-visible:border-violet-400/40 focus-visible:ring-violet-500/40";

const cardClass =
  "w-full max-w-[440px] rounded-3xl border border-violet-400/15 bg-[#241433]/45 p-6 shadow-2xl shadow-black/40 backdrop-blur-md sm:p-8";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, isAuthenticated, isAuthReady } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = getSafeRedirect(searchParams.get("redirect"));

  useEffect(() => {
    if (isAuthReady && isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isAuthReady, isAuthenticated, redirectTo, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await login(email, password);
    setLoading(false);
    if (result.ok) router.push(redirectTo);
    else setError(result.error ?? "Invalid credentials");
  };

  return (
    <div className={cardClass}>
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">Vibra</p>
      <h1 className="mb-1 text-3xl font-bold tracking-tight">Log in</h1>
      <p className="mb-6 text-sm text-violet-100/70">Pick up where you left off.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
        )}
        <div>
          <label className="mb-2 block text-sm font-bold">Email</label>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={fieldClass}
          />
        </div>
        <PasswordField
          value={password}
          onChange={setPassword}
          label="Password"
          id="login-password"
          autoComplete="current-password"
          showRequirements={false}
          inputClassName={fieldClass}
        />
        <Link href="/forgot-password" className="inline-block text-sm font-medium text-violet-300 hover:text-violet-200">
          Forgot your password?
        </Link>
        <Button type="submit" className="h-12 w-full rounded-full text-base font-bold" disabled={loading}>
          {loading ? "Signing in..." : "Log in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-white/70">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-semibold text-violet-300 hover:text-violet-200">
          Create one
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthSplit>
      <Suspense fallback={<div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />}>
        <LoginForm />
      </Suspense>
    </AuthSplit>
  );
}
