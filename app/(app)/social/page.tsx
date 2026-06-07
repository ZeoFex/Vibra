"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Music, UserPlus, ListMusic, Share2, MessageCircle } from "lucide-react";
import { activityFeed } from "@/lib/mock-data";
import { useSocial } from "@/lib/contexts/social-context";

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

export default function SocialFeedPage() {
  const { friends } = useSocial();

  return (
    <div className="space-y-8">
      {friends.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold">Your Friends</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {friends.map((friend) => (
              <Link
                key={friend.id}
                href={`/social/messages/${friend.id}`}
                className="flex shrink-0 flex-col items-center gap-2 transition-opacity hover:opacity-80"
              >
                <div className="relative">
                  <Image
                    src={friend.avatar}
                    alt={friend.name}
                    width={56}
                    height={56}
                    className="rounded-full ring-2 ring-violet-600/30"
                  />
                  <MessageCircle size={14} className="absolute -bottom-1 -right-1 rounded-full bg-violet-600 p-0.5 text-white" />
                </div>
                <span className="max-w-[72px] truncate text-xs font-medium">@{friend.username}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

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
    </div>
  );
}
