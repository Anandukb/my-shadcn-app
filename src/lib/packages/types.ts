import type { FlightDetails, PackagePrice } from "@/types/package";

export interface BilingualText {
  en: string;
  ar: string;
}

export interface PackageRowItineraryDay {
  day: number;
  title: BilingualText;
  desc: BilingualText;
  highlights: BilingualText[];
  images?: string[];
}

export interface PackageRowHotel {
  name: string;
  rating: number;
  location: string;
  nights: number;
  checkIn?: string;
  checkOut?: string;
  roomType?: BilingualText;
  description?: BilingualText;
  image?: string;
  badge?: BilingualText;
  amenities?: BilingualText[];
}

export interface PackageRowOptionalTour {
  id: string;
  title: BilingualText;
  tag: "Mandatory" | "Optional";
  desc: BilingualText;
  adult: number;
  single: number;
  child611: number;
  child25: number;
  infant: number;
  images: string[];
}

export interface PackageRowDepartureDate {
  id: string;
  date: string;
  adult: number;
  single: number;
  child611: number;
  child25: number;
  infant: number;
  seats: BilingualText;
  urgency: "red" | "amber" | "green";
}

export interface PackageRow {
  id: number;
  category: string;
  slug: string | null;
  price: number;
  continent: string;
  rating: number;
  reviews: number;
  featured: boolean;
  duration_en: string;
  duration_ar: string | null;
  image: string;
  group_size_en: string | null;
  group_size_ar: string | null;
  meals_en: string | null;
  meals_ar: string | null;
  accommodation_en: string | null;
  accommodation_ar: string | null;
  itinerary_file_url: string | null;
  title_en: string;
  title_ar: string | null;
  description_en: string;
  description_ar: string | null;
  location_en: string;
  location_ar: string | null;
  includes: BilingualText[];
  exclusions: BilingualText[];
  cancellation_policy: BilingualText[];
  pricing: PackagePrice | null;
  offer_pricing: PackagePrice | null;
  itinerary: PackageRowItineraryDay[];
  departure_dates: PackageRowDepartureDate[];
  flights: FlightDetails[];
  hotels: PackageRowHotel[];
  optional_tours: PackageRowOptionalTour[];
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PackageAdminInput {
  category: string;
  price: number;
  continent: string;
  rating: number;
  reviews: number;
  featured: boolean;
  duration: BilingualText;
  image: string;
  groupSize?: BilingualText;
  meals?: BilingualText;
  accommodation?: BilingualText;
  itineraryFileUrl?: string;
  title: BilingualText;
  description: BilingualText;
  location: BilingualText;
  includes: BilingualText[];
  exclusions?: BilingualText[];
  cancellationPolicy?: BilingualText[];
  pricing?: PackagePrice;
  offerPricing?: PackagePrice;
  itinerary?: PackageRowItineraryDay[];
  departureDates?: PackageRowDepartureDate[];
  flights?: FlightDetails[];
  hotels?: PackageRowHotel[];
  optionalTours?: PackageRowOptionalTour[];
}
