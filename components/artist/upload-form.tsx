"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, Music, FileText, Users, Shield, CheckCircle2, Plus, Trash2, Disc3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useArtistUploads } from "@/lib/contexts/artist-upload-context";
import { useArtistAuth } from "@/lib/contexts/artist-auth-context";
import { coverPresets } from "@/lib/mock-data/artist-uploads";
import { genreOptions } from "@/lib/constants/genres";
import {
  releaseTypeOptions,
  getReleaseTypeConfig,
  type ReleaseType,
} from "@/lib/constants/release-types";
import { cn } from "@/lib/utils";

interface TrackDraft {
  title: string;
  featuredArtists: string;
  producers: string;
  songwriters: string;
  lyrics: string;
  cover: string;
  audioFileName: string;
  explicit: boolean;
  about: string;
}

function createEmptyTrack(cover = coverPresets[0]): TrackDraft {
  return {
    title: "",
    featuredArtists: "",
    producers: "",
    songwriters: "",
    lyrics: "",
    cover,
    audioFileName: "",
    explicit: false,
    about: "",
  };
}

function createTracksForType(type: ReleaseType): TrackDraft[] {
  const config = getReleaseTypeConfig(type);
  return Array.from({ length: config.minTracks }, () => createEmptyTrack());
}

interface ArtistUploadFormProps {
  onSuccess?: () => void;
}

export function ArtistUploadForm({ onSuccess }: ArtistUploadFormProps) {
  const { artist, recordNewUploadStats } = useArtistAuth();
  const { submitUpload } = useArtistUploads();
  const [releaseType, setReleaseType] = useState<ReleaseType>("single");
  const [projectTitle, setProjectTitle] = useState("");
  const [artistName, setArtistName] = useState(artist?.stageName ?? "");
  const [genre, setGenre] = useState("Pop");
  const [releaseDate, setReleaseDate] = useState(new Date().toISOString().slice(0, 10));
  const [projectAbout, setProjectAbout] = useState("");
  const [projectCover, setProjectCover] = useState(coverPresets[0]);
  const [tracks, setTracks] = useState<TrackDraft[]>(createTracksForType("single"));
  const [copyrightConfirmed, setCopyrightConfirmed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedTrackCount, setSubmittedTrackCount] = useState(1);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const config = getReleaseTypeConfig(releaseType);

  const handleReleaseTypeChange = (type: ReleaseType) => {
    setReleaseType(type);
    setTracks(createTracksForType(type));
    setError("");
  };

  const updateTrack = (index: number, field: keyof TrackDraft, value: string | boolean) => {
    setTracks((prev) =>
      prev.map((track, i) => (i === index ? { ...track, [field]: value } : track))
    );
    setError("");
  };

  const addTrack = () => {
    if (tracks.length >= config.maxTracks) return;
    setTracks((prev) => [...prev, createEmptyTrack(projectCover)]);
  };

  const removeTrack = (index: number) => {
    if (tracks.length <= config.minTracks) return;
    setTracks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTrackCoverSelect = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) updateTrack(index, "cover", URL.createObjectURL(file));
  };

  const handleProjectCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setProjectCover(URL.createObjectURL(file));
  };

  const handleAudioSelect = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) updateTrack(index, "audioFileName", file.name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artist) return;

    if (!projectTitle.trim()) {
      return setError(`${config.projectLabel} is required.`);
    }
    if (!artistName.trim()) return setError("Artist name is required.");
    if (tracks.length < config.minTracks) {
      return setError(`${config.label} requires at least ${config.minTracks} track(s).`);
    }

    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      const label = config.allowsMultipleTracks ? `Track ${i + 1}` : "Track";
      if (!track.title.trim()) return setError(`${label}: song title is required.`);
      if (!track.producers.trim()) return setError(`${label}: producer details are required.`);
      if (!track.audioFileName) return setError(`${label}: please select an audio file.`);
    }

    if (!copyrightConfirmed) return setError("You must confirm copyright ownership.");

    setSubmitting(true);
    const albumTitle = `${config.label}: ${projectTitle.trim()}`;
    const albumGroupId = crypto.randomUUID();
    const trackCount = tracks.length;
    let successCount = 0;

    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      const result = await submitUpload({
        title: track.title.trim(),
        artistName: artistName.trim(),
        albumTitle,
        releaseType,
        albumGroupId,
        trackNumber: i + 1,
        genre,
        about: track.about.trim() || projectAbout.trim(),
        producers: track.producers.trim(),
        songwriters: track.songwriters.trim(),
        featuredArtists: track.featuredArtists.trim(),
        lyrics: track.lyrics.trim(),
        cover: track.cover || projectCover,
        audioFileName: track.audioFileName,
        releaseDate,
        explicit: track.explicit,
        copyrightConfirmed: true,
      });

      if (result.ok && result.upload) {
        recordNewUploadStats(result.upload.id, artist.id, result.upload.title, result.upload.cover);
        successCount++;
      } else {
        setSubmitting(false);
        return setError(result.error ?? `Failed to upload "${track.title}"`);
      }
    }

    setSubmitting(false);
    setSubmittedTrackCount(trackCount);
    setReleaseType("single");
    setProjectTitle("");
    setArtistName(artist.stageName);
    setGenre("Pop");
    setReleaseDate(new Date().toISOString().slice(0, 10));
    setProjectAbout("");
    setProjectCover(coverPresets[0]);
    setTracks(createTracksForType("single"));
    setCopyrightConfirmed(false);
    setSubmitted(true);
    onSuccess?.();
    setTimeout(() => setSubmitted(false), 5000);

    if (successCount > 1) {
      setError("");
    }
  };

  return (
    <div className="space-y-6">
      {submitted && (
        <div className="flex items-center gap-3 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
          <CheckCircle2 size={18} />
          {submittedTrackCount > 1
            ? `${submittedTrackCount} tracks uploaded and published! They will appear on the listener home feed.`
            : "Song uploaded and published! It will appear on the listener home feed."}
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
            <Disc3 size={20} className="text-violet-400" />
            <h2 className="text-lg font-semibold">Release Type</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-white/50">What are you uploading? *</label>
              <select
                value={releaseType}
                onChange={(e) => handleReleaseTypeChange(e.target.value as ReleaseType)}
                className="flex h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
              >
                {releaseTypeOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-zinc-900">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-white/50">{config.projectLabel} *</label>
              <Input
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder={config.projectPlaceholder}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/50">Artist Name *</label>
              <Input
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                placeholder="Your stage name"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/50">Genre *</label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="flex h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
              >
                {genreOptions.map((g) => (
                  <option key={g} value={g} className="bg-zinc-900">
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/50">Release Date</label>
              <Input type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} />
            </div>
            {!config.allowsMultipleTracks && (
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/50">Track Number</label>
                <Input value="1" disabled className="opacity-60" />
              </div>
            )}
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-white/50">
                About this {config.label.toLowerCase()}
              </label>
              <Textarea
                value={projectAbout}
                onChange={(e) => setProjectAbout(e.target.value)}
                placeholder={`Describe your ${config.label.toLowerCase()}...`}
                rows={3}
              />
            </div>
            {config.allowsMultipleTracks && (
              <div className="sm:col-span-2">
                <label className="mb-2 block text-xs font-medium text-white/50">{config.label} Cover Art</label>
                <div className="flex flex-wrap gap-2">
                  {coverPresets.map((url) => (
                    <button
                      key={url}
                      type="button"
                      onClick={() => setProjectCover(url)}
                      className={cn(
                        "relative h-16 w-16 overflow-hidden rounded-lg ring-2 transition-all",
                        projectCover === url ? "ring-violet-500" : "ring-transparent hover:ring-white/20"
                      )}
                    >
                      <Image src={url} alt="" fill className="object-cover" sizes="64px" />
                    </button>
                  ))}
                </div>
                <label className="mt-3 inline-flex cursor-pointer">
                  <span className="inline-flex h-9 items-center rounded-full border border-white/20 px-4 text-xs font-medium text-white/70 hover:bg-white/10">
                    Upload {config.label.toLowerCase()} cover
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleProjectCoverSelect} />
                </label>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Music size={20} className="text-violet-400" />
              <h2 className="text-lg font-semibold">{config.trackSectionLabel}</h2>
            </div>
            {config.allowsMultipleTracks && tracks.length < config.maxTracks && (
              <Button type="button" variant="outline" size="sm" onClick={addTrack} className="gap-1">
                <Plus size={14} />
                Add Track
              </Button>
            )}
          </div>

          <div className="space-y-8">
            {tracks.map((track, index) => (
              <div
                key={index}
                className="rounded-xl border border-white/10 bg-black/20 p-5"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-medium text-white/80">
                    {config.allowsMultipleTracks ? `Track ${index + 1}` : "Track Details"}
                  </h3>
                  {config.allowsMultipleTracks && tracks.length > config.minTracks && (
                    <button
                      type="button"
                      onClick={() => removeTrack(index)}
                      className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs font-medium text-white/50">Song Title *</label>
                    <Input
                      value={track.title}
                      onChange={(e) => updateTrack(index, "title", e.target.value)}
                      placeholder="e.g. Midnight Confessions"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-white/50">Producers *</label>
                    <Input
                      value={track.producers}
                      onChange={(e) => updateTrack(index, "producers", e.target.value)}
                      placeholder="e.g. You, DJ Mensah"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-white/50">Songwriters</label>
                    <Input
                      value={track.songwriters}
                      onChange={(e) => updateTrack(index, "songwriters", e.target.value)}
                      placeholder="e.g. You, co-writer"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs font-medium text-white/50">Featured Artists</label>
                    <Input
                      value={track.featuredArtists}
                      onChange={(e) => updateTrack(index, "featuredArtists", e.target.value)}
                      placeholder="Comma-separated names"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs font-medium text-white/50">About This Track</label>
                    <Textarea
                      value={track.about}
                      onChange={(e) => updateTrack(index, "about", e.target.value)}
                      placeholder="Optional track-specific description..."
                      rows={2}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <div className="mb-2 flex items-center gap-2">
                    <FileText size={16} className="text-violet-400" />
                    <label className="text-xs font-medium text-white/50">Lyrics (optional)</label>
                  </div>
                  <Textarea
                    value={track.lyrics}
                    onChange={(e) => updateTrack(index, "lyrics", e.target.value)}
                    placeholder="Add lyrics now or update later from My Songs..."
                    rows={6}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-medium text-white/50">Track Cover Art</label>
                    <div className="flex flex-wrap gap-2">
                      {coverPresets.slice(0, 4).map((url) => (
                        <button
                          key={url}
                          type="button"
                          onClick={() => updateTrack(index, "cover", url)}
                          className={cn(
                            "relative h-14 w-14 overflow-hidden rounded-lg ring-2 transition-all",
                            track.cover === url ? "ring-violet-500" : "ring-transparent hover:ring-white/20"
                          )}
                        >
                          <Image src={url} alt="" fill className="object-cover" sizes="56px" />
                        </button>
                      ))}
                    </div>
                    <label className="mt-2 inline-flex cursor-pointer">
                      <span className="inline-flex h-8 items-center rounded-full border border-white/20 px-3 text-xs text-white/70 hover:bg-white/10">
                        Upload track cover
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleTrackCoverSelect(index, e)}
                      />
                    </label>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-white/50">Audio File *</label>
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/[0.02] px-4 py-6 transition-colors hover:border-violet-500/50">
                      <Music size={24} className="mb-2 text-white/30" />
                      <span className="text-center text-sm text-white/70">
                        {track.audioFileName || "Select MP3, WAV, or FLAC"}
                      </span>
                      <input
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        onChange={(e) => handleAudioSelect(index, e)}
                      />
                    </label>
                  </div>
                </div>

                <label className="mt-4 flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={track.explicit}
                    onChange={(e) => updateTrack(index, "explicit", e.target.checked)}
                    className="h-4 w-4 accent-violet-600"
                  />
                  <span className="text-sm text-white/70">This track contains explicit content</span>
                </label>
              </div>
            ))}
          </div>
        </section>

        {!config.allowsMultipleTracks && (
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="mb-5 flex items-center gap-2">
              <Upload size={20} className="text-violet-400" />
              <h2 className="text-lg font-semibold">Single Cover Art</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {coverPresets.map((url) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => {
                    setProjectCover(url);
                    updateTrack(0, "cover", url);
                  }}
                  className={cn(
                    "relative h-16 w-16 overflow-hidden rounded-lg ring-2 transition-all",
                    tracks[0]?.cover === url ? "ring-violet-500" : "ring-transparent hover:ring-white/20"
                  )}
                >
                  <Image src={url} alt="" fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-5 flex items-center gap-2">
            <Shield size={20} className="text-violet-400" />
            <h2 className="text-lg font-semibold">Rights & Content</h2>
          </div>
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={copyrightConfirmed}
              onChange={(e) => setCopyrightConfirmed(e.target.checked)}
              className="h-4 w-4 accent-violet-600"
            />
            <span className="text-sm text-white/70">I confirm I own the rights to this music *</span>
          </label>
        </section>

        <Button type="submit" size="lg" className="w-full gap-2" disabled={submitting}>
          <Upload size={18} />
          {submitting
            ? "Uploading..."
            : config.allowsMultipleTracks
              ? `Upload & Publish ${config.label}`
              : "Upload & Publish Song"}
        </Button>
      </form>
    </div>
  );
}
