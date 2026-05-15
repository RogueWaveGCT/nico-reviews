import { NextRequest, NextResponse } from "next/server";
import {
  getOrCreateDefaultShowcase,
  getSources,
  addSource,
  removeSource,
} from "@/lib/db";
import { detectPlatform } from "@/lib/scraper";

export async function GET() {
  const showcase = getOrCreateDefaultShowcase("Nico's Adventure Rides");
  const sources = getSources(showcase.id);
  return NextResponse.json({ showcase, sources });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { url, businessName } = body as {
    url?: string;
    businessName?: string;
  };

  if (!url || typeof url !== "string") {
    return NextResponse.json(
      { error: "URL is required" },
      { status: 400 }
    );
  }

  const platform = detectPlatform(url);
  if (!platform) {
    return NextResponse.json(
      { error: "URL must be a Google Maps or TripAdvisor link" },
      { status: 400 }
    );
  }

  const showcase = getOrCreateDefaultShowcase("Nico's Adventure Rides");
  const source = addSource(showcase.id, platform, url, businessName);

  return NextResponse.json({ source }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Source ID is required" },
      { status: 400 }
    );
  }

  removeSource(id);
  return NextResponse.json({ ok: true });
}
