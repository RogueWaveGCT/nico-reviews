"use client";

import { StarRating } from "./star-rating";

interface HeroProps {
  averageRating: number;
  totalReviews: number;
  businessName: string;
}

export function Hero({ averageRating, totalReviews, businessName }: HeroProps) {
  return (
    <section className="text-center py-16 md:py-24 px-4">
      <p className="text-text-secondary text-sm md:text-base tracking-widest uppercase mb-6">
        {businessName}
      </p>

      <div className="relative inline-block mb-6">
        <span className="text-8xl md:text-[10rem] lg:text-[12rem] font-black tracking-tighter text-gradient leading-none">
          {averageRating.toFixed(1)}
        </span>
        <div
          className="absolute -inset-8 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(245,158,11,0.4) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="flex justify-center mb-4">
        <StarRating rating={averageRating} size="xl" />
      </div>

      <p className="text-text-secondary text-lg md:text-xl">
        <span className="text-text-primary font-semibold">{totalReviews}</span>
        {" "}verified reviews across Google and TripAdvisor
      </p>
    </section>
  );
}
