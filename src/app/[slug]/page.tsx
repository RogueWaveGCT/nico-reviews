import { notFound } from "next/navigation";
import { getShowcaseBySlug, getReviewsByShowcase, getSources } from "@/lib/db";
import { computeStats } from "@/lib/stats";
import { ShowcasePage } from "@/components/showcase/showcase-page";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const showcase = getShowcaseBySlug(slug);

  if (!showcase) {
    return { title: "Not found" };
  }

  return {
    title: `${showcase.business_name} · Reviews`,
    description: `Verified reviews for ${showcase.business_name} from Google and TripAdvisor`,
    openGraph: {
      title: `${showcase.business_name} · Reviews`,
      description: `Verified reviews for ${showcase.business_name} from Google and TripAdvisor`,
    },
  };
}

export default async function ShowcaseRoute({ params }: PageProps) {
  const { slug } = await params;
  const showcase = getShowcaseBySlug(slug);

  if (!showcase) {
    notFound();
  }

  const reviews = getReviewsByShowcase(showcase.id);
  const sources = getSources(showcase.id);
  const stats = computeStats(reviews);

  return (
    <ShowcasePage
      data={{
        showcase,
        reviews,
        sources,
        stats,
      }}
    />
  );
}
