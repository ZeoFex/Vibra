"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader, useConfirmModal, FilterTabs } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PostedUpload = {
  id: string;
  title: string;
  artistName: string;
  albumTitle: string;
  albumGroupId: string | null;
  releaseType: string | null;
  genre: string;
  songwriters: string | null;
  coverUrl: string;
  status: string;
  submittedAt: string;
};

type Category = "all" | "singles" | "albums";

function isSingle(upload: PostedUpload) {
  return (upload.releaseType ?? "single") === "single";
}

export default function AdminCatalogPage() {
  const [posted, setPosted] = useState<PostedUpload[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [category, setCategory] = useState<Category>("all");
  const [genre, setGenre] = useState("all");
  const { confirm, modal } = useConfirmModal();

  function loadPosted() {
    fetch("/api/admin/catalog", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data?.uploads) setPosted(data.uploads); })
      .catch(() => undefined);
  }

  useEffect(() => { loadPosted(); }, []);

  const savePosted = async (upload: PostedUpload, scope: "song" | "album") => {
    await fetch(`/api/admin/catalog/${upload.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ ...upload, scope }),
    });
    setEditing(null);
    loadPosted();
  };

  const removePosted = (upload: PostedUpload, scope: "song" | "album") => {
    const label = scope === "album" ? upload.albumTitle : upload.title;
    confirm({
      title: scope === "album" ? "Delete this album?" : "Delete this song?",
      message: scope === "album"
        ? `"${label}" and every song on it will be removed from Vibra. This cannot be undone.`
        : `"${label}" will be removed from Vibra. This cannot be undone.`,
      confirmLabel: scope === "album" ? "Delete album" : "Delete song",
      destructive: true,
      onConfirm: () => {
        void fetch(`/api/admin/catalog/${upload.id}?scope=${scope}`, { method: "DELETE", credentials: "include" }).then(() => loadPosted());
      },
    });
  };

  const genres = useMemo(() => ["all", ...new Set(posted.map((upload) => upload.genre).filter(Boolean))], [posted]);
  const filtered = posted.filter((upload) => {
    if (genre !== "all" && upload.genre !== genre) return false;
    if (category === "singles" && !isSingle(upload)) return false;
    if (category === "albums" && isSingle(upload)) return false;
    return true;
  });

  const groups = new Map<string, PostedUpload[]>();
  for (const upload of filtered) {
    const key = isSingle(upload) ? `single:${upload.id}` : upload.albumGroupId || upload.id;
    groups.set(key, [...(groups.get(key) ?? []), upload]);
  }
  const singles = [...groups.values()].filter((group) => isSingle(group[0]));
  const albums = [...groups.values()].filter((group) => !isSingle(group[0]));

  return (
    <div className="space-y-6">
      {modal}
      <PageHeader
        title="Uploaded music"
        description="Songs and albums posted from the admin catalog"
        actions={<Link href="/admin/uploads" className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium hover:bg-violet-500">Upload more</Link>}
      />

      <FilterTabs
        tabs={[
          { id: "all" as const, label: "All", count: posted.length },
          { id: "singles" as const, label: "Singles", count: posted.filter(isSingle).length },
          { id: "albums" as const, label: "Albums", count: posted.filter((upload) => !isSingle(upload)).length },
        ]}
        active={category}
        onChange={setCategory}
      />

      <div className="flex gap-2 overflow-x-auto pb-1">
        {genres.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setGenre(item)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs ${genre === item ? "bg-white text-black" : "bg-white/10 text-white/70"}`}
          >
            {item === "all" ? "All genres" : item}
          </button>
        ))}
      </div>

      {category !== "albums" && (
        <section className="space-y-3">
          <h2 className="font-semibold">Singles</h2>
          {singles.length === 0 && <p className="text-sm text-white/40">No singles in this view.</p>}
          {singles.map((group) => group.map((upload) => (
            <TrackRow key={upload.id} upload={upload} editing={editing} setEditing={setEditing} setPosted={setPosted} savePosted={savePosted} removePosted={removePosted} />
          )))}
        </section>
      )}

      {category !== "singles" && (
        <section className="space-y-4">
          <h2 className="font-semibold">Albums</h2>
          {albums.length === 0 && <p className="text-sm text-white/40">No albums in this view.</p>}
          {albums.map((group) => {
            const first = group[0];
            return (
              <div key={first.albumGroupId || first.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    {first.coverUrl ? <img src={first.coverUrl} alt="" className="h-14 w-14 rounded-lg object-cover" /> : <span className="h-14 w-14 rounded-lg bg-white/10" />}
                    <div>
                      <p className="font-medium">{first.albumTitle}</p>
                      <p className="text-xs text-white/50">{first.artistName} · {first.genre} · {group.length} songs</p>
                    </div>
                  </div>
                  <button type="button" className="text-sm text-red-400" onClick={() => removePosted(first, "album")}>Delete album</button>
                </div>
                <div className="space-y-2">
                  {group.map((upload) => (
                    <TrackRow key={upload.id} upload={upload} editing={editing} setEditing={setEditing} setPosted={setPosted} savePosted={savePosted} removePosted={removePosted} />
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}

function TrackRow({
  upload,
  editing,
  setEditing,
  setPosted,
  savePosted,
  removePosted,
}: {
  upload: PostedUpload;
  editing: string | null;
  setEditing: (id: string | null) => void;
  setPosted: React.Dispatch<React.SetStateAction<PostedUpload[]>>;
  savePosted: (upload: PostedUpload, scope: "song" | "album") => Promise<void>;
  removePosted: (upload: PostedUpload, scope: "song" | "album") => void;
}) {
  if (editing === upload.id) {
    return (
      <div className="grid gap-2 rounded-lg bg-black/30 p-3">
        <Input value={upload.title} onChange={(event) => setPosted((current) => current.map((item) => item.id === upload.id ? { ...item, title: event.target.value } : item))} />
        <Input value={upload.artistName} onChange={(event) => setPosted((current) => current.map((item) => item.id === upload.id ? { ...item, artistName: event.target.value } : item))} />
        <Input value={upload.albumTitle} onChange={(event) => setPosted((current) => current.map((item) => item.id === upload.id ? { ...item, albumTitle: event.target.value } : item))} />
        <Input value={upload.songwriters ?? ""} placeholder="Songwriter" onChange={(event) => setPosted((current) => current.map((item) => item.id === upload.id ? { ...item, songwriters: event.target.value } : item))} />
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => void savePosted(upload, "song")}>Save song</Button>
          <Button size="sm" variant="secondary" onClick={() => void savePosted(upload, "album")}>Apply artist and album to all tracks</Button>
          <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-black/20 px-3 py-2">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{upload.title}</p>
        <p className="truncate text-xs text-white/45">{upload.artistName} · {upload.genre}{upload.songwriters ? ` · ${upload.songwriters}` : ""}</p>
      </div>
      <div className="flex shrink-0 gap-3 text-sm">
        <button type="button" className="text-violet-300" onClick={() => setEditing(upload.id)}>Edit</button>
        <button type="button" className="text-red-400" onClick={() => removePosted(upload, "song")}>Delete</button>
      </div>
    </div>
  );
}
