import { prisma } from "@/lib/prisma";
import { generateVerifyToken, getAppUrl, sendVerificationEmail } from "@/lib/email";
import { jsonError, jsonOk, parseBody } from "@/lib/api-utils";

export async function POST(request: Request) {
  const body = await parseBody<{ email?: string }>(request);
  if (!body?.email?.trim()) {
    return jsonError("Email is required");
  }

  const email = body.email.trim().toLowerCase();
  const artist = await prisma.artist.findUnique({ where: { email } });

  if (!artist) {
    return jsonOk({
      message: "If an unverified account exists for this email, a verification link has been sent.",
      pendingVerification: true,
    });
  }

  if (artist.emailVerified) {
    return jsonError("This account is already verified. Please sign in.", 400);
  }

  const verifyToken = generateVerifyToken();
  const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.artist.update({
    where: { id: artist.id },
    data: { verifyToken, verifyExpires },
  });

  const verifyUrl = `${getAppUrl()}/artist/verify?token=${verifyToken}`;
  const emailResult = await sendVerificationEmail(email, artist.stageName, verifyUrl);

  return jsonOk({
    message: emailResult.sent
      ? "Verification email sent. Check your inbox."
      : "Email could not be sent. Try again later.",
    emailSent: emailResult.sent,
    pendingVerification: true,
    ...(process.env.NODE_ENV === "development" && !emailResult.sent ? { verifyUrl } : {}),
  });
}
