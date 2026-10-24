"use client";

import { useState } from "react";
import Image from "next/image";
import { PageHeader } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { genreOptions } from "@/lib/constants/genres";
import { releaseTypeOptions, getReleaseTypeConfig, type ReleaseType } from "@/lib/constants/release-types";
import { getAudioDurationFromFile } from "@/lib/audio/resolve-audio-url";

type TrackFile = { file: File; title: string; duration: number; explicit: boolean };

export default function AdminCatalogUploadPage() {
  const [releaseType, setReleaseType] = useState<ReleaseType>("album");
  const [albumTitle, setAlbumTitle] = useState("");
  const [artistName, setArtistName] = useState("");
  const [genre, setGenre] = useState<string>(genreOptions[0] ?? "Pop");
  const [releaseDate, setReleaseDate] = useState(new Date().toISOString().slice(0, 10));
  const [producers, setProducers] = useState("");
  const [songwriters, setSongwriters] = useState("");
  const [featuredArtists, setFeaturedArtists] = useState("");
  const [about, setAbout] = useState("");
  const [cover, setCover] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [tracks, setTracks] = useState<TrackFile[]>([]);
  const [rights, setRights] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const config = getReleaseTypeConfig(releaseType);

  const onCover = (file: File | undefined) => {
    if (!file) return;
    setCover(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const onAudio = async (list: FileList | null) => {
    if (!list) return;
    const next: TrackFile[] = [];
    for (const file of Array.from(list).slice(0, 40)) {
      const duration = await getAudioDurationFromFile(file);
      next.push({
        file,
        title: file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " "),
        duration,
        explicit: false,
      });
    }
    setTracks(next);
  };

  const submit = async () => {
    setError("");
    setMessage("");
    if (!rights) {
      setError("Confirm you have the right to post these songs.");
      return;
    }
    if (!cover || tracks.length < config.minTracks) {
      setError(`Add a cover and at least ${config.minTracks} audio file(s).`);
      return;
    }
    setBusy(true);
    const body = new FormData();
    body.set("releaseType", releaseType);
    body.set("albumTitle", albumTitle);
    body.set("artistName", artistName);
    body.set("genre", genre);
    body.set("releaseDate", releaseDate);
    body.set("producers", producers);
    body.set("songwriters", songwriters);
    body.set("featuredArtists", featuredArtists);
    body.set("about", about);
    body.set("copyrightConfirmed", "true");
    body.set("cover", cover);
    tracks.forEach((track, index) => {
      body.append("audio", track.file);
      body.set(`title-${index}`, track.title);
      body.set(`duration-${index}`, String(track.duration));
      body.set(`explicit-${index}`, track.explicit ? "true" : "false");
    });
    const response = await fetch("/api/admin/catalog", { method: "POST", body });
    const data = (await response.json()) as { created?: number; skipped?: { title: string; reason: string }[]; error?: string };
    setBusy(false);
    if (!response.ok) {
      setError(data.error || "Upload failed");
      return;
    }
    const skipped = data.skipped ?? [];
    setMessage(
      `Published ${data.created ?? 0} track(s).${skipped.length ? ` Skipped ${skipped.length}: ${skipped.map((item) => `${item.title} (${item.reason})`).join(", ")}` : ""}`
    );
    setTracks([]);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Upload catalog"
        description="Publish a single, EP, album, or other release. Duplicate title and artist pairs are skipped. Up to 40 tracks per batch."
      />
      <div className="space-y-4 rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <label className="block text-sm text-white/70">
          Release type
          <select
            className="mt-1 w-full rounded-lg border border-white/10 bg-black px-3 py-2"
            value={releaseType}
            onChange={(event) => setReleaseType(event.target.value as ReleaseType)}
          >
            {releaseTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <Input placeholder={config.projectPlaceholder} value={albumTitle} onChange={(event) => setAlbumTitle(event.target.value)} />
        <Input placeholder="Artist name" value={artistName} onChange={(event) => setArtistName(event.target.value)} />
        <div className="grid gap-3 sm:grid-cols-2">
          <select className="rounded-lg border border-white/10 bg-black px-3 py-2" value={genre} onChange={(event) => setGenre(event.target.value)}>
            {genreOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <Input type="date" value={releaseDate} onChange={(event) => setReleaseDate(event.target.value)} />
        </div>
        <Input placeholder="Producers" value={producers} onChange={(event) => setProducers(event.target.value)} />
        <Input placeholder="Songwriters" value={songwriters} onChange={(event) => setSongwriters(event.target.value)} />
        <Input placeholder="Featured artists" value={featuredArtists} onChange={(event) => setFeaturedArtists(event.target.value)} />
        <Textarea placeholder="About this release" value={about} onChange={(event) => setAbout(event.target.value)} />
        <label className="block text-sm text-white/70">
          Cover thumbnail
          <input className="mt-1 block w-full text-sm" type="file" accept="image/*" onChange={(event) => onCover(event.target.files?.[0])} />
        </label>
        {coverPreview && (
          <Image src={coverPreview} alt="" width={160} height={160} className="h-40 w-40 rounded-xl object-cover" unoptimized />
        )}
        <label className="block text-sm text-white/70">
          Audio files ({config.minTracks}–40)
          <input className="mt-1 block w-full text-sm" type="file" accept="audio/*" multiple onChange={(event) => void onAudio(event.target.files)} />
        </label>
        <div className="space-y-2">
          {tracks.map((track, index) => (
            <div key={`${track.file.name}-${index}`} className="grid gap-2 rounded-lg bg-white/5 p-3 sm:grid-cols-[1fr_auto]">
              <Input
                value={track.title}
                onChange={(event) =>
                  setTracks((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, title: event.target.value } : item)))
                }
              />
              <label className="flex items-center gap-2 text-sm text-white/60">
                <input
                  type="checkbox"
                  checked={track.explicit}
                  onChange={(event) =>
                    setTracks((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, explicit: event.target.checked } : item)))
                  }
                />
                Explicit
              </label>
            </div>
          ))}
        </div>
        <label className="flex items-start gap-2 text-sm text-white/70">
          <input type="checkbox" checked={rights} onChange={(event) => setRights(event.target.checked)} className="mt-1" />
          I have the right to post this music on Vibra.
        </label>
        {error && <p className="text-sm text-red-400">{error}</p>}
        {message && <p className="text-sm text-emerald-400">{message}</p>}
        <Button disabled={busy} onClick={() => void submit()}>
          {busy ? "Uploading…" : "Publish release"}
        </Button>
      </div>
    </div>
  );
}
