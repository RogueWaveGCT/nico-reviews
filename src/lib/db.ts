import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import type { Source, Review, Showcase, Platform } from "./types";

const DB_PATH = process.env.DATABASE_PATH || "./data/reviews.db";

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;

  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");

  initialise(_db);
  return _db;
}

function initialise(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS showcases (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      business_name TEXT NOT NULL DEFAULT 'My Business',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sources (
      id TEXT PRIMARY KEY,
      showcase_id TEXT NOT NULL REFERENCES showcases(id) ON DELETE CASCADE,
      platform TEXT NOT NULL CHECK (platform IN ('google', 'tripadvisor')),
      url TEXT NOT NULL,
      business_name TEXT,
      last_sync_at TEXT,
      last_sync_error TEXT,
      total_reviews INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      source_id TEXT NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
      platform TEXT NOT NULL,
      author_name TEXT NOT NULL,
      author_avatar_url TEXT,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      review_date TEXT NOT NULL,
      body TEXT,
      photo_urls TEXT,
      hidden INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(source_id, author_name, review_date)
    );

    CREATE INDEX IF NOT EXISTS idx_reviews_source ON reviews(source_id);
    CREATE INDEX IF NOT EXISTS idx_reviews_platform ON reviews(platform);
    CREATE INDEX IF NOT EXISTS idx_reviews_date ON reviews(review_date);
    CREATE INDEX IF NOT EXISTS idx_sources_showcase ON sources(showcase_id);
    CREATE INDEX IF NOT EXISTS idx_showcases_slug ON showcases(slug);
  `);
}

// --- Showcase operations ---

export function getOrCreateDefaultShowcase(
  businessName = "My Business"
): Showcase {
  const db = getDb();
  const existing = db
    .prepare("SELECT * FROM showcases LIMIT 1")
    .get() as Showcase | undefined;

  if (existing) return existing;

  const id = generateId();
  const slug = generateSlug();
  db.prepare(
    "INSERT INTO showcases (id, slug, business_name) VALUES (?, ?, ?)"
  ).run(id, slug, businessName);

  return db.prepare("SELECT * FROM showcases WHERE id = ?").get(id) as Showcase;
}

export function getShowcaseBySlug(slug: string): Showcase | undefined {
  const db = getDb();
  return db
    .prepare("SELECT * FROM showcases WHERE slug = ?")
    .get(slug) as Showcase | undefined;
}

export function updateShowcase(
  id: string,
  fields: Partial<Pick<Showcase, "slug" | "business_name">>
): void {
  const db = getDb();
  if (fields.slug) {
    db.prepare(
      "UPDATE showcases SET slug = ?, updated_at = datetime('now') WHERE id = ?"
    ).run(fields.slug, id);
  }
  if (fields.business_name) {
    db.prepare(
      "UPDATE showcases SET business_name = ?, updated_at = datetime('now') WHERE id = ?"
    ).run(fields.business_name, id);
  }
}

// --- Source operations ---

export function getSources(showcaseId: string): Source[] {
  const db = getDb();
  return db
    .prepare("SELECT * FROM sources WHERE showcase_id = ? ORDER BY created_at DESC")
    .all(showcaseId) as Source[];
}

export function getSource(id: string): Source | undefined {
  const db = getDb();
  return db.prepare("SELECT * FROM sources WHERE id = ?").get(id) as
    | Source
    | undefined;
}

export function addSource(
  showcaseId: string,
  platform: Platform,
  url: string,
  businessName?: string
): Source {
  const db = getDb();
  const id = generateId();
  db.prepare(
    "INSERT INTO sources (id, showcase_id, platform, url, business_name) VALUES (?, ?, ?, ?, ?)"
  ).run(id, showcaseId, platform, url, businessName || null);
  return db.prepare("SELECT * FROM sources WHERE id = ?").get(id) as Source;
}

export function removeSource(id: string): void {
  const db = getDb();
  db.prepare("DELETE FROM reviews WHERE source_id = ?").run(id);
  db.prepare("DELETE FROM sources WHERE id = ?").run(id);
}

export function updateSourceSync(
  id: string,
  totalReviews: number,
  error?: string
): void {
  const db = getDb();
  if (error) {
    db.prepare(
      "UPDATE sources SET last_sync_error = ?, total_reviews = ? WHERE id = ?"
    ).run(error, totalReviews, id);
  } else {
    db.prepare(
      "UPDATE sources SET last_sync_at = datetime('now'), last_sync_error = NULL, total_reviews = ? WHERE id = ?"
    ).run(totalReviews, id);
  }
}

// --- Review operations ---

export function getReviewsByShowcase(showcaseId: string): Review[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT r.* FROM reviews r
       JOIN sources s ON r.source_id = s.id
       WHERE s.showcase_id = ? AND r.hidden = 0
       ORDER BY r.review_date DESC`
    )
    .all(showcaseId) as Review[];
}

export function upsertReview(review: Omit<Review, "created_at">): boolean {
  const db = getDb();
  try {
    db.prepare(
      `INSERT INTO reviews (id, source_id, platform, author_name, author_avatar_url, rating, review_date, body, photo_urls, hidden)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(source_id, author_name, review_date) DO UPDATE SET
         rating = excluded.rating,
         body = excluded.body,
         photo_urls = excluded.photo_urls,
         author_avatar_url = excluded.author_avatar_url`
    ).run(
      review.id,
      review.source_id,
      review.platform,
      review.author_name,
      review.author_avatar_url,
      review.rating,
      review.review_date,
      review.body,
      review.photo_urls,
      review.hidden
    );
    return true;
  } catch {
    return false;
  }
}

export function toggleReviewHidden(id: string): void {
  const db = getDb();
  db.prepare("UPDATE reviews SET hidden = CASE WHEN hidden = 0 THEN 1 ELSE 0 END WHERE id = ?").run(id);
}

// --- Helpers ---

function generateId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 16; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function generateSlug(): string {
  const adjectives = ["stellar", "summit", "trail", "ridge", "peak", "wild"];
  const nouns = ["reviews", "rides", "tours", "routes", "roads", "paths"];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 900) + 100;
  return `${adj}-${noun}-${num}`;
}
