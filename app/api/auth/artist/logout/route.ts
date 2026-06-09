import { clearAuthCookie } from "@/lib/auth/cookies";
import { jsonOk } from "@/lib/api-utils";

export async function POST() {
  await clearAuthCookie("artist");
  return jsonOk({ ok: true });
}
