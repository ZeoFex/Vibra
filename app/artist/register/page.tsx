"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mic2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SelectField } from "@/components/ui/select-field";
import { ProfilePicturePicker } from "@/components/auth/profile-picture-picker";
import { PasswordField } from "@/components/auth/password-field";
import { useArtistAuth } from "@/lib/contexts/artist-auth-context";
import { uploadProfilePicture } from "@/lib/client/upload-avatar";
import { genreOptions } from "@/lib/constants/genres";
import { countryOptions } from "@/lib/constants/countries";
import { isPasswordValid } from "@/lib/auth/password-requirements";

export default function ArtistRegisterPage() {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
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
  const [successMessage, setSuccessMessage] = useState("");
  const [devVerifyUrl, setDevVerifyUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { register } = useArtistAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!avatarFile) {
      setError("Please add a profile picture.");
      return;
    }
    if (!form.country) {
      setError("Please select your country.");
      return;
    }
    if (!isPasswordValid(form.password)) {
      setError("Please meet all password requirements before registering.");
      return;
    }

    setLoading(true);
    setError("");

    const upload = await uploadProfilePicture(avatarFile);
    if (!upload.ok || !upload.url) {
      setLoading(false);
      setError(upload.error ?? "Could not upload profile picture");
      return;
    }

    const result = await register({ ...form, imageUrl: upload.url });
    setLoading(false);
    if (result.ok) {
      setSuccessMessage(result.message ?? "Check your email to verify your account.");
      setDevVerifyUrl(result.verifyUrl ?? null);
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
          <h1 className="text-xl font-bold">Check Your Email</h1>
          <p className="mt-3 text-sm text-white/60">{successMessage}</p>
          <p className="mt-2 text-xs text-white/40">
            Open the verification link in your email, then sign in to the artist portal.
          </p>
          {devVerifyUrl && (
            <p className="mt-4 break-all rounded-lg bg-white/5 p-3 text-left text-xs text-violet-300">
              Dev link:{" "}
              <a href={devVerifyUrl} className="underline">
                {devVerifyUrl}
              </a>
            </p>
          )}
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
          <ProfilePicturePicker
            file={avatarFile}
            onFileChange={setAvatarFile}
            label="Artist profile picture"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm text-white/70">Email *</label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <PasswordField
                value={form.password}
                onChange={(password) => setForm({ ...form, password })}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-white/70">Stage Name *</label>
              <Input
                value={form.stageName}
                onChange={(e) => setForm({ ...form, stageName: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-white/70">Legal Name *</label>
              <Input
                value={form.legalName}
                onChange={(e) => setForm({ ...form, legalName: e.target.value })}
                required
              />
            </div>
            <SelectField
              label="Genre"
              value={form.genre}
              onChange={(genre) => setForm({ ...form, genre })}
              options={genreOptions}
              required
            />
            <SelectField
              label="Country"
              value={form.country}
              onChange={(country) => setForm({ ...form, country })}
              options={countryOptions}
              required
              placeholder="Select your country"
            />
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm text-white/70">Bio</label>
              <Textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <Button type="submit" className="w-full gap-2" disabled={loading}>
            <UserPlus size={16} />
            {loading ? "Submitting..." : "Register as Artist"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-white/50">
          Already registered but not verified? Submit the form again with the same email to resend the link.
        </p>
        <p className="mt-2 text-center text-sm text-white/50">
          Already have an account?{" "}
          <Link href="/artist/login" className="text-violet-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
