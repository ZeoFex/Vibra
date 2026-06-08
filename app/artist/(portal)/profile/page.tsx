"use client";

import { useState } from "react";
import Image from "next/image";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useArtistAuth } from "@/lib/contexts/artist-auth-context";

export default function ArtistProfilePage() {
  const { artist, updateProfile } = useArtistAuth();
  const [form, setForm] = useState({
    stageName: artist?.stageName ?? "",
    legalName: artist?.legalName ?? "",
    bio: artist?.bio ?? "",
    genre: artist?.genre ?? "",
    country: artist?.country ?? "",
  });
  const [saved, setSaved] = useState(false);

  if (!artist) return null;

  const handleSave = () => {
    updateProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Image src={artist.image} alt={artist.stageName} width={80} height={80} className="rounded-full" />
        <div>
          <h2 className="text-xl font-bold">{artist.stageName}</h2>
          <p className="text-sm text-white/50">{artist.email}</p>
          <p className="mt-1 text-xs capitalize text-white/40">Status: {artist.status}</p>
        </div>
      </div>

      {saved && (
        <div className="rounded-lg bg-green-500/10 px-4 py-2 text-sm text-green-300">Profile updated</div>
      )}

      <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div>
          <label className="mb-1.5 block text-xs text-white/50">Stage Name</label>
          <Input value={form.stageName} onChange={(e) => setForm({ ...form, stageName: e.target.value })} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-white/50">Legal Name</label>
          <Input value={form.legalName} onChange={(e) => setForm({ ...form, legalName: e.target.value })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs text-white/50">Genre</label>
            <Input value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-white/50">Country</label>
            <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-white/50">Bio</label>
          <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={4} />
        </div>
        <Button onClick={handleSave} className="gap-2">
          <Save size={16} />
          Save Profile
        </Button>
      </div>
    </div>
  );
}
