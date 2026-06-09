"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop";

interface ProfilePicturePickerProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  label?: string;
  className?: string;
}

export function ProfilePicturePicker({
  file,
  onFileChange,
  label = "Profile picture",
  className,
}: ProfilePicturePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(DEFAULT_AVATAR);

  useEffect(() => {
    if (!file) {
      setPreview(DEFAULT_AVATAR);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <p className="text-sm text-white/70">{label} *</p>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="group relative h-24 w-24 overflow-hidden rounded-full border-2 border-dashed border-white/20 bg-white/5 transition-colors hover:border-violet-500"
      >
        <Image src={preview} alt="Profile preview" fill className="object-cover" sizes="96px" />
        <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          <Camera size={22} className="text-white" />
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
      />
      <p className="text-center text-xs text-white/40">
        {file ? file.name : "Tap to add a photo (max 5MB)"}
      </p>
    </div>
  );
}
