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
import { VibraLogo } from "@/components/brand/vibra-logo";
import { AuthSplit } from "@/components/auth/auth-split";

const fieldClass =
  "h-12 rounded-md border-transparent bg-white/10 text-base shadow-none focus-visible:border-white focus-visible:ring-1 focus-visible:ring-white";

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
    <div className="w-full max-w-[420px]">
      <Link href="/" className="mb-8 inline-flex lg:hidden">
        <VibraLogo size={72} className="rounded-2xl" />
      </Link>
      <h1 className="mb-8 text-3xl font-bold tracking-tight sm:text-4xl">Sign up to start listening</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-md bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
        )}
        <ProfilePicturePicker file={avatarFile} onFileChange={setAvatarFile} required={false} />
        <div>
          <label className="mb-2 block text-sm font-bold">Name</label>
          <Input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={fieldClass}
          />
        </div>
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
        <PasswordField value={password} onChange={setPassword} inputClassName={fieldClass} />
        <Button type="submit" className="h-12 w-full rounded-full text-base font-bold shadow-none" disabled={loading || !isPasswordValid(password)}>
          {loading ? "Creating account..." : "Sign up"}
        </Button>
      </form>

      <p className="mt-8 text-sm text-white/70">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-white underline underline-offset-2 hover:text-violet-300">
          Log in here
        </Link>
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <AuthSplit>
      <Suspense fallback={<div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />}>
        <SignupForm />
      </Suspense>
    </AuthSplit>
  );
}
