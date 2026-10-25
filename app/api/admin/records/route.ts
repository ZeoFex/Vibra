import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth/session";
import { jsonError, jsonOk, parseBody } from "@/lib/api-utils";
import type { ArtistStatus, UploadStatus } from "@/app/generated/prisma/enums";

export const runtime = "nodejs";

function artistStatus(status: ArtistStatus) {
  if (status === "active") return "verified";
  if (status === "suspended") return "suspended";
  return "pending";
}

function musicStatus(status: UploadStatus) {
  if (status === "published") return "approved";
  if (status === "rejected") return "rejected";
  if (status === "draft") return "changes_requested";
  return "pending";
}

export async function GET() {
  const admin = await requireAdminSession();
  if (!admin) return jsonError("Unauthorized", 401);

  const [artists, uploads, listens] = await Promise.all([
    prisma.artist.findMany({
      where: { email: { not: "catalog@vibra.local" } },
      include: { uploads: { select: { id: true, title: true, audioUrl: true, status: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.artistUpload.findMany({
      include: { artist: { select: { stageName: true } } },
      orderBy: { submittedAt: "desc" },
    }),
    prisma.listen.groupBy({
      by: ["artistName"],
      _sum: { plays: true },
    }),
  ]);

  const plays = new Map(listens.map((row) => [row.artistName, row._sum.plays ?? 0]));

  return jsonOk({
    applications: artists.map((artist) => ({
      id: artist.id,
      stageName: artist.stageName,
      legalName: artist.legalName,
      email: artist.email,
      phone: "",
      country: artist.country,
      profilePhoto: artist.imageUrl || "",
      bio: artist.bio || "",
      socialLinks: [],
      sampleSongUrls: artist.uploads.map((upload) => upload.title),
      documents: [],
      status: artistStatus(artist.status),
      submittedAt: artist.createdAt.toISOString(),
      adminNotes: [],
      history: [{ action: "Account created", by: artist.stageName, at: artist.createdAt.toISOString() }],
      songCount: artist.uploads.length,
      genre: artist.genre,
    })),
    musicQueue: uploads.map((upload) => ({
      id: upload.id,
      title: upload.title,
      artistName: upload.artistName || upload.artist.stageName,
      artistId: upload.artistId,
      album: upload.albumTitle,
      genre: upload.genre,
      coverArt: upload.coverUrl,
      audioUrl: upload.audioUrl || upload.audioFileName,
      lyrics: upload.lyrics || undefined,
      explicit: upload.explicit,
      copyrightConfirmed: upload.copyrightConfirmed,
      releaseDate: upload.releaseDate.toISOString().slice(0, 10),
      status: musicStatus(upload.status),
      submittedAt: upload.submittedAt.toISOString(),
      adminNotes: [],
    })),
    payouts: artists.map((artist) => ({
      id: artist.id,
      artistId: artist.id,
      artistName: artist.stageName,
      totalStreams: plays.get(artist.stageName) ?? 0,
      estimatedEarnings: 0,
      approvedAmount: 0,
      status: "pending" as const,
      paymentMethod: "Not set",
      paymentDetails: "",
      period: "All time",
    })),
  });
}

export async function PATCH(request: Request) {
  const admin = await requireAdminSession();
  if (!admin) return jsonError("Unauthorized", 401);
  const body = await parseBody<{ kind?: string; id?: string; status?: string }>(request);
  if (!body?.id || !body.kind || !body.status) return jsonError("Missing update");

  if (body.kind === "artist") {
    const status: ArtistStatus =
      body.status === "approved" || body.status === "verified" || body.status === "active"
        ? "active"
        : body.status === "suspended" || body.status === "rejected"
          ? "suspended"
          : "pending";
    await prisma.artist.update({ where: { id: body.id }, data: { status } });
    return jsonOk({ ok: true });
  }

  if (body.kind === "upload") {
    const status: UploadStatus =
      body.status === "approved" || body.status === "published"
        ? "published"
        : body.status === "rejected"
          ? "rejected"
          : body.status === "changes_requested" || body.status === "draft"
            ? "draft"
            : "pending";
    await prisma.artistUpload.update({ where: { id: body.id }, data: { status } });
    return jsonOk({ ok: true });
  }

  return jsonError("Unknown update");
}
