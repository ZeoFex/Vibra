"use client";

import Image from "next/image";
import { Plus, Star } from "lucide-react";
import { officialPlaylists } from "@/lib/mock-data/admin";
import { PageHeader, StatusBadge } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";

export default function PlaylistsAdminPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Editorial Playlists"
        description="Create and manage official Vibra playlists"
        actions={<Button className="gap-1"><Plus size={16} /> Create Playlist</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {officialPlaylists.map((pl) => (
          <div key={pl.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex gap-4">
              <Image src={pl.cover} alt="" width={72} height={72} className="rounded-lg shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate font-semibold">{pl.title}</h3>
                  {pl.featured && <Star size={14} className="text-yellow-400 shrink-0" />}
                </div>
                <p className="text-xs text-white/50">{pl.category} · {pl.songCount} songs</p>
                <div className="mt-2 flex gap-1">
                  {pl.official && <StatusBadge status="verified" />}
                  {pl.featured && <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs text-yellow-400">Featured</span>}
                </div>
              </div>
            </div>
            <p className="mt-3 text-xs text-white/50 line-clamp-2">{pl.description}</p>
            <div className="mt-3 flex gap-2">
              <Button variant="secondary" size="sm">Edit</Button>
              <Button variant="ghost" size="sm">Manage Songs</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
