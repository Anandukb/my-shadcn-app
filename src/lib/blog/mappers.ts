import type { BlogPost } from "@/types/blog";
import type { BilingualText, BlogPostRow } from "./types";
import type { BlogPostAdminInput } from "./schema";

function pick(text: BilingualText | null | undefined, locale: "en" | "ar"): string {
  if (!text) return "";
  if (locale === "ar" && text.ar) return text.ar;
  return text.en;
}

export function rowToBlogPost(row: BlogPostRow, locale: "en" | "ar"): BlogPost {
  return {
    id: row.id,
    slug: row.slug,
    title: pick({ en: row.title_en, ar: row.title_ar ?? "" }, locale),
    excerpt: pick({ en: row.excerpt_en, ar: row.excerpt_ar ?? "" }, locale),
    content: pick({ en: row.content_en, ar: row.content_ar ?? "" }, locale),
    coverImage: row.cover_image,
    author: row.author,
    category: row.category ?? undefined,
    tags: row.tags,
    metaTitle: row.meta_title_en !== null ? pick({ en: row.meta_title_en, ar: row.meta_title_ar ?? "" }, locale) : undefined,
    metaDescription:
      row.meta_description_en !== null
        ? pick({ en: row.meta_description_en, ar: row.meta_description_ar ?? "" }, locale)
        : undefined,
    isPublished: row.is_published,
    publishedAt: row.published_at ?? undefined,
  };
}

// Admin list/preview always resolves to English, regardless of what Arabic
// content exists — mirrors rowToAdminPackage.
export function rowToAdminBlogPost(row: BlogPostRow): BlogPost {
  return rowToBlogPost(row, "en");
}

export function rowToAdminInput(row: BlogPostRow): BlogPostAdminInput {
  return {
    slug: row.slug,
    title: { en: row.title_en, ar: row.title_ar ?? "" },
    excerpt: { en: row.excerpt_en, ar: row.excerpt_ar ?? "" },
    content: { en: row.content_en, ar: row.content_ar ?? "" },
    coverImage: row.cover_image,
    author: row.author,
    category: row.category ?? undefined,
    tags: row.tags,
    metaTitle: row.meta_title_en !== null ? { en: row.meta_title_en, ar: row.meta_title_ar ?? "" } : undefined,
    metaDescription:
      row.meta_description_en !== null ? { en: row.meta_description_en, ar: row.meta_description_ar ?? "" } : undefined,
    isPublished: row.is_published,
  };
}

// Flattens the full bilingual admin form into DB columns. Does NOT set
// published_at — the repository owns that (it needs to know the *existing*
// row to decide whether this is a first-time publish or a re-save).
export function blogPostAdminInputToRow(input: BlogPostAdminInput): Record<string, unknown> {
  return {
    slug: input.slug,
    title_en: input.title.en,
    title_ar: input.title.ar || null,
    excerpt_en: input.excerpt.en,
    excerpt_ar: input.excerpt.ar || null,
    content_en: input.content.en,
    content_ar: input.content.ar || null,
    cover_image: input.coverImage,
    author: input.author || "Maram Tours and Travels",
    category: input.category || null,
    tags: input.tags,
    meta_title_en: input.metaTitle?.en ?? null,
    meta_title_ar: input.metaTitle?.ar || null,
    meta_description_en: input.metaDescription?.en ?? null,
    meta_description_ar: input.metaDescription?.ar || null,
    is_published: input.isPublished,
  };
}
