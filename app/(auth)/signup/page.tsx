"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProfilePicturePicker } from "@/components/auth/profile-picture-picker";
import { PasswordField } from "@/components/auth/password-field";
import { useAuth } from "@/lib/contexts/app-context";
import { getSafeRedirect } from "@/lib/auth-redirect";
import { uploadProfilePicture } from "@/lib/client/upload-avatar";
import { isPasswordValid } from "@/lib/auth/password-requirements";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop";

function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signup } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = getSafeRedirect(searchParams.get("redirect"));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid(password)) {
      setError("Please meet all password requirements before signing up.");
      return;
    }

    setLoading(true);
    setError("");

    let avatarUrl = DEFAULT_AVATAR;
    if (avatarFile) {
      const upload = await uploadProfilePicture(avatarFile);
      if (!upload.ok || !upload.url) {
        setLoading(false);
        setError(upload.error ?? "Could not upload profile picture");
        return;
      }
      avatarUrl = upload.url;
    }

    const result = await signup(name, email, password, avatarUrl);
    setLoading(false);
    if (result.ok) router.push(redirectTo);
    else setError(result.error ?? "Signup failed");
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600">
            <span className="text-lg font-bold">V</span>
          </div>
          <span className="text-2xl font-bold">Vibra</span>
        </Link>
        <p className="mt-2 text-white/50">Create your account</p>
      </div>

      <form onSubmit={handleSubmit} className="glass space-y-4 rounded-2xl p-8">
        {error && (
          <div className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</div>
        )}
        <ProfilePicturePicker file={avatarFile} onFileChange={setAvatarFile} required={false} />
        <div>
          <label className="mb-1.5 block text-sm text-white/70">Name</label>
          <Input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
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
        <PasswordField value={password} onChange={setPassword} />
        <Button type="submit" variant="premium" className="w-full" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </Button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-transparent px-2 text-white/40">or continue with</span>
          </div>
        </div>

        <p className="text-center text-xs text-white/40">Google and Apple sign-up coming soon</p>
      </form>

      <p className="mt-6 text-center text-sm text-white/50">
        Already have an account?{" "}
        <Link href="/login" className="text-violet-400 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center gradient-bg px-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-fuchsia-600/15 blur-[100px]" />
      </div>
      <Suspense fallback={<div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />}>
        <SignupForm />
      </Suspense>
    </div>
  );
}
