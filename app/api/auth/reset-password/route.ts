import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { getPasswordValidationError } from "@/lib/auth/password-requirements";
import { jsonError, jsonOk, parseBody } from "@/lib/api-utils";

export async function POST(request: Request) {
  const body = await parseBody<{ token?: string; password?: string }>(request);
  if (!body?.token?.trim() || !body?.password) {
    return jsonError("Reset link and a new password are required");
  }

  const passwordError = getPasswordValidationError(body.password);
  if (passwordError) return jsonError(passwordError);

  const user = await prisma.user.findFirst({
    where: { verifyToken: body.token.trim() },
  });

  if (!user || !user.verifyExpires || user.verifyExpires.getTime() < Date.now()) {
    return jsonError("This reset link is invalid or has expired", 400);
  }

  const passwordHash = await hashPassword(body.password);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      verifyToken: null,
      verifyExpires: null,
    },
  });

  return jsonOk({ message: "Password updated. You can sign in now." });
}
