"use client";

interface RatingDistributionProps {
  distribution: Record<number, number>;
  total: number;
}

export function RatingDistribution({ distribution, total }: RatingDistributionProps) {
  const rows = [5, 4, 3, 2, 1];

  return (
    <section className="px-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold text-text-primary mb-6 text-center">
        Rating breakdown
      </h2>
      <div className="glass-card p-6 md:p-8">
        <div className="space-y-3">
          {rows.map((star) => {
            const count = distribution[star] || 0;
            const percentage = total > 0 ? (count / total) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-3">
                <span className="text-sm font-medium text-text-secondary w-8 text-right">
                  {star}★
                </span>
                <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${percentage}%`,
                      background: "linear-gradient(90deg, #F59E0B, #FCD34D)",
                      minWidth: count > 0 ? "4px" : "0",
                    }}
                  />
                </div>
                <span className="text-sm text-text-secondary w-16 text-right tabular-nums">
                  {count} ({Math.round(percentage)}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
