"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthSplit } from "@/components/auth/auth-split";
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

const fieldClass =
  "h-12 rounded-xl border-violet-400/15 bg-[#0c0714]/70 text-base shadow-none backdrop-blur-none focus-visible:border-violet-400/40 focus-visible:ring-violet-500/40";

const cardClass =
  "w-full max-w-[440px] rounded-3xl border border-violet-400/15 bg-[#241433]/45 p-6 shadow-2xl shadow-black/40 backdrop-blur-md sm:p-8";

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
      <AuthSplit sideSrc="/vibra-artist-hero.jpg" sideAlt="Artist performing on stage">
        <div className={`${cardClass} text-center`}>
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
          <Button className="mt-6 h-12 w-full text-base font-bold" onClick={() => router.push("/artist/login")}>
            Go to Artist Login
          </Button>
        </div>
      </AuthSplit>
    );
  }

  return (
    <AuthSplit sideSrc="/vibra-artist-hero.jpg" sideAlt="Artist performing on stage">
      <div className={cardClass}>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">Vibra Artists</p>
        <h1 className="mb-1 text-3xl font-bold tracking-tight">Create an artist account</h1>
        <p className="mb-6 text-sm text-violet-100/70">Apply to upload and manage your music.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</div>
          )}
          <ProfilePicturePicker
            file={avatarFile}
            onFileChange={setAvatarFile}
            label="Artist profile picture"
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm text-white/70">Email *</label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className={fieldClass}
              />
            </div>
            <div className="sm:col-span-2">
              <PasswordField
                value={form.password}
                onChange={(password) => setForm({ ...form, password })}
                inputClassName={fieldClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-white/70">Stage Name *</label>
              <Input
                value={form.stageName}
                onChange={(e) => setForm({ ...form, stageName: e.target.value })}
                required
                className={fieldClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-white/70">Legal Name *</label>
              <Input
                value={form.legalName}
                onChange={(e) => setForm({ ...form, legalName: e.target.value })}
                required
                className={fieldClass}
              />
            </div>
            <SelectField
              label="Genre"
              value={form.genre}
              onChange={(genre) => setForm({ ...form, genre })}
              options={genreOptions}
              required
              selectClassName={fieldClass}
            />
            <SelectField
              label="Country"
              value={form.country}
              onChange={(country) => setForm({ ...form, country })}
              options={countryOptions}
              required
              placeholder="Select your country"
              selectClassName={fieldClass}
            />
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm text-white/70">Bio</label>
              <Textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={3}
                className="border-violet-400/15 bg-[#0c0714]/70 backdrop-blur-none"
              />
            </div>
          </div>
          <Button type="submit" className="h-12 w-full gap-2 text-base font-bold" disabled={loading}>
            <UserPlus size={16} />
            {loading ? "Submitting..." : "Register as Artist"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-white/50">
          Already registered but not verified? Submit the form again with the same email to resend the link.
        </p>
        <p className="mt-2 text-center text-sm text-white/50">
          Already have an account?{" "}
          <Link href="/artist/login" className="font-semibold text-violet-300 hover:text-violet-200">
            Sign in
          </Link>
        </p>
      </div>
    </AuthSplit>
  );
}
