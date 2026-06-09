import { uploadAvatarImage } from "@/lib/cloudinary";
import { jsonError, jsonOk } from "@/lib/api-utils";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return jsonError("Profile picture file is required");
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return jsonError("Use a JPG, PNG, WebP, or GIF image");
    }

    if (file.size > MAX_BYTES) {
      return jsonError("Image must be 5MB or smaller");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadAvatarImage(buffer);

    return jsonOk({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    console.error("[upload/avatar]", err);
    return jsonError(message, 500);
  }
}
