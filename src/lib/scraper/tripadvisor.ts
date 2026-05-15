import * as cheerio from "cheerio";
import type { SyncResult } from "../types";
import { upsertReview, updateSourceSync, getSource } from "../db";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 3000;
const MAX_PAGES = 10;

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

    if (!response.ok) return null;
    return await response.text();
  } catch {
    if (attempt < MAX_RETRIES) return fetchWithBackoff(url, attempt + 1);
    return null;
  }
}

/**
 * Scrape reviews from a TripAdvisor attraction/activity page.
 *
 * Paginates through review pages (up to MAX_PAGES) using TripAdvisor's
 * offset-based URL pattern. Like all scrapers targeting dynamic sites,
 * selectors may need updating when TripAdvisor changes their markup.
 */
export async function scrapeTripAdvisorReviews(
  sourceId: string
): Promise<SyncResult> {
  const source = getSource(sourceId);
  if (!source) {
    return { ok: false, reviewsFound: 0, reviewsAdded: 0, error: "Source not found" };
  }

  let totalFound = 0;
  let totalAdded = 0;
  let currentUrl = source.url;

  for (let page = 0; page < MAX_PAGES; page++) {
    const html = await fetchWithBackoff(currentUrl);
    if (!html) {
      if (page === 0) {
        updateSourceSync(
          sourceId,
          source.total_reviews,
          "Failed to fetch TripAdvisor page"
        );
        return {
          ok: false,
          reviewsFound: 0,
          reviewsAdded: 0,
          error: "Failed to fetch TripAdvisor page",
        };
      }
      break;
    }

    const $ = cheerio.load(html);
    const reviewElements = $(
      "[data-automation='reviewCard'], .review-container, .YibKl, [class*='ReviewCard']"
    );

    if (reviewElements.length === 0) break;

    reviewElements.each((_, el) => {
      try {
        const $el = $(el);
        const authorName =
          $el.find("[class*='username'], [class*='memberName'], .ui_header_link").first().text().trim() ||
          "Traveller";

        // TripAdvisor uses bubble ratings (class="ui_bubble_rating bubble_50" = 5 stars)
        const bubbleClass =
          $el.find("[class*='bubble_'], [class*='UctUV']").attr("class") || "";
        const bubbleMatch = bubbleClass.match(/bubble_(\d)0/);
        const ratingFromTitle = $el
          .find("[class*='rating'] title, svg[aria-label]")
          .attr("aria-label");
        const titleMatch = ratingFromTitle?.match(/(\d)/);

        const rating = bubbleMatch
          ? parseInt(bubbleMatch[1], 10)
          : titleMatch
            ? parseInt(titleMatch[1], 10)
            : 0;

        if (rating < 1 || rating > 5) return;

        const body =
          $el.find("[class*='reviewText'], .prw_reviews_text_summary_hsx, .QewHA, q").first().text().trim() || null;

        const dateText =
          $el.find("[class*='date'], .ratingDate, .cRVSd").first().text().trim() || "";
        const reviewDate = parseTripAdvisorDate(dateText);

        const avatarUrl =
          $el.find("img[class*='avatar'], img[class*='member']").attr("src") || null;

        // Collect photo URLs
        const photos: string[] = [];
        $el.find("[class*='photo'] img, [class*='media'] img").each((_, img) => {
          const src = $(img).attr("src");
          if (src && !src.includes("avatar")) photos.push(src);
        });

        const id = `ta-${sourceId}-${authorName}-${reviewDate}`
          .replace(/\s+/g, "-")
          .toLowerCase();

        const inserted = upsertReview({
          id,
          source_id: sourceId,
          platform: "tripadvisor",
          author_name: authorName,
          author_avatar_url: avatarUrl,
          rating,
          review_date: reviewDate,
          body,
          photo_urls: photos.length > 0 ? JSON.stringify(photos) : null,
          hidden: 0,
        });

        totalFound++;
        if (inserted) totalAdded++;
      } catch {
        // Skip malformed elements
      }
    });

    // Find next page link
    const nextLink = $("a.next, a[class*='next'], [data-page-number]")
      .last()
      .attr("href");
    if (!nextLink) break;

    currentUrl = nextLink.startsWith("http")
      ? nextLink
      : `https://www.tripadvisor.co.uk${nextLink}`;

    // Polite delay between pages
    await new Promise((r) => setTimeout(r, 2000));
  }

  updateSourceSync(sourceId, totalFound);
  return { ok: true, reviewsFound: totalFound, reviewsAdded: totalAdded };
}

function parseTripAdvisorDate(text: string): string {
  // TripAdvisor dates: "March 2026", "Date of experience: March 2026", "3 Mar 2026"
  const cleaned = text.replace(/date of experience:\s*/i, "").trim();

  const monthNames: Record<string, number> = {
    january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
    july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
    jan: 0, feb: 1, mar: 2, apr: 3, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
  };

  // Try "Month Year"
  const monthYearMatch = cleaned.match(
    /(\w+)\s+(\d{4})/i
  );
  if (monthYearMatch) {
    const monthIdx = monthNames[monthYearMatch[1].toLowerCase()];
    if (monthIdx !== undefined) {
      const year = parseInt(monthYearMatch[2], 10);
      return `${year}-${String(monthIdx + 1).padStart(2, "0")}-15`;
    }
  }

  // Try "DD Mon YYYY"
  const dMyMatch = cleaned.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/);
  if (dMyMatch) {
    const monthIdx = monthNames[dMyMatch[2].toLowerCase()];
    if (monthIdx !== undefined) {
      const day = parseInt(dMyMatch[1], 10);
      const year = parseInt(dMyMatch[3], 10);
      return `${year}-${String(monthIdx + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }
  }

  return new Date().toISOString().split("T")[0];
}
