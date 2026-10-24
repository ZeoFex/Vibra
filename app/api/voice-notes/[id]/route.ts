import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserSession } from "@/lib/auth/session";

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await requireUserSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const note = await prisma.voiceNote.findFirst({ where: { id, userId: user.id } });
  if (!note) return NextResponse.json({ error: "Recording not found." }, { status: 404 });

  await prisma.voiceNote.delete({ where: { id: note.id } });
  return NextResponse.json({ ok: true });
}
