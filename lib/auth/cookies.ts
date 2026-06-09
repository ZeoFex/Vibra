import { cookies } from "next/headers";
import type { TokenAudience } from "./jwt";

const COOKIE_NAMES: Record<TokenAudience, string> = {
  user: "vibra_user_token",
  admin: "vibra_admin_token",
  artist: "vibra_artist_token",
};

export function getCookieName(audience: TokenAudience): string {
  return COOKIE_NAMES[audience];
}

export async function setAuthCookie(audience: TokenAudience, token: string) {
  const store = await cookies();
  store.set(COOKIE_NAMES[audience], token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAuthCookie(audience: TokenAudience) {
  const store = await cookies();
  store.delete(COOKIE_NAMES[audience]);
}

export async function getAuthToken(audience: TokenAudience): Promise<string | undefined> {
  const store = await cookies();
  return store.get(COOKIE_NAMES[audience])?.value;
}
