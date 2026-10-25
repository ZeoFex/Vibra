"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, Music } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { PageHeader, AdminSearchInput } from "@/components/admin/ui";

type Row = {
  id: string;
  stageName: string;
  profilePhoto: string;
  genre: string;
  country: string;
  status: string;
  songCount: number;
  bio: string;
};

export default function AdminArtistsPage() {
  const [artists, setArtists] = useState<Row[]>([]);
  const [catalog, setCatalog] = useState<{ id: string; name: string; image: string; source: string }[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/records", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data?.applications) setArtists(data.applications); })
      .catch(() => undefined);
    fetch("/api/admin/overview", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data?.catalog?.artists) setCatalog(data.catalog.artists); })
      .catch(() => undefined);
  }, []);

  const filtered = artists.filter((artist) =>
    !search || artist.stageName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Artist Management" description="Artist accounts from the database, plus artists currently returned by Audius and Jamendo" />
      <AdminSearchInput placeholder="Search artists..." value={search} onChange={setSearch} />

      {filtered.length === 0 && <p className="text-sm text-white/40">No artist accounts yet.</p>}

      <div className="grid gap-4 lg:grid-cols-2">
        {filtered.map((artist) => (
          <div key={artist.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex gap-4">
              {artist.profilePhoto ? (
                <img src={artist.profilePhoto} alt="" className="h-16 w-16 shrink-0 rounded-full object-cover" />
              ) : (
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-violet-700 text-xl font-semibold">{artist.stageName.slice(0, 1)}</span>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{artist.stageName}</h3>
                  {artist.status === "verified" && <BadgeCheck size={16} className="text-violet-400" />}
                </div>
                <p className="text-sm text-white/50">{artist.country} · {artist.status.replace(/_/g, " ")}</p>
                <span className="mt-2 inline-block rounded-full bg-white/5 px-2 py-0.5 text-xs text-white/50">{artist.genre}</span>
                <div className="mt-3 flex gap-4 text-xs text-white/40">
                  <span className="flex items-center gap-1"><Music size={12} /> {formatNumber(artist.songCount)} songs</span>
                </div>
                {artist.bio && <p className="mt-2 line-clamp-2 text-xs text-white/45">{artist.bio}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold">From the music APIs</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {catalog.filter((artist) => !search || artist.name.toLowerCase().includes(search.toLowerCase())).map((artist) => (
          <div key={artist.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
            {artist.image ? <img src={artist.image} alt="" className="h-12 w-12 rounded-full object-cover" /> : <span className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-700">{artist.name.slice(0, 1)}</span>}
            <div>
              <p className="font-medium">{artist.name}</p>
              <p className="text-xs text-white/45">{artist.source}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
