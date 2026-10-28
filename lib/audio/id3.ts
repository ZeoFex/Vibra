export type Id3Tags = {
  title?: string;
  artist?: string;
  album?: string;
  songwriter?: string;
  picture?: Uint8Array;
  pictureMime?: string;
};

function decodeText(encoding: number, data: Uint8Array): string {
  if (encoding === 1 || encoding === 2) {
    const start = data[0] === 0xff && data[1] === 0xfe ? 2 : 0;
    return new TextDecoder("utf-16le").decode(data.subarray(start)).replace(/\0/g, "").trim();
  }
  return new TextDecoder("utf-8").decode(data).replace(/\0/g, "").trim();
}

function readSyncsafe(bytes: Uint8Array, offset: number) {
  return ((bytes[offset] & 0x7f) << 21) | ((bytes[offset + 1] & 0x7f) << 14) | ((bytes[offset + 2] & 0x7f) << 7) | (bytes[offset + 3] & 0x7f);
}

function readU32(bytes: Uint8Array, offset: number) {
  return (bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3];
}

export function readId3(file: Uint8Array): Id3Tags {
  if (file.length < 10 || String.fromCharCode(file[0], file[1], file[2]) !== "ID3") return {};
  const version = file[3];
  const tagSize = readSyncsafe(file, 6);
  const end = Math.min(file.length, 10 + tagSize);
  const tags: Id3Tags = {};
  let offset = 10;

  while (offset + 10 < end) {
    const id = String.fromCharCode(file[offset], file[offset + 1], file[offset + 2], file[offset + 3]);
    if (!/^[A-Z0-9]{4}$/.test(id)) break;
    const size = version === 4 ? readSyncsafe(file, offset + 4) : readU32(file, offset + 4);
    const bodyStart = offset + 10;
    const bodyEnd = Math.min(end, bodyStart + size);
    if (bodyEnd <= bodyStart) break;
    const body = file.subarray(bodyStart, bodyEnd);

    if (id === "TIT2" || id === "TPE1" || id === "TALB" || id === "TCOM" || id === "TEXT") {
      const value = decodeText(body[0], body.subarray(1));
      if (id === "TIT2" && value) tags.title = value;
      if (id === "TPE1" && value) tags.artist = value;
      if (id === "TALB" && value) tags.album = value;
      if ((id === "TEXT" || id === "TCOM") && value && !tags.songwriter) tags.songwriter = value;
    }

    if (id === "APIC" && !tags.picture) {
      const encoding = body[0];
      const mimeEnd = body.indexOf(0, 1);
      if (mimeEnd > 1) {
        const mime = new TextDecoder("ascii").decode(body.subarray(1, mimeEnd));
        let cursor = mimeEnd + 2;
        if (encoding === 1 || encoding === 2) {
          while (cursor + 1 < body.length && !(body[cursor] === 0 && body[cursor + 1] === 0)) cursor += 2;
          cursor += 2;
        } else {
          const descEnd = body.indexOf(0, cursor);
          cursor = descEnd === -1 ? cursor : descEnd + 1;
        }
        if (cursor < body.length) {
          tags.picture = body.subarray(cursor);
          tags.pictureMime = mime;
        }
      }
    }

    offset = bodyEnd;
  }

  return tags;
}
