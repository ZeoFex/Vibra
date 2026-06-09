import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";
import { setAuthCookie } from "@/lib/auth/cookies";
import { jsonError, jsonOk, parseBody } from "@/lib/api-utils";

function serializeArtist(artist: {
  id: string;
  email: string;
  stageName: string;
  legalName: string;
  genre: string;
  country: string;
  bio: string | null;
  imageUrl: string | null;
  status: string;
  emailVerified: boolean;
  createdAt: Date;
}) {
  return {
    id: artist.id,
    email: artist.email,
    stageName: artist.stageName,
    legalName: artist.legalName,
    genre: artist.genre,
    country: artist.country,
    bio: artist.bio ?? "",
    image: artist.imageUrl ?? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    status: artist.status,
    emailVerified: artist.emailVerified,
    createdAt: artist.createdAt.toISOString(),
    createdBy: "self" as const,
  };
}

export async function POST(request: Request) {
  const body = await parseBody<{ email?: string; password?: string }>(request);
  if (!body?.email?.trim() || !body?.password) {
    return jsonError("Invalid credentials", 401);
  }

  const email = body.email.trim().toLowerCase();
  const artist = await prisma.artist.findUnique({ where: { email } });
  if (!artist || !(await verifyPassword(body.password, artist.passwordHash))) {
    return jsonError("Invalid credentials", 401);
  }

  if (!artist.emailVerified) {
    return jsonError("Please verify your email before logging in. Check your inbox.", 403);
  }

  if (artist.status === "suspended") {
    return jsonError("This account has been suspended. Contact support.", 403);
  }

  const token = await signToken({ sub: artist.id, email: artist.email, aud: "artist" });
  await setAuthCookie("artist", token);

  return jsonOk({ artist: serializeArtist(artist) });
}
