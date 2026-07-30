import { z } from "zod";

const contactDetailsSchema = z.object({
  service: z.string(),
});

const hotelBookingDetailsSchema = z.object({
  destination: z.string(),
  checkInDate: z.string(),
  checkOutDate: z.string(),
  rooms: z.string(),
  adults: z.string(),
  children: z.string(),
  nationality: z.string(),
  specialRequests: z.string(),
});

const hotelSearchDetailsSchema = z.object({
  destination: z.string(),
  checkInDate: z.string(),
  checkOutDate: z.string(),
  rooms: z.string(),
  adults: z.string(),
  children: z.string(),
});

const bookNowDetailsSchema = z.object({
  destination: z.string(),
  travelDate: z.string(),
  travelers: z.string(),
});

export const enquiryInputSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("contact"),
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(1),
    message: z.string().min(1),
    details: contactDetailsSchema,
  }),
  z.object({
    type: z.literal("hotel_booking"),
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(1),
    message: z.string().optional(),
    details: hotelBookingDetailsSchema,
  }),
  z.object({
    type: z.literal("hotel_search"),
    name: z.string().optional(),
    email: z.string().email(),
    phone: z.string().min(1),
    message: z.string().optional(),
    details: hotelSearchDetailsSchema,
  }),
  z.object({
    type: z.literal("book_now"),
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(1),
    message: z.string().optional(),
    packageId: z.number().optional(),
    details: bookNowDetailsSchema,
  }),
]);

export type EnquiryInput = z.infer<typeof enquiryInputSchema>;
