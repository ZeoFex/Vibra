"use client";

import Image from "next/image";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { songs } from "@/lib/mock-data";
import { formatNumber, formatDuration } from "@/lib/utils";

export default function AdminSongsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Songs</h1>
          <p className="text-white/50">{songs.length} songs</p>
        </div>
        <Button>Upload Song</Button>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
        <Input placeholder="Search songs..." className="pl-9" />
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-left text-white/50">
              <th className="p-4">Track</th>
              <th className="p-4">Artist</th>
              <th className="p-4">Album</th>
              <th className="p-4">Genre</th>
              <th className="p-4">Plays</th>
              <th className="p-4">Duration</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {songs.map((song) => (
              <tr key={song.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <Image src={song.cover} alt={song.title} width={36} height={36} className="rounded" />
                    <span className="font-medium">{song.title}</span>
                  </div>
                </td>
                <td className="p-4 text-white/60">{song.artistName}</td>
                <td className="p-4 text-white/60">{song.albumTitle}</td>
                <td className="p-4 text-white/60">{song.genre}</td>
                <td className="p-4 text-white/60">{formatNumber(song.plays)}</td>
                <td className="p-4 text-white/60">{formatDuration(song.duration)}</td>
                <td className="p-4">
                  <Button variant="ghost" size="sm">Edit</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
