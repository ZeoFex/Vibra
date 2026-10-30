"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Crown } from "lucide-react";
import { useAuth } from "@/lib/contexts/app-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { User, UserPreferences } from "@/types";
import { checkOnline } from "@/lib/client/network";

const fallbackPrefs: UserPreferences = {
  emailNotifications: true,
  newMusic: true,
  friendActivity: true,
  privateProfile: false,
  explicitContent: true,
  autoplay: true,
  highQuality: false,
};

function Toggle({ on, label, detail, onClick }: { on: boolean; label: string; detail: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full cursor-pointer items-center justify-between gap-4 py-3 text-left">
      <span>
        <span className="block text-sm font-medium">{label}</span>
        <span className="profile-muted mt-0.5 block text-xs">{detail}</span>
      </span>
      <span className={`relative h-7 w-12 shrink-0 rounded-full transition ${on ? "bg-violet-600" : "bg-zinc-400"}`}>
        <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${on ? "left-5" : "left-0.5"}`} />
      </span>
    </button>
  );
}

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [prefs, setPrefs] = useState<UserPreferences>(user?.preferences ?? fallbackPrefs);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!user) return null;

  const save = async (extra?: { email?: string; newPassword?: string }) => {
    setError("");
    setMessage("");
    if (extra?.newPassword && extra.newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (!(await checkOnline())) return;
    setBusy(true);
    const response = await fetch("/api/auth/settings", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        bio,
        preferences: prefs,
        currentPassword: currentPassword || undefined,
        ...extra,
      }),
    });
    const data = (await response.json()) as { user?: User; error?: string };
    setBusy(false);
    if (!response.ok || !data.user) {
      setError(data.error || "Could not save settings");
      return;
    }
    updateProfile(data.user);
    setEmail(data.user.email);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setMessage("Saved");
  };

  const flip = (key: keyof UserPreferences) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    void fetch("/api/auth/settings", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ preferences: { [key]: next[key] } }),
    }).then(async (response) => {
      if (!response.ok) return;
      const data = (await response.json()) as { user?: User };
      if (data.user) updateProfile(data.user);
    });
  };

  return (
    <div className="mx-auto max-w-xl space-y-4 pb-6">
      <div className="profile-surface flex items-center gap-4 rounded-2xl p-4">
        <Image src={user.avatar} alt="" width={72} height={72} className="h-[72px] w-[72px] rounded-full object-cover" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-xl font-bold">{user.name}</h1>
            {user.tier === "premium" && <Crown size={16} className="text-violet-300" />}
          </div>
          <p className="profile-muted truncate text-sm">@{user.username}</p>
          <p className="profile-muted text-xs capitalize">{user.tier} plan</p>
        </div>
      </div>

      <section className="profile-surface space-y-3 rounded-2xl p-4">
        <h2 className="profile-muted text-sm font-semibold uppercase tracking-wide">Profile</h2>
        <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" className="profile-field" />
        <Input value={bio} onChange={(event) => setBio(event.target.value)} placeholder="Bio" className="profile-field" />
        <Button disabled={busy} onClick={() => void save()} className="w-full sm:w-auto">Save profile</Button>
      </section>

      <section className="profile-surface space-y-3 rounded-2xl p-4">
        <h2 className="profile-muted text-sm font-semibold uppercase tracking-wide">Email</h2>
        <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" className="profile-field" />
        <Input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} placeholder="Current password" className="profile-field" />
        <Button disabled={busy} variant="secondary" onClick={() => void save({ email })} className="w-full sm:w-auto">Update email</Button>
      </section>

      <section className="profile-surface space-y-3 rounded-2xl p-4">
        <h2 className="profile-muted text-sm font-semibold uppercase tracking-wide">Password</h2>
        <Input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} placeholder="Current password" className="profile-field" />
        <Input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="New password" className="profile-field" />
        <Input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Confirm new password" className="profile-field" />
        <Button disabled={busy} variant="secondary" onClick={() => void save({ newPassword })} className="w-full sm:w-auto">Change password</Button>
      </section>

      <section className="profile-surface divide-y divide-[var(--line)] rounded-2xl px-4">
        <h2 className="profile-muted py-3 text-sm font-semibold uppercase tracking-wide">Playback</h2>
        <Toggle on={prefs.autoplay} label="Autoplay" detail="Keep playing similar music when a song ends" onClick={() => flip("autoplay")} />
        <Toggle on={prefs.explicitContent} label="Explicit content" detail="Allow songs marked explicit" onClick={() => flip("explicitContent")} />
        <Toggle on={prefs.highQuality} label="High quality audio" detail="Use more data for clearer sound" onClick={() => flip("highQuality")} />
      </section>

      <section className="profile-surface divide-y divide-[var(--line)] rounded-2xl px-4">
        <h2 className="profile-muted py-3 text-sm font-semibold uppercase tracking-wide">Notifications</h2>
        <Toggle on={prefs.emailNotifications} label="Email" detail="Account and security emails" onClick={() => flip("emailNotifications")} />
        <Toggle on={prefs.newMusic} label="New music" detail="Releases from artists you follow" onClick={() => flip("newMusic")} />
        <Toggle on={prefs.friendActivity} label="Friend activity" detail="Requests and messages" onClick={() => flip("friendActivity")} />
      </section>

      <section className="profile-surface divide-y divide-[var(--line)] rounded-2xl px-4">
        <h2 className="profile-muted py-3 text-sm font-semibold uppercase tracking-wide">Privacy</h2>
        <Toggle on={prefs.privateProfile} label="Private profile" detail="Only friends can see your listening" onClick={() => flip("privateProfile")} />
      </section>

      {user.tier === "free" && (
        <Link href="/premium" className="block rounded-2xl bg-violet-600 px-4 py-4 text-center text-sm font-semibold" style={{ color: "#ffffff" }}>
          Upgrade to Premium
        </Link>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}
      {message && <p className="text-sm text-emerald-400">{message}</p>}
    </div>
  );
}
