import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";
import { jsonError, jsonOk } from "@/lib/api-utils";
import { hasPermission } from "@/types/admin";
import { uploadCatalogAudio, uploadCatalogImage } from "@/lib/cloudinary";
import { ALLOWED_AUDIO_MIME_TYPES, MAX_AUDIO_BYTES, normalizeAudioMimeType } from "@/lib/audio/constants";
import { getReleaseTypeConfig, type ReleaseType } from "@/lib/constants/release-types";

export const runtime = "nodejs";

const CATALOG_EMAIL = "catalog@vibra.local";
const BATCH_LIMIT = 40;

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

export async function POST(request: Request) {
  const admin = await requireAdminSession();
  if (!admin || !hasPermission(admin.role, "music-review")) return jsonError("Unauthorized", 401);

  const formData = await request.formData();
  if (formData.get("copyrightConfirmed") !== "true") {
    return jsonError("Confirm you have the right to post this music");
  }

  const releaseType = String(formData.get("releaseType") ?? "album") as ReleaseType;
  const config = getReleaseTypeConfig(releaseType);
  const albumTitle = String(formData.get("albumTitle") ?? "").trim();
  const artistName = String(formData.get("artistName") ?? "").trim();
  const genre = String(formData.get("genre") ?? "Music").trim();
  const producers = String(formData.get("producers") ?? "Unknown").trim() || "Unknown";
  const about = String(formData.get("about") ?? "").trim();
  const releaseDateRaw = String(formData.get("releaseDate") ?? "");
  const releaseDate = releaseDateRaw ? new Date(releaseDateRaw) : new Date();
  const cover = formData.get("cover");
  const audioFiles = formData.getAll("audio").filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (!albumTitle || !artistName) return jsonError("Release title and artist name are required");
  if (!(cover instanceof File) || cover.size === 0) return jsonError("A cover image is required");
  if (audioFiles.length < config.minTracks) return jsonError(`Add at least ${config.minTracks} track(s) for a ${config.label}`);
  if (audioFiles.length > BATCH_LIMIT) return jsonError(`Upload at most ${BATCH_LIMIT} tracks at a time`);

  const artistId = await catalogArtistId();
  const coverUrl = await uploadCatalogImage(Buffer.from(await cover.arrayBuffer()));
  const albumGroupId = randomUUID();
  const created: string[] = [];
  const skipped: { title: string; reason: string }[] = [];

  for (const [index, file] of audioFiles.entries()) {
    const title = String(formData.get(`title-${index}`) ?? "").trim() || titleFromFile(file.name);
    const mimeType = normalizeAudioMimeType(file);
    if (file.size > MAX_AUDIO_BYTES) {
      skipped.push({ title, reason: "File is over 50 MB" });
      continue;
    }
    if (!ALLOWED_AUDIO_MIME_TYPES.has(mimeType) && !/\.(mp3|wav|flac|m4a|aac|ogg)$/i.test(file.name)) {
      skipped.push({ title, reason: "Unsupported audio format" });
      continue;
    }

    const duplicate = await prisma.artistUpload.findFirst({
      where: {
        title: { equals: title, mode: "insensitive" },
        artistName: { equals: artistName, mode: "insensitive" },
        status: { not: "rejected" },
      },
      select: { id: true },
    });
    if (duplicate) {
      skipped.push({ title, reason: "Already on Vibra" });
      continue;
    }

    const audioUrl = await uploadCatalogAudio(Buffer.from(await file.arrayBuffer()), file.name);
    const durationRaw = Number.parseInt(String(formData.get(`duration-${index}`) ?? "0"), 10);
    await prisma.artistUpload.create({
      data: {
        artistId,
        title,
        artistName,
        albumTitle,
        releaseType,
        albumGroupId,
        trackNumber: index + 1,
        genre,
        about: about || null,
        producers,
        songwriters: String(formData.get("songwriters") ?? "").trim() || null,
        featuredArtists: String(formData.get("featuredArtists") ?? "").trim() || null,
        lyrics: null,
        coverUrl,
        audioFileName: file.name,
        audioUrl,
        duration: Number.isFinite(durationRaw) && durationRaw > 0 ? durationRaw : 180,
        releaseDate,
        explicit: formData.get(`explicit-${index}`) === "true",
        copyrightConfirmed: true,
        status: "published",
      },
    });
    created.push(title);
  }

  return jsonOk({ created: created.length, skipped, albumGroupId });
}
