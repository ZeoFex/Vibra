"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Plus, Pencil, Trash2 } from "lucide-react";
import { usePlaylists } from "@/lib/contexts/playlist-context";
import { Button } from "@/components/ui/button";

export function PlaylistMenu({ playlistId, onDeleted }: { playlistId: string; onDeleted?: () => void }) {
  const { getPlaylist, updatePlaylist, deletePlaylist } = usePlaylists();
  const router = useRouter();
  const playlist = getPlaylist(playlistId);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(playlist?.title ?? "");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [open]);

  if (!playlist) return null;

  return (
    <div ref={rootRef} className="relative" onClick={(event) => event.preventDefault()}>
      <button
        type="button"
        aria-label="Playlist options"
        className="flex h-8 w-8 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setTitle(playlist.title);
          setOpen((value) => !value);
        }}
      >
        <MoreHorizontal size={18} />
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-44 rounded-lg border border-white/10 bg-zinc-900 py-1 shadow-xl">
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-white/10"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setOpen(false);
              router.push(`/playlist/${playlistId}?add=1`);
            }}
          >
            <Plus size={14} /> Add song
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-white/10"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setEditing(true);
              setOpen(false);
            }}
          >
            <Pencil size={14} /> Edit
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-300 hover:bg-white/10"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              deletePlaylist(playlistId);
              setOpen(false);
              onDeleted?.();
            }}
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}
      {editing && (
        <form
          className="absolute right-0 z-20 mt-1 w-56 rounded-lg border border-white/10 bg-zinc-900 p-3 shadow-xl"
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            updatePlaylist(playlistId, title);
            setEditing(false);
          }}
          onClick={(event) => event.stopPropagation()}
        >
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="h-10 w-full rounded-md bg-white/10 px-2 text-sm outline-none"
            autoFocus
          />
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
            <Button type="submit" size="sm">Save</Button>
          </div>
        </form>
      )}
    </div>
  );
}
