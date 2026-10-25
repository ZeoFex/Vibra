import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserSession } from "@/lib/auth/session";

export async function GET() {
  const user = await requireUserSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const listens = await prisma.listen.findMany({
    where: { userId: user.id },
    orderBy: [{ plays: "desc" }, { updatedAt: "desc" }],
    take: 100,
  });

  const totalPlays = listens.reduce((sum, listen) => sum + listen.plays, 0);
  return NextResponse.json({
    totalPlays,
    songs: listens.length,
    listens: listens.map((listen) => ({
      songId: listen.songId,
      title: listen.title,
      artistName: listen.artistName,
      cover: listen.cover,
      plays: listen.plays,
    })),
  });
}

export async function POST(request: Request) {
  const user = await requireUserSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as { songId?: string; title?: string; artistName?: string; cover?: string };
  if (!body.songId || !body.title) return NextResponse.json({ error: "Missing song" }, { status: 400 });

  const listen = await prisma.listen.upsert({
    where: { userId_songId: { userId: user.id, songId: body.songId } },
    create: {
      userId: user.id,
      songId: body.songId,
      title: body.title,
      artistName: body.artistName || "Unknown",
      cover: body.cover || "",
      plays: 1,
    },
    update: { plays: { increment: 1 }, title: body.title, artistName: body.artistName || "Unknown", cover: body.cover || "" },
  });

  return NextResponse.json({ plays: listen.plays });
}
