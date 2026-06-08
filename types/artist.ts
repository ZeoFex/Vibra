export type ArtistAccountStatus = "active" | "pending" | "suspended";

export interface ArtistAccount {
  id: string;
  email: string;
  password: string;
  stageName: string;
  legalName: string;
  image: string;
  bio: string;
  genre: string;
  country: string;
  status: ArtistAccountStatus;
  createdAt: string;
  createdBy: "admin" | "self";
}

export interface ArtistSongStats {
  uploadId: string;
  artistId: string;
  title: string;
  cover: string;
  views: number;
  plays: number;
  downloads: number;
  likes: number;
  saves: number;
  updatedAt: string;
}

export interface ArtistDashboardSummary {
  totalViews: number;
  totalPlays: number;
  totalDownloads: number;
  totalLikes: number;
  monthlyListeners: number;
  followerGrowth: number;
  songCount: number;
}
