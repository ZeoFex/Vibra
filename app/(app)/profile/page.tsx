"use client";

import { useState } from "react";
import Image from "next/image";
import { Crown, Edit2, Save } from "lucide-react";
import { useAuth } from "@/lib/contexts/app-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");

  const handleSave = () => {
    updateProfile({ name, bio });
    setEditing(false);
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-4">
          <Image
            src={user.avatar}
            alt={user.name}
            width={120}
            height={120}
            className="rounded-full ring-4 ring-violet-600/30"
          />
          {user.tier === "premium" && (
            <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600">
              <Crown size={16} />
            </div>
          )}
        </div>

        {editing ? (
          <div className="w-full max-w-sm space-y-3">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
            <Input value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Bio" />
            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1 gap-1">
                <Save size={16} />
                Save
              </Button>
              <Button variant="secondary" onClick={() => setEditing(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="mt-1 text-white/50">{user.email}</p>
            {user.bio && <p className="mt-3 text-white/70">{user.bio}</p>}
            <Button variant="secondary" size="sm" className="mt-4 gap-1" onClick={() => setEditing(true)}>
              <Edit2 size={14} />
              Edit Profile
            </Button>
          </>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-2xl font-bold">{user.followers}</p>
          <p className="text-xs text-white/50">Followers</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-2xl font-bold">{user.following}</p>
          <p className="text-xs text-white/50">Following</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-2xl font-bold capitalize">{user.tier}</p>
          <p className="text-xs text-white/50">Plan</p>
        </div>
      </div>

      {user.tier === "free" && (
        <div className="glass flex items-center justify-between rounded-2xl p-6">
          <div>
            <p className="font-semibold">Upgrade to Premium</p>
            <p className="text-sm text-white/50">Unlock unlimited skips, hi-fi audio, and more</p>
          </div>
          <Link href="/premium">
            <Button variant="premium" size="sm">Upgrade</Button>
          </Link>
        </div>
      )}

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Account Settings</h2>
        {["Email notifications", "Privacy settings", "Connected accounts", "Download quality"].map((item) => (
          <button
            key={item}
            className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm text-white/70 transition-colors hover:bg-white/5"
          >
            {item}
            <span className="text-white/30">→</span>
          </button>
        ))}
      </div>
    </div>
  );
}
