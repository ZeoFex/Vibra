"use client";

import { useState } from "react";
import Image from "next/image";
import { BadgeCheck, Ban, Star, Music, Users } from "lucide-react";
import { artists } from "@/lib/mock-data/artists";
import { getSongsByArtist } from "@/lib/mock-data/songs";
import { formatNumber } from "@/lib/utils";
import { PageHeader, StatusBadge, AdminSearchInput, useConfirmModal } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";

export default function AdminArtistsPage() {
  const [search, setSearch] = useState("");
  const { confirm, modal } = useConfirmModal();

  const filtered = artists.filter((a) =>
    !search || a.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {modal}
      <PageHeader title="Artist Management" description="Manage verified artists, content, and profiles" />

      <AdminSearchInput placeholder="Search artists..." value={search} onChange={setSearch} />

      <div className="grid gap-4 lg:grid-cols-2">
        {filtered.map((artist) => {
          const songCount = getSongsByArtist(artist.id).length;
          return (
            <div key={artist.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex gap-4">
                <Image src={artist.image} alt="" width={64} height={64} className="rounded-full shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{artist.name}</h3>
                    {artist.verified && <BadgeCheck size={16} className="text-violet-400" />}
                  </div>
                  <p className="text-sm text-white/50">{formatNumber(artist.monthlyListeners)} monthly listeners</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {artist.genres.map((g) => (
                      <span key={g} className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-white/50">{g}</span>
                    ))}
                  </div>
                  <div className="mt-3 flex gap-4 text-xs text-white/40">
                    <span className="flex items-center gap-1"><Music size={12} /> {songCount} songs</span>
                    <span className="flex items-center gap-1"><Users size={12} /> {formatNumber(artist.monthlyListeners / 100)} followers</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-4">
                <Button variant="secondary" size="sm">View Profile</Button>
                <Button variant="secondary" size="sm">Edit</Button>
                <Button variant="secondary" size="sm" className="gap-1"><Star size={14} /> Feature</Button>
                {!artist.verified && (
                  <Button size="sm" className="gap-1"><BadgeCheck size={14} /> Verify</Button>
                )}
                <Button variant="ghost" size="sm" className="text-red-400 gap-1" onClick={() => confirm({ title: "Suspend Artist", message: `Suspend ${artist.name}?`, destructive: true, onConfirm: () => {} })}>
                  <Ban size={14} /> Suspend
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
