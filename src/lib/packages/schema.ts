import { z } from "zod";

const bilingualTextSchema = z.object({
  en: z.string(),
  ar: z.string(),
});

const requiredBilingualTextSchema = z.object({
  en: z.string().min(1),
  ar: z.string(),
});

const packagePriceSchema = z.object({
  adult: z.number(),
  stag: z.number(),
  child0to1: z.number(),
  child2to5: z.number(),
  child6to12: z.number(),
});

const itineraryDaySchema = z.object({
  day: z.number(),
  title: bilingualTextSchema,
  desc: bilingualTextSchema,
  highlights: z.array(bilingualTextSchema),
  images: z.array(z.string()).optional(),
});

const departureDateSchema = z.object({
  id: z.string(),
  date: z.string(),
  adult: z.number(),
  single: z.number(),
  child611: z.number(),
  child25: z.number(),
  infant: z.number(),
  seats: bilingualTextSchema,
  urgency: z.enum(["red", "amber", "green"]),
});

const flightDetailsSchema = z.object({
  type: z.string(),
  airline: z.string(),
  flightNo: z.string().optional(),
  from: z.string().optional(),
  fromCity: z.string().optional(),
  to: z.string().optional(),
  toCity: z.string().optional(),
  departure: z.string(),
  arrival: z.string(),
  duration: z.string(),
  class: z.string().optional(),
  date: z.string().optional(),
});

const hotelDetailsSchema = z.object({
  name: z.string(),
  rating: z.number(),
  location: z.string(),
  nights: z.number(),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  roomType: bilingualTextSchema.optional(),
  description: bilingualTextSchema.optional(),
  image: z.string().optional(),
  badge: bilingualTextSchema.optional(),
  amenities: z.array(bilingualTextSchema).optional(),
});

const optionalTourSchema = z.object({
  id: z.string(),
  title: bilingualTextSchema,
  tag: z.enum(["Mandatory", "Optional"]),
  desc: bilingualTextSchema,
  adult: z.number(),
  single: z.number(),
  child611: z.number(),
  child25: z.number(),
  infant: z.number(),
  images: z.array(z.string()),
});

export const packageAdminInputSchema = z.object({
  category: z.enum(["cruise", "fixed-departure", "holidays", "kerala", "medical"]),
  title: requiredBilingualTextSchema,
  description: bilingualTextSchema,
  price: z.number(),
  image: z.string(),
  duration: requiredBilingualTextSchema,
  location: requiredBilingualTextSchema,
  continent: z.string(),
  rating: z.number(),
  reviews: z.number(),
  featured: z.boolean(),
  includes: z.array(bilingualTextSchema),
  exclusions: z.array(bilingualTextSchema).optional(),
  groupSize: bilingualTextSchema.optional(),
  meals: bilingualTextSchema.optional(),
  accommodation: bilingualTextSchema.optional(),
  cancellationPolicy: z.array(bilingualTextSchema).optional(),
  pricing: packagePriceSchema.optional(),
  offerPricing: packagePriceSchema.optional(),
  itineraryFileUrl: z.string().optional(),
  itinerary: z.array(itineraryDaySchema).optional(),
  departureDates: z.array(departureDateSchema).optional(),
  flights: z.array(flightDetailsSchema).optional(),
  hotels: z.array(hotelDetailsSchema).optional(),
  optionalTours: z.array(optionalTourSchema).optional(),
});

export const packageAdminUpdateSchema = packageAdminInputSchema.partial();
