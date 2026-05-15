export type Platform = "google" | "tripadvisor";

export interface Source {
  id: string;
  showcase_id: string;
  platform: Platform;
  url: string;
  business_name: string | null;
  last_sync_at: string | null;
  last_sync_error: string | null;
  total_reviews: number;
  created_at: string;
}

export interface Review {
  id: string;
  source_id: string;
  platform: Platform;
  author_name: string;
  author_avatar_url: string | null;
  rating: number;
  review_date: string;
  body: string | null;
  photo_urls: string | null;
  hidden: number;
  created_at: string;
}

export interface Showcase {
  id: string;
  slug: string;
  business_name: string;
  created_at: string;
  updated_at: string;
}

export interface ShowcaseData {
  showcase: Showcase;
  reviews: Review[];
  sources: Source[];
  stats: {
    totalReviews: number;
    averageRating: number;
    platformBreakdown: Record<Platform, { count: number; average: number }>;
    ratingDistribution: Record<number, number>;
    monthlyTrend: Array<{ month: string; average: number; count: number }>;
    keywords: Array<{ word: string; count: number }>;
  };
}

export interface SyncResult {
  ok: boolean;
  reviewsFound: number;
  reviewsAdded: number;
  error?: string;
}
