export async function uploadProfilePicture(
  file: File
): Promise<{ ok: boolean; url?: string; error?: string }> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch("/api/upload/avatar", {
      method: "POST",
      body: formData,
    });
    const data = (await res.json()) as { url?: string; error?: string };
    if (!res.ok) return { ok: false, error: data.error ?? "Upload failed" };
    if (!data.url) return { ok: false, error: "Upload failed" };
    return { ok: true, url: data.url };
  } catch {
    return { ok: false, error: "Unable to upload profile picture" };
  }
}
