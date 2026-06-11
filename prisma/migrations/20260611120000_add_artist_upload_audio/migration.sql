-- CreateTable
CREATE TABLE "artist_upload_audio" (
    "upload_id" TEXT NOT NULL,
    "data" BYTEA NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "storage" TEXT NOT NULL DEFAULT 'database',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "artist_upload_audio_pkey" PRIMARY KEY ("upload_id")
);

-- AddForeignKey
ALTER TABLE "artist_upload_audio" ADD CONSTRAINT "artist_upload_audio_upload_id_fkey" FOREIGN KEY ("upload_id") REFERENCES "artist_uploads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
