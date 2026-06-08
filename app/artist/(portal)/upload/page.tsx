"use client";

import { ArtistUploadForm } from "@/components/artist/upload-form";

export default function ArtistUploadPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white/80">Upload New Music</h2>
        <p className="text-sm text-white/50">
          Add track details, credits, lyrics, and files. Published songs appear on the listener home feed.
        </p>
      </div>
      <ArtistUploadForm />
    </div>
  );
}
