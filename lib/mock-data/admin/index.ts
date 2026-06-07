import type {
  AdminUser,
  ArtistApplication,
  MusicReviewItem,
  ModerationReport,
  SupportTicket,
  AdminActivityLog,
  ArtistPayout,
  PlatformNotificationDraft,
  FeaturedContentItem,
  OfficialPlaylist,
} from "@/types/admin";
import { artists } from "../artists";
import { songs } from "../songs";

export const adminUsers: AdminUser[] = [
  {
    id: "admin-1",
    name: "Jordan Blake",
    email: "jordan@vibra.app",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    role: "super_admin",
    lastLogin: "2026-06-06T09:00:00Z",
  },
  {
    id: "admin-2",
    name: "Priya Sharma",
    email: "priya@vibra.app",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    role: "verification_manager",
    lastLogin: "2026-06-05T14:30:00Z",
  },
];

export const demoAdminAccounts: { email: string; password: string; admin: AdminUser }[] = [
  { email: "admin@vibra.app", password: "admin123", admin: adminUsers[0] },
  { email: "verify@vibra.app", password: "verify123", admin: adminUsers[1] },
];

export const artistApplications: ArtistApplication[] = [
  {
    id: "app-1",
    stageName: "Kofi Wave",
    legalName: "Kwame Mensah",
    email: "kofi@music.com",
    phone: "+233 24 123 4567",
    country: "Ghana",
    profilePhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    bio: "Afrobeats artist blending traditional Ghanaian rhythms with modern production.",
    socialLinks: [
      { platform: "Instagram", url: "https://instagram.com/kofiwave" },
      { platform: "Twitter", url: "https://twitter.com/kofiwave" },
    ],
    sampleSongUrls: ["sample-1.mp3", "sample-2.mp3"],
    documents: [
      { type: "Government ID", name: "ghana_passport.pdf", uploadedAt: "2026-06-01" },
      { type: "Music Ownership", name: "ownership_proof.pdf", uploadedAt: "2026-06-01" },
    ],
    recordLabel: "Independent",
    distributionLinks: ["https://distrokid.com/kofiwave"],
    status: "pending",
    submittedAt: "2026-06-04T10:00:00Z",
    adminNotes: [],
    history: [{ action: "Application submitted", by: "Artist", at: "2026-06-04T10:00:00Z" }],
  },
  {
    id: "app-2",
    stageName: "Zara Bloom",
    legalName: "Zara Okonkwo",
    email: "zara@bloommusic.io",
    phone: "+234 803 456 7890",
    country: "Nigeria",
    profilePhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    bio: "R&B and soul vocalist with 50K+ monthly listeners on other platforms.",
    socialLinks: [{ platform: "Instagram", url: "https://instagram.com/zarabloom" }],
    sampleSongUrls: ["sample-zara.mp3"],
    documents: [
      { type: "Government ID", name: "nin_card.pdf", uploadedAt: "2026-05-28" },
      { type: "Business Registration", name: "bloom_llc.pdf", uploadedAt: "2026-05-28" },
    ],
    status: "under_review",
    submittedAt: "2026-05-28T08:00:00Z",
    adminNotes: ["Verified social media presence"],
    history: [
      { action: "Application submitted", by: "Artist", at: "2026-05-28T08:00:00Z" },
      { action: "Moved to under review", by: "Priya Sharma", at: "2026-05-29T11:00:00Z" },
    ],
  },
  {
    id: "app-3",
    stageName: "DJ Phantom",
    legalName: "Alex Turner",
    email: "phantom@dj.com",
    phone: "+1 555 0123",
    country: "United States",
    profilePhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
    bio: "Electronic DJ and producer.",
    socialLinks: [],
    sampleSongUrls: [],
    documents: [{ type: "Government ID", name: "drivers_license.jpg", uploadedAt: "2026-06-02" }],
    status: "needs_more_info",
    submittedAt: "2026-06-02T15:00:00Z",
    adminNotes: ["Missing sample songs", "Need proof of music ownership"],
    history: [
      { action: "Application submitted", by: "Artist", at: "2026-06-02T15:00:00Z" },
      { action: "Requested more info", by: "Priya Sharma", at: "2026-06-03T09:00:00Z", note: "Please upload sample tracks" },
    ],
  },
  {
    id: "app-4",
    stageName: "Amara Soul",
    legalName: "Amara Diallo",
    email: "amara@soul.fr",
    phone: "+33 6 12 34 56 78",
    country: "France",
    profilePhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop",
    bio: "Jazz and neo-soul artist from Paris.",
    socialLinks: [{ platform: "Spotify", url: "https://open.spotify.com/artist/amara" }],
    sampleSongUrls: ["amara-demo.mp3"],
    documents: [
      { type: "Government ID", name: "french_id.pdf", uploadedAt: "2026-05-20" },
      { type: "Music Ownership", name: "publishing_rights.pdf", uploadedAt: "2026-05-20" },
    ],
    status: "verified",
    submittedAt: "2026-05-20T12:00:00Z",
    adminNotes: ["Fully verified — excellent documentation"],
    history: [
      { action: "Application submitted", by: "Artist", at: "2026-05-20T12:00:00Z" },
      { action: "Approved", by: "Jordan Blake", at: "2026-05-22T10:00:00Z" },
      { action: "Verified", by: "Jordan Blake", at: "2026-05-23T14:00:00Z" },
    ],
  },
];

export const musicReviewQueue: MusicReviewItem[] = [
  {
    id: "review-1",
    title: "Accra Nights",
    artistName: "Kofi Wave",
    artistId: "pending-kofi",
    album: "Debut EP",
    genre: "Afrobeats",
    coverArt: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop",
    audioUrl: "accra-nights.mp3",
    lyrics: "Under the Accra moonlight...",
    explicit: false,
    copyrightConfirmed: true,
    releaseDate: "2026-06-15",
    status: "pending",
    submittedAt: "2026-06-05T08:00:00Z",
    adminNotes: [],
  },
  {
    id: "review-2",
    title: "Midnight Confessions",
    artistName: "Zara Bloom",
    artistId: "pending-zara",
    album: "Bloom",
    genre: "R&B",
    coverArt: "https://images.unsplash.com/photo-1511379938545-c1f69419868d?w=200&h=200&fit=crop",
    audioUrl: "midnight-confessions.mp3",
    explicit: true,
    copyrightConfirmed: true,
    releaseDate: "2026-06-20",
    status: "pending",
    submittedAt: "2026-06-04T16:00:00Z",
    adminNotes: [],
  },
  {
    id: "review-3",
    title: "Neon Dreams Remix",
    artistName: "Luna Eclipse",
    artistId: "artist-1",
    album: "Cosmic Waves",
    genre: "Electronic",
    coverArt: songs[0].cover,
    audioUrl: "neon-dreams-remix.mp3",
    explicit: false,
    copyrightConfirmed: true,
    releaseDate: "2026-06-10",
    status: "approved",
    submittedAt: "2026-06-01T10:00:00Z",
    adminNotes: ["Approved for homepage feature"],
  },
];

export const moderationReports: ModerationReport[] = [
  {
    id: "rep-1",
    type: "copyright",
    target: "Unauthorized Upload — 'Blinding Lights'",
    targetId: "song-fake-1",
    reportedBy: "Universal Music Group",
    reason: "Copyright infringement",
    description: "This track uses our copyrighted master recording without license.",
    status: "open",
    priority: "critical",
    createdAt: "2026-06-06T07:00:00Z",
  },
  {
    id: "rep-2",
    type: "impersonation",
    target: "Fake Drake Account",
    targetId: "artist-fake-1",
    reportedBy: "user-42",
    reason: "Impersonation",
    description: "This artist profile is impersonating Drake.",
    status: "investigating",
    priority: "high",
    createdAt: "2026-06-05T18:00:00Z",
  },
  {
    id: "rep-3",
    type: "cover_art",
    target: "Inappropriate album cover",
    targetId: "album-bad-1",
    reportedBy: "user-88",
    reason: "Offensive content",
    description: "Album cover contains explicit imagery.",
    status: "open",
    priority: "medium",
    createdAt: "2026-06-05T12:00:00Z",
  },
  {
    id: "rep-4",
    type: "playlist",
    target: "Hate Speech Playlist",
    targetId: "playlist-bad-1",
    reportedBy: "user-15",
    reason: "Harmful content",
    description: "Playlist title and description contain hate speech.",
    status: "resolved",
    priority: "high",
    createdAt: "2026-06-03T09:00:00Z",
  },
];

export const supportTickets: SupportTicket[] = [
  {
    id: "ticket-1",
    subject: "Cannot upload song — file keeps failing",
    category: "upload",
    submitter: "Kofi Wave",
    submitterEmail: "kofi@music.com",
    status: "open",
    createdAt: "2026-06-06T08:30:00Z",
    updatedAt: "2026-06-06T08:30:00Z",
    messages: [
      { id: "m1", from: "Kofi Wave", content: "Every time I try to upload my WAV file it fails at 90%.", isInternal: false, createdAt: "2026-06-06T08:30:00Z" },
    ],
  },
  {
    id: "ticket-2",
    subject: "Premium charged twice this month",
    category: "payment",
    submitter: "Sarah Chen",
    submitterEmail: "sarah@vibra.app",
    status: "assigned",
    assignedTo: "Jordan Blake",
    createdAt: "2026-06-05T14:00:00Z",
    updatedAt: "2026-06-05T16:00:00Z",
    messages: [
      { id: "m2", from: "Sarah Chen", content: "I was charged $9.99 twice on June 5th.", isInternal: false, createdAt: "2026-06-05T14:00:00Z" },
      { id: "m3", from: "Jordan Blake", content: "Looking into this with our payment provider.", isInternal: false, createdAt: "2026-06-05T16:00:00Z" },
      { id: "m4", from: "Jordan Blake", content: "Stripe shows duplicate webhook — refund initiated.", isInternal: true, createdAt: "2026-06-05T16:30:00Z" },
    ],
  },
  {
    id: "ticket-3",
    subject: "Verification taking too long",
    category: "verification",
    submitter: "Zara Bloom",
    submitterEmail: "zara@bloommusic.io",
    status: "open",
    createdAt: "2026-06-04T11:00:00Z",
    updatedAt: "2026-06-04T11:00:00Z",
    messages: [
      { id: "m5", from: "Zara Bloom", content: "Submitted my application 8 days ago. Any update?", isInternal: false, createdAt: "2026-06-04T11:00:00Z" },
    ],
  },
];

export const activityLogs: AdminActivityLog[] = [
  { id: "log-1", adminId: "admin-1", adminName: "Jordan Blake", action: "Verified artist", target: "Amara Soul", targetType: "artist", reason: "Complete documentation", createdAt: "2026-06-05T10:00:00Z" },
  { id: "log-2", adminId: "admin-2", adminName: "Priya Sharma", action: "Requested more info", target: "DJ Phantom", targetType: "application", reason: "Missing sample songs", createdAt: "2026-06-03T09:00:00Z" },
  { id: "log-3", adminId: "admin-1", adminName: "Jordan Blake", action: "Approved song", target: "Neon Dreams Remix", targetType: "song", createdAt: "2026-06-01T11:00:00Z" },
  { id: "log-4", adminId: "admin-1", adminName: "Jordan Blake", action: "Suspended user", target: "spam_user_99", targetType: "user", reason: "Bot activity", createdAt: "2026-05-30T15:00:00Z" },
  { id: "log-5", adminId: "admin-2", adminName: "Priya Sharma", action: "Dismissed report", target: "rep-false-1", targetType: "report", reason: "False report", createdAt: "2026-05-29T12:00:00Z" },
];

export const artistPayouts: ArtistPayout[] = [
  { id: "pay-1", artistId: "artist-1", artistName: "Luna Eclipse", totalStreams: 4_200_000, estimatedEarnings: 8400, approvedAmount: 8000, status: "pending", paymentMethod: "Bank Transfer", paymentDetails: "****4521", period: "May 2026" },
  { id: "pay-2", artistId: "artist-2", artistName: "Midnight Pulse", totalStreams: 8_500_000, estimatedEarnings: 17000, approvedAmount: 17000, status: "approved", paymentMethod: "PayPal", paymentDetails: "mid***@pulse.com", period: "May 2026" },
  { id: "pay-3", artistId: "artist-4", artistName: "Neon Drift", totalStreams: 5_600_000, estimatedEarnings: 11200, approvedAmount: 11200, status: "paid", paymentMethod: "Mobile Money", paymentDetails: "+233 *** 789", period: "April 2026", adminNote: "Paid via Paystack" },
];

export const notificationDrafts: PlatformNotificationDraft[] = [
  { id: "notif-d1", title: "New Feature: Vibra AI Playlists", message: "Create personalized playlists with AI.", audience: "all", type: "platform_update", status: "draft" },
  { id: "notif-d2", title: "Premium 30% Off", message: "Limited time offer for free users.", audience: "free", type: "promotion", status: "sent", sentAt: "2026-06-01T09:00:00Z" },
];

export const featuredContent: FeaturedContentItem[] = [
  { id: "feat-1", type: "artist", title: "Luna Eclipse", subtitle: "4.2M monthly listeners", image: artists[0].image, section: "featured_artists", order: 1, active: true },
  { id: "feat-2", type: "song", title: "Neon Dreams", subtitle: "Luna Eclipse", image: songs[0].cover, section: "featured_songs", order: 1, active: true },
  { id: "feat-3", type: "playlist", title: "Vibra Top 50", subtitle: "The biggest hits", image: "https://images.unsplash.com/photo-1619983081563-430f63602796?w=200&h=200&fit=crop", section: "editors_picks", order: 1, active: true },
];

export const officialPlaylists: OfficialPlaylist[] = [
  { id: "op-1", title: "Vibra Top 50", description: "The biggest songs on Vibra", cover: "https://images.unsplash.com/photo-1619983081563-430f63602796?w=200&h=200&fit=crop", category: "Charts", songCount: 50, featured: true, official: true },
  { id: "op-2", title: "Afro Heat", description: "Hottest Afrobeats right now", cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop", category: "Genre", songCount: 35, featured: true, official: true },
  { id: "op-3", title: "Chill Mode", description: "Relax and unwind", cover: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop", category: "Mood", songCount: 40, featured: false, official: true },
  { id: "op-4", title: "Workout Hits", description: "High energy tracks", cover: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop", category: "Mood", songCount: 30, featured: false, official: true },
  { id: "op-5", title: "New Ghana Sounds", description: "Fresh from Ghana", cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&h=200&fit=crop", category: "Regional", songCount: 25, featured: true, official: true },
];

export const adminDashboardStats = {
  totalUsers: 1_250_000,
  totalArtists: 3_200,
  verifiedArtists: 2_840,
  pendingApplications: 12,
  totalSongs: 12_450,
  totalAlbums: 3_800,
  activeSubscriptions: 312_500,
  totalRevenue: 2_450_000,
  dailyActiveUsers: 48_250,
  monthlyActiveUsers: 890_000,
  pendingMusicReviews: 8,
  openReports: 5,
  openTickets: 7,
};

export const growthData = {
  users: [
    { month: "Jan", value: 820000 },
    { month: "Feb", value: 910000 },
    { month: "Mar", value: 980000 },
    { month: "Apr", value: 1050000 },
    { month: "May", value: 1180000 },
    { month: "Jun", value: 1250000 },
  ],
  artists: [
    { month: "Jan", value: 2100 },
    { month: "Feb", value: 2400 },
    { month: "Mar", value: 2650 },
    { month: "Apr", value: 2900 },
    { month: "May", value: 3050 },
    { month: "Jun", value: 3200 },
  ],
  streams: [
    { month: "Jan", value: 45_000_000 },
    { month: "Feb", value: 52_000_000 },
    { month: "Mar", value: 58_000_000 },
    { month: "Apr", value: 64_000_000 },
    { month: "May", value: 71_000_000 },
    { month: "Jun", value: 78_000_000 },
  ],
  revenue: [
    { month: "Jan", value: 1_800_000 },
    { month: "Feb", value: 1_950_000 },
    { month: "Mar", value: 2_100_000 },
    { month: "Apr", value: 2_200_000 },
    { month: "May", value: 2_350_000 },
    { month: "Jun", value: 2_450_000 },
  ],
  topGenres: [
    { genre: "Hip-Hop", pct: 28 },
    { genre: "Afrobeats", pct: 22 },
    { genre: "Electronic", pct: 18 },
    { genre: "R&B", pct: 14 },
    { genre: "Gospel", pct: 10 },
  ],
  topCountries: [
    { country: "United States", pct: 32 },
    { country: "Ghana", pct: 18 },
    { country: "Nigeria", pct: 15 },
    { country: "United Kingdom", pct: 12 },
    { country: "France", pct: 8 },
  ],
};
