import { SignJWT, jwtVerify } from "jose";

export type TokenAudience = "user" | "admin" | "artist";

export interface TokenPayload {
  sub: string;
  email: string;
  role?: string;
  aud: TokenAudience;
}

function getSecret(audience: TokenAudience): Uint8Array {
  const secret =
    audience === "admin"
      ? process.env.ADMIN_JWT_SECRET ?? process.env.JWT_SECRET
      : process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT secret is not configured");
  return new TextEncoder().encode(secret);
}

export async function signToken(
  payload: Omit<TokenPayload, "aud"> & { aud: TokenAudience },
  expiresIn = "7d"
): Promise<string> {
  return new SignJWT({ email: payload.email, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setAudience(payload.aud)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecret(payload.aud));
}

export async function verifyToken(
  token: string,
  audience: TokenAudience
): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(audience), {
      audience,
    });
    if (!payload.sub || typeof payload.email !== "string") return null;
    return {
      sub: payload.sub,
      email: payload.email,
      role: typeof payload.role === "string" ? payload.role : undefined,
      aud: audience,
    };
  } catch {
    return null;
  }
}
