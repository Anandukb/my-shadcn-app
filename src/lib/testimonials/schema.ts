import { z } from "zod";

export const testimonialInputSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  place: z.string().min(1, "Place / trip is required").max(160),
  text: z.string().min(1, "Review text is required").max(4000),
  rating: z.number().int().min(1).max(5).default(5),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export type TestimonialInput = z.infer<typeof testimonialInputSchema>;
