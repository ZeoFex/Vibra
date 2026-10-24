import { prisma } from "@/lib/prisma";
import { requireUserSession } from "@/lib/auth/session";
import { jsonError, jsonOk } from "@/lib/api-utils";

export async function GET() {
  const me = await requireUserSession();
  if (!me) return jsonError("Unauthorized", 401);

  const rows = await prisma.appNotification.findMany({
    where: { userId: me.id },
    orderBy: { createdAt: "desc" },
    take: 40,
  });

  return jsonOk({
    notifications: rows.map((row) => ({
      id: row.id,
      type: row.type,
      title: row.title,
      message: row.message,
      read: row.read,
      createdAt: row.createdAt.toISOString(),
      link: row.link ?? undefined,
    })),
  });
}

export async function PATCH(request: Request) {
  const me = await requireUserSession();
  if (!me) return jsonError("Unauthorized", 401);
  const body = (await request.json()) as { id?: string; all?: boolean };

  if (body.all) {
    await prisma.appNotification.updateMany({ where: { userId: me.id, read: false }, data: { read: true } });
    return jsonOk({ ok: true });
  }

  if (!body.id) return jsonError("Missing notification", 400);
  await prisma.appNotification.updateMany({
    where: { id: body.id, userId: me.id },
    data: { read: true },
  });
  return jsonOk({ ok: true });
}
