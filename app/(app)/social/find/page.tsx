"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Search, UserPlus, Check, Music, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSocial } from "@/lib/contexts/social-context";
import type { SocialProfile } from "@/types";

function UserCard({
  profile,
  reason,
  onAdd,
  added,
  pending,
}: {
  profile: SocialProfile;
  reason?: string;
  onAdd: () => void;
  added?: boolean;
  pending?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
      <Image src={profile.avatar} alt={profile.name} width={48} height={48} className="rounded-full" />
      <div className="min-w-0 flex-1">
        <p className="font-medium">{profile.name}</p>
        <p className="text-sm text-violet-400">@{profile.username}</p>
        {reason && (
          <p className="mt-1 flex items-center gap-1 text-xs text-white/50">
            <Music size={12} />
            {reason}
          </p>
        )}
        {profile.bio && !reason && (
          <p className="mt-1 truncate text-xs text-white/40">{profile.bio}</p>
        )}
      </div>
      {added ? (
        <span className="flex items-center gap-1 text-sm text-green-400">
          <Check size={16} />
          Sent
        </span>
      ) : pending ? (
        <Button variant="secondary" size="sm" disabled>
          Pending
        </Button>
      ) : (
        <Button variant="secondary" size="sm" className="gap-1" onClick={onAdd}>
          <UserPlus size={14} />
          Add
        </Button>
      )}
    </div>
  );
}

export default function FindFriendsPage() {
  const [query, setQuery] = useState("");
  const {
    searchUsers,
    recommendations,
    sendFriendRequest,
    hasSentRequest,
    hasPendingRequest,
    isFriend,
  } = useSocial();

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    return searchUsers(query);
  }, [query, searchUsers]);

  const handleAdd = (profile: SocialProfile) => {
    sendFriendRequest(profile);
  };

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 text-lg font-semibold">Search by Username</h2>
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <Input
            placeholder="Search @username or name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-11"
          />
        </div>

        {query.trim() && (
          <div className="mt-4 space-y-3">
            {searchResults.length === 0 ? (
              <p className="text-center text-sm text-white/50">No users found for &ldquo;{query}&rdquo;</p>
            ) : (
              searchResults.map((profile) => (
                <UserCard
                  key={profile.id}
                  profile={profile}
                  onAdd={() => handleAdd(profile)}
                  added={hasSentRequest(profile.id)}
                  pending={hasPendingRequest(profile.id)}
                />
              ))
            )}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <Sparkles size={18} className="text-violet-400" />
          <h2 className="text-lg font-semibold">Recommended Based on Your Taste</h2>
        </div>
        <p className="mb-4 text-sm text-white/50">
          People who like the same songs and artists as you
        </p>
        <div className="space-y-3">
          {recommendations.length === 0 ? (
            <p className="text-sm text-white/50">Like more songs and artists to get recommendations.</p>
          ) : (
            recommendations.map(({ profile, reason }) => (
              <UserCard
                key={profile.id}
                profile={profile}
                reason={reason}
                onAdd={() => handleAdd(profile)}
                added={hasSentRequest(profile.id) || isFriend(profile.id)}
                pending={hasPendingRequest(profile.id)}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
