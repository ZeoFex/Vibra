"use client";

import Link from "next/link";
import Image from "next/image";
import { Check, X, UserPlus, Inbox, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSocial } from "@/lib/contexts/social-context";

export default function FriendRequestsPage() {
  const { friendRequests, acceptRequest, declineRequest, friends } = useSocial();

  const pending = friendRequests.filter((r) => r.status === "pending");
  const handled = friendRequests.filter((r) => r.status !== "pending");

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-4 text-lg font-semibold">
          Incoming Requests
          {pending.length > 0 && (
            <span className="ml-2 text-sm font-normal text-white/50">({pending.length})</span>
          )}
        </h2>

        {pending.length === 0 ? (
          <div className="flex flex-col items-center rounded-xl border border-white/10 bg-white/5 py-12 text-center">
            <Inbox size={40} className="mb-3 text-white/20" />
            <p className="text-white/50">No pending friend requests</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((request) => (
              <div
                key={request.id}
                className="rounded-xl border border-violet-600/20 bg-violet-600/5 p-4"
              >
                <div className="flex items-start gap-4">
                  <Image
                    src={request.from.avatar}
                    alt={request.from.name}
                    width={52}
                    height={52}
                    className="rounded-full"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{request.from.name}</p>
                    <p className="text-sm text-violet-400">@{request.from.username}</p>
                    {request.matchReason && (
                      <p className="mt-2 text-xs text-white/50">{request.matchReason}</p>
                    )}
                    <p className="mt-1 text-xs text-white/30">
                      {new Date(request.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 gap-1"
                    onClick={() => acceptRequest(request.id)}
                  >
                    <Check size={16} />
                    Accept
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1 gap-1"
                    onClick={() => declineRequest(request.id)}
                  >
                    <X size={16} />
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {friends.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold">Friends ({friends.length})</h2>
          <div className="space-y-2">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-white/5"
              >
                <Image
                  src={friend.avatar}
                  alt={friend.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">{friend.name}</p>
                  <p className="text-xs text-white/50">@{friend.username}</p>
                </div>
                <Link href={`/social/messages/${friend.id}`}>
                  <Button variant="ghost" size="icon-sm">
                    <MessageCircle size={16} />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {handled.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-white/70">Recent</h2>
          <div className="space-y-2">
            {handled.map((request) => (
              <div
                key={request.id}
                className="flex items-center gap-4 rounded-xl p-3 opacity-60"
              >
                <Image
                  src={request.from.avatar}
                  alt={request.from.name}
                  width={36}
                  height={36}
                  className="rounded-full"
                />
                <div className="flex-1">
                  <p className="text-sm">{request.from.name}</p>
                  <p className="text-xs text-white/40">@{request.from.username}</p>
                </div>
                <span
                  className={`text-xs capitalize ${
                    request.status === "accepted" ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {request.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
