import { NextRequest, NextResponse } from "next/server";
import { getSource } from "@/lib/db";
import { syncSource } from "@/lib/scraper";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { sourceId } = body as { sourceId?: string };

  if (!sourceId) {
    return NextResponse.json(
      { error: "sourceId is required" },
      { status: 400 }
    );
  }

  const source = getSource(sourceId);
  if (!source) {
    return NextResponse.json(
      { error: "Source not found" },
      { status: 404 }
    );
  }

  const result = await syncSource(sourceId, source.platform);
  return NextResponse.json(result);
}
