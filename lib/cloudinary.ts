import { v2 as cloudinary } from "cloudinary";

let configured = false;

function ensureConfigured() {
  if (configured) return;
  const url = process.env.CLOUDINARY_URL?.trim();
  if (!url) {
    throw new Error("CLOUDINARY_URL is not configured");
  }
  cloudinary.config({ cloudinary_url: url, secure: true });
  configured = true;
}

export async function uploadAvatarImage(
  buffer: Buffer,
  folder = "vibra/avatars"
): Promise<string> {
  ensureConfigured();

  const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [{ width: 400, height: 400, crop: "fill", gravity: "auto" }],
      },
      (error, uploadResult) => {
        if (error || !uploadResult?.secure_url) {
          reject(error ?? new Error("Upload failed"));
          return;
        }
        resolve(uploadResult as { secure_url: string });
      }
    );
    stream.end(buffer);
  });

  return result.secure_url;
}
