import {
  getOrCreateDefaultShowcase,
  addSource,
  upsertReview,
  getDb,
} from "./db";
import type { Platform } from "./types";

interface SeedReview {
  author: string;
  rating: number;
  date: string;
  body: string;
  platform: Platform;
}

const SEED_REVIEWS: SeedReview[] = [
  {
    author: "James Harrington",
    rating: 5,
    date: "2026-04-28",
    body: "Absolutely world-class day out. Nico took us along the Cheddar Gorge route and then up onto the Mendips. The views were extraordinary and his knowledge of every lane, every viewpoint, every decent cafe stop was obvious. Bikes were in perfect condition. Cannot recommend highly enough.",
    platform: "google",
  },
  {
    author: "Sarah Mitchell",
    rating: 5,
    date: "2026-04-15",
    body: "Booked the Black Mountains tour for my husband's 50th. Nico sorted everything, bikes, route, lunch stop at a farmhouse pub near Abergavenny. The whole group said it was the highlight of the year. Professional, calm, and genuinely passionate about what he does.",
    platform: "google",
  },
  {
    author: "Tom Fairbanks",
    rating: 5,
    date: "2026-03-30",
    body: "Third time riding with Nico. Did the Brecon Beacons loop this time. He always matches the route to the group's ability which makes all the difference. Never felt rushed, never felt bored. The man knows every back road in South Wales.",
    platform: "google",
  },
  {
    author: "Rachel Owens",
    rating: 4,
    date: "2026-03-18",
    body: "Great tour through the Wye Valley. Stunning scenery and Nico was an excellent guide. Only minor gripe was the start time felt early for a weekend but I understand why given the distance covered. Would definitely go again.",
    platform: "google",
  },
  {
    author: "David Clarke",
    rating: 5,
    date: "2026-03-05",
    body: "I was nervous about joining as a relatively inexperienced rider. Nico put me at ease immediately, ran through the bike controls, stayed at my pace and checked in regularly. By the end of the day I felt ten times more confident. The route through the Quantocks was beautiful.",
    platform: "google",
  },
  {
    author: "Emma Richardson",
    rating: 5,
    date: "2026-02-20",
    body: "Organised a corporate team ride for 8 of us. Nico handled the logistics flawlessly. Mix of abilities in our group and he managed the pace perfectly so nobody was left behind. The route along the Somerset coast into Exmoor was spectacular. Several of the team have already asked about booking again.",
    platform: "google",
  },
  {
    author: "Mark Sullivan",
    rating: 3,
    date: "2026-02-08",
    body: "Decent ride and Nico clearly knows his stuff. The bikes were good quality. Felt the route was a touch long for what was advertised as an intermediate ride. Good but not quite what I expected.",
    platform: "google",
  },
  {
    author: "Charlotte Pemberton",
    rating: 5,
    date: "2026-01-25",
    body: "My partner and I did the winter Brecon ride. Cold but utterly magical. Mist clearing off the Beacons as we climbed, empty roads, wood fire at the lunch stop. Nico's route planning is outstanding. He reads the weather and adjusts on the fly. Felt completely safe the entire time.",
    platform: "google",
  },
  {
    author: "Alex Turner",
    rating: 5,
    date: "2025-12-14",
    body: "Got the Bristol Gorge and Chew Valley tour as a Christmas present. Perfect December day for it. Nico picked routes that avoided the mud and kept us on solid tarmac. His pre-ride safety briefing was thorough without being boring. Highlight was dropping down into the valley with the winter sun behind us.",
    platform: "google",
  },
  {
    author: "Helen Frost",
    rating: 4,
    date: "2025-11-28",
    body: "Lovely autumn ride through the Cotswolds edge. The colours were incredible. Nico chose some fantastic quiet lanes that I would never have found on my own. Bikes well maintained. Would have liked a slightly later lunch stop but that is a very minor point.",
    platform: "google",
  },
  {
    author: "Ben Cartwright",
    rating: 5,
    date: "2025-11-10",
    body: "Nico guided our stag party on a full day through the Forest of Dean and Wye Valley. Everyone from complete beginners to experienced riders had a brilliant time. He managed the group dynamics perfectly and the pub lunch he picked was spot on. Genuinely one of the best activity days any of us have done.",
    platform: "google",
  },
  {
    author: "Louise Whitaker",
    rating: 5,
    date: "2025-10-22",
    body: "Solo rider, joined one of Nico's open group tours. Welcoming from the first minute. Mixed group of ages and abilities and Nico made everyone feel included. The route around the Gower Peninsula was breathtaking. Already booked my next one.",
    platform: "google",
  },
  {
    author: "George Tanner",
    rating: 5,
    date: "2025-09-15",
    body: "Did the two-day tour covering Bristol to Brecon and back. Overnight in a cracking B&B that Nico recommended. The riding was superb, the company was great, and the whole thing was seamlessly organised. This is how adventure touring should be done.",
    platform: "google",
  },
  {
    author: "Hannah Beckett",
    rating: 5,
    date: "2025-08-30",
    body: "Nico is the real deal. Not some bloke who bought a few bikes and started a tour company. He actually knows every road, every hazard, every perfect photo spot. The Exmoor coast route was unforgettable. My riding has improved massively just from following his lines through the bends.",
    platform: "tripadvisor",
  },
  {
    author: "Steve Mercer",
    rating: 5,
    date: "2026-04-20",
    body: "Brought my 17-year-old son on the intro ride around the Mendips. Nico was brilliant with him, patient and encouraging without being patronising. The kid has not stopped talking about it since. We are already planning the next one. Top-quality bikes and gear provided.",
    platform: "tripadvisor",
  },
  {
    author: "Fiona Gray",
    rating: 4,
    date: "2026-03-25",
    body: "Thoroughly enjoyed the Gower ride. Nico found us roads I have lived in Wales my whole life and never discovered. Took some incredible photos at Three Cliffs Bay. Deducting one star only because the weather turned and we had to cut the last section short, though Nico handled the change of plan smoothly.",
    platform: "tripadvisor",
  },
  {
    author: "Rob Hayward",
    rating: 5,
    date: "2026-03-12",
    body: "Third year running doing a spring ride with Nico. He never repeats a route which I appreciate. This year was the Carmarthenshire hills and the riding was superb. Quiet roads, challenging but never dangerous, with Nico always visible ahead setting the pace. Faultless as always.",
    platform: "tripadvisor",
  },
  {
    author: "Claire Ashton",
    rating: 5,
    date: "2026-02-14",
    body: "Valentine's day ride through the Wye Valley with my husband. Nico had arranged a coffee stop at a riverside cafe and lunch at a gastropub he clearly knew well. Romantic and thrilling in equal measure. The man has a gift for reading what a group wants from the day.",
    platform: "tripadvisor",
  },
  {
    author: "Patrick O'Brien",
    rating: 5,
    date: "2026-01-18",
    body: "I have ridden with tour operators across Europe and Nico is comfortably in the top tier. His route knowledge is encyclopaedic, his safety standards are impeccable, and he has an easy manner that makes the whole day feel effortless. The Bristol to Bath via backroads tour was a masterclass in guiding.",
    platform: "tripadvisor",
  },
  {
    author: "Nadira Hussain",
    rating: 5,
    date: "2025-12-30",
    body: "New Year's Eve ride. What a way to end the year. Small group, spectacular sunset over the Severn Estuary from the top of a hill Nico knew about. He brought flasks of hot chocolate. Genuinely one of my favourite experiences of 2025. Booking again immediately.",
    platform: "tripadvisor",
  },
  {
    author: "Michael Doyle",
    rating: 3,
    date: "2025-12-05",
    body: "Good ride, well organised. The Quantocks route was pleasant enough. I found it a bit tame for what I was hoping for as an experienced rider but I think I should have booked the advanced tour instead. Nico was professional throughout and the bike was in great nick.",
    platform: "tripadvisor",
  },
  {
    author: "Ingrid Svensson",
    rating: 5,
    date: "2025-11-15",
    body: "Visiting from Sweden and found Nico through a recommendation. The autumn ride through the Forest of Dean was magical. The colours, the quiet roads, the mist in the valleys. Nico was a wonderful host who clearly loves sharing these landscapes. A genuine highlight of our UK trip.",
    platform: "tripadvisor",
  },
  {
    author: "Will Jennings",
    rating: 5,
    date: "2025-10-28",
    body: "Got the full-day Black Mountains tour. Started in Abergavenny, climbed the Gospel Pass and then wound through some of the most incredible scenery I have seen anywhere. Nico timed the lunch stop perfectly at a hilltop pub with views for miles. Photography stops at all the right moments. Superb.",
    platform: "tripadvisor",
  },
  {
    author: "Diane Mortimer",
    rating: 5,
    date: "2025-10-10",
    body: "I was the slowest in our group and never once felt like I was holding anyone up. Nico structured the ride so the faster riders could push on at certain sections while he stayed with me. That kind of thoughtful guiding is rare. The Cheddar and Mendips route was gorgeous.",
    platform: "tripadvisor",
  },
  {
    author: "Sam Okafor",
    rating: 5,
    date: "2025-09-22",
    body: "Nico sorted a custom route for four of us wanting something challenging. Delivered a belter through the Brecon Beacons with some seriously rewarding climbs and descents. He carried spares, had a backup plan for weather, and knew exactly where we could push on and where to ease off. Total pro.",
    platform: "tripadvisor",
  },
  {
    author: "Karen Fletcher",
    rating: 4,
    date: "2025-09-05",
    body: "Enjoyable day riding through North Somerset. Good mix of coast and countryside. Nico is clearly experienced and runs a tight ship. The bikes are well maintained and comfortable. Would have appreciated more photo stops but appreciate that's a personal preference.",
    platform: "tripadvisor",
  },
  {
    author: "Tim Barnett",
    rating: 5,
    date: "2025-08-18",
    body: "Mate. This bloke is brilliant. Did the Exmoor epic with three friends and it was hands down the best day on a bike any of us have had. Nico picked roads that made us feel like we were in a motorcycle documentary. Porlock Hill was terrifying and amazing. Already planning the return trip.",
    platform: "tripadvisor",
  },
  {
    author: "Jenny Marsh",
    rating: 5,
    date: "2025-07-30",
    body: "Summer evening ride around the Chew Valley. Perfect golden light, empty lanes, a stop at a village pub for a cold drink. Nico has this brilliant ability to make a ride feel like a genuine adventure even when you are 20 minutes from Bristol. Calm, capable, and very good company.",
    platform: "tripadvisor",
  },
];

export function seed(): void {
  const db = getDb();

  // Clear existing data
  db.exec("DELETE FROM reviews");
  db.exec("DELETE FROM sources");
  db.exec("DELETE FROM showcases");

  const showcase = getOrCreateDefaultShowcase("Nico's Adventure Rides");

  // Create two sources
  const googleSource = addSource(
    showcase.id,
    "google",
    "https://maps.google.com/maps?cid=PLACEHOLDER_GOOGLE_CID",
    "Nico's Adventure Rides"
  );

  const tripSource = addSource(
    showcase.id,
    "tripadvisor",
    "https://www.tripadvisor.co.uk/Attraction_Review-PLACEHOLDER",
    "Nico's Adventure Rides"
  );

  let googleCount = 0;
  let tripCount = 0;

  for (const review of SEED_REVIEWS) {
    const sourceId =
      review.platform === "google" ? googleSource.id : tripSource.id;
    const id = `seed-${review.author.toLowerCase().replace(/\s+/g, "-")}-${review.date}`;

    upsertReview({
      id,
      source_id: sourceId,
      platform: review.platform,
      author_name: review.author,
      author_avatar_url: null,
      rating: review.rating,
      review_date: review.date,
      body: review.body,
      photo_urls: null,
      hidden: 0,
    });

    if (review.platform === "google") googleCount++;
    else tripCount++;
  }

  // Update source counts and sync times
  db.prepare(
    "UPDATE sources SET total_reviews = ?, last_sync_at = datetime('now') WHERE id = ?"
  ).run(googleCount, googleSource.id);
  db.prepare(
    "UPDATE sources SET total_reviews = ?, last_sync_at = datetime('now') WHERE id = ?"
  ).run(tripCount, tripSource.id);

  console.log(
    `Seeded ${SEED_REVIEWS.length} reviews (${googleCount} Google, ${tripCount} TripAdvisor)`
  );
  console.log(`Showcase slug: ${showcase.slug}`);
  console.log(`View at: http://localhost:3000/${showcase.slug}`);
}

// Run via: npx tsx src/lib/run-seed.ts
