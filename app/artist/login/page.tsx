"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordField } from "@/components/auth/password-field";
import { AuthSplit } from "@/components/auth/auth-split";
import { useArtistAuth } from "@/lib/contexts/artist-auth-context";
import { getSafeRedirect } from "@/lib/auth-redirect";

const fieldClass =
  "h-12 rounded-xl border-violet-400/15 bg-[#0c0714]/70 text-base shadow-none backdrop-blur-none focus-visible:border-violet-400/40 focus-visible:ring-violet-500/40";

const cardClass =
  "w-full max-w-[440px] rounded-3xl border border-violet-400/15 bg-[#241433]/45 p-6 shadow-2xl shadow-black/40 backdrop-blur-md sm:p-8";

function ArtistLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const { login, resendVerification, isAuthenticated, isAuthReady } = useArtistAuth();
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
    setNotice("");
    const result = await login(email, password);
    setLoading(false);
    if (result.ok) router.push(redirectTo);
    else setError(result.error ?? "Login failed");
  };

  const needsVerification = error.toLowerCase().includes("verify");

  const handleResend = async () => {
    if (!email.trim()) {
      setError("Enter your email address first.");
      return;
    }
    setResending(true);
    setNotice("");
    const result = await resendVerification(email);
    setResending(false);
    if (result.ok) {
      setError("");
      setNotice(result.message ?? "Verification email sent.");
    } else {
      setError(result.error ?? "Could not resend verification email.");
    }
  };

  return (
    <div className={cardClass}>
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">Vibra Artists</p>
      <h1 className="mb-1 text-3xl font-bold tracking-tight">Artist log in</h1>
      <p className="mb-6 text-sm text-violet-100/70">Open your dashboard, uploads, and analytics.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</div>
        )}
        {notice && (
          <div className="rounded-lg bg-green-500/10 px-4 py-2 text-sm text-green-300">{notice}</div>
        )}
        <div>
          <label className="mb-2 block text-sm font-semibold text-white">Email</label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className={fieldClass} />
        </div>
        <PasswordField
          value={password}
          onChange={setPassword}
          id="artist-login-password"
          autoComplete="current-password"
          showRequirements={false}
          inputClassName={fieldClass}
        />
        <Button type="submit" className="h-12 w-full gap-2 text-base font-bold" disabled={loading}>
          <Lock size={16} />
          {loading ? "Signing in..." : "Sign in to Artist Portal"}
        </Button>

        {needsVerification && (
          <Button type="button" variant="secondary" className="w-full" onClick={handleResend} disabled={resending}>
            {resending ? "Sending..." : "Resend verification email"}
          </Button>
        )}

        <p className="text-xs text-white/40">
          Register as an artist, verify your email, then sign in here.
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-white/70">
        New artist?{" "}
        <Link href="/artist/register" className="font-semibold text-violet-300 hover:text-violet-200">Create an account</Link>
      </p>
      <p className="mt-2 text-center text-sm text-white/50">
        <Link href="/home" className="text-violet-300 hover:text-violet-200">Back to Vibra</Link>
      </p>
    </div>
  );
}

export default function ArtistLoginPage() {
  return (
    <AuthSplit sideSrc="/vibra-artist-hero.jpg" sideAlt="Artist performing on stage">
      <Suspense fallback={<div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />}>
        <ArtistLoginForm />
      </Suspense>
    </AuthSplit>
  );
}
