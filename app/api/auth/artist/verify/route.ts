import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api-utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) return jsonError("Verification token is required");

  const artist = await prisma.artist.findFirst({
    where: { verifyToken: token },
  });

  if (!artist) return jsonError("Invalid or expired verification link", 400);

  if (artist.verifyExpires && artist.verifyExpires < new Date()) {
    return jsonError("Verification link has expired. Please register again.", 400);
  }

  if (artist.emailVerified) {
    return jsonOk({ message: "Email already verified. You can log in.", alreadyVerified: true });
  }

  await prisma.artist.update({
    where: { id: artist.id },
    data: {
      emailVerified: true,
      status: "active",
      verifyToken: null,
      verifyExpires: null,
    },
  });

  return jsonOk({ message: "Email verified successfully. You can now log in." });
}
