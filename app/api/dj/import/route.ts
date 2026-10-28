import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { requireUserSession } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";
import { jsonError, jsonOk } from "@/lib/api-utils";
import { uploadCatalogAudio, uploadCatalogImage } from "@/lib/cloudinary";
import { ALLOWED_AUDIO_MIME_TYPES, MAX_AUDIO_BYTES, normalizeAudioMimeType } from "@/lib/audio/constants";
import { readId3 } from "@/lib/audio/id3";
import type { Song } from "@/types";

export const runtime = "nodejs";

const CATALOG_EMAIL = "catalog@vibra.local";

async function catalogArtistId() {
  const existing = await prisma.artist.findUnique({ where: { email: CATALOG_EMAIL } });
  if (existing) return existing.id;
  const created = await prisma.artist.create({
    data: {
      email: CATALOG_EMAIL,
      passwordHash: await hashPassword(randomUUID()),
      stageName: "Vibra Catalog",
      legalName: "Vibra Catalog",
      genre: "Various",
      country: "Ghana",
      status: "active",
      emailVerified: true,
    },
  });
  return created.id;
}

function titleFromFile(name: string) {
  return name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();
}

function asSong(upload: {
  id: string;
  title: string;
  artistName: string;
  albumTitle: string;
  coverUrl: string;
  duration: number;
  genre: string;
  releaseDate: Date;
  audioUrl: string | null;
  albumGroupId: string | null;
}): Song {
  return {
    id: upload.id,
    title: upload.title,
    artistId: `upload-artist-${encodeURIComponent(upload.artistName)}`,
    artistName: upload.artistName,
    albumId: upload.albumGroupId ?? upload.id,
    albumTitle: upload.albumTitle,
    cover: upload.coverUrl,
    duration: upload.duration,
    genre: upload.genre,
    plays: 0,
    releaseDate: upload.releaseDate.toISOString().slice(0, 10),
    audioUrl: upload.audioUrl ?? undefined,
  };
}

export async function POST(request: Request) {
  const user = await requireUserSession();
  if (!user) return jsonError("Sign in to add songs from this device", 401);

  const formData = await request.formData();
  if (formData.get("copyrightConfirmed") !== "true") {
    return jsonError("Confirm you have the right to add this song to Vibra");
  }
  const file = formData.get("audio");
  if (!(file instanceof File) || file.size <= 0) return jsonError("Choose an audio file");
  if (file.size > MAX_AUDIO_BYTES) return jsonError("File is over 50 MB");

  const mimeType = normalizeAudioMimeType(file);
  if (!ALLOWED_AUDIO_MIME_TYPES.has(mimeType) && !/\.(mp3|wav|flac|m4a|aac|ogg)$/i.test(file.name)) {
    return jsonError("Unsupported audio format");
  }

  const audioBuffer = Buffer.from(await file.arrayBuffer());
  const tags = readId3(audioBuffer);
  const title = String(formData.get("title") ?? "").trim() || tags.title || titleFromFile(file.name);
  const artistName = String(formData.get("artistName") ?? "").trim() || tags.artist || "Unknown artist";
  const durationRaw = Number.parseInt(String(formData.get("duration") ?? "0"), 10);

  const existing = await prisma.artistUpload.findFirst({
    where: {
      title: { equals: title, mode: "insensitive" },
      artistName: { equals: artistName, mode: "insensitive" },
      status: "published",
    },
  });
  if (existing) return jsonOk({ saved: false, song: asSong(existing) });

  let coverUrl = "/vibra-logo.jpg";
  if (tags.picture && tags.picture.length > 32) {
    coverUrl = await uploadCatalogImage(Buffer.from(tags.picture));
  }
  const audioUrl = await uploadCatalogAudio(audioBuffer, file.name);
  const created = await prisma.artistUpload.create({
    data: {
      artistId: await catalogArtistId(),
      title,
      artistName,
      albumTitle: tags.album || title,
      releaseType: "single",
      albumGroupId: randomUUID(),
      trackNumber: 1,
      genre: "Music",
      producers: artistName,
      songwriters: tags.songwriter || null,
      coverUrl,
      audioFileName: file.name,
      audioUrl,
      duration: Number.isFinite(durationRaw) && durationRaw > 0 ? durationRaw : 180,
      releaseDate: new Date(),
      explicit: false,
      copyrightConfirmed: true,
      status: "published",
    },
  });

  return jsonOk({ saved: true, song: asSong(created) });
}
