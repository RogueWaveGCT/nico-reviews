import { NextRequest, NextResponse } from "next/server";
import { getShowcaseBySlug, getReviewsByShowcase, getSources } from "@/lib/db";
import { computeStats } from "@/lib/stats";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json(
      { error: "slug parameter is required" },
      { status: 400 }
    );
  }

  const showcase = getShowcaseBySlug(slug);
  if (!showcase) {
    return NextResponse.json(
      { error: "Showcase not found" },
      { status: 404 }
    );
  }

  const reviews = getReviewsByShowcase(showcase.id);
  const sources = getSources(showcase.id);
  const stats = computeStats(reviews);

  return NextResponse.json({
    showcase,
    reviews,
    sources,
    stats,
  });
}
