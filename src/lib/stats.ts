import type { Review, Platform, ShowcaseData } from "./types";

const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "is", "it", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "shall", "can", "need", "dare", "ought",
  "used", "this", "that", "these", "those", "i", "me", "my", "mine",
  "we", "us", "our", "ours", "you", "your", "yours", "he", "him", "his",
  "she", "her", "hers", "they", "them", "their", "theirs", "what",
  "which", "who", "whom", "where", "when", "why", "how", "all", "each",
  "every", "both", "few", "more", "most", "some", "any", "no", "not",
  "only", "own", "same", "so", "than", "too", "very", "just", "about",
  "above", "after", "again", "against", "am", "are", "aren", "as",
  "because", "before", "below", "between", "from", "further", "here",
  "if", "into", "its", "let", "nor", "off", "once", "other", "out",
  "over", "such", "then", "there", "through", "under", "until", "up",
  "while", "also", "back", "even", "still", "went", "got", "get",
  "one", "two", "don", "didn", "doesn", "won", "wouldn", "couldn",
  "shouldn", "really", "felt", "like", "think", "know", "made",
  "going", "come", "well", "much", "already", "ever", "never",
]);

export function computeStats(reviews: Review[]): ShowcaseData["stats"] {
  const visible = reviews.filter((r) => r.hidden === 0);
  const totalReviews = visible.length;

  // Average rating
  const sumRating = visible.reduce((acc, r) => acc + r.rating, 0);
  const averageRating =
    totalReviews > 0 ? Math.round((sumRating / totalReviews) * 10) / 10 : 0;

  // Platform breakdown
  const platformBreakdown: Record<Platform, { count: number; average: number }> = {
    google: { count: 0, average: 0 },
    tripadvisor: { count: 0, average: 0 },
  };

  const platformSums: Record<Platform, number> = { google: 0, tripadvisor: 0 };

  for (const review of visible) {
    platformBreakdown[review.platform].count++;
    platformSums[review.platform] += review.rating;
  }

  for (const platform of ["google", "tripadvisor"] as Platform[]) {
    const count = platformBreakdown[platform].count;
    platformBreakdown[platform].average =
      count > 0 ? Math.round((platformSums[platform] / count) * 10) / 10 : 0;
  }

  // Rating distribution
  const ratingDistribution: Record<number, number> = {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
  };
  for (const review of visible) {
    ratingDistribution[review.rating]++;
  }

  // Monthly trend (last 12 months)
  const now = new Date();
  const monthlyMap = new Map<string, { sum: number; count: number }>();

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyMap.set(key, { sum: 0, count: 0 });
  }

  for (const review of visible) {
    const month = review.review_date.substring(0, 7);
    const entry = monthlyMap.get(month);
    if (entry) {
      entry.sum += review.rating;
      entry.count++;
    }
  }

  const monthlyTrend = Array.from(monthlyMap.entries()).map(
    ([month, data]) => ({
      month,
      average: data.count > 0
        ? Math.round((data.sum / data.count) * 10) / 10
        : 0,
      count: data.count,
    })
  );

  // Keyword extraction from positive reviews (4-5 stars)
  const wordFreq = new Map<string, number>();
  const positiveReviews = visible.filter((r) => r.rating >= 4 && r.body);

  for (const review of positiveReviews) {
    const words = (review.body || "")
      .toLowerCase()
      .replace(/[^a-z\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !STOP_WORDS.has(w));

    const unique = new Set(words);
    for (const word of unique) {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    }
  }

  const keywords = Array.from(wordFreq.entries())
    .filter(([_, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([word, count]) => ({ word, count }));

  return {
    totalReviews,
    averageRating,
    platformBreakdown,
    ratingDistribution,
    monthlyTrend,
    keywords,
  };
}
