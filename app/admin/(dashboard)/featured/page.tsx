"use client";

import Image from "next/image";
import { GripVertical, Eye, EyeOff } from "lucide-react";
import { featuredContent } from "@/lib/mock-data/admin";
import { PageHeader } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";

const sections = [
  { id: "featured_artists", label: "Featured Artists" },
  { id: "featured_songs", label: "Featured Songs" },
  { id: "editors_picks", label: "Editor's Picks" },
  { id: "trending", label: "Trending Music" },
  { id: "new_releases", label: "New Releases" },
  { id: "mood_playlists", label: "Mood Playlists" },
];

export default function FeaturedPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Content Featuring" description="Control homepage sections and featured content" />

      {sections.map((section) => {
        const items = featuredContent.filter((f) => f.section === section.id);
        return (
          <section key={section.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">{section.label}</h2>
              <Button variant="secondary" size="sm">Add Item</Button>
            </div>
            {items.length === 0 ? (
              <p className="text-sm text-white/40">No items — drag content here to feature</p>
            ) : (
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 rounded-lg bg-white/5 p-3">
                    <GripVertical size={16} className="cursor-grab text-white/30" />
                    <Image src={item.image} alt="" width={40} height={40} className="rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-white/50">{item.subtitle} · {item.type}</p>
                    </div>
                    <Button variant="ghost" size="icon-sm">
                      {item.active ? <Eye size={16} /> : <EyeOff size={16} className="text-white/30" />}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
