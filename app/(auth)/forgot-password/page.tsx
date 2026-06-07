"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center gradient-bg px-4">
      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600">
              <span className="text-lg font-bold">V</span>
            </div>
            <span className="text-2xl font-bold">Vibra</span>
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
