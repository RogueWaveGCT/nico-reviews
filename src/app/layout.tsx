import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Review Showcase",
  description: "Aggregated reviews from Google and TripAdvisor",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-surface-base text-text-primary">{children}</body>
    </html>
  );
}
