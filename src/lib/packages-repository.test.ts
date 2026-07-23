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

import { packagesRepository } from "./packages-repository";

function makeRawRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    category: "holidays",
    slug: null,
    price: 999,
    continent: "Asia",
    rating: 4.5,
    reviews: 10,
    featured: false,
    duration: "5 Days",
    image: "https://example.com/img.jpg",
    group_size: null,
    meals: null,
    accommodation: null,
    itinerary_file_url: null,
    title_en: "Maldives Escape",
    title_ar: null,
    description_en: "A lovely trip",
    description_ar: null,
    location_en: "Maldives",
    location_ar: null,
    includes: [],
    exclusions: [],
    cancellation_policy: [],
    pricing: null,
    offer_pricing: null,
    itinerary: [],
    departure_dates: [],
    flights: [],
    hotels: [],
    optional_tours: [],
    created_by: null,
    updated_by: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("packagesRepository.getAll", () => {
  beforeEach(() => {
    selectMock.mockReset();
    orderMock.mockReset();
  });

  it("returns locale-resolved packages", async () => {
    orderMock.mockResolvedValue({ data: [makeRawRow()], error: null });
    selectMock.mockReturnValue({ order: orderMock });

    const result = await packagesRepository.getAll("en");
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Maldives Escape");
  });

  it("throws when Supabase returns an error", async () => {
    orderMock.mockResolvedValue({ data: null, error: new Error("db error") });
    selectMock.mockReturnValue({ order: orderMock });

    await expect(packagesRepository.getAll("en")).rejects.toThrow();
  });
});

describe("packagesRepository.getByCategory", () => {
  beforeEach(() => {
    selectMock.mockReset();
    eqMock.mockReset();
    orderMock.mockReset();
  });

  it("filters by category and resolves locale", async () => {
    orderMock.mockResolvedValue({ data: [makeRawRow({ category: "cruise" })], error: null });
    eqMock.mockReturnValue({ order: orderMock });
    selectMock.mockReturnValue({ eq: eqMock });

    const result = await packagesRepository.getByCategory("cruise", "en");
    expect(eqMock).toHaveBeenCalledWith("category", "cruise");
    expect(result).toHaveLength(1);
  });
});

describe("packagesRepository.getById", () => {
  beforeEach(() => {
    selectMock.mockReset();
    eqMock.mockReset();
    singleMock.mockReset();
  });

  it("returns null when no row matches", async () => {
    singleMock.mockResolvedValue({ data: null, error: { code: "PGRST116" } });
    eqMock.mockReturnValue({ single: singleMock });
    selectMock.mockReturnValue({ eq: eqMock });

    const result = await packagesRepository.getById(999, "en");
    expect(result).toBeNull();
  });

  it("returns the locale-resolved package when found", async () => {
    singleMock.mockResolvedValue({ data: makeRawRow(), error: null });
    eqMock.mockReturnValue({ single: singleMock });
    selectMock.mockReturnValue({ eq: eqMock });

    const result = await packagesRepository.getById(1, "en");
    expect(result?.title).toBe("Maldives Escape");
  });
});

describe("packagesRepository.create", () => {
  beforeEach(() => {
    insertMock.mockReset();
    selectMock.mockReset();
    singleMock.mockReset();
  });

  it("inserts and returns the admin (English) view of the new package", async () => {
    singleMock.mockResolvedValue({ data: makeRawRow({ id: 42 }), error: null });
    selectMock.mockReturnValue({ single: singleMock });
    insertMock.mockReturnValue({ select: selectMock });

    const created = await packagesRepository.create({
      category: "holidays",
      title: "Maldives Escape",
      description: "A lovely trip",
      price: 999,
      image: "https://example.com/img.jpg",
      duration: "5 Days",
      location: "Maldives",
      continent: "Asia",
      rating: 4.5,
      reviews: 10,
      featured: false,
      includes: [],
    });

    expect(created.id).toBe(42);
    expect(created.title).toBe("Maldives Escape");
  });
});

describe("packagesRepository.update", () => {
  beforeEach(() => {
    selectMock.mockReset();
    eqMock.mockReset();
    singleMock.mockReset();
    updateMock.mockReset();
  });

  it("throws when the package does not exist", async () => {
    singleMock.mockResolvedValue({ data: null, error: { code: "PGRST116" } });
    eqMock.mockReturnValue({ single: singleMock });
    selectMock.mockReturnValue({ eq: eqMock });

    await expect(packagesRepository.update(999, { featured: true })).rejects.toThrow();
  });

  it("fetches the existing row, merges, and returns the updated package", async () => {
    const existingRow = makeRawRow({ featured: false });
    singleMock
      .mockResolvedValueOnce({ data: existingRow, error: null })
      .mockResolvedValueOnce({ data: { ...existingRow, featured: true }, error: null });
    eqMock.mockReturnValue({ single: singleMock });
    selectMock
      .mockReturnValueOnce({ eq: eqMock })
      .mockReturnValueOnce({ single: singleMock });
    updateMock.mockReturnValue({ eq: () => ({ select: selectMock }) });

    const result = await packagesRepository.update(1, { featured: true });
    expect(result.featured).toBe(true);
  });
});

describe("packagesRepository.delete", () => {
  beforeEach(() => {
    deleteMock.mockReset();
    eqMock.mockReset();
  });

  it("returns true on success", async () => {
    eqMock.mockResolvedValue({ error: null });
    deleteMock.mockReturnValue({ eq: eqMock });

    const result = await packagesRepository.delete(1);
    expect(result).toBe(true);
  });
});

describe("packagesRepository.toggleFeatured", () => {
  beforeEach(() => {
    selectMock.mockReset();
    eqMock.mockReset();
    singleMock.mockReset();
    updateMock.mockReset();
  });

  it("flips the featured flag", async () => {
    singleMock
      .mockResolvedValueOnce({ data: makeRawRow({ featured: false }), error: null })
      .mockResolvedValueOnce({ data: makeRawRow({ featured: true }), error: null });
    eqMock.mockReturnValue({ single: singleMock });
    selectMock
      .mockReturnValueOnce({ eq: eqMock })
      .mockReturnValueOnce({ single: singleMock });
    updateMock.mockReturnValue({ eq: () => ({ select: selectMock }) });

    const result = await packagesRepository.toggleFeatured(1);
    expect(result.featured).toBe(true);
  });
});
