"use client";

import Image from "next/image";
import { Heart, Music, UserPlus, ListMusic, Share2 } from "lucide-react";
import { activityFeed } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";

const activityIcons = {
  played: Music,
  liked: Heart,
  followed: UserPlus,
  created_playlist: ListMusic,
  shared: Share2,
};

const activityLabels = {
  played: "played",
  liked: "liked",
  followed: "started following",
  created_playlist: "created playlist",
  shared: "shared",
};

export default function SocialPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Social</h1>
        <p className="text-sm text-white/50">See what your friends are listening to</p>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Activity Feed</h2>
        <div className="space-y-3">
          {activityFeed.map((item) => {
            const Icon = activityIcons[item.type];
            return (
              <div key={item.id} className="flex items-start gap-4 rounded-xl p-4 transition-colors hover:bg-white/5">
                <Image
                  src={item.userAvatar}
                  alt={item.userName}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{item.userName}</span>{" "}
                    <span className="text-white/50">{activityLabels[item.type]}</span>{" "}
                    <span className="font-medium">{item.target}</span>
                  </p>
                  <p className="mt-1 text-xs text-white/30">
                    {new Date(item.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <Icon size={16} className="shrink-0 text-white/30" />
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Suggested People</h2>
        <div className="space-y-3">
          {[
            { name: "Sarah Chen", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop", mutual: 12 },
            { name: "Marcus Lee", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop", mutual: 8 },
            { name: "Emma Wilson", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop", mutual: 5 },
          ].map((person) => (
            <div key={person.name} className="flex items-center gap-4 rounded-xl p-4 glass">
              <Image src={person.avatar} alt={person.name} width={48} height={48} className="rounded-full" />
              <div className="flex-1">
                <p className="font-medium">{person.name}</p>
                <p className="text-xs text-white/50">{person.mutual} mutual connections</p>
              </div>
              <Button variant="secondary" size="sm">Follow</Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
