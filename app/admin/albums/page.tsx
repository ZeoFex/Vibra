"use client";

import Image from "next/image";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { albums } from "@/lib/mock-data";

export default function AdminAlbumsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Albums</h1>
          <p className="text-white/50">{albums.length} albums</p>
        </div>
        <Button>Add Album</Button>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
        <Input placeholder="Search albums..." className="pl-9" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {albums.map((album) => (
          <div key={album.id} className="flex gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
            <Image src={album.cover} alt={album.title} width={64} height={64} className="rounded-lg" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{album.title}</p>
              <p className="text-sm text-white/50">{album.artistName}</p>
              <p className="text-xs text-white/40">
                {album.type} · {album.trackCount} tracks · {album.genre}
              </p>
            </div>
            <Button variant="ghost" size="sm">Edit</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
