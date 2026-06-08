"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, Music, FileText, Users, Shield, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useArtistUploads } from "@/lib/contexts/artist-upload-context";
import { useArtistAuth } from "@/lib/contexts/artist-auth-context";
import { coverPresets, genreOptions } from "@/lib/mock-data/artist-uploads";
import { cn } from "@/lib/utils";

const emptyForm = {
  title: "",
  artistName: "",
  albumTitle: "",
  genre: "Pop",
  about: "",
  producers: "",
  songwriters: "",
  featuredArtists: "",
  lyrics: "",
  cover: coverPresets[0],
  audioFileName: "",
  releaseDate: new Date().toISOString().slice(0, 10),
  explicit: false,
  copyrightConfirmed: false,
};

interface ArtistUploadFormProps {
  onSuccess?: () => void;
}

export function ArtistUploadForm({ onSuccess }: ArtistUploadFormProps) {
  const { artist, recordNewUploadStats } = useArtistAuth();
  const { submitUpload } = useArtistUploads();
  const [form, setForm] = useState({
    ...emptyForm,
    artistName: artist?.stageName ?? "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const update = (field: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) update("audioFileName", file.name);
  };

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) update("cover", URL.createObjectURL(file));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!artist) return;

    if (!form.title.trim()) return setError("Song title is required.");
    if (!form.artistName.trim()) return setError("Artist name is required.");
    if (!form.albumTitle.trim()) return setError("Album or single name is required.");
    if (!form.producers.trim()) return setError("Producer details are required.");
    if (!form.lyrics.trim()) return setError("Lyrics are required.");
    if (!form.audioFileName) return setError("Please select an audio file.");
    if (!form.copyrightConfirmed) return setError("You must confirm copyright ownership.");

    const upload = submitUpload(form, artist.id);
    recordNewUploadStats(upload.id, artist.id, upload.title, upload.cover);
    setForm({ ...emptyForm, artistName: artist.stageName });
    setSubmitted(true);
    onSuccess?.();
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="space-y-6">
      {submitted && (
        <div className="flex items-center gap-3 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
          <CheckCircle2 size={18} />
          Song uploaded and published! It will appear on the listener home feed.
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-5 flex items-center gap-2">
            <Music size={20} className="text-violet-400" />
            <h2 className="text-lg font-semibold">Track Information</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-white/50">Song Title *</label>
              <Input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. Midnight Confessions" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/50">Artist Name *</label>
              <Input value={form.artistName} onChange={(e) => update("artistName", e.target.value)} placeholder="Your stage name" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/50">Album / Single / EP *</label>
              <Input value={form.albumTitle} onChange={(e) => update("albumTitle", e.target.value)} placeholder="e.g. Debut EP" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/50">Genre *</label>
              <select
                value={form.genre}
                onChange={(e) => update("genre", e.target.value)}
                className="flex h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
              >
                {genreOptions.map((g) => (
                  <option key={g} value={g} className="bg-zinc-900">{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/50">Release Date</label>
              <Input type="date" value={form.releaseDate} onChange={(e) => update("releaseDate", e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-white/50">About This Track</label>
              <Textarea value={form.about} onChange={(e) => update("about", e.target.value)} placeholder="Describe the story behind this song..." rows={3} />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-5 flex items-center gap-2">
            <Users size={20} className="text-violet-400" />
            <h2 className="text-lg font-semibold">Credits & Production</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/50">Producers *</label>
              <Input value={form.producers} onChange={(e) => update("producers", e.target.value)} placeholder="e.g. You, DJ Mensah" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/50">Songwriters</label>
              <Input value={form.songwriters} onChange={(e) => update("songwriters", e.target.value)} placeholder="e.g. You, co-writer" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-white/50">Featured Artists</label>
              <Input value={form.featuredArtists} onChange={(e) => update("featuredArtists", e.target.value)} placeholder="Comma-separated names" />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-5 flex items-center gap-2">
            <FileText size={20} className="text-violet-400" />
            <h2 className="text-lg font-semibold">Lyrics</h2>
          </div>
          <Textarea value={form.lyrics} onChange={(e) => update("lyrics", e.target.value)} placeholder="Paste your full lyrics..." rows={8} className="font-mono text-sm" />
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-5 flex items-center gap-2">
            <Upload size={20} className="text-violet-400" />
            <h2 className="text-lg font-semibold">Cover Art & Audio</h2>
          </div>
          <div className="mb-4">
            <label className="mb-2 block text-xs font-medium text-white/50">Cover Art</label>
            <div className="flex flex-wrap gap-2">
              {coverPresets.map((url) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => update("cover", url)}
                  className={cn(
                    "relative h-16 w-16 overflow-hidden rounded-lg ring-2 transition-all",
                    form.cover === url ? "ring-violet-500" : "ring-transparent hover:ring-white/20"
                  )}
                >
                  <Image src={url} alt="" fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="cursor-pointer">
                <span className="inline-flex h-9 items-center rounded-full border border-white/20 px-4 text-xs font-medium text-white/70 hover:bg-white/10">
                  Upload custom cover
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={handleCoverSelect} />
              </label>
              <Input
                value={form.cover.startsWith("blob:") ? "" : form.cover}
                onChange={(e) => update("cover", e.target.value)}
                placeholder="Or paste image URL"
                className="flex-1"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-white/50">Audio File *</label>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/[0.02] px-6 py-8 transition-colors hover:border-violet-500/50 hover:bg-white/[0.04]">
              <Music size={32} className="mb-2 text-white/30" />
              <span className="text-sm font-medium text-white/70">
                {form.audioFileName || "Click to select MP3, WAV, or FLAC"}
              </span>
              <span className="mt-1 text-xs text-white/40">Mock upload — file name saved locally</span>
              <input type="file" accept="audio/*" className="hidden" onChange={handleAudioSelect} />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-5 flex items-center gap-2">
            <Shield size={20} className="text-violet-400" />
            <h2 className="text-lg font-semibold">Rights & Content</h2>
          </div>
          <div className="space-y-3">
            <label className="flex cursor-pointer items-center gap-3">
              <input type="checkbox" checked={form.explicit} onChange={(e) => update("explicit", e.target.checked)} className="h-4 w-4 accent-violet-600" />
              <span className="text-sm text-white/70">This track contains explicit content</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3">
              <input type="checkbox" checked={form.copyrightConfirmed} onChange={(e) => update("copyrightConfirmed", e.target.checked)} className="h-4 w-4 accent-violet-600" />
              <span className="text-sm text-white/70">I confirm I own the rights to this music *</span>
            </label>
          </div>
        </section>

        <Button type="submit" size="lg" className="w-full gap-2">
          <Upload size={18} />
          Upload & Publish Song
        </Button>
      </form>
    </div>
  );
}
