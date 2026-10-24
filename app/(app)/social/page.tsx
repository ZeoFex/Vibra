"use client";

import Link from "next/link";
import Image from "next/image";
import { MessageCircle } from "lucide-react";
import { useSocial } from "@/lib/contexts/social-context";

export default function SocialFeedPage() {
  const { friends } = useSocial();

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-4 text-lg font-semibold">Your Friends</h2>
        {friends.length === 0 ? (
          <p className="text-sm text-white/50">No friends yet. Find someone and send a request.</p>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {friends.map((friend) => (
              <Link
                key={friend.id}
                href={`/social/messages/${friend.id}`}
                className="flex shrink-0 flex-col items-center gap-2 transition-opacity hover:opacity-80"
              >
                <div className="relative">
                  <Image src={friend.avatar} alt={friend.name} width={56} height={56} className="rounded-full ring-2 ring-violet-600/30" />
                  <MessageCircle size={14} className="absolute -bottom-1 -right-1 rounded-full bg-violet-600 p-0.5 text-white" />
                </div>
                <span className="max-w-[72px] truncate text-xs font-medium">@{friend.username}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
