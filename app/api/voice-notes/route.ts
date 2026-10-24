import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserSession } from "@/lib/auth/session";
import { uploadVoiceAudio } from "@/lib/cloudinary";

export async function GET() {
  const user = await requireUserSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const notes = await prisma.voiceNote.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({
    notes: notes.map((note) => ({
      id: note.id,
      audioUrl: note.audioUrl,
      createdAt: note.createdAt.toISOString(),
    })),
  });
}

export async function POST(request: Request) {
  const user = await requireUserSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await request.formData();
  const file = form.get("audio");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Record a short voice note first." }, { status: 400 });
  }
  if (file.size > 4_000_000) {
    return NextResponse.json({ error: "That recording is too long." }, { status: 400 });
  }

  try {
    const audioUrl = await uploadVoiceAudio(Buffer.from(await file.arrayBuffer()));
    const note = await prisma.voiceNote.create({
      data: { userId: user.id, audioUrl },
    });

    return NextResponse.json({
      note: { id: note.id, audioUrl: note.audioUrl, createdAt: note.createdAt.toISOString() },
    });
  } catch (error) {
    console.error("voice note save failed", error);
    return NextResponse.json({ error: "Could not save your recording." }, { status: 500 });
  }
}
