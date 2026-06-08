"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mic2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useArtistAuth } from "@/lib/contexts/artist-auth-context";
import { genreOptions } from "@/lib/mock-data/artist-uploads";

export default function ArtistRegisterPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    stageName: "",
    legalName: "",
    genre: "Pop",
    country: "",
    bio: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useArtistAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await register(form);
    setLoading(false);
    if (result.ok) {
      setSuccess(true);
    } else {
      setError(result.error ?? "Registration failed");
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center gradient-bg px-4">
        <div className="glass max-w-md rounded-2xl p-8 text-center">
          <UserPlus size={40} className="mx-auto mb-4 text-violet-400" />
          <h1 className="text-xl font-bold">Registration Submitted</h1>
          <p className="mt-3 text-sm text-white/60">
            Your artist account is pending admin approval. Once an admin activates your login,
            you can sign in at the artist portal.
          </p>
          <Button className="mt-6 w-full" onClick={() => router.push("/artist/login")}>
            Go to Artist Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center gradient-bg px-4 py-12">
      <div className="relative w-full max-w-lg">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600">
            <Mic2 size={28} />
          </div>
          <h1 className="text-2xl font-bold">Artist Registration</h1>
          <p className="mt-2 text-sm text-white/50">Apply for an artist account on Vibra</p>
        </div>

        <form onSubmit={handleSubmit} className="glass space-y-4 rounded-2xl p-8">
          {error && (
            <div className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm text-white/70">Email *</label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm text-white/70">Password *</label>
              <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-white/70">Stage Name *</label>
              <Input value={form.stageName} onChange={(e) => setForm({ ...form, stageName: e.target.value })} required />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-white/70">Legal Name *</label>
              <Input value={form.legalName} onChange={(e) => setForm({ ...form, legalName: e.target.value })} required />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-white/70">Genre *</label>
              <select
                value={form.genre}
                onChange={(e) => setForm({ ...form, genre: e.target.value })}
                className="flex h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white"
              >
                {genreOptions.map((g) => (
                  <option key={g} value={g} className="bg-zinc-900">{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-white/70">Country *</label>
              <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} required />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm text-white/70">Bio</label>
              <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} />
            </div>
          </div>
          <Button type="submit" className="w-full gap-2" disabled={loading}>
            <UserPlus size={16} />
            {loading ? "Submitting..." : "Register as Artist"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-white/50">
          Already have an account?{" "}
          <Link href="/artist/login" className="text-violet-400 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
