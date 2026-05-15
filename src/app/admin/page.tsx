"use client";

import { useState, useEffect, useCallback } from "react";
import type { Source, Showcase } from "@/lib/types";

interface AdminData {
  showcase: Showcase;
  sources: Source[];
}

export default function AdminPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [url, setUrl] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/sources");
      const json = await res.json();
      setData(json);
    } catch {
      setMessage({ type: "error", text: "Failed to load data" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setMessage(null);

    const res = await fetch("/api/sources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: url.trim(), businessName: businessName.trim() || undefined }),
    });
    const json = await res.json();

    if (!res.ok) {
      setMessage({ type: "error", text: json.error || "Failed to add source" });
      return;
    }

    setUrl("");
    setBusinessName("");
    setMessage({ type: "ok", text: "Source added" });
    fetchData();
  };

  const removeSource = async (id: string) => {
    if (!confirm("Remove this source and all its reviews?")) return;
    await fetch(`/api/sources?id=${id}`, { method: "DELETE" });
    fetchData();
  };

  const syncSource = async (id: string) => {
    setSyncing(id);
    setMessage(null);
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceId: id }),
      });
      const json = await res.json();
      if (json.ok) {
        setMessage({
          type: "ok",
          text: `Synced: ${json.reviewsFound} found, ${json.reviewsAdded} new`,
        });
      } else {
        setMessage({ type: "error", text: json.error || "Sync failed" });
      }
    } catch {
      setMessage({ type: "error", text: "Sync request failed" });
    } finally {
      setSyncing(null);
      fetchData();
    }
  };

  const seedDatabase = async () => {
    setSeeding(true);
    setMessage(null);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const json = await res.json();
      if (json.ok) {
        setMessage({ type: "ok", text: "Database seeded with demo reviews" });
      } else {
        setMessage({ type: "error", text: json.error || "Seed failed" });
      }
    } catch {
      setMessage({ type: "error", text: "Seed request failed" });
    } finally {
      setSeeding(false);
      fetchData();
    }
  };

  const copyLink = () => {
    if (!data) return;
    const base = window.location.origin;
    navigator.clipboard.writeText(`${base}/${data.showcase.slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Review Sources</h1>
          <button
            onClick={seedDatabase}
            disabled={seeding}
            className="text-sm px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors disabled:opacity-50"
          >
            {seeding ? "Seeding..." : "Load demo data"}
          </button>
        </div>

        {/* Public link */}
        {data && (
          <div className="mb-8 p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-gray-400 mb-1">Public showcase link</p>
                <code className="text-teal-400 text-sm">
                  {typeof window !== "undefined" ? window.location.origin : ""}/{data.showcase.slug}
                </code>
              </div>
              <button
                onClick={copyLink}
                className="px-3 py-1.5 rounded-lg bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 transition-colors text-sm whitespace-nowrap"
              >
                {copied ? "Copied" : "Copy link"}
              </button>
            </div>
          </div>
        )}

        {/* Status messages */}
        {message && (
          <div
            className={`mb-6 p-3 rounded-lg text-sm ${
              message.type === "ok"
                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Add source form */}
        <form onSubmit={addSource} className="mb-10">
          <h2 className="text-lg font-semibold mb-4">Add a review source</h2>
          <div className="space-y-3">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste a Google Maps or TripAdvisor URL"
              required
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-teal-500/50 transition-colors"
            />
            <div className="flex gap-3">
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Business name (optional)"
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-teal-500/50 transition-colors"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-medium transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </form>

        {/* Sources list */}
        <h2 className="text-lg font-semibold mb-4">Connected sources</h2>
        {data && data.sources.length === 0 && (
          <div className="p-8 rounded-xl bg-white/5 border border-white/10 text-center">
            <p className="text-gray-400 mb-2">No sources yet</p>
            <p className="text-gray-500 text-sm">
              Add a Google or TripAdvisor URL above, or load demo data to get started
            </p>
          </div>
        )}
        <div className="space-y-3">
          {data?.sources.map((source) => (
            <div
              key={source.id}
              className="p-4 rounded-xl bg-white/5 border border-white/10"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        source.platform === "google"
                          ? "bg-blue-500/15 text-blue-400"
                          : "bg-emerald-500/15 text-emerald-400"
                      }`}
                    >
                      {source.platform === "google" ? "Google" : "TripAdvisor"}
                    </span>
                    {source.business_name && (
                      <span className="text-sm text-gray-300 font-medium">
                        {source.business_name}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate mb-2">{source.url}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>{source.total_reviews} reviews</span>
                    <span>
                      {source.last_sync_at
                        ? `Synced ${new Date(source.last_sync_at + "Z").toLocaleString()}`
                        : "Not yet synced"}
                    </span>
                    {source.last_sync_error && (
                      <span className="text-red-400" title={source.last_sync_error}>
                        Sync error
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => syncSource(source.id)}
                    disabled={syncing === source.id}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-gray-300 transition-colors disabled:opacity-50"
                  >
                    {syncing === source.id ? "Syncing..." : "Sync now"}
                  </button>
                  <button
                    onClick={() => removeSource(source.id)}
                    className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-sm text-red-400 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick link to public page */}
        {data && data.sources.length > 0 && (
          <div className="mt-8 text-center">
            <a
              href={`/${data.showcase.slug}`}
              className="text-teal-400 hover:text-teal-300 text-sm transition-colors"
            >
              View public showcase page →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
