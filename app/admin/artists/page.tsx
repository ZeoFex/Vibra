"use client";

import Image from "next/image";
import { Search, BadgeCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { artists } from "@/lib/mock-data";
import { formatNumber } from "@/lib/utils";

export default function AdminArtistsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Artists</h1>
          <p className="text-white/50">{artists.length} artists</p>
        </div>
        <Button>Add Artist</Button>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
        <Input placeholder="Search artists..." className="pl-9" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {artists.map((artist) => (
          <div key={artist.id} className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
            <Image src={artist.image} alt={artist.name} width={56} height={56} className="rounded-full" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <p className="truncate font-medium">{artist.name}</p>
                {artist.verified && <BadgeCheck size={14} className="shrink-0 text-violet-400" />}
              </div>
              <p className="text-xs text-white/50">{formatNumber(artist.monthlyListeners)} listeners</p>
              <p className="text-xs text-white/40">{artist.genres.join(", ")}</p>
            </div>
            <Button variant="ghost" size="sm">Edit</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
