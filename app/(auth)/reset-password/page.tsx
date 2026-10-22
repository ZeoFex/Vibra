"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/auth/password-field";
import { VibraLogo } from "@/components/brand/vibra-logo";
import { isPasswordValid } from "@/lib/auth/password-requirements";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("This reset link is missing. Request a new one from the login page.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not reset your password.");
        return;
      }
      setDone(true);
    } catch {
      setError("Could not reset your password. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex">
          <VibraLogo size={72} className="rounded-2xl" />
        </Link>
        <p className="mt-2 text-white/50">Choose a new password</p>
      </div>

      {done ? (
        <div className="glass rounded-2xl p-8 text-center">
          <h2 className="mb-2 text-xl font-semibold">Password updated</h2>
          <p className="mb-6 text-sm text-white/50">You can sign in with your new password.</p>
          <Link href="/login">
            <Button className="w-full">Back to login</Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="glass space-y-4 rounded-2xl p-8">
          {error && (
            <div className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</div>
          )}
          <PasswordField value={password} onChange={setPassword} label="New password" id="reset-password" />
          <Button type="submit" className="w-full" disabled={loading || !isPasswordValid(password)}>
            {loading ? "Saving..." : "Update password"}
          </Button>
          <Link href="/forgot-password" className="block text-center text-sm text-violet-400 hover:underline">
            Request a new link
          </Link>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center gradient-bg px-4">
      <Suspense fallback={<div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
