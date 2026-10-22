import { prisma } from "@/lib/prisma";
import { generateVerifyToken, getAppUrl, sendPasswordResetEmail } from "@/lib/email";
import { jsonError, jsonOk, parseBody } from "@/lib/api-utils";

export async function POST(request: Request) {
  const body = await parseBody<{ email?: string }>(request);
  if (!body?.email?.trim()) {
    return jsonError("Email is required");
  }

  const email = body.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return jsonOk({
      message: "If an account exists for this email, a reset link has been sent.",
      emailSent: true,
    });
  }

  const verifyToken = generateVerifyToken();
  const verifyExpires = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: { verifyToken, verifyExpires },
  });

  const resetUrl = `${getAppUrl()}/reset-password?token=${verifyToken}`;
  const emailResult = await sendPasswordResetEmail(email, user.name, resetUrl);

  if (!emailResult.sent) {
    return jsonError(emailResult.error ?? "Failed to send reset email", 502);
  }

  return jsonOk({
    message: "Password reset email sent. Check your inbox.",
    emailSent: true,
  });
}
