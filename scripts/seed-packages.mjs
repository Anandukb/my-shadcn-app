// scripts/seed-packages.mjs
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envFile = readFileSync(path.resolve(__dirname, "../.env.local"), "utf-8");
  const env = {};
  for (const line of envFile.split("\n")) {
    const match = line.match(/^([A-Z_]+)=(.*)$/);
    if (match) env[match[1]] = match[2];
  }
  return env;
}

function toBilingual(en) {
  return { en, ar: "" };
}

function mapPackageToRow(pkg) {
  return {
    category: pkg.category,
    price: pkg.price,
    continent: pkg.continent,
    rating: pkg.rating,
    reviews: pkg.reviews,
    featured: pkg.featured,
    duration: pkg.duration,
    image: pkg.image,
    group_size: pkg.groupSize ?? null,
    meals: pkg.meals ?? null,
    accommodation: pkg.accommodation ?? null,
    itinerary_file_url: pkg.itineraryFileUrl ?? null,
    title_en: pkg.title,
    title_ar: null,
    description_en: pkg.description,
    description_ar: null,
    location_en: pkg.location,
    location_ar: null,
    includes: (pkg.includes ?? []).map(toBilingual),
    exclusions: (pkg.exclusions ?? []).map(toBilingual),
    cancellation_policy: (pkg.cancellationPolicy ?? []).map(toBilingual),
    pricing: pkg.pricing ?? null,
    offer_pricing: pkg.offerPricing ?? null,
    itinerary: (pkg.itinerary ?? []).map((day) => ({
      day: day.day,
      title: toBilingual(day.title),
      desc: toBilingual(day.desc),
      highlights: (day.highlights ?? []).map(toBilingual),
      images: day.images,
    })),
    departure_dates: (pkg.departureDates ?? []).map((dep) => ({
      id: dep.id,
      date: dep.date,
      adult: dep.adult,
      single: dep.single,
      child611: dep.child611,
      child25: dep.child25,
      infant: dep.infant,
      seats: toBilingual(dep.seats),
      urgency: dep.urgency,
    })),
    flights: pkg.flights ?? [],
    hotels: (pkg.hotels ?? []).map((hotel) => ({
      name: hotel.name,
      rating: hotel.rating,
      location: hotel.location,
      nights: hotel.nights,
      checkIn: hotel.checkIn,
      checkOut: hotel.checkOut,
      roomType: hotel.roomType !== undefined ? toBilingual(hotel.roomType) : undefined,
      description: hotel.description !== undefined ? toBilingual(hotel.description) : undefined,
      image: hotel.image,
      badge: hotel.badge !== undefined ? toBilingual(hotel.badge) : undefined,
      amenities: hotel.amenities !== undefined ? hotel.amenities.map(toBilingual) : undefined,
    })),
    optional_tours: (pkg.optionalTours ?? []).map((tour) => ({
      id: tour.id,
      title: toBilingual(tour.title),
      tag: tour.tag,
      desc: toBilingual(tour.desc),
      adult: tour.adult,
      single: tour.single,
      child611: tour.child611,
      child25: tour.child25,
      infant: tour.infant,
      images: tour.images,
    })),
  };
}

async function main() {
  const env = loadEnv();
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { count, error: countError } = await supabase.from("packages").select("*", { count: "exact", head: true });
  if (countError) {
    console.error("Failed to check existing packages:", countError);
    process.exit(1);
  }
  if (count && count > 0) {
    console.log(`packages table already has ${count} rows — skipping seed to avoid duplicates.`);
    process.exit(0);
  }

  const packagesJsonPath = path.resolve(__dirname, "../src/data/packages.json");
  const packages = JSON.parse(readFileSync(packagesJsonPath, "utf-8"));
  const rows = packages.map(mapPackageToRow);

  const { data, error } = await supabase.from("packages").insert(rows).select("id, title_en");
  if (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }

  console.log(`Seeded ${data.length} packages:`);
  for (const row of data) {
    console.log(`  - #${row.id}: ${row.title_en}`);
  }
}

main();
