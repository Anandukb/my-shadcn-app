import { describe, it, expect } from "vitest";
import { rowToBlogPost, rowToAdminBlogPost, rowToAdminInput, blogPostAdminInputToRow } from "./mappers";
import type { BlogPostRow } from "./types";
import type { BlogPostAdminInput } from "./schema";

function makeRow(overrides: Partial<BlogPostRow> = {}): BlogPostRow {
  return {
    id: 1,
    slug: "kerala-backwaters-guide",
    title_en: "A Guide to Kerala's Backwaters",
    title_ar: null,
    excerpt_en: "Everything you need to know before your houseboat trip.",
    excerpt_ar: null,
    content_en: "Paragraph one.\n\nParagraph two.",
    content_ar: null,
    cover_image: "https://example.com/cover.jpg",
    author: "Maram Tours and Travels",
    category: "Travel Tips",
    tags: ["kerala", "backwaters"],
    meta_title_en: null,
    meta_title_ar: null,
    meta_description_en: null,
    meta_description_ar: null,
    is_published: true,
    published_at: "2026-01-01T00:00:00Z",
    created_by: null,
    updated_by: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("rowToBlogPost", () => {
  it("returns English values when locale is en", () => {
    const post = rowToBlogPost(makeRow(), "en");
    expect(post.title).toBe("A Guide to Kerala's Backwaters");
    expect(post.excerpt).toBe("Everything you need to know before your houseboat trip.");
    expect(post.content).toBe("Paragraph one.\n\nParagraph two.");
    expect(post.category).toBe("Travel Tips");
    expect(post.tags).toEqual(["kerala", "backwaters"]);
    expect(post.isPublished).toBe(true);
  });

  it("falls back to English when the Arabic value is null", () => {
    const post = rowToBlogPost(makeRow({ title_ar: null }), "ar");
    expect(post.title).toBe("A Guide to Kerala's Backwaters");
  });

  it("returns Arabic values when present and locale is ar", () => {
    const post = rowToBlogPost(makeRow({ title_ar: "دليل بحيرات كيرالا" }), "ar");
    expect(post.title).toBe("دليل بحيرات كيرالا");
  });

  it("leaves metaTitle/metaDescription undefined when unset", () => {
    const post = rowToBlogPost(makeRow(), "en");
    expect(post.metaTitle).toBeUndefined();
    expect(post.metaDescription).toBeUndefined();
  });

  it("resolves metaTitle/metaDescription with English fallback when set", () => {
    const post = rowToBlogPost(
      makeRow({ meta_title_en: "Custom SEO Title", meta_description_en: "Custom SEO description." }),
      "en"
    );
    expect(post.metaTitle).toBe("Custom SEO Title");
    expect(post.metaDescription).toBe("Custom SEO description.");
  });

  it("carries category as undefined when the row has none", () => {
    const post = rowToBlogPost(makeRow({ category: null }), "en");
    expect(post.category).toBeUndefined();
  });
});

describe("rowToAdminBlogPost", () => {
  it("always resolves to English regardless of any Arabic content", () => {
    const post = rowToAdminBlogPost(makeRow({ title_ar: "دليل بحيرات كيرالا" }));
    expect(post.title).toBe("A Guide to Kerala's Backwaters");
  });
});

describe("rowToAdminInput", () => {
  it("returns the full bilingual view, not resolved to one language", () => {
    const input = rowToAdminInput(makeRow({ title_ar: "دليل بحيرات كيرالا" }));
    expect(input.title).toEqual({ en: "A Guide to Kerala's Backwaters", ar: "دليل بحيرات كيرالا" });
    expect(input.slug).toBe("kerala-backwaters-guide");
    expect(input.tags).toEqual(["kerala", "backwaters"]);
  });

  it("returns undefined for metaTitle/metaDescription when unset", () => {
    const input = rowToAdminInput(makeRow());
    expect(input.metaTitle).toBeUndefined();
    expect(input.metaDescription).toBeUndefined();
  });
});

describe("blogPostAdminInputToRow", () => {
  const baseInput: BlogPostAdminInput = {
    slug: "new-post",
    title: { en: "New Post", ar: "منشور جديد" },
    excerpt: { en: "Excerpt", ar: "" },
    content: { en: "Content", ar: "" },
    coverImage: "https://example.com/img.jpg",
    author: "Maram Tours and Travels",
    category: "Guides",
    tags: ["a", "b"],
    isPublished: false,
  };

  it("flattens bilingual fields into _en/_ar columns", () => {
    const row = blogPostAdminInputToRow(baseInput) as Record<string, unknown>;
    expect(row.title_en).toBe("New Post");
    expect(row.title_ar).toBe("منشور جديد");
    expect(row.excerpt_ar).toBeNull();
    expect(row.slug).toBe("new-post");
    expect(row.tags).toEqual(["a", "b"]);
    expect(row.is_published).toBe(false);
  });

  it("sets meta_title_en/ar to null when metaTitle is omitted", () => {
    const row = blogPostAdminInputToRow(baseInput) as Record<string, unknown>;
    expect(row.meta_title_en).toBeNull();
    expect(row.meta_title_ar).toBeNull();
  });

  it("flattens metaTitle/metaDescription when provided", () => {
    const row = blogPostAdminInputToRow({
      ...baseInput,
      metaTitle: { en: "SEO Title", ar: "" },
      metaDescription: { en: "SEO Description", ar: "وصف" },
    }) as Record<string, unknown>;
    expect(row.meta_title_en).toBe("SEO Title");
    expect(row.meta_title_ar).toBeNull();
    expect(row.meta_description_en).toBe("SEO Description");
    expect(row.meta_description_ar).toBe("وصف");
  });

  it("defaults author to the site name when blank", () => {
    const row = blogPostAdminInputToRow({ ...baseInput, author: "" }) as Record<string, unknown>;
    expect(row.author).toBe("Maram Tours and Travels");
  });

  it("does not include published_at — that's the repository's responsibility", () => {
    const row = blogPostAdminInputToRow(baseInput) as Record<string, unknown>;
    expect(row.published_at).toBeUndefined();
  });
});
