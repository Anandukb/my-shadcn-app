import type { Package, ItineraryDay, HotelDetails, OptionalTour, DepartureDate } from "@/types/package";
import type { BilingualText, PackageRow, PackageAdminInput } from "./types";

function pick(text: BilingualText | null | undefined, locale: "en" | "ar"): string {
  if (!text) return "";
  if (locale === "ar" && text.ar) return text.ar;
  return text.en;
}

function pickList(list: BilingualText[] | null | undefined, locale: "en" | "ar"): string[] {
  if (!list) return [];
  return list.map((item) => pick(item, locale));
}

export function rowToPackage(row: PackageRow, locale: "en" | "ar"): Package {
  return {
    id: row.id,
    category: row.category,
    title: pick({ en: row.title_en, ar: row.title_ar ?? "" }, locale),
    description: pick({ en: row.description_en, ar: row.description_ar ?? "" }, locale),
    price: row.price,
    image: row.image,
    duration: pick({ en: row.duration_en, ar: row.duration_ar ?? "" }, locale),
    location: pick({ en: row.location_en, ar: row.location_ar ?? "" }, locale),
    continent: row.continent,
    rating: row.rating,
    reviews: row.reviews,
    featured: row.featured,
    includes: pickList(row.includes, locale),
    exclusions: pickList(row.exclusions, locale),
    groupSize: row.group_size_en !== null ? pick({ en: row.group_size_en, ar: row.group_size_ar ?? "" }, locale) : undefined,
    meals: row.meals_en !== null ? pick({ en: row.meals_en, ar: row.meals_ar ?? "" }, locale) : undefined,
    accommodation: row.accommodation_en !== null ? pick({ en: row.accommodation_en, ar: row.accommodation_ar ?? "" }, locale) : undefined,
    cancellationPolicy: pickList(row.cancellation_policy, locale),
    pricing: row.pricing ?? undefined,
    offerPricing: row.offer_pricing ?? undefined,
    itineraryFileUrl: row.itinerary_file_url ?? undefined,
    itinerary: row.itinerary.map(
      (day): ItineraryDay => ({
        day: day.day,
        title: pick(day.title, locale),
        desc: pick(day.desc, locale),
        highlights: pickList(day.highlights, locale),
        images: day.images,
      })
    ),
    departureDates: row.departure_dates.map(
      (dep): DepartureDate => ({
        id: dep.id,
        date: dep.date,
        adult: dep.adult,
        single: dep.single,
        child611: dep.child611,
        child25: dep.child25,
        infant: dep.infant,
        seats: pick(dep.seats, locale),
        urgency: dep.urgency,
      })
    ),
    flights: row.flights,
    hotels: row.hotels.map(
      (hotel): HotelDetails => ({
        name: hotel.name,
        rating: hotel.rating,
        location: hotel.location,
        nights: hotel.nights,
        checkIn: hotel.checkIn,
        checkOut: hotel.checkOut,
        roomType: hotel.roomType ? pick(hotel.roomType, locale) : undefined,
        description: hotel.description ? pick(hotel.description, locale) : undefined,
        image: hotel.image,
        badge: hotel.badge ? pick(hotel.badge, locale) : undefined,
        amenities: hotel.amenities ? pickList(hotel.amenities, locale) : undefined,
      })
    ),
    optionalTours: row.optional_tours.map(
      (tour): OptionalTour => ({
        id: tour.id,
        title: pick(tour.title, locale),
        tag: tour.tag,
        desc: pick(tour.desc, locale),
        adult: tour.adult,
        single: tour.single,
        child611: tour.child611,
        child25: tour.child25,
        infant: tour.infant,
        images: tour.images,
      })
    ),
  };
}

export function rowToAdminPackage(row: PackageRow): Package {
  return rowToPackage(row, "en");
}

export function rowToAdminInput(row: PackageRow): PackageAdminInput {
  return {
    category: row.category,
    price: row.price,
    continent: row.continent,
    rating: row.rating,
    reviews: row.reviews,
    featured: row.featured,
    duration: { en: row.duration_en, ar: row.duration_ar ?? "" },
    image: row.image,
    groupSize: row.group_size_en !== null ? { en: row.group_size_en, ar: row.group_size_ar ?? "" } : undefined,
    meals: row.meals_en !== null ? { en: row.meals_en, ar: row.meals_ar ?? "" } : undefined,
    accommodation:
      row.accommodation_en !== null ? { en: row.accommodation_en, ar: row.accommodation_ar ?? "" } : undefined,
    itineraryFileUrl: row.itinerary_file_url ?? undefined,
    title: { en: row.title_en, ar: row.title_ar ?? "" },
    description: { en: row.description_en, ar: row.description_ar ?? "" },
    location: { en: row.location_en, ar: row.location_ar ?? "" },
    includes: row.includes,
    exclusions: row.exclusions,
    cancellationPolicy: row.cancellation_policy,
    pricing: row.pricing ?? undefined,
    offerPricing: row.offer_pricing ?? undefined,
    itinerary: row.itinerary,
    departureDates: row.departure_dates,
    flights: row.flights,
    hotels: row.hotels,
    optionalTours: row.optional_tours,
  };
}

export function packageAdminInputToInsertRow(input: PackageAdminInput): Record<string, unknown> {
  return {
    category: input.category,
    price: input.price,
    continent: input.continent,
    rating: input.rating,
    reviews: input.reviews,
    featured: input.featured,
    duration_en: input.duration.en,
    duration_ar: input.duration.ar || null,
    image: input.image,
    group_size_en: input.groupSize?.en ?? null,
    group_size_ar: input.groupSize?.ar || null,
    meals_en: input.meals?.en ?? null,
    meals_ar: input.meals?.ar || null,
    accommodation_en: input.accommodation?.en ?? null,
    accommodation_ar: input.accommodation?.ar || null,
    itinerary_file_url: input.itineraryFileUrl ?? null,
    title_en: input.title.en,
    title_ar: input.title.ar || null,
    description_en: input.description.en,
    description_ar: input.description.ar || null,
    location_en: input.location.en,
    location_ar: input.location.ar || null,
    includes: input.includes,
    exclusions: input.exclusions ?? [],
    cancellation_policy: input.cancellationPolicy ?? [],
    pricing: input.pricing ?? null,
    offer_pricing: input.offerPricing ?? null,
    itinerary: input.itinerary ?? [],
    departure_dates: input.departureDates ?? [],
    flights: input.flights ?? [],
    hotels: input.hotels ?? [],
    optional_tours: input.optionalTours ?? [],
  };
}

export function packageAdminInputToUpdateRow(input: Partial<PackageAdminInput>): Record<string, unknown> {
  const merged: Record<string, unknown> = {};

  if (input.category !== undefined) merged.category = input.category;
  if (input.price !== undefined) merged.price = input.price;
  if (input.continent !== undefined) merged.continent = input.continent;
  if (input.rating !== undefined) merged.rating = input.rating;
  if (input.reviews !== undefined) merged.reviews = input.reviews;
  if (input.featured !== undefined) merged.featured = input.featured;
  if (input.image !== undefined) merged.image = input.image;
  if (input.itineraryFileUrl !== undefined) merged.itinerary_file_url = input.itineraryFileUrl;

  if (input.duration !== undefined) {
    merged.duration_en = input.duration.en;
    merged.duration_ar = input.duration.ar || null;
  }
  if (input.groupSize !== undefined) {
    merged.group_size_en = input.groupSize.en;
    merged.group_size_ar = input.groupSize.ar || null;
  }
  if (input.meals !== undefined) {
    merged.meals_en = input.meals.en;
    merged.meals_ar = input.meals.ar || null;
  }
  if (input.accommodation !== undefined) {
    merged.accommodation_en = input.accommodation.en;
    merged.accommodation_ar = input.accommodation.ar || null;
  }
  if (input.title !== undefined) {
    merged.title_en = input.title.en;
    merged.title_ar = input.title.ar || null;
  }
  if (input.description !== undefined) {
    merged.description_en = input.description.en;
    merged.description_ar = input.description.ar || null;
  }
  if (input.location !== undefined) {
    merged.location_en = input.location.en;
    merged.location_ar = input.location.ar || null;
  }

  if (input.includes !== undefined) merged.includes = input.includes;
  if (input.exclusions !== undefined) merged.exclusions = input.exclusions;
  if (input.cancellationPolicy !== undefined) merged.cancellation_policy = input.cancellationPolicy;
  if (input.pricing !== undefined) merged.pricing = input.pricing;
  if (input.offerPricing !== undefined) merged.offer_pricing = input.offerPricing;
  if (input.itinerary !== undefined) merged.itinerary = input.itinerary;
  if (input.departureDates !== undefined) merged.departure_dates = input.departureDates;
  if (input.flights !== undefined) merged.flights = input.flights;
  if (input.hotels !== undefined) merged.hotels = input.hotels;
  if (input.optionalTours !== undefined) merged.optional_tours = input.optionalTours;

  return merged;
}
