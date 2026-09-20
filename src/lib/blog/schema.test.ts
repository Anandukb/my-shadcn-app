import { describe, it, expect } from "vitest";
import { blogPostAdminInputSchema } from "./schema";
import type { BlogPostAdminInput } from "./schema";

function makeValidInput(overrides: Partial<BlogPostAdminInput> = {}): BlogPostAdminInput {
  return {
    slug: "kerala-backwaters-guide",
    title: { en: "A Guide to Kerala's Backwaters", ar: "" },
    excerpt: { en: "Everything you need to know.", ar: "" },
    content: { en: "Paragraph one.\n\nParagraph two.", ar: "" },
    coverImage: "https://example.com/cover.jpg",
    author: "Maram Tours and Travels",
    tags: ["kerala"],
    isPublished: false,
    ...overrides,
  };
}

describe("blogPostAdminInputSchema", () => {
  it("accepts a complete, valid post", () => {
    const result = blogPostAdminInputSchema.safeParse(makeValidInput());
    expect(result.success).toBe(true);
  });

  it("accepts a post with optional fields omitted", () => {
    const input = makeValidInput();
    const result = blogPostAdminInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("rejects an empty English title", () => {
    const result = blogPostAdminInputSchema.safeParse(makeValidInput({ title: { en: "", ar: "" } }));
    expect(result.success).toBe(false);
  });

  it("rejects an empty English excerpt", () => {
    const result = blogPostAdminInputSchema.safeParse(makeValidInput({ excerpt: { en: "", ar: "" } }));
    expect(result.success).toBe(false);
  });

  it("rejects an empty English content", () => {
    const result = blogPostAdminInputSchema.safeParse(makeValidInput({ content: { en: "", ar: "" } }));
    expect(result.success).toBe(false);
  });

  it("rejects a missing cover image", () => {
    const result = blogPostAdminInputSchema.safeParse(makeValidInput({ coverImage: "" }));
    expect(result.success).toBe(false);
  });

  it("rejects an empty slug", () => {
    const result = blogPostAdminInputSchema.safeParse(makeValidInput({ slug: "" }));
    expect(result.success).toBe(false);
  });

  it("rejects a slug with uppercase letters, spaces, or other invalid characters", () => {
    for (const badSlug of ["Kerala Guide", "kerala_guide", "kerala--guide ", "kéralá-guide"]) {
      const result = blogPostAdminInputSchema.safeParse(makeValidInput({ slug: badSlug }));
      expect(result.success).toBe(false);
    }
  });

  it("accepts a clean lowercase-hyphenated slug", () => {
    const result = blogPostAdminInputSchema.safeParse(makeValidInput({ slug: "10-best-beaches-in-goa" }));
    expect(result.success).toBe(true);
  });

  it("accepts optional metaTitle/metaDescription", () => {
    const result = blogPostAdminInputSchema.safeParse(
      makeValidInput({ metaTitle: { en: "SEO Title", ar: "" }, metaDescription: { en: "SEO description", ar: "" } })
    );
    expect(result.success).toBe(true);
  });

  it("defaults tags to an empty array when omitted", () => {
    const { tags, ...withoutTags } = makeValidInput();
    void tags;
    const result = blogPostAdminInputSchema.safeParse(withoutTags);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.tags).toEqual([]);
  });

  it("defaults isPublished to false when omitted", () => {
    const { isPublished, ...withoutPublished } = makeValidInput();
    void isPublished;
    const result = blogPostAdminInputSchema.safeParse(withoutPublished);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.isPublished).toBe(false);
  });
});
