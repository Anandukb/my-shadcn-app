import { describe, it, expect } from "vitest";
import { rowToPackage, rowToAdminPackage, packageInputToInsertRow, packageInputToUpdateRow } from "./mappers";
import type { PackageRow } from "./types";
import type { Package } from "@/types/package";

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

describe("packageInputToInsertRow", () => {
  it("wraps single-language input into bilingual shape with empty Arabic", () => {
    const input: Omit<Package, "id"> = {
      category: "holidays",
      title: "New Package",
      description: "Desc",
      price: 100,
      image: "img.jpg",
      duration: "3 Days",
      location: "Paris",
      continent: "Europe",
      rating: 5,
      reviews: 0,
      featured: false,
      includes: ["Breakfast"],
    };
    const row = packageInputToInsertRow(input) as Record<string, any>;
    expect(row.title_en).toBe("New Package");
    expect(row.title_ar).toBeNull();
    expect(row.includes).toEqual([{ en: "Breakfast", ar: "" }]);
  });
});

describe("packageInputToUpdateRow", () => {
  it("preserves existing Arabic content when the admin submits an English-only update", () => {
    const existing = makeRow({
      title_ar: "هروب المالديف",
      includes: [{ en: "Flights", ar: "رحلات جوية" }],
    });
    const input: Partial<Package> = {
      title: "Maldives Escape (Updated)",
      includes: ["Flights", "Breakfast"],
    };
    const result = packageInputToUpdateRow(input, existing) as Record<string, any>;
    expect(result.title_en).toBe("Maldives Escape (Updated)");
    expect(result.title_ar).toBe("هروب المالديف");
    expect(result.includes).toEqual([
      { en: "Flights", ar: "رحلات جوية" },
      { en: "Breakfast", ar: "" },
    ]);
  });

  it("only includes fields that were actually submitted", () => {
    const existing = makeRow();
    const result = packageInputToUpdateRow({ featured: true }, existing) as Record<string, any>;
    expect(result).toEqual({ featured: true });
  });
});
