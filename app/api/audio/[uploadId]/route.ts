import { prisma } from "@/lib/prisma";
import { createAudioStreamResponse } from "@/lib/audio/stream-response";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ uploadId: string }> }
) {
  const { uploadId } = await params;

  const record = await prisma.artistUpload.findFirst({
    where: {
      id: uploadId,
      status: "published",
    },
    select: {
      audio: {
        select: {
          data: true,
          mimeType: true,
        },
      },
    },
  });

  if (!record?.audio) {
    return new Response("Audio not found", { status: 404 });
  }

  const buffer = Buffer.from(record.audio.data);
  return createAudioStreamResponse(buffer, record.audio.mimeType, request);
}
