import { clearAuthCookie } from "@/lib/auth/cookies";
import { jsonOk } from "@/lib/api-utils";

export async function POST() {
  await clearAuthCookie("user");
  return jsonOk({ ok: true });
}
