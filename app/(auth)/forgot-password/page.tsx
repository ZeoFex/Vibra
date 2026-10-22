"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle } from "lucide-react";
import { VibraLogo } from "@/components/brand/vibra-logo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not send the reset email.");
        return;
      }
      setSent(true);
    } catch {
      setError("Could not send the reset email. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center gradient-bg px-4">
      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex">
            <VibraLogo size={72} className="rounded-2xl" />
          </Link>
          <p className="mt-2 text-white/50">Reset your password</p>
        </div>

        {sent ? (
          <div className="glass rounded-2xl p-8 text-center">
            <CheckCircle size={48} className="mx-auto mb-4 text-green-400" />
            <h2 className="mb-2 text-xl font-semibold">Check your email</h2>
            <p className="mb-6 text-sm text-white/50">
              We sent a password reset link to {email}
            </p>
            <Link href="/login">
              <Button variant="secondary" className="w-full">Back to login</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass space-y-4 rounded-2xl p-8">
            {error && (
              <div className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</div>
            )}
            <p className="text-sm text-white/60">
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>
            <div>
              <label className="mb-1.5 block text-sm text-white/70">Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Send reset link"}
            </Button>
            <Link href="/login" className="block text-center text-sm text-violet-400 hover:underline">
              Back to login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
