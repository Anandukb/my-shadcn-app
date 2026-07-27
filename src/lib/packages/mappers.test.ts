import { describe, it, expect } from "vitest";
import { rowToPackage, rowToAdminPackage, rowToAdminInput, packageAdminInputToInsertRow, packageAdminInputToUpdateRow } from "./mappers";
import type { PackageRow, PackageAdminInput } from "./types";

function makeRow(overrides: Partial<PackageRow> = {}): PackageRow {
  return {
    id: 1,
    category: "holidays",
    slug: null,
    price: 999,
    continent: "Asia",
    rating: 4.5,
    reviews: 10,
    featured: false,
    duration_en: "5 Days",
    duration_ar: null,
    group_size_en: null,
    group_size_ar: null,
    meals_en: null,
    meals_ar: null,
    accommodation_en: null,
    accommodation_ar: null,
    image: "https://example.com/img.jpg",
    itinerary_file_url: null,
    title_en: "Maldives Escape",
    title_ar: null,
    description_en: "A lovely trip",
    description_ar: null,
    location_en: "Maldives",
    location_ar: null,
    includes: [{ en: "Flights", ar: "" }],
    exclusions: [],
    cancellation_policy: [],
    pricing: null,
    offer_pricing: null,
    itinerary: [
      { day: 1, title: { en: "Arrival", ar: "" }, desc: { en: "Land and relax", ar: "" }, highlights: [{ en: "Airport pickup", ar: "" }] },
    ],
    departure_dates: [],
    flights: [],
    hotels: [
      { name: "Grand Resort", rating: 5, location: "Male", nights: 3, roomType: { en: "Deluxe", ar: "" } },
    ],
    optional_tours: [],
    created_by: null,
    updated_by: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("rowToPackage", () => {
  it("returns English values when locale is en", () => {
    const row = makeRow();
    const pkg = rowToPackage(row, "en");
    expect(pkg.title).toBe("Maldives Escape");
    expect(pkg.description).toBe("A lovely trip");
    expect(pkg.location).toBe("Maldives");
    expect(pkg.includes).toEqual(["Flights"]);
    expect(pkg.itinerary?.[0].title).toBe("Arrival");
    expect(pkg.hotels?.[0].roomType).toBe("Deluxe");
  });

  it("falls back to English when the Arabic value is null", () => {
    const row = makeRow({ title_ar: null });
    const pkg = rowToPackage(row, "ar");
    expect(pkg.title).toBe("Maldives Escape");
  });

  it("returns Arabic values when present and locale is ar", () => {
    const row = makeRow({
      title_ar: "هروب المالديف",
      includes: [{ en: "Flights", ar: "رحلات جوية" }],
    });
    const pkg = rowToPackage(row, "ar");
    expect(pkg.title).toBe("هروب المالديف");
    expect(pkg.includes).toEqual(["رحلات جوية"]);
  });

  it("falls back to English within a nested bilingual list item when its Arabic side is empty", () => {
    const row = makeRow({ includes: [{ en: "Flights", ar: "" }] });
    const pkg = rowToPackage(row, "ar");
    expect(pkg.includes).toEqual(["Flights"]);
  });
});

describe("rowToAdminPackage", () => {
  it("always resolves to English regardless of any Arabic content", () => {
    const row = makeRow({ title_ar: "هروب المالديف" });
    const pkg = rowToAdminPackage(row);
    expect(pkg.title).toBe("Maldives Escape");
  });
});

describe("rowToPackage (bilingual fields)", () => {
  it("resolves duration/groupSize/meals/accommodation with English fallback", () => {
    const row = makeRow({
      duration_en: "5 Days",
      duration_ar: null,
      group_size_en: "Max 15",
      group_size_ar: null,
      meals_en: "Breakfast",
      meals_ar: "إفطار",
    });
    const pkg = rowToPackage(row, "ar");
    expect(pkg.duration).toBe("5 Days");
    expect(pkg.groupSize).toBe("Max 15");
    expect(pkg.meals).toBe("إفطار");
  });

  it("leaves groupSize/meals/accommodation undefined when their _en column is null", () => {
    const row = makeRow({ group_size_en: null, meals_en: null, accommodation_en: null });
    const pkg = rowToPackage(row, "en");
    expect(pkg.groupSize).toBeUndefined();
    expect(pkg.meals).toBeUndefined();
    expect(pkg.accommodation).toBeUndefined();
  });
});

describe("rowToAdminInput", () => {
  it("returns the full bilingual view, not resolved to one language", () => {
    const row = makeRow({
      title_ar: "هروب المالديف",
      duration_en: "5 Days",
      duration_ar: "5 أيام",
      group_size_en: "Max 15",
      group_size_ar: "15 كحد أقصى",
    });
    const input = rowToAdminInput(row);
    expect(input.title).toEqual({ en: "Maldives Escape", ar: "هروب المالديف" });
    expect(input.duration).toEqual({ en: "5 Days", ar: "5 أيام" });
    expect(input.groupSize).toEqual({ en: "Max 15", ar: "15 كحد أقصى" });
  });

  it("returns undefined for groupSize/meals/accommodation when their _en column is null", () => {
    const row = makeRow({ group_size_en: null, meals_en: null, accommodation_en: null });
    const input = rowToAdminInput(row);
    expect(input.groupSize).toBeUndefined();
    expect(input.meals).toBeUndefined();
    expect(input.accommodation).toBeUndefined();
  });

  it("passes JSONB-shaped nested arrays through unchanged", () => {
    const row = makeRow();
    const input = rowToAdminInput(row);
    expect(input.includes).toEqual(row.includes);
    expect(input.itinerary).toEqual(row.itinerary);
    expect(input.hotels).toEqual(row.hotels);
  });
});

describe("packageAdminInputToInsertRow", () => {
  it("flattens bilingual top-level fields into _en/_ar columns", () => {
    const input: PackageAdminInput = {
      category: "holidays",
      title: { en: "New Package", ar: "باقة جديدة" },
      description: { en: "Desc", ar: "" },
      price: 100,
      image: "img.jpg",
      duration: { en: "3 Days", ar: "" },
      location: { en: "Paris", ar: "" },
      continent: "Europe",
      rating: 5,
      reviews: 0,
      featured: false,
      includes: [{ en: "Breakfast", ar: "" }],
    };
    const row = packageAdminInputToInsertRow(input) as Record<string, unknown>;
    expect(row.title_en).toBe("New Package");
    expect(row.title_ar).toBe("باقة جديدة");
    expect(row.duration_en).toBe("3 Days");
    expect(row.duration_ar).toBeNull();
    expect(row.includes).toEqual([{ en: "Breakfast", ar: "" }]);
  });

  it("sets group_size_en/ar to null when groupSize is omitted", () => {
    const input: PackageAdminInput = {
      category: "holidays",
      title: { en: "T", ar: "" },
      description: { en: "D", ar: "" },
      price: 100,
      image: "img.jpg",
      duration: { en: "3 Days", ar: "" },
      location: { en: "Paris", ar: "" },
      continent: "Europe",
      rating: 5,
      reviews: 0,
      featured: false,
      includes: [],
    };
    const row = packageAdminInputToInsertRow(input) as Record<string, unknown>;
    expect(row.group_size_en).toBeNull();
    expect(row.group_size_ar).toBeNull();
  });
});

describe("packageAdminInputToUpdateRow", () => {
  it("only includes fields that were actually submitted", () => {
    const result = packageAdminInputToUpdateRow({ featured: true }) as Record<string, unknown>;
    expect(result).toEqual({ featured: true });
  });

  it("flattens a submitted bilingual field into _en/_ar columns", () => {
    const result = packageAdminInputToUpdateRow({
      title: { en: "Updated Title", ar: "عنوان محدث" },
    }) as Record<string, unknown>;
    expect(result).toEqual({ title_en: "Updated Title", title_ar: "عنوان محدث" });
  });

  it("passes a submitted nested array through wholesale, both languages", () => {
    const itinerary = [
      { day: 1, title: { en: "Arrival", ar: "وصول" }, desc: { en: "Land", ar: "" }, highlights: [] },
    ];
    const result = packageAdminInputToUpdateRow({ itinerary }) as Record<string, unknown>;
    expect(result).toEqual({ itinerary });
  });
});
