import { describe, it, expect, vi, beforeEach } from "vitest";

const selectMock = vi.fn();
const insertMock = vi.fn();
const updateMock = vi.fn();
const deleteMock = vi.fn();
const eqMock = vi.fn();
const singleMock = vi.fn();
const orderMock = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: () => ({
      select: selectMock,
      insert: insertMock,
      update: updateMock,
      delete: deleteMock,
    }),
  }),
}));

import { blogRepository, BlogPostNotFoundError, BlogPostSlugConflictError } from "./blog-repository";
import type { BlogPostAdminInput } from "./blog/schema";

function makeRawRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    slug: "kerala-backwaters-guide",
    title_en: "A Guide to Kerala's Backwaters",
    title_ar: null,
    excerpt_en: "Everything you need to know.",
    excerpt_ar: null,
    content_en: "Paragraph one.\n\nParagraph two.",
    content_ar: null,
    cover_image: "https://example.com/cover.jpg",
    author: "Maram Tours and Travels",
    category: null,
    tags: [],
    meta_title_en: null,
    meta_title_ar: null,
    meta_description_en: null,
    meta_description_ar: null,
    is_published: false,
    published_at: null,
    created_by: null,
    updated_by: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

const baseInput: BlogPostAdminInput = {
  slug: "kerala-backwaters-guide",
  title: { en: "A Guide to Kerala's Backwaters", ar: "" },
  excerpt: { en: "Everything you need to know.", ar: "" },
  content: { en: "Paragraph one.\n\nParagraph two.", ar: "" },
  coverImage: "https://example.com/cover.jpg",
  author: "Maram Tours and Travels",
  tags: [],
  isPublished: false,
};

describe("blogRepository.listPublished", () => {
  beforeEach(() => {
    selectMock.mockReset();
    eqMock.mockReset();
    orderMock.mockReset();
  });

  it("filters to published posts only, newest first", async () => {
    orderMock.mockResolvedValue({ data: [makeRawRow({ is_published: true })], error: null });
    eqMock.mockReturnValue({ order: orderMock });
    selectMock.mockReturnValue({ eq: eqMock });

    const result = await blogRepository.listPublished("en");
    expect(eqMock).toHaveBeenCalledWith("is_published", true);
    expect(result).toHaveLength(1);
  });
});

describe("blogRepository.getPublishedBySlug", () => {
  beforeEach(() => {
    selectMock.mockReset();
    eqMock.mockReset();
    singleMock.mockReset();
  });

  it("returns null when the post is a draft, even if the slug matches", async () => {
    singleMock.mockResolvedValue({ data: makeRawRow({ is_published: false }), error: null });
    eqMock.mockReturnValue({ single: singleMock });
    selectMock.mockReturnValue({ eq: eqMock });

    const result = await blogRepository.getPublishedBySlug("kerala-backwaters-guide", "en");
    expect(result).toBeNull();
  });

  it("returns the post when published", async () => {
    singleMock.mockResolvedValue({ data: makeRawRow({ is_published: true }), error: null });
    eqMock.mockReturnValue({ single: singleMock });
    selectMock.mockReturnValue({ eq: eqMock });

    const result = await blogRepository.getPublishedBySlug("kerala-backwaters-guide", "en");
    expect(result?.title).toBe("A Guide to Kerala's Backwaters");
  });
});

describe("blogRepository.create", () => {
  beforeEach(() => {
    insertMock.mockReset();
    selectMock.mockReset();
    singleMock.mockReset();
  });

  it("stamps published_at when created already published", async () => {
    singleMock.mockResolvedValue({ data: makeRawRow({ is_published: true, published_at: "2026-02-01T00:00:00Z" }), error: null });
    selectMock.mockReturnValue({ single: singleMock });
    insertMock.mockReturnValue({ select: selectMock });

    await blogRepository.create({ ...baseInput, isPublished: true });
    const insertedRow = insertMock.mock.calls[0][0];
    expect(insertedRow.published_at).not.toBeNull();
    expect(insertedRow.is_published).toBe(true);
  });

  it("leaves published_at null when created as a draft", async () => {
    singleMock.mockResolvedValue({ data: makeRawRow(), error: null });
    selectMock.mockReturnValue({ single: singleMock });
    insertMock.mockReturnValue({ select: selectMock });

    await blogRepository.create(baseInput);
    const insertedRow = insertMock.mock.calls[0][0];
    expect(insertedRow.published_at).toBeNull();
  });

  it("maps a unique-slug violation to BlogPostSlugConflictError", async () => {
    singleMock.mockResolvedValue({ data: null, error: { code: "23505", message: "duplicate key" } });
    selectMock.mockReturnValue({ single: singleMock });
    insertMock.mockReturnValue({ select: selectMock });

    await expect(blogRepository.create(baseInput)).rejects.toThrow(BlogPostSlugConflictError);
  });
});

describe("blogRepository.update", () => {
  beforeEach(() => {
    selectMock.mockReset();
    eqMock.mockReset();
    singleMock.mockReset();
    updateMock.mockReset();
  });

  it("throws BlogPostNotFoundError when the post does not exist", async () => {
    singleMock.mockResolvedValue({ data: null, error: { code: "PGRST116" } });
    eqMock.mockReturnValue({ single: singleMock });
    selectMock.mockReturnValue({ eq: eqMock });

    await expect(blogRepository.update(999, baseInput)).rejects.toThrow(BlogPostNotFoundError);
  });

  it("stamps published_at the first time a draft is published", async () => {
    const existingRow = makeRawRow({ is_published: false, published_at: null });
    singleMock
      .mockResolvedValueOnce({ data: existingRow, error: null })
      .mockResolvedValueOnce({ data: { ...existingRow, is_published: true, published_at: "2026-03-01T00:00:00Z" }, error: null });
    eqMock.mockReturnValue({ single: singleMock });
    selectMock.mockReturnValueOnce({ eq: eqMock }).mockReturnValueOnce({ single: singleMock });
    updateMock.mockReturnValue({ eq: () => ({ select: selectMock }) });

    await blogRepository.update(1, { ...baseInput, isPublished: true });
    const updateRow = updateMock.mock.calls[0][0];
    expect(updateRow.published_at).not.toBeNull();
  });

  it("keeps the original published_at when re-saving an already-published post", async () => {
    const existingRow = makeRawRow({ is_published: true, published_at: "2026-01-15T00:00:00Z" });
    singleMock
      .mockResolvedValueOnce({ data: existingRow, error: null })
      .mockResolvedValueOnce({ data: existingRow, error: null });
    eqMock.mockReturnValue({ single: singleMock });
    selectMock.mockReturnValueOnce({ eq: eqMock }).mockReturnValueOnce({ single: singleMock });
    updateMock.mockReturnValue({ eq: () => ({ select: selectMock }) });

    await blogRepository.update(1, { ...baseInput, isPublished: true });
    const updateRow = updateMock.mock.calls[0][0];
    expect(updateRow.published_at).toBe("2026-01-15T00:00:00Z");
  });

  it("does not clear published_at when unpublishing — only flips is_published", async () => {
    const existingRow = makeRawRow({ is_published: true, published_at: "2026-01-15T00:00:00Z" });
    singleMock
      .mockResolvedValueOnce({ data: existingRow, error: null })
      .mockResolvedValueOnce({ data: { ...existingRow, is_published: false }, error: null });
    eqMock.mockReturnValue({ single: singleMock });
    selectMock.mockReturnValueOnce({ eq: eqMock }).mockReturnValueOnce({ single: singleMock });
    updateMock.mockReturnValue({ eq: () => ({ select: selectMock }) });

    await blogRepository.update(1, { ...baseInput, isPublished: false });
    const updateRow = updateMock.mock.calls[0][0];
    expect(updateRow.published_at).toBe("2026-01-15T00:00:00Z");
    expect(updateRow.is_published).toBe(false);
  });
});

describe("blogRepository.delete", () => {
  beforeEach(() => {
    selectMock.mockReset();
    eqMock.mockReset();
    singleMock.mockReset();
    deleteMock.mockReset();
  });

  it("throws BlogPostNotFoundError when the post does not exist", async () => {
    singleMock.mockResolvedValue({ data: null, error: { code: "PGRST116" } });
    eqMock.mockReturnValue({ single: singleMock });
    selectMock.mockReturnValue({ eq: eqMock });

    await expect(blogRepository.delete(999)).rejects.toThrow(BlogPostNotFoundError);
  });
});
