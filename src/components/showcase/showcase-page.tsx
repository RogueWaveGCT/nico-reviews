"use client";

import type { ShowcaseData } from "@/lib/types";
import { Hero } from "./hero";
import { SourceBreakdown } from "./source-breakdown";
import { RatingDistribution } from "./rating-distribution";
import { TrendChart } from "./trend-chart";
import { SentimentCloud } from "./sentiment-cloud";
import { ReviewCarousel } from "./review-carousel";
import { Footer } from "./footer";
import { AnimateOnScroll } from "./use-scroll-animate";

interface ShowcasePageProps {
  data: ShowcaseData;
}

export function ShowcasePage({ data }: ShowcasePageProps) {
  const { showcase, reviews, stats } = data;

  if (stats.totalReviews === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card p-12 text-center max-w-md">
          <p className="text-text-primary text-lg font-medium mb-2">
            No reviews yet
          </p>
          <p className="text-text-secondary text-sm">
            Reviews will appear here once sources are connected
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated gradient washes */}
      <div
        className="gradient-wash animate-drift-1"
        style={{
          width: "600px",
          height: "600px",
          top: "-10%",
          left: "-5%",
          background: "radial-gradient(circle, rgba(45, 212, 191, 0.12) 0%, transparent 70%)",
        }}
      />
      <div
        className="gradient-wash animate-drift-2"
        style={{
          width: "500px",
          height: "500px",
          top: "40%",
          right: "-10%",
          background: "radial-gradient(circle, rgba(245, 158, 11, 0.08) 0%, transparent 70%)",
        }}
      />
      <div
        className="gradient-wash animate-drift-1"
        style={{
          width: "400px",
          height: "400px",
          bottom: "10%",
          left: "20%",
          background: "radial-gradient(circle, rgba(45, 212, 191, 0.06) 0%, transparent 70%)",
          animationDelay: "-10s",
        }}
      />

      {/* Content */}
      <div className="relative z-10 space-y-16 md:space-y-24 pb-8">
        <AnimateOnScroll>
          <Hero
            averageRating={stats.averageRating}
            totalReviews={stats.totalReviews}
            businessName={showcase.business_name}
          />
        </AnimateOnScroll>

        <AnimateOnScroll delay={100}>
          <SourceBreakdown platformBreakdown={stats.platformBreakdown} />
        </AnimateOnScroll>

        <AnimateOnScroll delay={150}>
          <RatingDistribution
            distribution={stats.ratingDistribution}
            total={stats.totalReviews}
          />
        </AnimateOnScroll>

        <AnimateOnScroll delay={200}>
          <TrendChart monthlyTrend={stats.monthlyTrend} />
        </AnimateOnScroll>

        <AnimateOnScroll delay={100}>
          <SentimentCloud keywords={stats.keywords} />
        </AnimateOnScroll>

        <AnimateOnScroll delay={100}>
          <ReviewCarousel reviews={reviews.slice(0, 20)} />
        </AnimateOnScroll>

        <Footer businessName={showcase.business_name} />
      </div>
    </div>
  );
}
