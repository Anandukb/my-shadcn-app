import { describe, it, expect } from "vitest";
import { packageAdminInputSchema } from "./schema";
import type { PackageAdminInput } from "./types";

function makeValidInput(overrides: Partial<PackageAdminInput> = {}): PackageAdminInput {
  return {
    category: "holidays",
    title: { en: "Maldives Escape", ar: "" },
    description: { en: "", ar: "" },
    price: 999,
    image: "https://example.com/img.jpg",
    duration: { en: "5 Days", ar: "" },
    location: { en: "Maldives", ar: "" },
    continent: "Asia",
    rating: 4.5,
    reviews: 10,
    featured: false,
    includes: [{ en: "Flights", ar: "" }],
    ...overrides,
  };
}

describe("packageAdminInputSchema", () => {
  it("accepts empty-English optional bilingual sub-fields (hotel badge/description, itinerary day desc)", () => {
    const input = makeValidInput({
      hotels: [
        {
          name: "Grand Hyatt",
          rating: 4,
          location: "Male",
          nights: 3,
          roomType: { en: "", ar: "" },
          description: { en: "", ar: "" },
          badge: { en: "", ar: "" },
          amenities: [],
        },
      ],
      itinerary: [
        {
          day: 1,
          title: { en: "Arrival", ar: "" },
          desc: { en: "", ar: "" },
          highlights: [],
        },
      ],
    });

    const result = packageAdminInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("rejects an empty English title", () => {
    const input = makeValidInput({ title: { en: "", ar: "" } });

    const result = packageAdminInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects an empty English duration", () => {
    const input = makeValidInput({ duration: { en: "", ar: "" } });

    const result = packageAdminInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects an empty English location", () => {
    const input = makeValidInput({ location: { en: "", ar: "" } });

    const result = packageAdminInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});
