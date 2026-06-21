export interface PackagePrice {
  adult: number;
  stag: number;
  child0to1: number;
  child2to5: number;
  child6to12: number;
}

export interface ItineraryDay {
  day: number;
  title: string;
  desc: string;
  highlights: string[];
  images?: string[];
}

export interface FlightDetails {
  type: string;       // "Outbound" | "Return"
  airline: string;
  flightNo?: string;
  from?: string;
  fromCity?: string;
  to?: string;
  toCity?: string;
  departure: string;
  arrival: string;
  duration: string;
  class?: string;
  date?: string;
}

export interface HotelDetails {
  name: string;
  rating: number;      // 1–5
  location: string;
  nights: number;
  checkIn?: string;
  checkOut?: string;
  roomType?: string;
  description?: string;
  image?: string;
  badge?: string;
  amenities?: string[];
}

export interface DepartureDate {
  id: string;
  date: string;
  adult: number;
  single: number;
  child611: number;
  child25: number;
  infant: number;
  seats: string;       // e.g. "4 Seats Left" | "Available" | "Filling Fast"
  urgency: "red" | "amber" | "green";
}

export interface OptionalTour {
  id: string;
  title: string;
  tag: "Mandatory" | "Optional";
  desc: string;
  adult: number;
  single: number;
  child611: number;
  child25: number;
  infant: number;
  images: string[];
}

export interface Package {
  id: number;
  category: string;
  title: string;
  description: string;
  price: number;
  image: string;
  duration: string;
  location: string;
  continent: string;
  rating: number;
  reviews: number;
  featured: boolean;
  includes: string[];

  // Extended fields
  exclusions?: string[];
  groupSize?: string;
  meals?: string;
  accommodation?: string;
  cancellationPolicy?: string[];

  // Detailed pricing
  pricing?: PackagePrice;
  offerPricing?: PackagePrice;

  // Itinerary
  itineraryFileUrl?: string;
  itinerary?: ItineraryDay[];

  // Fixed-departure specific
  departureDates?: DepartureDate[];
  flights?: FlightDetails[];

  // Hotels
  hotels?: HotelDetails[];

  // Optional tours (all categories)
  optionalTours?: OptionalTour[];
}
