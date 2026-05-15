import { NextRequest, NextResponse } from "next/server";
import { getOrCreateDefaultShowcase, updateShowcase } from "@/lib/db";

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { slug, businessName } = body as {
    slug?: string;
    businessName?: string;
  };

  const showcase = getOrCreateDefaultShowcase();

  if (slug && typeof slug === "string") {
    const cleaned = slug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    if (cleaned.length < 3) {
      return NextResponse.json(
        { error: "Slug must be at least 3 characters" },
        { status: 400 }
      );
    }

    updateShowcase(showcase.id, { slug: cleaned });
  }

  if (businessName && typeof businessName === "string") {
    updateShowcase(showcase.id, { business_name: businessName });
  }

  const updated = getOrCreateDefaultShowcase();
  return NextResponse.json({ showcase: updated });
}
