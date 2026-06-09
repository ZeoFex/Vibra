export type AdminRole =
  | "super_admin"
  | "content_manager"
  | "verification_manager"
  | "support_admin"
  | "finance_admin";

export type VerificationStatus =
  | "pending"
  | "under_review"
  | "needs_more_info"
  | "approved"
  | "verified"
  | "rejected"
  | "suspended";

export type MusicReviewStatus = "pending" | "approved" | "rejected" | "changes_requested";

export type ReportStatus = "open" | "investigating" | "resolved" | "dismissed";

export type TicketStatus = "open" | "assigned" | "closed";

export type PayoutStatus = "pending" | "approved" | "paid" | "rejected";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: AdminRole;
  lastLogin: string;
}

export interface ArtistApplication {
  id: string;
  stageName: string;
  legalName: string;
  email: string;
  phone: string;
  country: string;
  profilePhoto: string;
  bio: string;
  socialLinks: { platform: string; url: string }[];
  sampleSongUrls: string[];
  documents: { type: string; name: string; uploadedAt: string }[];
  recordLabel?: string;
  distributionLinks?: string[];
  status: VerificationStatus;
  submittedAt: string;
  adminNotes: string[];
  history: { action: string; by: string; at: string; note?: string }[];
}

export interface MusicReviewItem {
  id: string;
  title: string;
  artistName: string;
  artistId: string;
  album: string;
  genre: string;
  coverArt: string;
  audioUrl: string;
  lyrics?: string;
  explicit: boolean;
  copyrightConfirmed: boolean;
  releaseDate: string;
  status: MusicReviewStatus;
  submittedAt: string;
  adminNotes: string[];
}

export interface ModerationReport {
  id: string;
  type: "song" | "artist" | "playlist" | "user" | "copyright" | "impersonation" | "cover_art" | "lyrics";
  target: string;
  targetId: string;
  reportedBy: string;
  reason: string;
  description: string;
  status: ReportStatus;
  priority: "low" | "medium" | "high" | "critical";
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  category: "account" | "payment" | "copyright" | "verification" | "upload" | "bug" | "general";
  submitter: string;
  submitterEmail: string;
  status: TicketStatus;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  messages: { id: string; from: string; content: string; isInternal: boolean; createdAt: string }[];
}

export interface AdminActivityLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  target: string;
  targetType: string;
  reason?: string;
  createdAt: string;
}

export interface ArtistPayout {
  id: string;
  artistId: string;
  artistName: string;
  totalStreams: number;
  estimatedEarnings: number;
  approvedAmount: number;
  status: PayoutStatus;
  paymentMethod: string;
  paymentDetails: string;
  period: string;
  adminNote?: string;
}

export interface PlatformNotificationDraft {
  id: string;
  title: string;
  message: string;
  audience: "all" | "free" | "premium" | "artists" | "country" | "genre";
  audienceFilter?: string;
  type: "new_release" | "platform_update" | "promotion" | "subscription" | "artist_announcement";
  sentAt?: string;
  status: "draft" | "sent";
}

export interface FeaturedContentItem {
  id: string;
  type: "artist" | "song" | "album" | "playlist";
  title: string;
  subtitle: string;
  image: string;
  section: string;
  order: number;
  active: boolean;
}

export interface OfficialPlaylist {
  id: string;
  title: string;
  description: string;
  cover: string;
  category: string;
  songCount: number;
  featured: boolean;
  official: boolean;
}

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: "Super Admin",
  content_manager: "Content Manager",
  verification_manager: "Artist Verification Manager",
  support_admin: "Support Admin",
  finance_admin: "Finance Admin",
};

export const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
  super_admin: ["*", "sub-admins"],
  content_manager: ["overview", "music-review", "playlists", "featured", "reports", "activity"],
  verification_manager: ["overview", "verification", "artists", "artist-accounts", "activity"],
  support_admin: ["overview", "support", "reports", "users", "activity"],
  finance_admin: ["overview", "subscriptions", "payouts", "analytics", "activity"],
};

export function hasPermission(role: AdminRole, permission: string): boolean {
  const perms = ROLE_PERMISSIONS[role];
  return perms.includes("*") || perms.includes(permission);
}
