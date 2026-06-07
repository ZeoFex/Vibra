import type { ChatMessage } from "@/types";
import { socialProfiles } from "./social";

const sarah = socialProfiles[0];
const james = socialProfiles[3];

const me = {
  id: "user-1",
  name: "Alex Rivera",
  username: "alexrivera",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop",
};

export const initialFriends = [sarah, james];

export const initialPrivateMessages: Record<string, ChatMessage[]> = {
  "user-2": [
    {
      id: "dm-1",
      senderId: sarah.id,
      senderName: sarah.name,
      senderAvatar: sarah.avatar,
      senderUsername: sarah.username,
      content: "Hey! Did you hear Luna Eclipse's new track? It's incredible 🎵",
      createdAt: "2026-06-05T16:00:00Z",
    },
    {
      id: "dm-2",
      senderId: me.id,
      senderName: me.name,
      senderAvatar: me.avatar,
      senderUsername: me.username,
      content: "Yes! Neon Dreams is on repeat for me right now",
      createdAt: "2026-06-05T16:05:00Z",
    },
    {
      id: "dm-3",
      senderId: sarah.id,
      senderName: sarah.name,
      senderAvatar: sarah.avatar,
      senderUsername: sarah.username,
      content: "Same here! We should make a shared playlist",
      createdAt: "2026-06-05T16:08:00Z",
    },
  ],
  "user-5": [
    {
      id: "dm-4",
      senderId: james.id,
      senderName: james.name,
      senderAvatar: james.avatar,
      senderUsername: james.username,
      content: "That Pulse Wave set last night was fire 🔥",
      createdAt: "2026-06-04T22:30:00Z",
    },
    {
      id: "dm-5",
      senderId: me.id,
      senderName: me.name,
      senderAvatar: me.avatar,
      senderUsername: me.username,
      content: "Neon Drift never misses. Got any similar artist recs?",
      createdAt: "2026-06-04T22:45:00Z",
    },
  ],
};

export const initialCommunityMessages: ChatMessage[] = [
  {
    id: "gc-1",
    senderId: socialProfiles[1].id,
    senderName: socialProfiles[1].name,
    senderAvatar: socialProfiles[1].avatar,
    senderUsername: socialProfiles[1].username,
    content: "Who else thinks Midnight Pulse's new album is a masterpiece?",
    createdAt: "2026-06-06T08:00:00Z",
  },
  {
    id: "gc-2",
    senderId: socialProfiles[2].id,
    senderName: socialProfiles[2].name,
    senderAvatar: socialProfiles[2].avatar,
    senderUsername: socialProfiles[2].username,
    content: "Lo-fi Sunday vibes ☕ Perfect day for Solace's Calm Waters",
    createdAt: "2026-06-06T09:15:00Z",
  },
  {
    id: "gc-3",
    senderId: socialProfiles[4].id,
    senderName: socialProfiles[4].name,
    senderAvatar: socialProfiles[4].avatar,
    senderUsername: socialProfiles[4].username,
    content: "Just discovered Aria Nova — where has this artist been all my life?",
    createdAt: "2026-06-06T10:30:00Z",
  },
  {
    id: "gc-4",
    senderId: socialProfiles[5].id,
    senderName: socialProfiles[5].name,
    senderAvatar: socialProfiles[5].avatar,
    senderUsername: socialProfiles[5].username,
    content: "Vibra AI made me the perfect workout playlist. This app is underrated 💪",
    createdAt: "2026-06-06T11:00:00Z",
  },
  {
    id: "gc-5",
    senderId: me.id,
    senderName: me.name,
    senderAvatar: me.avatar,
    senderUsername: me.username,
    content: "The sound quality on premium is worth every penny",
    createdAt: "2026-06-06T11:45:00Z",
  },
];

export const communityAutoReplies = [
  "Totally agree! 🎶",
  "Adding that to my queue now",
  "Great taste!",
  "This community has the best recs",
  "Vibra really gets it right",
];
