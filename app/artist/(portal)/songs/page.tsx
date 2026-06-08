"use client";

import Image from "next/image";
import { Eye, Play, Download, Heart } from "lucide-react";
import { useArtistAuth } from "@/lib/contexts/artist-auth-context";
import { useArtistUploads } from "@/lib/contexts/artist-upload-context";
import { formatNumber } from "@/lib/utils";
import type { ArtistUploadStatus } from "@/types";
import { cn } from "@/lib/utils";

const statusLabel: Record<ArtistUploadStatus, string> = {
  published: "Published",
  pending: "Pending",
  draft: "Draft",
  rejected: "Rejected",
};

export default function ArtistSongsPage() {
  const { artist, getArtistStats } = useArtistAuth();
  const { uploads } = useArtistUploads();
  if (!artist) return null;

  const myUploads = uploads.filter((u) => u.uploadedBy === artist.id);
  const statsMap = new Map(getArtistStats(artist.id).map((s) => [s.uploadId, s]));

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold">My Songs</h2>
        <p className="text-sm text-white/50">All uploads with listener stats and metadata</p>
      </div>

      {myUploads.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center text-white/50">
          No songs uploaded yet.
        </div>
      ) : (
        <div className="space-y-4">
          {myUploads.map((upload) => {
            const stat = statsMap.get(upload.id);
            return (
              <div key={upload.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex gap-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
                    <Image src={upload.cover} alt={upload.title} fill className="object-cover" sizes="80px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{upload.title}</h3>
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-xs",
                        upload.status === "published" ? "bg-green-500/20 text-green-300" : "bg-amber-500/20 text-amber-300"
                      )}>
                        {statusLabel[upload.status]}
                      </span>
                    </div>
                    <p className="text-sm text-white/50">{upload.albumTitle} · {upload.genre}</p>
                    <p className="mt-1 text-xs text-white/40">Producers: {upload.producers}</p>
                    {stat && (
                      <div className="mt-3 flex flex-wrap gap-4 text-xs text-white/60">
                        <span className="flex items-center gap-1"><Eye size={12} /> {formatNumber(stat.views)}</span>
                        <span className="flex items-center gap-1"><Play size={12} /> {formatNumber(stat.plays)}</span>
                        <span className="flex items-center gap-1"><Download size={12} /> {formatNumber(stat.downloads)}</span>
                        <span className="flex items-center gap-1"><Heart size={12} /> {formatNumber(stat.likes)}</span>
                      </div>
                    )}
                  </div>
                </div>
                {upload.lyrics && (
                  <p className="mt-4 rounded-lg bg-white/5 p-3 text-xs italic text-white/50 line-clamp-2">
                    {upload.lyrics}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
