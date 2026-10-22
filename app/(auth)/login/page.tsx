"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordField } from "@/components/auth/password-field";
import { useAuth } from "@/lib/contexts/app-context";
import { getSafeRedirect } from "@/lib/auth-redirect";
import { VibraLogo } from "@/components/brand/vibra-logo";
import { AuthSplit } from "@/components/auth/auth-split";

const fieldClass =
  "h-12 rounded-md border-transparent bg-white/10 text-base shadow-none focus-visible:border-white focus-visible:ring-1 focus-visible:ring-white";

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
    <div className="w-full max-w-[420px]">
      <Link href="/" className="mb-8 inline-flex lg:hidden">
        <VibraLogo size={72} className="rounded-2xl" />
      </Link>
      <h1 className="mb-8 text-3xl font-bold tracking-tight sm:text-4xl">Log in to Vibra</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
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
        <Link href="/forgot-password" className="inline-block text-sm font-medium text-white underline underline-offset-2 hover:text-violet-300">
          Forgot your password?
        </Link>
        <Button type="submit" className="h-12 w-full rounded-full text-base font-bold shadow-none" disabled={loading}>
          {loading ? "Signing in..." : "Log in"}
        </Button>
      </form>

      <p className="mt-8 text-sm text-white/70">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-bold text-white underline underline-offset-2 hover:text-violet-300">
          Sign up for Vibra
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
