import type { Package, ItineraryDay, HotelDetails, OptionalTour, DepartureDate } from "@/types/package";
import type {
  BilingualText,
  PackageRow,
  PackageRowItineraryDay,
  PackageRowHotel,
  PackageRowOptionalTour,
  PackageRowDepartureDate,
} from "./types";

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
    duration: row.duration,
    location: pick({ en: row.location_en, ar: row.location_ar ?? "" }, locale),
    continent: row.continent,
    rating: row.rating,
    reviews: row.reviews,
    featured: row.featured,
    includes: pickList(row.includes, locale),
    exclusions: pickList(row.exclusions, locale),
    groupSize: row.group_size ?? undefined,
    meals: row.meals ?? undefined,
    accommodation: row.accommodation ?? undefined,
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

function wrap(en: string): BilingualText {
  return { en, ar: "" };
}

function wrapList(list: string[]): BilingualText[] {
  return list.map((en) => ({ en, ar: "" }));
}

export function packageInputToInsertRow(input: Omit<Package, "id">): Record<string, unknown> {
  return {
    category: input.category,
    price: input.price,
    continent: input.continent,
    rating: input.rating,
    reviews: input.reviews,
    featured: input.featured,
    duration: input.duration,
    image: input.image,
    group_size: input.groupSize ?? null,
    meals: input.meals ?? null,
    accommodation: input.accommodation ?? null,
    itinerary_file_url: input.itineraryFileUrl ?? null,
    title_en: input.title,
    title_ar: null,
    description_en: input.description,
    description_ar: null,
    location_en: input.location,
    location_ar: null,
    includes: wrapList(input.includes ?? []),
    exclusions: wrapList(input.exclusions ?? []),
    cancellation_policy: wrapList(input.cancellationPolicy ?? []),
    pricing: input.pricing ?? null,
    offer_pricing: input.offerPricing ?? null,
    itinerary: (input.itinerary ?? []).map(
      (day): PackageRowItineraryDay => ({
        day: day.day,
        title: wrap(day.title),
        desc: wrap(day.desc),
        highlights: wrapList(day.highlights ?? []),
        images: day.images,
      })
    ),
    departure_dates: (input.departureDates ?? []).map(
      (dep): PackageRowDepartureDate => ({
        id: dep.id,
        date: dep.date,
        adult: dep.adult,
        single: dep.single,
        child611: dep.child611,
        child25: dep.child25,
        infant: dep.infant,
        seats: wrap(dep.seats),
        urgency: dep.urgency,
      })
    ),
    flights: input.flights ?? [],
    hotels: (input.hotels ?? []).map(
      (hotel): PackageRowHotel => ({
        name: hotel.name,
        rating: hotel.rating,
        location: hotel.location,
        nights: hotel.nights,
        checkIn: hotel.checkIn,
        checkOut: hotel.checkOut,
        roomType: hotel.roomType !== undefined ? wrap(hotel.roomType) : undefined,
        description: hotel.description !== undefined ? wrap(hotel.description) : undefined,
        image: hotel.image,
        badge: hotel.badge !== undefined ? wrap(hotel.badge) : undefined,
        amenities: hotel.amenities !== undefined ? wrapList(hotel.amenities) : undefined,
      })
    ),
    optional_tours: (input.optionalTours ?? []).map(
      (tour): PackageRowOptionalTour => ({
        id: tour.id,
        title: wrap(tour.title),
        tag: tour.tag,
        desc: wrap(tour.desc),
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

// Index-based Arabic-preservation: this assumes array items keep their
// position between edits (the admin form resubmits whole arrays, not
// per-item diffs). If an admin reorders or deletes a middle item, the
// Arabic side could misalign with the wrong item. Acceptable for this
// plan since the admin form is English-only — Plan 2b's proper bilingual
// editing UI will edit en/ar together per item, removing this limitation.
export function packageInputToUpdateRow(input: Partial<Package>, existing: PackageRow): Record<string, unknown> {
  const merged: Record<string, unknown> = {};

  if (input.category !== undefined) merged.category = input.category;
  if (input.price !== undefined) merged.price = input.price;
  if (input.continent !== undefined) merged.continent = input.continent;
  if (input.rating !== undefined) merged.rating = input.rating;
  if (input.reviews !== undefined) merged.reviews = input.reviews;
  if (input.featured !== undefined) merged.featured = input.featured;
  if (input.duration !== undefined) merged.duration = input.duration;
  if (input.image !== undefined) merged.image = input.image;
  if (input.groupSize !== undefined) merged.group_size = input.groupSize;
  if (input.meals !== undefined) merged.meals = input.meals;
  if (input.accommodation !== undefined) merged.accommodation = input.accommodation;
  if (input.itineraryFileUrl !== undefined) merged.itinerary_file_url = input.itineraryFileUrl;

  if (input.title !== undefined) {
    merged.title_en = input.title;
    merged.title_ar = existing.title_ar;
  }
  if (input.description !== undefined) {
    merged.description_en = input.description;
    merged.description_ar = existing.description_ar;
  }
  if (input.location !== undefined) {
    merged.location_en = input.location;
    merged.location_ar = existing.location_ar;
  }

  if (input.includes !== undefined) {
    merged.includes = input.includes.map((en, i) => ({ en, ar: existing.includes[i]?.ar ?? "" }));
  }
  if (input.exclusions !== undefined) {
    merged.exclusions = input.exclusions.map((en, i) => ({ en, ar: existing.exclusions[i]?.ar ?? "" }));
  }
  if (input.cancellationPolicy !== undefined) {
    merged.cancellation_policy = input.cancellationPolicy.map((en, i) => ({
      en,
      ar: existing.cancellation_policy[i]?.ar ?? "",
    }));
  }
  if (input.pricing !== undefined) merged.pricing = input.pricing;
  if (input.offerPricing !== undefined) merged.offer_pricing = input.offerPricing;

  if (input.itinerary !== undefined) {
    merged.itinerary = input.itinerary.map((day, i) => {
      const existingDay = existing.itinerary[i];
      return {
        day: day.day,
        title: { en: day.title, ar: existingDay?.title.ar ?? "" },
        desc: { en: day.desc, ar: existingDay?.desc.ar ?? "" },
        highlights: (day.highlights ?? []).map((en, j) => ({
          en,
          ar: existingDay?.highlights[j]?.ar ?? "",
        })),
        images: day.images,
      };
    });
  }

  if (input.departureDates !== undefined) {
    merged.departure_dates = input.departureDates.map((dep, i) => {
      const existingDep = existing.departure_dates[i];
      return {
        id: dep.id,
        date: dep.date,
        adult: dep.adult,
        single: dep.single,
        child611: dep.child611,
        child25: dep.child25,
        infant: dep.infant,
        seats: { en: dep.seats, ar: existingDep?.seats.ar ?? "" },
        urgency: dep.urgency,
      };
    });
  }

  if (input.flights !== undefined) merged.flights = input.flights;

  if (input.hotels !== undefined) {
    merged.hotels = input.hotels.map((hotel, i) => {
      const existingHotel = existing.hotels[i];
      return {
        name: hotel.name,
        rating: hotel.rating,
        location: hotel.location,
        nights: hotel.nights,
        checkIn: hotel.checkIn,
        checkOut: hotel.checkOut,
        roomType: hotel.roomType !== undefined ? { en: hotel.roomType, ar: existingHotel?.roomType?.ar ?? "" } : undefined,
        description:
          hotel.description !== undefined
            ? { en: hotel.description, ar: existingHotel?.description?.ar ?? "" }
            : undefined,
        image: hotel.image,
        badge: hotel.badge !== undefined ? { en: hotel.badge, ar: existingHotel?.badge?.ar ?? "" } : undefined,
        amenities:
          hotel.amenities !== undefined
            ? hotel.amenities.map((en, j) => ({ en, ar: existingHotel?.amenities?.[j]?.ar ?? "" }))
            : undefined,
      };
    });
  }

  if (input.optionalTours !== undefined) {
    merged.optional_tours = input.optionalTours.map((tour, i) => {
      const existingTour = existing.optional_tours[i];
      return {
        id: tour.id,
        title: { en: tour.title, ar: existingTour?.title.ar ?? "" },
        tag: tour.tag,
        desc: { en: tour.desc, ar: existingTour?.desc.ar ?? "" },
        adult: tour.adult,
        single: tour.single,
        child611: tour.child611,
        child25: tour.child25,
        infant: tour.infant,
        images: tour.images,
      };
    });
  }

  return merged;
}
