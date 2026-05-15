"use client";

interface StarRatingProps {
  rating: number;
  size?: "sm" | "md" | "lg" | "xl";
  showValue?: boolean;
}

const SIZE_MAP = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
  xl: "w-8 h-8",
};

export function StarRating({ rating, size = "md", showValue = false }: StarRatingProps) {
  const sizeClass = SIZE_MAP[size];
  const fullStars = Math.floor(rating);
  const partialFill = rating - fullStars;
  const emptyStars = 5 - fullStars - (partialFill > 0 ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: fullStars }).map((_, i) => (
        <svg key={`full-${i}`} className={`${sizeClass} star-gold`} viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      {partialFill > 0 && (
        <svg key="partial" className={`${sizeClass} star-gold`} viewBox="0 0 20 20">
          <defs>
            <linearGradient id={`partial-fill-${rating}`}>
              <stop offset={`${partialFill * 100}%`} stopColor="currentColor" />
              <stop offset={`${partialFill * 100}%`} stopColor="rgba(255,255,255,0.15)" />
            </linearGradient>
          </defs>
          <path
            fill={`url(#partial-fill-${rating})`}
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
          />
        </svg>
      )}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <svg key={`empty-${i}`} className={`${sizeClass} text-white/15`} viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      {showValue && (
        <span className="ml-1 text-sm text-text-secondary font-medium">{rating.toFixed(1)}</span>
      )}
    </div>
  );
}
