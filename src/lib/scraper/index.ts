import type { Platform, SyncResult } from "../types";
import { scrapeGoogleReviews } from "./google";
import { scrapeTripAdvisorReviews } from "./tripadvisor";

export async function syncSource(
  sourceId: string,
  platform: Platform
): Promise<SyncResult> {
  switch (platform) {
    case "google":
      return scrapeGoogleReviews(sourceId);
    case "tripadvisor":
      return scrapeTripAdvisorReviews(sourceId);
    default:
      return {
        ok: false,
        reviewsFound: 0,
        reviewsAdded: 0,
        error: `Unsupported platform: ${platform}`,
      };
  }
}

export function detectPlatform(url: string): Platform | null {
  const lower = url.toLowerCase();
  if (
    lower.includes("google.com/maps") ||
    lower.includes("maps.google") ||
    lower.includes("goo.gl/maps") ||
    lower.includes("google.com/search")
  ) {
    return "google";
  }
  if (lower.includes("tripadvisor")) {
    return "tripadvisor";
  }
  return null;
}
