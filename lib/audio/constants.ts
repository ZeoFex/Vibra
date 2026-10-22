/** Max audio upload size stored in Neon (50 MB). */
export const MAX_AUDIO_BYTES = 50 * 1024 * 1024;

export const ALLOWED_AUDIO_MIME_TYPES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
  "audio/flac",
  "audio/x-flac",
  "audio/mp4",
  "audio/aac",
  "audio/ogg",
  "audio/webm",
]);

export function getUploadAudioPath(uploadId: string): string {
  return `/api/audio/${uploadId}`;
}

export function normalizeAudioMimeType(file: File): string {
  if (file.type && ALLOWED_AUDIO_MIME_TYPES.has(file.type)) return file.type;

  const ext = file.name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "mp3":
      return "audio/mpeg";
    case "wav":
      return "audio/wav";
    case "flac":
      return "audio/flac";
    case "m4a":
    case "aac":
      return "audio/mp4";
    case "ogg":
      return "audio/ogg";
    default:
      return file.type || "audio/mpeg";
  }
}

export function isAllowedAudioFile(file: File): boolean {
  const mime = normalizeAudioMimeType(file);
  return ALLOWED_AUDIO_MIME_TYPES.has(mime) || /\.(mp3|wav|flac|m4a|aac|ogg)$/i.test(file.name);
}
