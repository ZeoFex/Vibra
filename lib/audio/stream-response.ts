export function createAudioStreamResponse(
  data: Buffer,
  mimeType: string,
  request: Request
): Response {
  const size = data.length;

  const baseHeaders: Record<string, string> = {
    "Content-Type": mimeType,
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=3600, immutable",
  };

  const rangeHeader = request.headers.get("range");
  if (!rangeHeader) {
    return new Response(new Uint8Array(data), {
      status: 200,
      headers: {
        ...baseHeaders,
        "Content-Length": String(size),
      },
    });
  }

  const match = /^bytes=(\d*)-(\d*)$/i.exec(rangeHeader.trim());
  if (!match) {
    return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
  }

  let start = match[1] ? Number.parseInt(match[1], 10) : 0;
  let end = match[2] ? Number.parseInt(match[2], 10) : size - 1;

  if (Number.isNaN(start) || Number.isNaN(end) || start > end || start >= size) {
    return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
  }

  end = Math.min(end, size - 1);
  const chunk = data.subarray(start, end + 1);

  return new Response(new Uint8Array(chunk), {
    status: 206,
    headers: {
      ...baseHeaders,
      "Content-Range": `bytes ${start}-${end}/${size}`,
      "Content-Length": String(chunk.length),
    },
  });
}
