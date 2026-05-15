import * as cheerio from "cheerio";
import type { SyncResult } from "../types";
import { upsertReview, updateSourceSync, getSource } from "../db";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 2000;

async function fetchWithBackoff(
  url: string,
  attempt = 0
): Promise<string | null> {
  try {
    const delay = BASE_DELAY_MS * Math.pow(2, attempt);
    if (attempt > 0) {
      await new Promise((r) => setTimeout(r, delay));
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-GB,en;q=0.9",
      },
    });

    if (response.status === 429 && attempt < MAX_RETRIES) {
      return fetchWithBackoff(url, attempt + 1);
    }

    if (!response.ok) {
      return null;
    }

    return await response.text();
  } catch {
    if (attempt < MAX_RETRIES) {
      return fetchWithBackoff(url, attempt + 1);
    }
    return null;
  }
}

/**
 * Scrape reviews from a Google Business Profile.
 *
 * Google's public review pages have varied and obfuscated HTML structures
 * that change frequently. This scraper attempts to parse the publicly
 * accessible review data. When Google changes their markup (which they
 * do regularly), the selectors below will need updating.
 *
 * For production use, consider using the Google Places API instead.
 */
export async function scrapeGoogleReviews(
  sourceId: string
): Promise<SyncResult> {
  const source = getSource(sourceId);
  if (!source) {
    return { ok: false, reviewsFound: 0, reviewsAdded: 0, error: "Source not found" };
  }

  const html = await fetchWithBackoff(source.url);
  if (!html) {
    const existing = source.total_reviews;
    updateSourceSync(sourceId, existing, "Failed to fetch Google profile page");
    return {
      ok: false,
      reviewsFound: 0,
      reviewsAdded: 0,
      error: "Failed to fetch Google profile page",
    };
  }

  const $ = cheerio.load(html);
  let reviewsFound = 0;
  let reviewsAdded = 0;

  // Google review selectors — these target common patterns in the public
  // maps/place page. They will break when Google changes their markup.
  const reviewElements = $("[data-review-id], .jftiEf, .gws-localreviews__google-review");

  reviewElements.each((_, el) => {
    try {
      const $el = $(el);
      const authorName =
        $el.find(".d4r55, .TSUbDb, [class*='author']").first().text().trim() ||
        "Anonymous";
      const ratingText =
        $el.find("[aria-label*='star'], [aria-label*='Star']").attr("aria-label") || "";
      const ratingMatch = ratingText.match(/(\d)/);
      const rating = ratingMatch ? parseInt(ratingMatch[1], 10) : 0;

      if (rating < 1 || rating > 5) return;

      const bodyText =
        $el.find(".wiI7pd, .Jtu6Td, [class*='review-text']").first().text().trim() || null;
      const dateText =
        $el.find(".rsqaWe, .dehysf, [class*='date']").first().text().trim() || "";

      const reviewDate = parseRelativeDate(dateText);
      const avatarUrl =
        $el.find("img[src*='photo'], img[src*='avatar']").attr("src") || null;

      const id = `g-${sourceId}-${authorName}-${reviewDate}`.replace(/\s+/g, "-").toLowerCase();

      const inserted = upsertReview({
        id,
        source_id: sourceId,
        platform: "google",
        author_name: authorName,
        author_avatar_url: avatarUrl,
        rating,
        review_date: reviewDate,
        body: bodyText,
        photo_urls: null,
        hidden: 0,
      });

      reviewsFound++;
      if (inserted) reviewsAdded++;
    } catch {
      // Skip malformed review elements
    }
  });

  updateSourceSync(sourceId, reviewsFound);
  return { ok: true, reviewsFound, reviewsAdded };
}

function parseRelativeDate(text: string): string {
  const now = new Date();
  const lower = text.toLowerCase();

  if (lower.includes("a day ago") || lower.includes("1 day ago")) {
    now.setDate(now.getDate() - 1);
  } else if (lower.includes("day")) {
    const match = lower.match(/(\d+)\s*day/);
    if (match) now.setDate(now.getDate() - parseInt(match[1], 10));
  } else if (lower.includes("week")) {
    const match = lower.match(/(\d+)\s*week/);
    const weeks = match ? parseInt(match[1], 10) : 1;
    now.setDate(now.getDate() - weeks * 7);
  } else if (lower.includes("month")) {
    const match = lower.match(/(\d+)\s*month/);
    const months = match ? parseInt(match[1], 10) : 1;
    now.setMonth(now.getMonth() - months);
  } else if (lower.includes("year")) {
    const match = lower.match(/(\d+)\s*year/);
    const years = match ? parseInt(match[1], 10) : 1;
    now.setFullYear(now.getFullYear() - years);
  }

  return now.toISOString().split("T")[0];
}
