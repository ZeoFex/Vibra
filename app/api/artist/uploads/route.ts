import { prisma } from "@/lib/prisma";
import { requireArtistSession } from "@/lib/auth/session";
import { jsonError, jsonOk, parseBody } from "@/lib/api-utils";

function serializeUpload(upload: {
  id: string;
  artistId: string;
  title: string;
  artistName: string;
  albumTitle: string;
  genre: string;
  about: string | null;
  producers: string;
  songwriters: string | null;
  featuredArtists: string | null;
  lyrics: string;
  coverUrl: string;
  audioFileName: string;
  duration: number;
  releaseDate: Date;
  explicit: boolean;
  copyrightConfirmed: boolean;
  status: string;
  submittedAt: Date;
}) {
  return {
    id: upload.id,
    title: upload.title,
    artistName: upload.artistName,
    albumTitle: upload.albumTitle,
    genre: upload.genre,
    about: upload.about ?? "",
    producers: upload.producers,
    songwriters: upload.songwriters ?? "",
    featuredArtists: upload.featuredArtists ?? "",
    lyrics: upload.lyrics,
    cover: upload.coverUrl,
    audioFileName: upload.audioFileName,
    duration: upload.duration,
    releaseDate: upload.releaseDate.toISOString().slice(0, 10),
    explicit: upload.explicit,
    copyrightConfirmed: upload.copyrightConfirmed,
    status: upload.status,
    submittedAt: upload.submittedAt.toISOString(),
    uploadedBy: upload.artistId,
  };
}

export async function GET() {
  const artist = await requireArtistSession();
  if (!artist) return jsonError("Unauthorized", 401);

  const uploads = await prisma.artistUpload.findMany({
    where: { artistId: artist.id },
    orderBy: { submittedAt: "desc" },
  });

  return jsonOk({ uploads: uploads.map(serializeUpload) });
}

export async function POST(request: Request) {
  const artist = await requireArtistSession();
  if (!artist) return jsonError("Unauthorized", 401);

  if (!artist.emailVerified || artist.status !== "active") {
    return jsonError("Your artist account must be verified and active to upload", 403);
  }

  const body = await parseBody<{
    title?: string;
    artistName?: string;
    albumTitle?: string;
    genre?: string;
    about?: string;
    producers?: string;
    songwriters?: string;
    featuredArtists?: string;
    lyrics?: string;
    cover?: string;
    audioFileName?: string;
    duration?: number;
    releaseDate?: string;
    explicit?: boolean;
    copyrightConfirmed?: boolean;
  }>(request);

  if (!body?.title?.trim() || !body?.albumTitle?.trim() || !body?.producers?.trim() || !body?.lyrics?.trim() || !body?.audioFileName) {
    return jsonError("Missing required upload fields");
  }

  if (!body.copyrightConfirmed) {
    return jsonError("You must confirm copyright ownership");
  }

  const upload = await prisma.artistUpload.create({
    data: {
      artistId: artist.id,
      title: body.title.trim(),
      artistName: (body.artistName ?? artist.stageName).trim(),
      albumTitle: body.albumTitle.trim(),
      genre: body.genre ?? artist.genre,
      about: body.about?.trim(),
      producers: body.producers.trim(),
      songwriters: body.songwriters?.trim(),
      featuredArtists: body.featuredArtists?.trim(),
      lyrics: body.lyrics.trim(),
      coverUrl: body.cover ?? "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop",
      audioFileName: body.audioFileName,
      duration: body.duration ?? 180,
      releaseDate: body.releaseDate ? new Date(body.releaseDate) : new Date(),
      explicit: body.explicit ?? false,
      copyrightConfirmed: true,
      status: "published",
    },
  });

  return jsonOk({ upload: serializeUpload(upload) }, 201);
}
