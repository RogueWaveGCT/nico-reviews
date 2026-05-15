"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { Review } from "@/lib/types";
import { StarRating } from "./star-rating";
import { PlatformBadge } from "./platform-badge";

interface ReviewCarouselProps {
  reviews: Review[];
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ReviewCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false);
  const bodyLength = review.body?.length || 0;
  const needsTruncation = bodyLength > 200;

  const displayBody =
    needsTruncation && !expanded
      ? review.body?.slice(0, 200) + "..."
      : review.body;

  const initials = review.author_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="glass-card-hover p-6 min-w-[300px] max-w-[380px] md:min-w-[360px] flex-shrink-0 flex flex-col">
      <div className="flex items-start gap-3 mb-3">
        {review.author_avatar_url ? (
          <img
            src={review.author_avatar_url}
            alt=""
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm font-semibold text-text-secondary">
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-text-primary font-medium text-sm truncate">
            {review.author_name}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-text-tertiary text-xs">
              {formatDate(review.review_date)}
            </span>
            <PlatformBadge platform={review.platform} />
          </div>
        </div>
      </div>

      <div className="mb-3">
        <StarRating rating={review.rating} size="sm" />
      </div>

      {displayBody && (
        <p className="text-text-secondary text-sm leading-relaxed flex-1">
          {displayBody}
          {needsTruncation && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-accent-teal ml-1 hover:underline focus:outline-none text-sm"
            >
              {expanded ? "show less" : "read more"}
            </button>
          )}
        </p>
      )}

      {!review.body && (
        <div className="flex-1 flex items-center">
          <p className="text-text-tertiary text-sm italic">
            {review.rating >= 4 ? "Left a positive rating" : "No written review"}
          </p>
        </div>
      )}
    </div>
  );
}

export function ReviewCarousel({ reviews }: ReviewCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const distance = el.clientWidth * 0.8;
    el.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth",
    });
  };

  if (reviews.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto">
      <h2 className="text-xl font-semibold text-text-primary mb-6 text-center px-4">
        Recent reviews
      </h2>

      <div className="relative">
        {/* Scroll buttons */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center text-text-primary hover:bg-white/20 transition-colors hidden md:flex"
            aria-label="Scroll left"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center text-text-primary hover:bg-white/20 transition-colors hidden md:flex"
            aria-label="Scroll right"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Fade edges */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-surface-base to-transparent z-[1] pointer-events-none" />
        )}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-surface-base to-transparent z-[1] pointer-events-none" />
        )}

        {/* Scrollable container */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto px-4 pb-4 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {reviews.map((review) => (
            <div key={review.id} className="snap-start">
              <ReviewCard review={review} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
