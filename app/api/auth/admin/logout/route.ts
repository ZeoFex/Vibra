import { clearAuthCookie } from "@/lib/auth/cookies";
import { jsonOk } from "@/lib/api-utils";

export async function POST() {
  await clearAuthCookie("admin");
  return jsonOk({ ok: true });
}
