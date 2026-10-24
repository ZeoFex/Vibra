import { requireUserSession } from "@/lib/auth/session";
import { jsonError, jsonOk } from "@/lib/api-utils";
import { publicUser } from "@/app/api/auth/settings/route";

export async function GET() {
  const user = await requireUserSession();
  if (!user) return jsonError("Unauthorized", 401);

  return jsonOk({ user: publicUser(user) });
}
