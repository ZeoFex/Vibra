import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { getPasswordValidationError } from "@/lib/auth/password-requirements";
import { generateVerifyToken, getAppUrl, sendVerificationEmail } from "@/lib/email";
import { jsonError, jsonOk, parseBody } from "@/lib/api-utils";

type RegisterBody = {
  email?: string;
  password?: string;
  stageName?: string;
  legalName?: string;
  genre?: string;
  country?: string;
  bio?: string;
  imageUrl?: string;
};

async function issueVerification(email: string, stageName: string, verifyToken: string) {
  const verifyUrl = `${getAppUrl()}/artist/verify?token=${verifyToken}`;
  const emailResult = await sendVerificationEmail(email, stageName, verifyUrl);
  return { verifyUrl, emailResult };
}

export async function POST(request: Request) {
  const body = await parseBody<RegisterBody>(request);

  if (!body?.email?.trim() || !body?.password || !body?.stageName?.trim() || !body?.legalName?.trim() || !body?.genre || !body?.country?.trim() || !body?.imageUrl?.trim()) {
    return jsonError("All required fields must be filled, including profile picture");
  }

  const passwordError = getPasswordValidationError(body.password);
  if (passwordError) {
    return jsonError(passwordError);
  }

  const email = body.email.trim().toLowerCase();
  const passwordHash = await hashPassword(body.password);
  const verifyToken = generateVerifyToken();
  const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const profileData = {
    passwordHash,
    stageName: body.stageName.trim(),
    legalName: body.legalName.trim(),
    genre: body.genre,
    country: body.country.trim(),
    bio: body.bio?.trim(),
    imageUrl: body.imageUrl.trim(),
    verifyToken,
    verifyExpires,
    status: "pending" as const,
    emailVerified: false,
  };

  const existing = await prisma.artist.findUnique({ where: { email } });

  if (existing?.emailVerified) {
    return jsonError("An artist account with this email already exists. Please sign in.", 409);
  }

  let artist;
  let resent = false;

  if (existing) {
    artist = await prisma.artist.update({
      where: { id: existing.id },
      data: profileData,
    });
    resent = true;
  } else {
    artist = await prisma.artist.create({
      data: { email, ...profileData },
    });
  }

  const { verifyUrl, emailResult } = await issueVerification(email, artist.stageName, verifyToken);

  return jsonOk({
    message: emailResult.sent
      ? resent
        ? "This email is already registered but not verified. We sent a new verification link."
        : "Registration successful. Check your email to verify your account."
      : resent
        ? "This email is already registered but not verified. Email could not be sent — use the link below if running locally."
        : "Registration successful. Email could not be sent — use the verification link in server logs if running locally.",
    emailSent: emailResult.sent,
    pendingVerification: true,
    resent,
    ...(process.env.NODE_ENV === "development" && !emailResult.sent ? { verifyUrl } : {}),
  }, resent ? 200 : 201);
}
