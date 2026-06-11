import { prisma } from "@/lib/prisma";
import { requireArtistSession } from "@/lib/auth/session";
import { jsonError, jsonOk } from "@/lib/api-utils";
import {
  ALLOWED_AUDIO_MIME_TYPES,
  MAX_AUDIO_BYTES,
  getUploadAudioPath,
  normalizeAudioMimeType,
} from "@/lib/audio/constants";

export const runtime = "nodejs";

function serializeUpload(upload: {
  id: string;
  artistId: string;
  title: string;
  artistName: string;
  albumTitle: string;
  releaseType: string | null;
  albumGroupId: string | null;
  trackNumber: number | null;
  genre: string;
  about: string | null;
  producers: string;
  songwriters: string | null;
  featuredArtists: string | null;
  lyrics: string | null;
  coverUrl: string;
  audioFileName: string;
  duration: number;
  releaseDate: Date;
  explicit: boolean;
  copyrightConfirmed: boolean;
  status: string;
  submittedAt: Date;
  audio?: { uploadId: string } | null;
}) {
  return {
    id: upload.id,
    title: upload.title,
    artistName: upload.artistName,
    albumTitle: upload.albumTitle,
    releaseType: upload.releaseType ?? undefined,
    albumGroupId: upload.albumGroupId ?? undefined,
    trackNumber: upload.trackNumber ?? undefined,
    genre: upload.genre,
    about: upload.about ?? "",
    producers: upload.producers,
    songwriters: upload.songwriters ?? "",
    featuredArtists: upload.featuredArtists ?? "",
    lyrics: upload.lyrics ?? "",
    cover: upload.coverUrl,
    audioFileName: upload.audioFileName,
    audioUrl: upload.audio ? getUploadAudioPath(upload.id) : undefined,
    duration: upload.duration,
    releaseDate: upload.releaseDate.toISOString().slice(0, 10),
    explicit: upload.explicit,
    copyrightConfirmed: upload.copyrightConfirmed,
    status: upload.status,
    submittedAt: upload.submittedAt.toISOString(),
    uploadedBy: upload.artistId,
  };
}

function parseBoolean(value: FormDataEntryValue | null): boolean {
  return value === "true" || value === "1" || value === "on";
}

function parseOptionalInt(value: FormDataEntryValue | null): number | undefined {
  if (value == null || value === "") return undefined;
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export async function GET() {
  const artist = await requireArtistSession();
  if (!artist) return jsonError("Unauthorized", 401);

  const uploads = await prisma.artistUpload.findMany({
    where: { artistId: artist.id },
    orderBy: { submittedAt: "desc" },
    include: {
      audio: {
        select: { uploadId: true },
      },
    },
  });

  return jsonOk({ uploads: uploads.map(serializeUpload) });
}

export async function POST(request: Request) {
  const artist = await requireArtistSession();
  if (!artist) return jsonError("Unauthorized", 401);

  if (!artist.emailVerified || artist.status !== "active") {
    return jsonError("Your artist account must be verified and active to upload", 403);
  }

  const formData = await request.formData();
  const audioFile = formData.get("audio");

  if (!(audioFile instanceof File) || audioFile.size === 0) {
    return jsonError("A valid audio file is required");
  }

  if (audioFile.size > MAX_AUDIO_BYTES) {
    return jsonError("Audio file exceeds the 50 MB limit");
  }

  const mimeType = normalizeAudioMimeType(audioFile);
  if (!ALLOWED_AUDIO_MIME_TYPES.has(mimeType) && !/\.(mp3|wav|flac|m4a|aac|ogg)$/i.test(audioFile.name)) {
    return jsonError("Unsupported audio format. Use MP3, WAV, FLAC, M4A, AAC, or OGG");
  }

  const title = String(formData.get("title") ?? "").trim();
  const albumTitle = String(formData.get("albumTitle") ?? "").trim();
  const producers = String(formData.get("producers") ?? "").trim();
  const audioFileName = String(formData.get("audioFileName") ?? audioFile.name).trim();

  if (!title || !albumTitle || !producers || !audioFileName) {
    return jsonError("Missing required upload fields");
  }

  if (!parseBoolean(formData.get("copyrightConfirmed"))) {
    return jsonError("You must confirm copyright ownership");
  }

  const durationRaw = Number.parseInt(String(formData.get("duration") ?? "180"), 10);
  const duration = Number.isFinite(durationRaw) && durationRaw > 0 ? durationRaw : 180;
  const releaseDateRaw = String(formData.get("releaseDate") ?? "");
  const releaseDate = releaseDateRaw ? new Date(releaseDateRaw) : new Date();
  const trackNumber = parseOptionalInt(formData.get("trackNumber"));

  const audioBuffer = Buffer.from(await audioFile.arrayBuffer());

  const upload = await prisma.artistUpload.create({
    data: {
      artistId: artist.id,
      title,
      artistName: String(formData.get("artistName") ?? artist.stageName).trim(),
      albumTitle,
      releaseType: String(formData.get("releaseType") ?? "").trim() || null,
      albumGroupId: String(formData.get("albumGroupId") ?? "").trim() || null,
      trackNumber,
      genre: String(formData.get("genre") ?? artist.genre).trim(),
      about: String(formData.get("about") ?? "").trim() || null,
      producers,
      songwriters: String(formData.get("songwriters") ?? "").trim() || null,
      featuredArtists: String(formData.get("featuredArtists") ?? "").trim() || null,
      lyrics: String(formData.get("lyrics") ?? "").trim() || null,
      coverUrl:
        String(formData.get("cover") ?? "").trim() ||
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop",
      audioFileName,
      duration,
      releaseDate,
      explicit: parseBoolean(formData.get("explicit")),
      copyrightConfirmed: true,
      status: "published",
      audio: {
        create: {
          data: audioBuffer,
          mimeType,
          sizeBytes: audioBuffer.length,
          storage: "database",
        },
      },
    },
    include: {
      audio: {
        select: { uploadId: true },
      },
    },
  });

  return jsonOk({ upload: serializeUpload(upload) }, 201);
}
