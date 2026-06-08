export type SubscriptionTier = "free" | "premium";

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  bio?: string;
  tier: SubscriptionTier;
  followers: number;
  following: number;
  createdAt: string;
}

export interface SocialProfile {
  id: string;
  username: string;
  name: string;
  avatar: string;
  bio?: string;
  likedSongIds: string[];
  likedArtistIds: string[];
}

export interface FriendRequest {
  id: string;
  from: SocialProfile;
  toUserId: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
  matchReason?: string;
}

export interface DownloadedTrack {
  songId: string;
  downloadedAt: string;
  sizeMb: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderUsername: string;
  content: string;
  createdAt: string;
}

export interface PrivateConversation {
  friendId: string;
  messages: ChatMessage[];
}

export interface Artist {
  id: string;
  name: string;
  image: string;
  bio: string;
  monthlyListeners: number;
  genres: string[];
  verified: boolean;
}

export interface Album {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  cover: string;
  releaseDate: string;
  genre: string;
  trackCount: number;
  type: "album" | "single" | "ep";
}

export interface Song {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  albumId: string;
  albumTitle: string;
  cover: string;
  duration: number;
  genre: string;
  plays: number;
  releaseDate: string;
  audioUrl?: string;
}

export type ArtistUploadStatus = "draft" | "pending" | "published" | "rejected";

export interface ArtistUpload {
  id: string;
  title: string;
  artistName: string;
  albumTitle: string;
  genre: string;
  about: string;
  producers: string;
  songwriters: string;
  featuredArtists: string;
  lyrics: string;
  cover: string;
  audioFileName: string;
  duration: number;
  releaseDate: string;
  explicit: boolean;
  copyrightConfirmed: boolean;
  status: ArtistUploadStatus;
  submittedAt: string;
  uploadedBy: string;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  cover: string;
  ownerId: string;
  ownerName: string;
  songIds: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Genre {
  id: string;
  name: string;
  image: string;
  color: string;
}

export interface Notification {
  id: string;
  type: "new_release" | "playlist_update" | "new_follower" | "system";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface ActivityItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  type: "played" | "liked" | "followed" | "created_playlist" | "shared";
  target: string;
  createdAt: string;
}

export interface MoodOption {
  id: string;
  name: string;
  emoji: string;
  gradient: string;
}

export interface ChartEntry {
  rank: number;
  song: Song;
  trend: "up" | "down" | "same";
}

export interface AdminStats {
  dailyActiveUsers: number;
  totalUsers: number;
  totalSongs: number;
  totalArtists: number;
  revenue: number;
  retentionRate: number;
  topSongs: { song: Song; plays: number }[];
}
