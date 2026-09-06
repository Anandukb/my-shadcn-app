import { z } from "zod";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const visaCountryInputSchema = z.object({
  name: z.string().min(1, "Country name is required").max(120),
  code: z.string().min(1, "Country code is required").max(10),
  slug: z.string().min(1, "Slug is required").max(140).regex(slugPattern, "Use lowercase letters, numbers, and hyphens only"),
  region: z.enum(["Middle East", "Asia", "Europe", "Africa", "Americas", "Oceania"]),
  flag: z.string().max(16).default(""),
  description: z.string().max(2000).optional().nullable(),
  requirements: z.array(z.string().min(1)).default([]),
  processingTime: z.string().max(120).optional().nullable(),
  price: z.string().max(120).optional().nullable(),
  image: z.string().max(2000).optional().nullable(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export type VisaCountryInput = z.infer<typeof visaCountryInputSchema>;
