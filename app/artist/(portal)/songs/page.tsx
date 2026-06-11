"use client";

import { useState } from "react";
import Image from "next/image";
import { Eye, Play, Download, Heart, FileText, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
  const { uploads, refreshUploads } = useArtistUploads();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [lyricsDraft, setLyricsDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  if (!artist) return null;

  const myUploads = uploads.filter((u) => u.uploadedBy === artist.id);
  const statsMap = new Map(getArtistStats(artist.id).map((s) => [s.uploadId, s]));

  const startEditing = (uploadId: string, currentLyrics: string) => {
    setEditingId(uploadId);
    setLyricsDraft(currentLyrics);
    setMessage("");
  };

  const saveLyrics = async (uploadId: string) => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch(`/api/artist/uploads/${uploadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ lyrics: lyricsDraft }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setMessage(data.error ?? "Could not save lyrics");
        return;
      }
      await refreshUploads();
      setEditingId(null);
      setLyricsDraft("");
      setMessage("Lyrics saved.");
      setTimeout(() => setMessage(""), 3000);
    } catch {
      setMessage("Could not save lyrics");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold">My Songs</h2>
        <p className="text-sm text-white/50">All uploads with listener stats. Add or update lyrics anytime.</p>
      </div>

      {message && (
        <div className="rounded-lg bg-green-500/10 px-4 py-2 text-sm text-green-300">{message}</div>
      )}

      {myUploads.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center text-white/50">
          No songs uploaded yet.
        </div>
      ) : (
        <div className="space-y-4">
          {myUploads.map((upload) => {
            const stat = statsMap.get(upload.id);
            const isEditing = editingId === upload.id;

            return (
              <div key={upload.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex gap-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
                    <Image src={upload.cover} alt={upload.title} fill className="object-cover" sizes="80px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{upload.title}</h3>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs",
                          upload.status === "published"
                            ? "bg-green-500/20 text-green-300"
                            : "bg-amber-500/20 text-amber-300"
                        )}
                      >
                        {statusLabel[upload.status]}
                      </span>
                    </div>
                    <p className="text-sm text-white/50">
                      {upload.albumTitle} · {upload.genre}
                      {upload.trackNumber ? ` · Track ${upload.trackNumber}` : ""}
                    </p>
                    <p className="mt-1 text-xs text-white/40">Producers: {upload.producers}</p>
                    {stat && (
                      <div className="mt-3 flex flex-wrap gap-4 text-xs text-white/60">
                        <span className="flex items-center gap-1">
                          <Eye size={12} /> {formatNumber(stat.views)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Play size={12} /> {formatNumber(stat.plays)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Download size={12} /> {formatNumber(stat.downloads)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart size={12} /> {formatNumber(stat.likes)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 rounded-lg border border-white/10 bg-black/20 p-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm text-white/70">
                      <FileText size={16} className="text-violet-400" />
                      Lyrics
                    </div>
                    {!isEditing && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditing(upload.id, upload.lyrics)}
                      >
                        {upload.lyrics ? "Edit lyrics" : "Add lyrics"}
                      </Button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-3">
                      <Textarea
                        value={lyricsDraft}
                        onChange={(e) => setLyricsDraft(e.target.value)}
                        rows={6}
                        placeholder="Paste or write lyrics for this track..."
                        className="font-mono text-sm"
                      />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          className="gap-1"
                          disabled={saving}
                          onClick={() => saveLyrics(upload.id)}
                        >
                          <Save size={14} />
                          {saving ? "Saving..." : "Save lyrics"}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : upload.lyrics ? (
                    <p className="whitespace-pre-wrap text-sm text-white/60">{upload.lyrics}</p>
                  ) : (
                    <p className="text-sm italic text-white/40">No lyrics yet. You can add them when ready.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
