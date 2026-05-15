"use client";

import { useMemo } from "react";

interface SentimentCloudProps {
  keywords: Array<{ word: string; count: number }>;
}

export function SentimentCloud({ keywords }: SentimentCloudProps) {
  if (keywords.length === 0) return null;

  const bubbles = useMemo(() => {
    const maxCount = Math.max(...keywords.map((k) => k.count));
    const minCount = Math.min(...keywords.map((k) => k.count));
    const range = maxCount - minCount || 1;

    return keywords.map((kw, i) => {
      const normalised = (kw.count - minCount) / range;
      const fontSize = 12 + normalised * 16;
      const opacity = 0.5 + normalised * 0.5;

      const cols = 5;
      const col = i % cols;
      const row = Math.floor(i / cols);
      const xJitter = ((i * 17) % 30) - 15;
      const yJitter = ((i * 13) % 20) - 10;

      return {
        ...kw,
        fontSize,
        opacity,
        x: 10 + (col / (cols - 1)) * 80 + xJitter * 0.3,
        y: 15 + row * 22 + yJitter * 0.3,
      };
    });
  }, [keywords]);

  const viewHeight = Math.max(200, Math.ceil(keywords.length / 5) * 55 + 40);

  return (
    <section className="px-4 max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold text-text-primary mb-6 text-center">
        What people say most
      </h2>
      <div className="glass-card p-6 md:p-8">
        <svg
          viewBox={`0 0 100 ${viewHeight / 4}`}
          className="w-full"
          style={{ maxHeight: `${viewHeight}px` }}
        >
          {bubbles.map((b) => (
            <text
              key={b.word}
              x={`${b.x}%`}
              y={`${b.y}%`}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={b.opacity > 0.7 ? "#FCD34D" : "#2DD4BF"}
              opacity={b.opacity}
              fontSize={b.fontSize / 4}
              fontWeight={b.opacity > 0.7 ? 600 : 400}
              fontFamily="Inter, system-ui, sans-serif"
            >
              {b.word}
            </text>
          ))}
        </svg>
      </div>
    </section>
  );
}
