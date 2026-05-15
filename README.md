# Nico Reviews

Aggregated review showcase for Google and TripAdvisor reviews, with a glassmorphic dark-mode public page and a lightweight admin surface.

## Quick start

```bash
npm install
cp .env.example .env
npm run seed     # Load 28 demo reviews
npm run dev      # Start at http://localhost:3000
```

The seed script prints the generated slug. Visit `http://localhost:3000/{slug}` to see the public page. Visit `http://localhost:3000/admin` to manage sources.

## How it works

### Admin (`/admin`)
- Paste a Google Maps URL or TripAdvisor URL to add it as a review source
- Each source shows its platform, review count, last sync time, and any errors
- "Sync now" triggers a live scrape of that source
- "Load demo data" seeds 28 realistic reviews for an adventure bike tour guide
- The public link with copy-to-clipboard is shown at the top

### Public page (`/{slug}`)
- Hero with aggregate rating, star visual, and review count
- Platform breakdown cards (Google and TripAdvisor side by side)
- Rating distribution bar chart (5★ down to 1★)
- Monthly rating trend area chart (last 12 months)
- Sentiment keyword cloud extracted from positive reviews
- Swipeable review carousel with read-more expansion
- Footer with "Get in touch" CTA linking to the configured phone number

### Scraping
- Google: parses public business profile HTML with cheerio
- TripAdvisor: paginates through review pages (up to 10 pages)
- Both use exponential backoff and polite rate limiting
- Failed scrapes retain previous data so the public page never goes blank
- Deduplicates reviews by source + author + date

## Environment variables

Copy `.env.example` to `.env`:

| Variable | Default | Description |
|---|---|---|
| `DATABASE_PATH` | `./data/reviews.db` | SQLite database file location |
| `NEXT_PUBLIC_BASE_URL` | `http://localhost:3000` | Base URL for shareable links |

## Tech stack

- Next.js 15 (App Router)
- React 19
- Tailwind CSS 3
- Recharts
- better-sqlite3
- cheerio (HTML scraping)

## Deployment

### Railway / Fly.io / VPS (recommended)
This app uses SQLite with better-sqlite3, which requires a persistent filesystem. Deploy as a standard Node.js app:

```bash
npm run build
npm start
```

Set `DATABASE_PATH` to a persistent volume path.

### Vercel
Vercel's serverless functions have an ephemeral filesystem, so standard SQLite does not persist between requests. To deploy on Vercel, swap better-sqlite3 for [Turso](https://turso.tech) (free tier, SQLite-compatible). The database layer is in `src/lib/db.ts` — replace the better-sqlite3 calls with `@libsql/client` and point it at your Turso database URL.

## Project structure

```
src/
  app/
    admin/page.tsx         Admin UI (client component)
    [slug]/page.tsx        Public showcase (server component)
    api/
      sources/route.ts     CRUD for review sources
      sync/route.ts        Trigger scrape for a source
      reviews/route.ts     Fetch reviews + stats by slug
      seed/route.ts        Seed demo data
      showcase/route.ts    Update showcase settings
  lib/
    db.ts                  SQLite database layer
    types.ts               Shared TypeScript types
    stats.ts               Review statistics computation
    seed.ts                Demo data (28 reviews)
    scraper/
      google.ts            Google review scraper
      tripadvisor.ts       TripAdvisor review scraper
      index.ts             Platform detection + routing
  components/
    showcase/              All public page components
```

## Adding real sources

1. Go to `/admin`
2. Find your Google Business Profile URL (the maps.google.com link) and paste it
3. Find your TripAdvisor activity/attraction page URL and paste it
4. Click "Sync now" on each source
5. Share the public link with clients

## CTA configuration

The footer CTA links to `tel:+447946065211`. To change the phone number, edit `src/components/showcase/footer.tsx`.
