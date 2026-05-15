"use client";

import { StarRating } from "./star-rating";
import type { Platform } from "@/lib/types";

interface SourceBreakdownProps {
  platformBreakdown: Record<Platform, { count: number; average: number }>;
}

export function SourceBreakdown({ platformBreakdown }: SourceBreakdownProps) {
  const platforms = [
    {
      key: "google" as Platform,
      name: "Google",
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
      ),
      color: "rgba(66, 133, 244, 0.1)",
      borderColor: "rgba(66, 133, 244, 0.2)",
    },
    {
      key: "tripadvisor" as Platform,
      name: "TripAdvisor",
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="11" fill="#34E0A1" opacity="0.9" />
          <path d="M12 5l2 6h6l-5 3.5 2 6-5-3.5-5 3.5 2-6-5-3.5h6z" fill="#0F3D2C" />
        </svg>
      ),
      color: "rgba(52, 224, 161, 0.1)",
      borderColor: "rgba(52, 224, 161, 0.2)",
    },
  ];

  return (
    <section className="px-4 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {platforms.map((p) => {
          const data = platformBreakdown[p.key];
          if (data.count === 0) return null;
          return (
            <div
              key={p.key}
              className="glass-card p-6 md:p-8"
              style={{ borderColor: p.borderColor }}
            >
              <div className="flex items-center gap-3 mb-4">
                {p.icon}
                <span className="text-lg font-semibold text-text-primary">
                  {p.name}
                </span>
              </div>
              <div className="flex items-end gap-3 mb-2">
                <span className="text-4xl font-bold text-gradient">
                  {data.average.toFixed(1)}
                </span>
                <span className="text-text-secondary text-sm pb-1">
                  / 5.0
                </span>
              </div>
              <StarRating rating={data.average} size="md" />
              <p className="text-text-secondary text-sm mt-3">
                {data.count} {data.count === 1 ? "review" : "reviews"}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
