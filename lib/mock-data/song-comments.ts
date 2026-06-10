export interface SongComment {
  id: string;
  uploadId: string;
  songTitle: string;
  listenerName: string;
  listenerAvatar: string;
  comment: string;
  rating: number;
  createdAt: string;
}

export const seedSongComments: SongComment[] = [
  {
    id: "comment-1",
    uploadId: "upload-1",
    songTitle: "Accra Nights",
    listenerName: "Ama K.",
    listenerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop",
    comment: "This track hits different at night. The guitar work is incredible!",
    rating: 5,
    createdAt: "2026-06-08T14:22:00Z",
  },
  {
    id: "comment-2",
    uploadId: "upload-1",
    songTitle: "Accra Nights",
    listenerName: "David Mensah",
    listenerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop",
    comment: "Been on repeat all week. Accra vibes are unmatched.",
    rating: 5,
    createdAt: "2026-06-07T09:15:00Z",
  },
  {
    id: "comment-3",
    uploadId: "upload-2",
    songTitle: "Midnight Confessions",
    listenerName: "Zoe Rivers",
    listenerAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop",
    comment: "The vocals on the bridge gave me chills. Beautiful songwriting.",
    rating: 4,
    createdAt: "2026-06-06T22:40:00Z",
  },
  {
    id: "comment-4",
    uploadId: "upload-3",
    songTitle: "Golden Hour Fade",
    listenerName: "James Park",
    listenerAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop",
    comment: "Perfect summer evening song. Added to my sunset playlist.",
    rating: 5,
    createdAt: "2026-06-05T18:05:00Z",
  },
  {
    id: "comment-5",
    uploadId: "upload-3",
    songTitle: "Golden Hour Fade",
    listenerName: "Lena Ortiz",
    listenerAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop",
    comment: "Love the indie pop feel. Would love a full album in this style!",
    rating: 4,
    createdAt: "2026-06-04T11:30:00Z",
  },
];

export function getCommentsForArtist(artistId: string, uploadIds: string[]): SongComment[] {
  const idSet = new Set(uploadIds);
  return seedSongComments
    .filter((c) => idSet.has(c.uploadId))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
