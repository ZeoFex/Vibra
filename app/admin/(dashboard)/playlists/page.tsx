"use client";

import { PageHeader } from "@/components/admin/ui";

export default function PlaylistsAdminPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Editorial Playlists" description="Official playlists saved on Vibra" />
      <p className="rounded-xl border border-white/10 bg-white/[0.03] p-6 text-sm text-white/50">
        No editorial playlists are stored yet. Listener-made lists are not part of the admin catalog.
      </p>
    </div>
  );
}
