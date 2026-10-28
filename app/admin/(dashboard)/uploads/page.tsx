"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { genreOptions } from "@/lib/constants/genres";
import { releaseTypeOptions, getReleaseTypeConfig, type ReleaseType } from "@/lib/constants/release-types";
import { getAudioDurationFromFile } from "@/lib/audio/resolve-audio-url";
import { readId3 } from "@/lib/audio/id3";

type TrackFile = {
  file: File;
  title: string;
  artist: string;
  album: string;
  songwriter: string;
  coverUrl: string;
  duration: number;
  explicit: boolean;
};

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

  const addAudio = async (list: FileList | null, mp3Only = false) => {
    if (!list?.length) return;
    const incoming = Array.from(list).filter((file) => !mp3Only || /\.mp3$/i.test(file.name) || file.type === "audio/mpeg");
    const next: TrackFile[] = [];
    for (const file of incoming.slice(0, 40)) {
      const duration = await getAudioDurationFromFile(file);
      const bytes = new Uint8Array(await file.arrayBuffer());
      const tags = readId3(bytes);
      const coverUrl = tags.picture
        ? URL.createObjectURL(new Blob([Uint8Array.from(tags.picture)], { type: tags.pictureMime || "image/jpeg" }))
        : "";
      next.push({
        file,
        title: tags.title || file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " "),
        artist: tags.artist || "",
        album: tags.album || "",
        songwriter: tags.songwriter || "",
        coverUrl,
        duration,
        explicit: false,
      });
    }
    setTracks((current) => [...current, ...next].slice(0, 40));
  };

  const config = getReleaseTypeConfig(releaseType);

  const onCover = (file?: File) => {
    setCover(file ?? null);
    setCoverPreview(file ? URL.createObjectURL(file) : "");
  };

  const publishBulk = async () => {
    setError("");
    setMessage("");
    if (!rights) {
      setError("Confirm you have the right to post these songs.");
      return;
    }
    const fallbackArtist = artistName.trim() || tracks.find((track) => track.artist.trim())?.artist || "";
    if (!fallbackArtist || tracks.length === 0) {
      setError("Add at least one MP3 with an artist name.");
      return;
    }
    setBusy(true);
    const body = new FormData();
    body.set("bulk", "true");
    body.set("artistName", fallbackArtist);
    body.set("genre", genre);
    body.set("releaseDate", releaseDate);
    body.set("producers", producers || "Unknown");
    body.set("copyrightConfirmed", "true");
    if (cover) body.set("cover", cover);
    tracks.forEach((track, index) => {
      body.append("audio", track.file);
      body.set(`title-${index}`, track.title);
      body.set(`artist-${index}`, track.artist);
      body.set(`songwriter-${index}`, track.songwriter);
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
    setMessage(`Published ${data.created ?? 0} MP3${(data.created ?? 0) === 1 ? "" : "s"}.${skipped.length ? ` Skipped ${skipped.length}: ${skipped.map((item) => `${item.title} (${item.reason})`).join(", ")}` : ""}`);
    setTracks([]);
  };

  const submit = async () => {
    setError("");
    setMessage("");
    if (!rights) {
      setError("Confirm you have the right to post these songs.");
      return;
    }
    if (tracks.length < config.minTracks) {
      setError(`Add at least ${config.minTracks} audio file(s).`);
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
    if (cover) body.set("cover", cover);
    tracks.forEach((track, index) => {
      body.append("audio", track.file);
      body.set(`title-${index}`, track.title);
      body.set(`artist-${index}`, track.artist);
      body.set(`songwriter-${index}`, track.songwriter);
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
        description="Publish a batch of MP3s, or a single, EP, or album. Duplicate title and artist pairs are skipped. Up to 40 tracks per batch."
        actions={<Link href="/admin/catalog" className="rounded-lg border border-white/15 px-4 py-2 text-sm hover:bg-white/5">View uploaded music</Link>}
      />
      <div className="space-y-4 rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex h-10 cursor-pointer items-center rounded-full bg-violet-600 px-5 text-sm font-medium text-white shadow-lg shadow-violet-600/25 hover:bg-violet-500">
            Choose cover (optional)
            <input className="sr-only" type="file" accept="image/*" onChange={(event) => onCover(event.target.files?.[0])} />
          </label>
          <span className="text-sm text-white/50">{cover ? cover.name : "Uses the thumbnail inside each MP3"}</span>
        </div>
        {coverPreview && (
          <Image src={coverPreview} alt="" width={120} height={120} className="h-28 w-28 rounded-xl object-cover" unoptimized />
        )}
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex h-10 cursor-pointer items-center rounded-full bg-violet-600 px-5 text-sm font-medium text-white shadow-lg shadow-violet-600/25 hover:bg-violet-500">
            Choose MP3s
            <input className="sr-only" type="file" accept=".mp3,audio/mpeg" multiple onChange={(event) => void addAudio(event.target.files, true)} />
          </label>
          <span className="text-sm text-white/50">{tracks.length} / 40 selected</span>
        </div>
        {tracks.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Details found in the files</h3>
            {tracks.map((track, index) => (
              <div key={`${track.file.name}-${index}`} className="flex gap-3 rounded-lg bg-black/30 p-3">
                {track.coverUrl ? (
                  <img src={track.coverUrl} alt="" className="h-16 w-16 rounded-lg object-cover" />
                ) : (
                  <span className="h-16 w-16 rounded-lg bg-white/10" />
                )}
                <div className="grid min-w-0 flex-1 gap-2">
                  <Input value={track.title} onChange={(event) => setTracks((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, title: event.target.value } : item))} placeholder="Song title" />
                  <Input value={track.artist} onChange={(event) => setTracks((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, artist: event.target.value } : item))} placeholder="Artist" />
                  <p className="text-xs text-white/50">{track.songwriter ? `Songwriter: ${track.songwriter}` : "No songwriter in the file"}{track.album ? ` · ${track.album}` : ""}</p>
                </div>
                <button type="button" className="text-sm text-white/50 hover:text-white" onClick={() => setTracks((current) => current.filter((_, itemIndex) => itemIndex !== index))}>Remove</button>
              </div>
            ))}
          </div>
        )}
        <label className="flex items-start gap-2 text-sm text-white/70">
          <input type="checkbox" checked={rights} onChange={(event) => setRights(event.target.checked)} className="mt-1" />
          I have the right to post this music on Vibra.
        </label>
        {error && <p className="text-sm text-red-400">{error}</p>}
        {message && <p className="text-sm text-emerald-400">{message}</p>}
        <Button disabled={busy} onClick={() => void publishBulk()}>
          {busy ? "Uploading…" : `Publish ${tracks.length || ""} MP3${tracks.length === 1 ? "" : "s"}`.replace("  ", " ")}
        </Button>
      </div>
      <div className="space-y-4 rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="font-semibold">Or publish one release</h2>
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
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex h-10 cursor-pointer items-center rounded-full bg-white/10 px-5 text-sm font-medium text-white hover:bg-white/20">
            Choose cover (optional)
            <input className="sr-only" type="file" accept="image/*" onChange={(event) => onCover(event.target.files?.[0])} />
          </label>
          <span className="text-sm text-white/50">{cover ? cover.name : "Uses the thumbnail inside each MP3"}</span>
        </div>
        <label className="inline-flex h-10 w-fit cursor-pointer items-center rounded-full bg-white/10 px-5 text-sm font-medium text-white hover:bg-white/20">
          Choose audio
          <input className="sr-only" type="file" accept="audio/*" multiple onChange={(event) => void addAudio(event.target.files)} />
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
