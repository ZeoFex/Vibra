"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mic2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useArtistAuth } from "@/lib/contexts/artist-auth-context";
import { getSafeRedirect } from "@/lib/auth-redirect";
import { DEMO_ARTIST_PASSWORD } from "@/lib/mock-data/artist-accounts";

function ArtistLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, isAuthReady } = useArtistAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = getSafeRedirect(searchParams.get("redirect") ?? "/artist/dashboard");

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
    else setError(result.error ?? "Login failed");
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600">
          <Mic2 size={28} />
        </div>
        <h1 className="text-2xl font-bold">Artist Login</h1>
        <p className="mt-2 text-sm text-white/50">Access your dashboard, uploads, and analytics</p>
      </div>

      <form onSubmit={handleSubmit} className="glass space-y-4 rounded-2xl p-8">
        {error && (
          <div className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</div>
        )}
        <div>
          <label className="mb-1.5 block text-sm text-white/70">Email</label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="kofi.wave@vibra.artist" required />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-white/70">Password</label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
        </div>
        <Button type="submit" className="w-full gap-2" disabled={loading}>
          <Lock size={16} />
          {loading ? "Signing in..." : "Sign in to Artist Portal"}
        </Button>

        <p className="text-xs text-white/40">
          Demo: <code className="text-white/50">kofi.wave@vibra.artist</code> /{" "}
          <code className="text-white/50">{DEMO_ARTIST_PASSWORD}</code>
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-white/50">
        New artist?{" "}
        <Link href="/artist/register" className="text-violet-400 hover:underline">Register here</Link>
      </p>
      <p className="mt-2 text-center text-sm text-white/40">
        <Link href="/home" className="hover:text-white/60">← Back to listener app</Link>
      </p>
    </div>
  );
}

export default function ArtistLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center gradient-bg px-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-fuchsia-600/15 blur-[100px]" />
      </div>
      <Suspense fallback={<div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />}>
        <ArtistLoginForm />
      </Suspense>
    </div>
  );
}
