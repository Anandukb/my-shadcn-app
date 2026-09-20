import { z } from "zod";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const bilingualTextSchema = z.object({
  en: z.string(),
  ar: z.string(),
});

const requiredBilingualTextSchema = z.object({
  en: z.string().min(1),
  ar: z.string(),
});

export const blogPostAdminInputSchema = z.object({
  slug: z.string().min(1, "Slug is required").max(160).regex(slugPattern, "Use lowercase letters, numbers, and hyphens only"),
  title: requiredBilingualTextSchema,
  excerpt: requiredBilingualTextSchema,
  content: requiredBilingualTextSchema,
  coverImage: z.string().min(1, "Cover image is required"),
  author: z.string().max(120).default("Maram Tours and Travels"),
  category: z.string().max(80).optional(),
  tags: z.array(z.string().min(1)).default([]),
  metaTitle: bilingualTextSchema.optional(),
  metaDescription: bilingualTextSchema.optional(),
  isPublished: z.boolean().default(false),
});

export type BlogPostAdminInput = z.infer<typeof blogPostAdminInputSchema>;
