"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface TrendChartProps {
  monthlyTrend: Array<{ month: string; average: number; count: number }>;
}

function formatMonth(month: string): string {
  const [year, m] = month.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[parseInt(m, 10) - 1]} '${year.slice(2)}`;
}

interface TooltipPayloadEntry {
  payload: {
    month: string;
    average: number;
    count: number;
  };
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
}) {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0].payload;
  if (data.count === 0) return null;

  return (
    <div className="glass-card px-3 py-2 text-sm">
      <p className="text-text-primary font-medium">{formatMonth(data.month)}</p>
      <p className="text-accent-gold">
        {data.average.toFixed(1)}★ from {data.count} {data.count === 1 ? "review" : "reviews"}
      </p>
    </div>
  );
}

export function TrendChart({ monthlyTrend }: TrendChartProps) {
  const hasData = monthlyTrend.some((m) => m.count > 0);
  if (!hasData) return null;

  const chartData = monthlyTrend.map((m) => ({
    ...m,
    label: formatMonth(m.month),
    displayAvg: m.count > 0 ? m.average : null,
  }));

  return (
    <section className="px-4 max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold text-text-primary mb-6 text-center">
        Rating trend
      </h2>
      <div className="glass-card p-6 md:p-8">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
            <defs>
              <linearGradient id="ratingGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[1, 5]}
              tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              ticks={[1, 2, 3, 4, 5]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="displayAvg"
              stroke="#F59E0B"
              strokeWidth={2}
              fill="url(#ratingGradient)"
              connectNulls
              dot={false}
              activeDot={{
                r: 5,
                fill: "#F59E0B",
                stroke: "rgba(245,158,11,0.3)",
                strokeWidth: 8,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
