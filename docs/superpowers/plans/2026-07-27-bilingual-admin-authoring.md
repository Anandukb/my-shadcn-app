# Bilingual Admin Authoring UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the bilingual admin authoring UI Plan 2a deliberately deferred — a global English/Arabic toggle in the package create/edit dialog, doubled form state for every already-bilingual field, and promote `duration`/`groupSize`/`meals`/`accommodation` to bilingual columns via a small migration.

**Architecture:** A new `PackageAdminInput` type carries the full bilingual shape between the admin form and the repository (replacing Plan 2a's English-only `Package`-based admin input, which relied on fetch-then-merge to avoid clobbering Arabic content the old form couldn't see). The admin list view stays English-only (Plan 2a's `getByCategory(category, "en")`, unchanged); only the create/edit dialog needs full bilingual data, fetched via a new admin-only endpoint when it opens.

**Tech Stack:** Same as Plan 2a — Supabase, `@tanstack/react-query`, `zod`, Vitest.

This is **Plan 2b of 3** (packages catalog subsystem), following Plan 2a (`docs/superpowers/plans/2026-07-16-packages-data-layer.md`), already implemented. Depends on Plan 1's `requireAdminSession()`.

## Global Constraints

- Bilingual scope is exactly: `title`, `description`, `location`, `duration`, `groupSize`, `meals`, `accommodation` (top-level); `includes`, `exclusions`, `cancellationPolicy` (string lists); itinerary day `title`/`desc`/`highlights`; hotel `roomType`/`description`/`badge`/`amenities`; optional tour `title`/`desc`; departure-date `seats`. Nothing else (category, price, image, continent, rating, reviews, featured, itineraryFileUrl, pricing/offerPricing, flights, hotel name/location/nights/checkIn/checkOut/image, optional tour tag/pricing/images, departure-date date/pricing/urgency) is bilingual.
- Arabic remains optional everywhere — only English fields keep required-field validation (Title, Price, Location, Duration). `rowToPackage`'s existing fallback-to-English behavior (Plan 2a) is unchanged.
- The admin list/table view stays English-only (`getByCategory(category, "en")`, unchanged from Plan 2a) — only the create/edit dialog needs bilingual data.
- Browser and Server Components never call Supabase directly — all package data access goes through `src/lib/packages-repository.ts`, consistent with Plan 1/2a's architecture.
- Follow the repository's existing code style: TypeScript strict, no comments except where a non-obvious constraint needs explaining.

---

## File Structure

| File | Change | Responsibility |
|---|---|---|
| `supabase/migrations/<timestamp>_add_bilingual_package_fields.sql` | Create | Promote `duration`/`group_size`/`meals`/`accommodation` to `_en`/`_ar` column pairs, backfilling from existing data. |
| `src/lib/packages/types.ts` | Modify | `PackageRow` gains the new column pairs, drops the 4 old columns. New `PackageAdminInput` type. |
| `src/lib/packages/mappers.ts` | Modify | `rowToPackage` extended for the 4 newly-bilingual fields. New `rowToAdminInput`, `packageAdminInputToInsertRow`, `packageAdminInputToUpdateRow`. Old `packageInputToInsertRow`/`packageInputToUpdateRow`/`wrap`/`wrapList` deleted (dead once `create`/`update` take bilingual input directly). |
| `src/lib/packages/mappers.test.ts` | Modify | Tests for the new/changed mapper functions; old English-only mapper tests removed. |
| `src/lib/packages-repository.ts` | Modify | `create`/`update` take `PackageAdminInput`/`Partial<PackageAdminInput>`. New `getAdminInputById`. |
| `src/lib/packages-repository.test.ts` | Modify | Existing `create`/`update` tests updated to the new bilingual input shape; new test for `getAdminInputById`. |
| `src/lib/packages/schema.ts` | Modify | New `packageAdminInputSchema`/`packageAdminUpdateSchema` (bilingual), replacing `packageInputSchema`/`packageUpdateSchema`. |
| `src/app/api/packages/route.ts` | Modify | `POST` validates against `packageAdminInputSchema`. |
| `src/app/api/packages/[id]/route.ts` | Modify | `PATCH` validates against `packageAdminUpdateSchema`. |
| `src/app/api/packages/[id]/admin/route.ts` | Create | `GET`, admin-gated, returns `PackageAdminInput` for populating the edit form. |
| `src/components/admin/CategoryPackagesTable.tsx` | Modify | Language toggle, doubled bilingual form state, `BilingualInput`/`BilingualTextarea` helper components, edit-open bilingual fetch, all 6 affected tabs' JSX. |

---

### Task 1: Migration — promote 4 fields to bilingual columns

**Files:**
- Create: `supabase/migrations/<timestamp>_add_bilingual_package_fields.sql`

**Interfaces:**
- Produces: `packages.duration_en`/`duration_ar`, `group_size_en`/`group_size_ar`, `meals_en`/`meals_ar`, `accommodation_en`/`accommodation_ar` columns, consumed by Task 2's `PackageRow` type.

- [ ] **Step 1: Create the migration file**

```bash
npx supabase migration new add_bilingual_package_fields
```

Open the generated `supabase/migrations/<timestamp>_add_bilingual_package_fields.sql` and replace its contents with:

```sql
alter table public.packages
  add column duration_en text,
  add column duration_ar text,
  add column group_size_en text,
  add column group_size_ar text,
  add column meals_en text,
  add column meals_ar text,
  add column accommodation_en text,
  add column accommodation_ar text;

update public.packages set
  duration_en = duration,
  group_size_en = group_size,
  meals_en = meals,
  accommodation_en = accommodation;

alter table public.packages
  alter column duration_en set not null;

alter table public.packages
  drop column duration,
  drop column group_size,
  drop column meals,
  drop column accommodation;
```

- [ ] **Step 2: Review checklist**

Confirm the file has, in order: the 8 new nullable columns added, the backfill `UPDATE` copying all 4 old columns to their new `_en` counterparts, `duration_en` set `NOT NULL` only after backfill, then the 4 old columns dropped. `group_size_en`/`meals_en`/`accommodation_en` stay nullable (their source columns were already nullable).

- [ ] **Step 3: Apply the migration**

```bash
npx supabase db push
```

Verify in the Supabase dashboard (**Table Editor**) that `packages` now has the 8 new columns and the 4 old ones are gone, with `duration_en` populated for all existing rows.

- [ ] **Step 4: Commit**

```bash
git add supabase/
git commit -m "feat: promote duration/groupSize/meals/accommodation to bilingual columns"
```

---

### Task 2: Types — extend `PackageRow`, add `PackageAdminInput`

**Files:**
- Modify: `src/lib/packages/types.ts`

**Interfaces:**
- Consumes: `BilingualText`, `PackageRowItineraryDay`, `PackageRowHotel`, `PackageRowOptionalTour`, `PackageRowDepartureDate` (already defined in this file, unchanged).
- Produces: updated `PackageRow` (new fields), new `PackageAdminInput` — consumed by Task 3's mappers.

- [ ] **Step 1: Replace the `PackageRow` interface**

Current (lines 55–90):
```ts
export interface PackageRow {
  id: number;
  category: string;
  slug: string | null;
  price: number;
  continent: string;
  rating: number;
  reviews: number;
  featured: boolean;
  duration: string;
  image: string;
  group_size: string | null;
  meals: string | null;
  accommodation: string | null;
  itinerary_file_url: string | null;
  title_en: string;
  title_ar: string | null;
  description_en: string;
  description_ar: string | null;
  location_en: string;
  location_ar: string | null;
  includes: BilingualText[];
  exclusions: BilingualText[];
  cancellation_policy: BilingualText[];
  pricing: PackagePrice | null;
  offer_pricing: PackagePrice | null;
  itinerary: PackageRowItineraryDay[];
  departure_dates: PackageRowDepartureDate[];
  flights: FlightDetails[];
  hotels: PackageRowHotel[];
  optional_tours: PackageRowOptionalTour[];
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}
```

Replace with:
```ts
export interface PackageRow {
  id: number;
  category: string;
  slug: string | null;
  price: number;
  continent: string;
  rating: number;
  reviews: number;
  featured: boolean;
  duration_en: string;
  duration_ar: string | null;
  image: string;
  group_size_en: string | null;
  group_size_ar: string | null;
  meals_en: string | null;
  meals_ar: string | null;
  accommodation_en: string | null;
  accommodation_ar: string | null;
  itinerary_file_url: string | null;
  title_en: string;
  title_ar: string | null;
  description_en: string;
  description_ar: string | null;
  location_en: string;
  location_ar: string | null;
  includes: BilingualText[];
  exclusions: BilingualText[];
  cancellation_policy: BilingualText[];
  pricing: PackagePrice | null;
  offer_pricing: PackagePrice | null;
  itinerary: PackageRowItineraryDay[];
  departure_dates: PackageRowDepartureDate[];
  flights: FlightDetails[];
  hotels: PackageRowHotel[];
  optional_tours: PackageRowOptionalTour[];
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PackageAdminInput {
  category: string;
  price: number;
  continent: string;
  rating: number;
  reviews: number;
  featured: boolean;
  duration: BilingualText;
  image: string;
  groupSize?: BilingualText;
  meals?: BilingualText;
  accommodation?: BilingualText;
  itineraryFileUrl?: string;
  title: BilingualText;
  description: BilingualText;
  location: BilingualText;
  includes: BilingualText[];
  exclusions?: BilingualText[];
  cancellationPolicy?: BilingualText[];
  pricing?: PackagePrice;
  offerPricing?: PackagePrice;
  itinerary?: PackageRowItineraryDay[];
  departureDates?: PackageRowDepartureDate[];
  flights?: FlightDetails[];
  hotels?: PackageRowHotel[];
  optionalTours?: PackageRowOptionalTour[];
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit` → expect NEW errors in `mappers.ts` (it still references the old `PackageRow` field names) — this is expected at this point, Task 3 fixes them. Confirm the errors are only in `mappers.ts` and its test file, not elsewhere.

- [ ] **Step 3: Commit**

```bash
git add src/lib/packages/types.ts
git commit -m "feat: add PackageAdminInput, promote 4 fields to bilingual columns in PackageRow"
```

---

### Task 3: Mappers — extend `rowToPackage`, add admin-input mappers, remove dead Plan 2a functions

**Files:**
- Modify: `src/lib/packages/mappers.ts`
- Modify: `src/lib/packages/mappers.test.ts`

**Interfaces:**
- Consumes: `PackageAdminInput`, updated `PackageRow` (Task 2).
- Produces: `rowToAdminInput(row: PackageRow): PackageAdminInput`, `packageAdminInputToInsertRow(input: PackageAdminInput): Record<string, unknown>`, `packageAdminInputToUpdateRow(input: Partial<PackageAdminInput>): Record<string, unknown>` — consumed by Task 4's repository. `rowToPackage`/`rowToAdminPackage` keep their existing signatures (Task 4 still uses `rowToAdminPackage` to shape write responses). `packageInputToInsertRow`, `packageInputToUpdateRow`, `wrap`, `wrapList` are deleted.

- [ ] **Step 1: Update `rowToPackage` for the 4 newly-bilingual fields**

Current (inside `rowToPackage`, the `duration`/`groupSize`/`meals`/`accommodation` lines):
```ts
    price: row.price,
    image: row.image,
    duration: row.duration,
    location: pick({ en: row.location_en, ar: row.location_ar ?? "" }, locale),
    continent: row.continent,
    rating: row.rating,
    reviews: row.reviews,
    featured: row.featured,
    includes: pickList(row.includes, locale),
    exclusions: pickList(row.exclusions, locale),
    groupSize: row.group_size ?? undefined,
    meals: row.meals ?? undefined,
    accommodation: row.accommodation ?? undefined,
```

Replace with:
```ts
    price: row.price,
    image: row.image,
    duration: pick({ en: row.duration_en, ar: row.duration_ar ?? "" }, locale),
    location: pick({ en: row.location_en, ar: row.location_ar ?? "" }, locale),
    continent: row.continent,
    rating: row.rating,
    reviews: row.reviews,
    featured: row.featured,
    includes: pickList(row.includes, locale),
    exclusions: pickList(row.exclusions, locale),
    groupSize: row.group_size_en !== null ? pick({ en: row.group_size_en, ar: row.group_size_ar ?? "" }, locale) : undefined,
    meals: row.meals_en !== null ? pick({ en: row.meals_en, ar: row.meals_ar ?? "" }, locale) : undefined,
    accommodation: row.accommodation_en !== null ? pick({ en: row.accommodation_en, ar: row.accommodation_ar ?? "" }, locale) : undefined,
```

- [ ] **Step 2: Delete the now-dead Plan 2a functions**

Delete these four functions entirely from `mappers.ts`: `wrap`, `wrapList`, `packageInputToInsertRow`, `packageInputToUpdateRow` (everything from `function wrap(en: string)` through the end of `packageInputToUpdateRow`, including its preceding "Index-based Arabic-preservation" comment block). Keep `rowToPackage`, `rowToAdminPackage`, `pick`, `pickList` — those stay.

- [ ] **Step 3: Write the failing tests for the new admin-input mappers**

Add to `mappers.test.ts` (the existing `rowToPackage`/`rowToAdminPackage` describe blocks stay; the `packageInputToInsertRow`/`packageInputToUpdateRow` describe blocks at the bottom get replaced by these):

```ts
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
```

Also add the new imports to the top of `mappers.test.ts`:
```ts
import { rowToPackage, rowToAdminPackage, rowToAdminInput, packageAdminInputToInsertRow, packageAdminInputToUpdateRow } from "./mappers";
import type { PackageRow, PackageAdminInput } from "./types";
```

And extend the existing `makeRow()` helper in `mappers.test.ts` to include the 4 new fields (replacing the old `duration`/`group_size`/`meals`/`accommodation` keys it currently sets):
```ts
    duration_en: "5 Days",
    duration_ar: null,
    group_size_en: null,
    group_size_ar: null,
    meals_en: null,
    meals_ar: null,
    accommodation_en: null,
    accommodation_ar: null,
```
(replacing the old `duration: "5 Days"`, `group_size: null`, `meals: null`, `accommodation: null` lines in `makeRow`'s default object).

- [ ] **Step 4: Run the tests to verify they fail**

Run: `npm test -- src/lib/packages/mappers.test.ts`
Expected: FAIL — `rowToAdminInput`/`packageAdminInputToInsertRow`/`packageAdminInputToUpdateRow` are not exported yet.

- [ ] **Step 5: Implement the new mapper functions**

Add to `mappers.ts` (after `rowToAdminPackage`, replacing the deleted `wrap`/`wrapList`/`packageInputToInsertRow`/`packageInputToUpdateRow`):

```ts
export function rowToAdminInput(row: PackageRow): PackageAdminInput {
  return {
    category: row.category,
    price: row.price,
    continent: row.continent,
    rating: row.rating,
    reviews: row.reviews,
    featured: row.featured,
    duration: { en: row.duration_en, ar: row.duration_ar ?? "" },
    image: row.image,
    groupSize: row.group_size_en !== null ? { en: row.group_size_en, ar: row.group_size_ar ?? "" } : undefined,
    meals: row.meals_en !== null ? { en: row.meals_en, ar: row.meals_ar ?? "" } : undefined,
    accommodation:
      row.accommodation_en !== null ? { en: row.accommodation_en, ar: row.accommodation_ar ?? "" } : undefined,
    itineraryFileUrl: row.itinerary_file_url ?? undefined,
    title: { en: row.title_en, ar: row.title_ar ?? "" },
    description: { en: row.description_en, ar: row.description_ar ?? "" },
    location: { en: row.location_en, ar: row.location_ar ?? "" },
    includes: row.includes,
    exclusions: row.exclusions,
    cancellationPolicy: row.cancellation_policy,
    pricing: row.pricing ?? undefined,
    offerPricing: row.offer_pricing ?? undefined,
    itinerary: row.itinerary,
    departureDates: row.departure_dates,
    flights: row.flights,
    hotels: row.hotels,
    optionalTours: row.optional_tours,
  };
}

export function packageAdminInputToInsertRow(input: PackageAdminInput): Record<string, unknown> {
  return {
    category: input.category,
    price: input.price,
    continent: input.continent,
    rating: input.rating,
    reviews: input.reviews,
    featured: input.featured,
    duration_en: input.duration.en,
    duration_ar: input.duration.ar || null,
    image: input.image,
    group_size_en: input.groupSize?.en ?? null,
    group_size_ar: input.groupSize?.ar || null,
    meals_en: input.meals?.en ?? null,
    meals_ar: input.meals?.ar || null,
    accommodation_en: input.accommodation?.en ?? null,
    accommodation_ar: input.accommodation?.ar || null,
    itinerary_file_url: input.itineraryFileUrl ?? null,
    title_en: input.title.en,
    title_ar: input.title.ar || null,
    description_en: input.description.en,
    description_ar: input.description.ar || null,
    location_en: input.location.en,
    location_ar: input.location.ar || null,
    includes: input.includes,
    exclusions: input.exclusions ?? [],
    cancellation_policy: input.cancellationPolicy ?? [],
    pricing: input.pricing ?? null,
    offer_pricing: input.offerPricing ?? null,
    itinerary: input.itinerary ?? [],
    departure_dates: input.departureDates ?? [],
    flights: input.flights ?? [],
    hotels: input.hotels ?? [],
    optional_tours: input.optionalTours ?? [],
  };
}

export function packageAdminInputToUpdateRow(input: Partial<PackageAdminInput>): Record<string, unknown> {
  const merged: Record<string, unknown> = {};

  if (input.category !== undefined) merged.category = input.category;
  if (input.price !== undefined) merged.price = input.price;
  if (input.continent !== undefined) merged.continent = input.continent;
  if (input.rating !== undefined) merged.rating = input.rating;
  if (input.reviews !== undefined) merged.reviews = input.reviews;
  if (input.featured !== undefined) merged.featured = input.featured;
  if (input.image !== undefined) merged.image = input.image;
  if (input.itineraryFileUrl !== undefined) merged.itinerary_file_url = input.itineraryFileUrl;

  if (input.duration !== undefined) {
    merged.duration_en = input.duration.en;
    merged.duration_ar = input.duration.ar || null;
  }
  if (input.groupSize !== undefined) {
    merged.group_size_en = input.groupSize.en;
    merged.group_size_ar = input.groupSize.ar || null;
  }
  if (input.meals !== undefined) {
    merged.meals_en = input.meals.en;
    merged.meals_ar = input.meals.ar || null;
  }
  if (input.accommodation !== undefined) {
    merged.accommodation_en = input.accommodation.en;
    merged.accommodation_ar = input.accommodation.ar || null;
  }
  if (input.title !== undefined) {
    merged.title_en = input.title.en;
    merged.title_ar = input.title.ar || null;
  }
  if (input.description !== undefined) {
    merged.description_en = input.description.en;
    merged.description_ar = input.description.ar || null;
  }
  if (input.location !== undefined) {
    merged.location_en = input.location.en;
    merged.location_ar = input.location.ar || null;
  }

  if (input.includes !== undefined) merged.includes = input.includes;
  if (input.exclusions !== undefined) merged.exclusions = input.exclusions;
  if (input.cancellationPolicy !== undefined) merged.cancellation_policy = input.cancellationPolicy;
  if (input.pricing !== undefined) merged.pricing = input.pricing;
  if (input.offerPricing !== undefined) merged.offer_pricing = input.offerPricing;
  if (input.itinerary !== undefined) merged.itinerary = input.itinerary;
  if (input.departureDates !== undefined) merged.departure_dates = input.departureDates;
  if (input.flights !== undefined) merged.flights = input.flights;
  if (input.hotels !== undefined) merged.hotels = input.hotels;
  if (input.optionalTours !== undefined) merged.optional_tours = input.optionalTours;

  return merged;
}
```

Also add `PackageAdminInput` to the `import type { ... } from "./types"` line at the top of `mappers.ts`.

- [ ] **Step 6: Run the tests to verify they pass**

Run: `npm test -- src/lib/packages/mappers.test.ts`
Expected: all tests PASS.

- [ ] **Step 7: Run the full suite and commit**

Run: `npm test` → expect all tests PASS (Task 4 hasn't run yet, so `packages-repository.test.ts` will FAIL at this point since it still calls `create`/`update` with the old `Omit<Package,"id">` shape against a repository whose mappers changed underneath it — expected, Task 4 fixes this. Confirm the ONLY failures are in `packages-repository.test.ts`.)

```bash
git add src/lib/packages/mappers.ts src/lib/packages/mappers.test.ts
git commit -m "feat: add bilingual admin-input mappers, remove dead Plan 2a english-only mappers"
```

---

### Task 4: Repository — bilingual `create`/`update`, new `getAdminInputById`

**Files:**
- Modify: `src/lib/packages-repository.ts`
- Modify: `src/lib/packages-repository.test.ts`

**Interfaces:**
- Consumes: `PackageAdminInput`, `rowToAdminInput`, `packageAdminInputToInsertRow`, `packageAdminInputToUpdateRow` (Tasks 2–3).
- Produces: `create(input: PackageAdminInput, createdBy?: string): Promise<Package>`, `update(id: number, input: Partial<PackageAdminInput>, updatedBy?: string): Promise<Package>` (signature change from Plan 2a), `getAdminInputById(id: number): Promise<PackageAdminInput | null>` (new) — consumed by Task 5's API routes.

- [ ] **Step 1: Update the imports**

Current (line 2):
```ts
import { rowToPackage, rowToAdminPackage, packageInputToInsertRow, packageInputToUpdateRow } from "@/lib/packages/mappers";
import type { PackageRow } from "@/lib/packages/types";
```

Replace with:
```ts
import { rowToPackage, rowToAdminPackage, rowToAdminInput, packageAdminInputToInsertRow, packageAdminInputToUpdateRow } from "@/lib/packages/mappers";
import type { PackageRow, PackageAdminInput } from "@/lib/packages/types";
```

- [ ] **Step 2: Replace `create`**

Current:
```ts
  async create(input: Omit<Package, "id">, createdBy?: string): Promise<Package> {
    const supabase = createAdminClient();
    const insertRow = {
      ...packageInputToInsertRow(input),
      created_by: createdBy ?? null,
      updated_by: createdBy ?? null,
    };

    const { data, error } = await supabase.from(TABLE).insert(insertRow).select().single();

    if (error) throw new Error(`Failed to create package: ${error.message}`);

    return rowToAdminPackage(data as PackageRow);
  },
```

Replace with:
```ts
  async create(input: PackageAdminInput, createdBy?: string): Promise<Package> {
    const supabase = createAdminClient();
    const insertRow = {
      ...packageAdminInputToInsertRow(input),
      created_by: createdBy ?? null,
      updated_by: createdBy ?? null,
    };

    const { data, error } = await supabase.from(TABLE).insert(insertRow).select().single();

    if (error) throw new Error(`Failed to create package: ${error.message}`);

    return rowToAdminPackage(data as PackageRow);
  },
```

- [ ] **Step 3: Replace `update`**

Current:
```ts
  async update(id: number, input: Partial<Package>, updatedBy?: string): Promise<Package> {
    const existing = await fetchRowById(id);
    if (!existing) {
      throw new PackageNotFoundError(id);
    }

    const supabase = createAdminClient();
    const updateRow = {
      ...packageInputToUpdateRow(input, existing),
      updated_by: updatedBy ?? null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from(TABLE).update(updateRow).eq("id", id).select().single();

    if (error) throw new Error(`Failed to update package ${id}: ${error.message}`);

    return rowToAdminPackage(data as PackageRow);
  },
```

Replace with:
```ts
  async update(id: number, input: Partial<PackageAdminInput>, updatedBy?: string): Promise<Package> {
    const existing = await fetchRowById(id);
    if (!existing) {
      throw new PackageNotFoundError(id);
    }

    const supabase = createAdminClient();
    const updateRow = {
      ...packageAdminInputToUpdateRow(input),
      updated_by: updatedBy ?? null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from(TABLE).update(updateRow).eq("id", id).select().single();

    if (error) throw new Error(`Failed to update package ${id}: ${error.message}`);

    return rowToAdminPackage(data as PackageRow);
  },
```

Note: `existing` is still fetched (to guard against updating a non-existent package) but is no longer passed into the mapper — `packageAdminInputToUpdateRow` takes only `input` now, since the admin form always submits complete bilingual pairs and no longer needs `existing`'s values to reconstruct anything.

- [ ] **Step 4: Add `getAdminInputById`**

Add this new method to the `packagesRepository` object, right after `getById`:

```ts
  async getAdminInputById(id: number): Promise<PackageAdminInput | null> {
    const row = await fetchRowById(id);
    return row ? rowToAdminInput(row) : null;
  },
```

- [ ] **Step 5: Update the existing `create`/`update` tests to the new bilingual shape**

In `packages-repository.test.ts`, find the `packagesRepository.create` describe block's test ("inserts and returns the admin (English) view of the new package") and replace its input object:

Current:
```ts
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
```

Replace with:
```ts
    const created = await packagesRepository.create({
      category: "holidays",
      title: { en: "Maldives Escape", ar: "" },
      description: { en: "A lovely trip", ar: "" },
      price: 999,
      image: "https://example.com/img.jpg",
      duration: { en: "5 Days", ar: "" },
      location: { en: "Maldives", ar: "" },
      continent: "Asia",
      rating: 4.5,
      reviews: 10,
      featured: false,
      includes: [],
    });
```

Find the `packagesRepository.update` describe block's test using `{ featured: true }` as input — this one doesn't touch bilingual fields, so it stays unchanged. No other `create`/`update` test calls need changes.

Add this import at the top of the test file: `import type { PackageAdminInput } from "@/lib/packages/types";` (only needed if you add explicit type annotations — the existing tests infer types fine without it, so this import is optional; skip it if TypeScript doesn't complain).

- [ ] **Step 6: Write the failing test for `getAdminInputById`**

Add this new describe block to `packages-repository.test.ts`:

```ts
describe("packagesRepository.getAdminInputById", () => {
  beforeEach(() => {
    selectMock.mockReset();
    eqMock.mockReset();
    singleMock.mockReset();
  });

  it("returns null when no row matches", async () => {
    singleMock.mockResolvedValue({ data: null, error: { code: "PGRST116" } });
    eqMock.mockReturnValue({ single: singleMock });
    selectMock.mockReturnValue({ eq: eqMock });

    const result = await packagesRepository.getAdminInputById(999);
    expect(result).toBeNull();
  });

  it("returns the full bilingual admin input when found", async () => {
    singleMock.mockResolvedValue({ data: makeRawRow({ title_ar: "هروب المالديف" }), error: null });
    eqMock.mockReturnValue({ single: singleMock });
    selectMock.mockReturnValue({ eq: eqMock });

    const result = await packagesRepository.getAdminInputById(1);
    expect(result?.title).toEqual({ en: "Maldives Escape", ar: "هروب المالديف" });
  });
});
```

Also update `makeRawRow()` (the test file's local row-builder helper) to use the new field names — replace its `duration: "5 Days"`, `group_size: null`, `meals: null`, `accommodation: null` entries with:
```ts
    duration_en: "5 Days",
    duration_ar: null,
    group_size_en: null,
    group_size_ar: null,
    meals_en: null,
    meals_ar: null,
    accommodation_en: null,
    accommodation_ar: null,
```

- [ ] **Step 7: Run the tests to verify they pass**

Run: `npm test -- src/lib/packages-repository.test.ts`
Expected: all tests PASS.

- [ ] **Step 8: Run the full suite and commit**

Run: `npm test` → expect all tests PASS.

```bash
git add src/lib/packages-repository.ts src/lib/packages-repository.test.ts
git commit -m "feat: switch repository create/update to bilingual input, add getAdminInputById"
```

---

### Task 5: API — bilingual zod schemas, new admin-input endpoint

**Files:**
- Modify: `src/lib/packages/schema.ts`
- Modify: `src/app/api/packages/route.ts`
- Modify: `src/app/api/packages/[id]/route.ts`
- Create: `src/app/api/packages/[id]/admin/route.ts`

**Interfaces:**
- Consumes: `packagesRepository.getAdminInputById` (Task 4).
- Produces: `packageAdminInputSchema`, `packageAdminUpdateSchema` (replacing `packageInputSchema`/`packageUpdateSchema`); `GET /api/packages/[id]/admin` — consumed by Task 6's edit-open fetch.

- [ ] **Step 1: Replace the bilingual-aware sub-schemas and the top-level schema**

In `src/lib/packages/schema.ts`, add this new schema right after the `import { z } from "zod";` line:

```ts
const bilingualTextSchema = z.object({
  en: z.string(),
  ar: z.string(),
});
```

Replace `itineraryDaySchema`:
```ts
const itineraryDaySchema = z.object({
  day: z.number(),
  title: bilingualTextSchema,
  desc: bilingualTextSchema,
  highlights: z.array(bilingualTextSchema),
  images: z.array(z.string()).optional(),
});
```

Replace `departureDateSchema`'s `seats` field:
```ts
const departureDateSchema = z.object({
  id: z.string(),
  date: z.string(),
  adult: z.number(),
  single: z.number(),
  child611: z.number(),
  child25: z.number(),
  infant: z.number(),
  seats: bilingualTextSchema,
  urgency: z.enum(["red", "amber", "green"]),
});
```

Keep `flightDetailsSchema` exactly as-is (not bilingual).

Replace `hotelDetailsSchema`:
```ts
const hotelDetailsSchema = z.object({
  name: z.string(),
  rating: z.number(),
  location: z.string(),
  nights: z.number(),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  roomType: bilingualTextSchema.optional(),
  description: bilingualTextSchema.optional(),
  image: z.string().optional(),
  badge: bilingualTextSchema.optional(),
  amenities: z.array(bilingualTextSchema).optional(),
});
```

Replace `optionalTourSchema`:
```ts
const optionalTourSchema = z.object({
  id: z.string(),
  title: bilingualTextSchema,
  tag: z.enum(["Mandatory", "Optional"]),
  desc: bilingualTextSchema,
  adult: z.number(),
  single: z.number(),
  child611: z.number(),
  child25: z.number(),
  infant: z.number(),
  images: z.array(z.string()),
});
```

Replace the final `packageInputSchema`/`packageUpdateSchema` block:
```ts
export const packageInputSchema = z.object({
  category: z.enum(["cruise", "fixed-departure", "holidays", "kerala", "medical"]),
  title: z.string().min(1),
  description: z.string(),
  price: z.number(),
  image: z.string(),
  duration: z.string(),
  location: z.string(),
  continent: z.string(),
  rating: z.number(),
  reviews: z.number(),
  featured: z.boolean(),
  includes: z.array(z.string()),
  exclusions: z.array(z.string()).optional(),
  groupSize: z.string().optional(),
  meals: z.string().optional(),
  accommodation: z.string().optional(),
  cancellationPolicy: z.array(z.string()).optional(),
  pricing: packagePriceSchema.optional(),
  offerPricing: packagePriceSchema.optional(),
  itineraryFileUrl: z.string().optional(),
  itinerary: z.array(itineraryDaySchema).optional(),
  departureDates: z.array(departureDateSchema).optional(),
  flights: z.array(flightDetailsSchema).optional(),
  hotels: z.array(hotelDetailsSchema).optional(),
  optionalTours: z.array(optionalTourSchema).optional(),
});

export const packageUpdateSchema = packageInputSchema.partial();
```

with:
```ts
export const packageAdminInputSchema = z.object({
  category: z.enum(["cruise", "fixed-departure", "holidays", "kerala", "medical"]),
  title: bilingualTextSchema,
  description: bilingualTextSchema,
  price: z.number(),
  image: z.string(),
  duration: bilingualTextSchema,
  location: bilingualTextSchema,
  continent: z.string(),
  rating: z.number(),
  reviews: z.number(),
  featured: z.boolean(),
  includes: z.array(bilingualTextSchema),
  exclusions: z.array(bilingualTextSchema).optional(),
  groupSize: bilingualTextSchema.optional(),
  meals: bilingualTextSchema.optional(),
  accommodation: bilingualTextSchema.optional(),
  cancellationPolicy: z.array(bilingualTextSchema).optional(),
  pricing: packagePriceSchema.optional(),
  offerPricing: packagePriceSchema.optional(),
  itineraryFileUrl: z.string().optional(),
  itinerary: z.array(itineraryDaySchema).optional(),
  departureDates: z.array(departureDateSchema).optional(),
  flights: z.array(flightDetailsSchema).optional(),
  hotels: z.array(hotelDetailsSchema).optional(),
  optionalTours: z.array(optionalTourSchema).optional(),
});

export const packageAdminUpdateSchema = packageAdminInputSchema.partial();
```

(`packagePriceSchema` at the top of the file is unchanged — pricing stays numeric-only, not bilingual.)

- [ ] **Step 2: Update `route.ts`'s POST handler**

In `src/app/api/packages/route.ts`, change the import and the schema reference:

Current (line 4): `import { packageInputSchema } from "@/lib/packages/schema";`
Replace with: `import { packageAdminInputSchema } from "@/lib/packages/schema";`

Current (inside `POST`): `const parsed = packageInputSchema.safeParse(body);`
Replace with: `const parsed = packageAdminInputSchema.safeParse(body);`

- [ ] **Step 3: Update `[id]/route.ts`'s PATCH handler**

In `src/app/api/packages/[id]/route.ts`, change the import and the schema reference:

Current (line 4): `import { packageUpdateSchema } from "@/lib/packages/schema";`
Replace with: `import { packageAdminUpdateSchema } from "@/lib/packages/schema";`

Current (inside `PATCH`): `const parsed = packageUpdateSchema.safeParse(body);`
Replace with: `const parsed = packageAdminUpdateSchema.safeParse(body);`

- [ ] **Step 4: Create the new admin-input endpoint**

```ts
// src/app/api/packages/[id]/admin/route.ts
import { NextResponse } from "next/server";
import { packagesRepository } from "@/lib/packages-repository";
import { requireAdminSession, UnauthorizedError } from "@/lib/admin-auth";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminSession();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw error;
  }

  const { id } = await params;
  const input = await packagesRepository.getAdminInputById(Number(id));

  if (!input) {
    return NextResponse.json({ error: "Package not found" }, { status: 404 });
  }

  return NextResponse.json(input);
}
```

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit` → expect no errors.
Run: `npm run build` → expect the route list to include `/api/packages/[id]/admin` alongside the existing routes.

- [ ] **Step 6: Commit**

```bash
git add src/lib/packages/schema.ts src/app/api/packages/
git commit -m "feat: bilingual zod schemas, new admin-input API endpoint"
```

---

### Task 6: `CategoryPackagesTable` — language toggle, bilingual form state, all affected tabs

**Files:**
- Modify: `src/components/admin/CategoryPackagesTable.tsx`

**Interfaces:**
- Consumes: `PackageAdminInput`, `PackageRowItineraryDay`, `PackageRowHotel`, `PackageRowOptionalTour`, `PackageRowDepartureDate`, `BilingualText` (from `@/lib/packages/types`); `GET /api/packages/[id]/admin` (Task 5); `POST`/`PATCH /api/packages` now expect `PackageAdminInput`/`Partial<PackageAdminInput>` bodies (Task 5).

This is one large, tightly-coupled task — the file's state, handlers, and JSX for every affected tab all reference each other, so there's no way to sub-divide it into independently-buildable increments without producing broken intermediate states. The steps below replace the file section by section, in the order those sections appear.

- [ ] **Step 1: Replace the imports and top-level helpers**

Current (lines 1–36):
```tsx
"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Package, PackagePrice, ItineraryDay, FlightDetails,
  HotelDetails, DepartureDate, OptionalTour,
} from "@/types/package";
import {
  Search, Plus, Edit, Trash2, Star, Loader2, Check, X,
  Image as ImageIcon, DollarSign, Clock, MapPin, FileText,
  Tags, Trash, Upload, Plane, Building, Calendar, Users, Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

interface Props { category: string; pageTitle: string; }

const emptyPrice: PackagePrice = { adult: 0, stag: 0, child0to1: 0, child2to5: 0, child6to12: 0 };
const newId = () => Math.random().toString(36).slice(2, 9);

function FieldLabel({ children, icon: Icon, color = "text-blue-400" }: { children: React.ReactNode; icon?: any; color?: string }) {
  return (
    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
      {Icon && <Icon className={`h-3.5 w-3.5 ${color}`} />}
      {children}
    </label>
  );
}
```

Replace with:
```tsx
"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Package, PackagePrice, FlightDetails,
} from "@/types/package";
import type {
  PackageAdminInput, BilingualText,
  PackageRowItineraryDay, PackageRowHotel, PackageRowOptionalTour, PackageRowDepartureDate,
} from "@/lib/packages/types";
import {
  Search, Plus, Edit, Trash2, Star, Loader2, Check, X,
  Image as ImageIcon, DollarSign, Clock, MapPin, FileText,
  Tags, Trash, Upload, Plane, Building, Calendar, Users, Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

interface Props { category: string; pageTitle: string; }

const emptyPrice: PackagePrice = { adult: 0, stag: 0, child0to1: 0, child2to5: 0, child6to12: 0 };
const newId = () => Math.random().toString(36).slice(2, 9);

function FieldLabel({ children, icon: Icon, color = "text-blue-400" }: { children: React.ReactNode; icon?: any; color?: string }) {
  return (
    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
      {Icon && <Icon className={`h-3.5 w-3.5 ${color}`} />}
      {children}
    </label>
  );
}

function zipBilingualList(enText: string, arText: string, separator = ","): BilingualText[] {
  const enItems = enText.split(separator).map((s) => s.trim()).filter(Boolean);
  const arItems = arText.split(separator).map((s) => s.trim()).filter(Boolean);
  return enItems.map((en, i) => ({ en, ar: arItems[i] ?? "" }));
}

function BilingualInput({
  locale, valueEn, valueAr, onChangeEn, onChangeAr, ...inputProps
}: {
  locale: "en" | "ar";
  valueEn: string;
  valueAr: string;
  onChangeEn: (value: string) => void;
  onChangeAr: (value: string) => void;
} & Omit<React.ComponentProps<typeof Input>, "value" | "onChange">) {
  const value = locale === "en" ? valueEn : valueAr;
  const onChange = locale === "en" ? onChangeEn : onChangeAr;
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      dir={locale === "ar" ? "rtl" : "ltr"}
      {...inputProps}
    />
  );
}

function BilingualTextarea({
  locale, valueEn, valueAr, onChangeEn, onChangeAr, ...textareaProps
}: {
  locale: "en" | "ar";
  valueEn: string;
  valueAr: string;
  onChangeEn: (value: string) => void;
  onChangeAr: (value: string) => void;
} & Omit<React.ComponentProps<typeof Textarea>, "value" | "onChange">) {
  const value = locale === "en" ? valueEn : valueAr;
  const onChange = locale === "en" ? onChangeEn : onChangeAr;
  return (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      dir={locale === "ar" ? "rtl" : "ltr"}
      {...textareaProps}
    />
  );
}
```

- [ ] **Step 2: Verify (partial — expect errors below this point)**

Run: `npx tsc --noEmit` → expect errors further down in the file (the component body still references `ItineraryDay`/`HotelDetails`/`OptionalTour`/`DepartureDate`, which are no longer imported). This is expected — Steps 3–8 fix the rest of the file. Confirm the errors are all in this one file.

- [ ] **Step 3: Replace the mutations and state declarations**

Current (lines 45–144, from the component signature through the last `useState`):
```tsx
export default function CategoryPackagesTable({ category, pageTitle }: Props) {
  const queryClient = useQueryClient();

  const { data: packages = [], isLoading: loading } = useQuery({
    queryKey: ["packages", category],
    queryFn: () => fetchPackages(category),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["packages"] });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<Package, "id">) => {
      const res = await fetch("/api/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create package");
      return res.json() as Promise<Package>;
    },
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Package> }) => {
      const res = await fetch(`/api/packages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update package");
      return res.json() as Promise<Package>;
    },
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/packages/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete package");
    },
    onSuccess: invalidate,
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/packages/${id}/feature`, { method: "PATCH" });
      if (!res.ok) throw new Error("Failed to toggle featured");
      return res.json() as Promise<Package>;
    },
    onSuccess: invalidate,
  });

  const submitting = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [deletingPackage, setDeletingPackage] = useState<Package | null>(null);
  const [activeTab, setActiveTab] = useState("basic");

  // ── Basic fields ──
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formDuration, setFormDuration] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formContinent, setFormContinent] = useState("Asia");
  const [formFeatured, setFormFeatured] = useState(false);
  const [formDescription, setFormDescription] = useState("");

  // ── Details fields ──
  const [formIncludes, setFormIncludes] = useState("");
  const [formExclusions, setFormExclusions] = useState("");
  const [formGroupSize, setFormGroupSize] = useState("");
  const [formMeals, setFormMeals] = useState("");
  const [formAccommodation, setFormAccommodation] = useState("");
  const [formCancellationPolicy, setFormCancellationPolicy] = useState("");

  // ── Pricing ──
  const [formPricing, setFormPricing] = useState<PackagePrice>(emptyPrice);
  const [formOfferPricing, setFormOfferPricing] = useState<PackagePrice>(emptyPrice);

  // ── Itinerary ──
  const [formItineraryFileUrl, setFormItineraryFileUrl] = useState("");
  const [formItinerary, setFormItinerary] = useState<ItineraryDay[]>([]);

  // ── Departure Dates ──
  const [formDepartures, setFormDepartures] = useState<DepartureDate[]>([]);

  // ── Flights ──
  const [formFlights, setFormFlights] = useState<FlightDetails[]>([]);

  // ── Hotels ──
  const [formHotels, setFormHotels] = useState<HotelDetails[]>([]);

  // ── Optional Tours ──
  const [formOptionalTours, setFormOptionalTours] = useState<OptionalTour[]>([]);
```

Replace with:
```tsx
export default function CategoryPackagesTable({ category, pageTitle }: Props) {
  const queryClient = useQueryClient();

  const { data: packages = [], isLoading: loading } = useQuery({
    queryKey: ["packages", category],
    queryFn: () => fetchPackages(category),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["packages"] });

  const createMutation = useMutation({
    mutationFn: async (data: PackageAdminInput) => {
      const res = await fetch("/api/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create package");
      return res.json() as Promise<Package>;
    },
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<PackageAdminInput> }) => {
      const res = await fetch(`/api/packages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update package");
      return res.json() as Promise<Package>;
    },
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/packages/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete package");
    },
    onSuccess: invalidate,
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/packages/${id}/feature`, { method: "PATCH" });
      if (!res.ok) throw new Error("Failed to toggle featured");
      return res.json() as Promise<Package>;
    },
    onSuccess: invalidate,
  });

  const submitting = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [deletingPackage, setDeletingPackage] = useState<Package | null>(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [editingLocale, setEditingLocale] = useState<"en" | "ar">("en");

  const editingId = editingPackage?.id;
  const { data: editingAdminInput, isFetching: loadingAdminInput } = useQuery({
    queryKey: ["packages", "admin-input", editingId],
    queryFn: async () => {
      const res = await fetch(`/api/packages/${editingId}/admin`);
      if (!res.ok) throw new Error("Failed to load package for editing");
      return res.json() as Promise<PackageAdminInput>;
    },
    enabled: isFormOpen && editingId !== undefined,
  });

  // ── Basic fields ──
  const [formTitleEn, setFormTitleEn] = useState("");
  const [formTitleAr, setFormTitleAr] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formDurationEn, setFormDurationEn] = useState("");
  const [formDurationAr, setFormDurationAr] = useState("");
  const [formLocationEn, setFormLocationEn] = useState("");
  const [formLocationAr, setFormLocationAr] = useState("");
  const [formContinent, setFormContinent] = useState("Asia");
  const [formFeatured, setFormFeatured] = useState(false);
  const [formDescriptionEn, setFormDescriptionEn] = useState("");
  const [formDescriptionAr, setFormDescriptionAr] = useState("");

  // ── Details fields ──
  const [formIncludesEn, setFormIncludesEn] = useState("");
  const [formIncludesAr, setFormIncludesAr] = useState("");
  const [formExclusionsEn, setFormExclusionsEn] = useState("");
  const [formExclusionsAr, setFormExclusionsAr] = useState("");
  const [formGroupSizeEn, setFormGroupSizeEn] = useState("");
  const [formGroupSizeAr, setFormGroupSizeAr] = useState("");
  const [formMealsEn, setFormMealsEn] = useState("");
  const [formMealsAr, setFormMealsAr] = useState("");
  const [formAccommodationEn, setFormAccommodationEn] = useState("");
  const [formAccommodationAr, setFormAccommodationAr] = useState("");
  const [formCancellationPolicyEn, setFormCancellationPolicyEn] = useState("");
  const [formCancellationPolicyAr, setFormCancellationPolicyAr] = useState("");

  // ── Pricing ──
  const [formPricing, setFormPricing] = useState<PackagePrice>(emptyPrice);
  const [formOfferPricing, setFormOfferPricing] = useState<PackagePrice>(emptyPrice);

  // ── Itinerary ──
  const [formItineraryFileUrl, setFormItineraryFileUrl] = useState("");
  const [formItinerary, setFormItinerary] = useState<PackageRowItineraryDay[]>([]);

  // ── Departure Dates ──
  const [formDepartures, setFormDepartures] = useState<PackageRowDepartureDate[]>([]);

  // ── Flights ──
  const [formFlights, setFormFlights] = useState<FlightDetails[]>([]);

  // ── Hotels ──
  const [formHotels, setFormHotels] = useState<PackageRowHotel[]>([]);

  // ── Optional Tours ──
  const [formOptionalTours, setFormOptionalTours] = useState<PackageRowOptionalTour[]>([]);
```

- [ ] **Step 4: Verify (partial)**

Run: `npx tsc --noEmit` → expect errors further down (the file's `resetForm`, `handleSave`, and array helper functions still reference the old shapes/state names). Expected — the next steps fix these. Confirm errors are all in this one file.

- [ ] **Step 5: Replace `resetForm` through `handleDeleteConfirm`**

Current (lines 146–213):
```tsx
  const resetForm = (pkg?: Package) => {
    setActiveTab("basic");
    setFormTitle(pkg?.title ?? "");
    setFormCategory(pkg?.category ?? (category === "all" ? "holidays" : category));
    setFormPrice(pkg?.price?.toString() ?? "");
    setFormImage(pkg?.image ?? "");
    setFormDuration(pkg?.duration ?? "");
    setFormLocation(pkg?.location ?? "");
    setFormContinent(pkg?.continent ?? "Asia");
    setFormFeatured(pkg?.featured ?? false);
    setFormDescription(pkg?.description ?? "");
    setFormIncludes(pkg?.includes?.join(", ") ?? "");
    setFormExclusions(pkg?.exclusions?.join(", ") ?? "");
    setFormGroupSize(pkg?.groupSize ?? "");
    setFormMeals(pkg?.meals ?? "");
    setFormAccommodation(pkg?.accommodation ?? "");
    setFormCancellationPolicy(pkg?.cancellationPolicy?.join("\n") ?? "");
    setFormPricing(pkg?.pricing ?? emptyPrice);
    setFormOfferPricing(pkg?.offerPricing ?? emptyPrice);
    setFormItineraryFileUrl(pkg?.itineraryFileUrl ?? "");
    setFormItinerary(pkg?.itinerary ?? []);
    setFormDepartures(pkg?.departureDates ?? []);
    setFormFlights(pkg?.flights ?? []);
    setFormHotels(pkg?.hotels ?? []);
    setFormOptionalTours(pkg?.optionalTours ?? []);
  };

  const handleOpenCreate = () => { setEditingPackage(null); resetForm(); setIsFormOpen(true); };
  const handleOpenEdit = (pkg: Package) => { setEditingPackage(pkg); resetForm(pkg); setIsFormOpen(true); };
  const handleOpenDelete = (pkg: Package) => { setDeletingPackage(pkg); setIsDeleteOpen(true); };

  const handleToggleFeatured = (id: number) => {
    toggleFeaturedMutation.mutate(id);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formPrice || !formLocation || !formDuration) { setActiveTab("basic"); return; }
    const data: Omit<Package, "id"> = {
      title: formTitle, category: formCategory,
      description: formDescription || "Discover beautiful attractions with Maram Holidays.",
      price: parseFloat(formPrice),
      image: formImage || "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1200",
      duration: formDuration, location: formLocation, continent: formContinent,
      featured: formFeatured, rating: editingPackage?.rating ?? 5.0, reviews: editingPackage?.reviews ?? 0,
      includes: formIncludes.split(",").map(s => s.trim()).filter(Boolean),
      exclusions: formExclusions.split(",").map(s => s.trim()).filter(Boolean),
      groupSize: formGroupSize, meals: formMeals, accommodation: formAccommodation,
      cancellationPolicy: formCancellationPolicy.split("\n").map(s => s.trim()).filter(Boolean),
      pricing: formPricing, offerPricing: formOfferPricing,
      itineraryFileUrl: formItineraryFileUrl, itinerary: formItinerary,
      departureDates: formDepartures, flights: formFlights, hotels: formHotels,
      optionalTours: formOptionalTours,
    };
    try {
      if (editingPackage) await updateMutation.mutateAsync({ id: editingPackage.id, data });
      else await createMutation.mutateAsync(data);
      setIsFormOpen(false);
    } catch (e) { console.error(e); }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPackage) return;
    try {
      await deleteMutation.mutateAsync(deletingPackage.id);
      setIsDeleteOpen(false);
    } catch (e) { console.error(e); }
  };
```

Replace with:
```tsx
  const resetForm = (input?: PackageAdminInput) => {
    setActiveTab("basic");
    setEditingLocale("en");
    setFormTitleEn(input?.title.en ?? "");
    setFormTitleAr(input?.title.ar ?? "");
    setFormCategory(input?.category ?? (category === "all" ? "holidays" : category));
    setFormPrice(input?.price?.toString() ?? "");
    setFormImage(input?.image ?? "");
    setFormDurationEn(input?.duration.en ?? "");
    setFormDurationAr(input?.duration.ar ?? "");
    setFormLocationEn(input?.location.en ?? "");
    setFormLocationAr(input?.location.ar ?? "");
    setFormContinent(input?.continent ?? "Asia");
    setFormFeatured(input?.featured ?? false);
    setFormDescriptionEn(input?.description.en ?? "");
    setFormDescriptionAr(input?.description.ar ?? "");
    setFormIncludesEn(input?.includes?.map((i) => i.en).join(", ") ?? "");
    setFormIncludesAr(input?.includes?.map((i) => i.ar).join(", ") ?? "");
    setFormExclusionsEn(input?.exclusions?.map((i) => i.en).join(", ") ?? "");
    setFormExclusionsAr(input?.exclusions?.map((i) => i.ar).join(", ") ?? "");
    setFormGroupSizeEn(input?.groupSize?.en ?? "");
    setFormGroupSizeAr(input?.groupSize?.ar ?? "");
    setFormMealsEn(input?.meals?.en ?? "");
    setFormMealsAr(input?.meals?.ar ?? "");
    setFormAccommodationEn(input?.accommodation?.en ?? "");
    setFormAccommodationAr(input?.accommodation?.ar ?? "");
    setFormCancellationPolicyEn(input?.cancellationPolicy?.map((i) => i.en).join("\n") ?? "");
    setFormCancellationPolicyAr(input?.cancellationPolicy?.map((i) => i.ar).join("\n") ?? "");
    setFormPricing(input?.pricing ?? emptyPrice);
    setFormOfferPricing(input?.offerPricing ?? emptyPrice);
    setFormItineraryFileUrl(input?.itineraryFileUrl ?? "");
    setFormItinerary(input?.itinerary ?? []);
    setFormDepartures(input?.departureDates ?? []);
    setFormFlights(input?.flights ?? []);
    setFormHotels(input?.hotels ?? []);
    setFormOptionalTours(input?.optionalTours ?? []);
  };

  useEffect(() => {
    if (isFormOpen && editingAdminInput) {
      resetForm(editingAdminInput);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFormOpen, editingAdminInput]);

  const handleOpenCreate = () => { setEditingPackage(null); resetForm(); setIsFormOpen(true); };
  const handleOpenEdit = (pkg: Package) => { setEditingPackage(pkg); setIsFormOpen(true); };
  const handleOpenDelete = (pkg: Package) => { setDeletingPackage(pkg); setIsDeleteOpen(true); };

  const handleToggleFeatured = (id: number) => {
    toggleFeaturedMutation.mutate(id);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitleEn || !formPrice || !formLocationEn || !formDurationEn) {
      setActiveTab("basic");
      setEditingLocale("en");
      return;
    }
    const data: PackageAdminInput = {
      category: formCategory,
      title: { en: formTitleEn, ar: formTitleAr },
      description: {
        en: formDescriptionEn || "Discover beautiful attractions with Maram Holidays.",
        ar: formDescriptionAr,
      },
      price: parseFloat(formPrice),
      image: formImage || "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1200",
      duration: { en: formDurationEn, ar: formDurationAr },
      location: { en: formLocationEn, ar: formLocationAr },
      continent: formContinent,
      featured: formFeatured,
      rating: editingPackage?.rating ?? 5.0,
      reviews: editingPackage?.reviews ?? 0,
      includes: zipBilingualList(formIncludesEn, formIncludesAr),
      exclusions: zipBilingualList(formExclusionsEn, formExclusionsAr),
      groupSize: formGroupSizeEn ? { en: formGroupSizeEn, ar: formGroupSizeAr } : undefined,
      meals: formMealsEn ? { en: formMealsEn, ar: formMealsAr } : undefined,
      accommodation: formAccommodationEn ? { en: formAccommodationEn, ar: formAccommodationAr } : undefined,
      cancellationPolicy: zipBilingualList(formCancellationPolicyEn, formCancellationPolicyAr, "\n"),
      pricing: formPricing,
      offerPricing: formOfferPricing,
      itineraryFileUrl: formItineraryFileUrl,
      itinerary: formItinerary,
      departureDates: formDepartures,
      flights: formFlights,
      hotels: formHotels,
      optionalTours: formOptionalTours,
    };
    try {
      if (editingPackage) await updateMutation.mutateAsync({ id: editingPackage.id, data });
      else await createMutation.mutateAsync(data);
      setIsFormOpen(false);
    } catch (e) { console.error(e); }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPackage) return;
    try {
      await deleteMutation.mutateAsync(deletingPackage.id);
      setIsDeleteOpen(false);
    } catch (e) { console.error(e); }
  };
```

Note the `eslint-disable-next-line` comment on the `useEffect`'s dependency array: `resetForm` is intentionally omitted from the deps list (it's redefined every render but doesn't need to trigger the effect) — this matches the pattern of accepting a lint exception only where the alternative (wrapping `resetForm` in `useCallback`) would be premature complexity for a form that only calls it from two places.

- [ ] **Step 6: Verify (partial)**

Run: `npx tsc --noEmit` → expect errors further down (the itinerary/hotel/tour/departure helper functions and the JSX still reference old field shapes). Expected — the next steps fix these. Confirm errors are all in this one file.

- [ ] **Step 7: Replace the itinerary/departure/flight/hotel/tour helper functions**

Current (lines 215–246):
```tsx
  // ── Itinerary helpers ──
  const addDay = () => setFormItinerary([...formItinerary, { day: formItinerary.length + 1, title: "", desc: "", highlights: [], images: [] }]);
  const removeDay = (i: number) => setFormItinerary(formItinerary.filter((_, idx) => idx !== i).map((d, idx) => ({ ...d, day: idx + 1 })));
  const updateDay = (i: number, field: keyof ItineraryDay, value: any) => {
    const updated = [...formItinerary];
    if (field === "highlights" || field === "images") {
      updated[i][field] = typeof value === "string" ? value.split(",").map(v => v.trim()).filter(Boolean) : value;
    } else { (updated[i] as any)[field] = value; }
    setFormItinerary(updated);
  };

  // ── Departure helpers ──
  const addDeparture = () => setFormDepartures([...formDepartures, { id: newId(), date: "", adult: 0, single: 0, child611: 0, child25: 0, infant: 0, seats: "Available", urgency: "green" }]);
  const removeDeparture = (id: string) => setFormDepartures(formDepartures.filter(d => d.id !== id));
  const updateDeparture = (id: string, field: keyof DepartureDate, value: any) => setFormDepartures(formDepartures.map(d => d.id === id ? { ...d, [field]: value } : d));

  // ── Flight helpers ──
  const addFlight = () => setFormFlights([...formFlights, { type: "Outbound", airline: "", flightNo: "", from: "", fromCity: "", to: "", toCity: "", departure: "", arrival: "", duration: "", class: "Economy", date: "" }]);
  const removeFlight = (i: number) => setFormFlights(formFlights.filter((_, idx) => idx !== i));
  const updateFlight = (i: number, field: keyof FlightDetails, value: string) => { const f = [...formFlights]; f[i] = { ...f[i], [field]: value }; setFormFlights(f); };

  // ── Hotel helpers ──
  const addHotel = () => setFormHotels([...formHotels, { name: "", rating: 4, location: "", nights: 1, checkIn: "", checkOut: "", roomType: "", description: "", image: "", badge: "", amenities: [] }]);
  const removeHotel = (i: number) => setFormHotels(formHotels.filter((_, idx) => idx !== i));
  const updateHotel = (i: number, field: keyof HotelDetails, value: any) => { const h = [...formHotels]; h[i] = { ...h[i], [field]: value }; setFormHotels(h); };

  // ── Optional Tour helpers ──
  const addTour = () => setFormOptionalTours([...formOptionalTours, { id: newId(), title: "", tag: "Optional", desc: "", adult: 0, single: 0, child611: 0, child25: 0, infant: 0, images: [] }]);
  const removeTour = (id: string) => setFormOptionalTours(formOptionalTours.filter(t => t.id !== id));
  const updateTour = (id: string, field: keyof OptionalTour, value: any) => {
    setFormOptionalTours(formOptionalTours.map(t => t.id === id ? { ...t, [field]: field === "images" ? (typeof value === "string" ? value.split(",").map((s: string) => s.trim()).filter(Boolean) : value) : value } : t));
  };
```

Replace with:
```tsx
  // ── Itinerary helpers ──
  const addDay = () =>
    setFormItinerary([
      ...formItinerary,
      { day: formItinerary.length + 1, title: { en: "", ar: "" }, desc: { en: "", ar: "" }, highlights: [], images: [] },
    ]);
  const removeDay = (i: number) =>
    setFormItinerary(formItinerary.filter((_, idx) => idx !== i).map((d, idx) => ({ ...d, day: idx + 1 })));
  const updateDayNumber = (i: number, value: number) => {
    const updated = [...formItinerary];
    updated[i] = { ...updated[i], day: value };
    setFormItinerary(updated);
  };
  const updateDayField = (i: number, field: "title" | "desc", locale: "en" | "ar", value: string) => {
    const updated = [...formItinerary];
    updated[i] = { ...updated[i], [field]: { ...updated[i][field], [locale]: value } };
    setFormItinerary(updated);
  };
  const updateDayHighlights = (i: number, locale: "en" | "ar", value: string) => {
    const updated = [...formItinerary];
    const items = value.split(",").map((v) => v.trim()).filter(Boolean);
    const existingHighlights = updated[i].highlights;
    updated[i] = {
      ...updated[i],
      highlights: items.map((text, j) => ({
        en: locale === "en" ? text : existingHighlights[j]?.en ?? "",
        ar: locale === "ar" ? text : existingHighlights[j]?.ar ?? "",
      })),
    };
    setFormItinerary(updated);
  };
  const updateDayImages = (i: number, value: string) => {
    const updated = [...formItinerary];
    updated[i] = { ...updated[i], images: value.split(",").map((v) => v.trim()).filter(Boolean) };
    setFormItinerary(updated);
  };

  // ── Departure helpers ──
  const addDeparture = () =>
    setFormDepartures([
      ...formDepartures,
      { id: newId(), date: "", adult: 0, single: 0, child611: 0, child25: 0, infant: 0, seats: { en: "Available", ar: "" }, urgency: "green" },
    ]);
  const removeDeparture = (id: string) => setFormDepartures(formDepartures.filter((d) => d.id !== id));
  const updateDepartureDate = (id: string, value: string) =>
    setFormDepartures(formDepartures.map((d) => (d.id === id ? { ...d, date: value } : d)));
  const updateDepartureUrgency = (id: string, value: "red" | "amber" | "green") =>
    setFormDepartures(formDepartures.map((d) => (d.id === id ? { ...d, urgency: value } : d)));
  const updateDepartureSeats = (id: string, locale: "en" | "ar", value: string) =>
    setFormDepartures(formDepartures.map((d) => (d.id === id ? { ...d, seats: { ...d.seats, [locale]: value } } : d)));
  const updateDeparturePrice = (
    id: string,
    field: "adult" | "single" | "child611" | "child25" | "infant",
    value: number
  ) => setFormDepartures(formDepartures.map((d) => (d.id === id ? { ...d, [field]: value } : d)));

  // ── Flight helpers ──
  const addFlight = () => setFormFlights([...formFlights, { type: "Outbound", airline: "", flightNo: "", from: "", fromCity: "", to: "", toCity: "", departure: "", arrival: "", duration: "", class: "Economy", date: "" }]);
  const removeFlight = (i: number) => setFormFlights(formFlights.filter((_, idx) => idx !== i));
  const updateFlight = (i: number, field: keyof FlightDetails, value: string) => { const f = [...formFlights]; f[i] = { ...f[i], [field]: value }; setFormFlights(f); };

  // ── Hotel helpers ──
  const addHotel = () =>
    setFormHotels([
      ...formHotels,
      { name: "", rating: 4, location: "", nights: 1, checkIn: "", checkOut: "", roomType: { en: "", ar: "" }, description: { en: "", ar: "" }, image: "", badge: { en: "", ar: "" }, amenities: [] },
    ]);
  const removeHotel = (i: number) => setFormHotels(formHotels.filter((_, idx) => idx !== i));
  const updateHotelPlain = (i: number, field: "name" | "location" | "checkIn" | "checkOut" | "image", value: string) => {
    const updated = [...formHotels];
    updated[i] = { ...updated[i], [field]: value };
    setFormHotels(updated);
  };
  const updateHotelNumber = (i: number, field: "rating" | "nights", value: number) => {
    const updated = [...formHotels];
    updated[i] = { ...updated[i], [field]: value };
    setFormHotels(updated);
  };
  const updateHotelBilingual = (
    i: number,
    field: "roomType" | "description" | "badge",
    locale: "en" | "ar",
    value: string
  ) => {
    const updated = [...formHotels];
    const current = updated[i][field] ?? { en: "", ar: "" };
    updated[i] = { ...updated[i], [field]: { ...current, [locale]: value } };
    setFormHotels(updated);
  };
  const updateHotelAmenities = (i: number, locale: "en" | "ar", value: string) => {
    const updated = [...formHotels];
    const items = value.split(",").map((v) => v.trim()).filter(Boolean);
    const existingAmenities = updated[i].amenities ?? [];
    updated[i] = {
      ...updated[i],
      amenities: items.map((text, j) => ({
        en: locale === "en" ? text : existingAmenities[j]?.en ?? "",
        ar: locale === "ar" ? text : existingAmenities[j]?.ar ?? "",
      })),
    };
    setFormHotels(updated);
  };

  // ── Optional Tour helpers ──
  const addTour = () =>
    setFormOptionalTours([
      ...formOptionalTours,
      { id: newId(), title: { en: "", ar: "" }, tag: "Optional", desc: { en: "", ar: "" }, adult: 0, single: 0, child611: 0, child25: 0, infant: 0, images: [] },
    ]);
  const removeTour = (id: string) => setFormOptionalTours(formOptionalTours.filter((t) => t.id !== id));
  const updateTourTag = (id: string, value: "Mandatory" | "Optional") =>
    setFormOptionalTours(formOptionalTours.map((t) => (t.id === id ? { ...t, tag: value } : t)));
  const updateTourBilingual = (id: string, field: "title" | "desc", locale: "en" | "ar", value: string) => {
    setFormOptionalTours(
      formOptionalTours.map((t) => (t.id === id ? { ...t, [field]: { ...t[field], [locale]: value } } : t))
    );
  };
  const updateTourPrice = (
    id: string,
    field: "adult" | "single" | "child611" | "child25" | "infant",
    value: number
  ) => setFormOptionalTours(formOptionalTours.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
  const updateTourImages = (id: string, value: string) => {
    setFormOptionalTours(
      formOptionalTours.map((t) =>
        t.id === id ? { ...t, images: value.split(",").map((s) => s.trim()).filter(Boolean) } : t
      )
    );
  };
```

- [ ] **Step 8: Verify (partial)**

Run: `npx tsc --noEmit` → expect errors only in the JSX below (`filteredPackages`/table rendering references `pkg.title` etc. from the unchanged `Package`-typed `packages` list — those should NOT error; only the create/edit dialog's JSX referencing the old `formTitle`/`formDuration`/etc. single-value state and the old `updateDay`/`updateHotel`/`updateTour`/`updateDeparture` function names should error). Confirm errors are confined to the dialog's JSX (from `{/* ── Create / Edit Dialog ── */}` onward). The next step fixes these.

- [ ] **Step 9: Replace the `DialogHeader` and add the language toggle**

The toolbar and table JSX above the dialog (everything through the closing `</div>` before `{/* ── Create / Edit Dialog ── */}`) is unchanged — do not touch it.

Current:
```tsx
          <DialogHeader className="shrink-0 mb-3">
            <DialogTitle className="text-xl font-extrabold flex items-center gap-2">
              <span className="h-9 w-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                {editingPackage ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </span>
              {editingPackage ? "Edit Package" : "Create Package"}
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">Complete all sections. The Detail page reflects exactly what you configure here.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="flex-1 overflow-hidden flex flex-col min-h-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
              <TabsList className="grid bg-slate-950 p-1 rounded-xl shrink-0 overflow-x-auto" style={{ gridTemplateColumns: `repeat(${isFixed ? 7 : 6}, 1fr)` }}>
                {["basic","details","pricing","itinerary","hotels","tours",...(isFixed ? ["departures","flights"] : [])].slice(0, isFixed ? 7 : 6).map(t => (
                  <TabsTrigger key={t} value={t} className={tabCls}>{t === "basic" ? "Basic" : t === "details" ? "Details" : t === "pricing" ? "Pricing" : t === "itinerary" ? "Itinerary" : t === "hotels" ? "Hotels" : t === "tours" ? "Opt. Tours" : t === "departures" ? "Departures" : "Flights"}</TabsTrigger>
                ))}
              </TabsList>


              <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-1">
```

Replace with:
```tsx
          <DialogHeader className="shrink-0 mb-3">
            <DialogTitle className="text-xl font-extrabold flex items-center gap-2">
              <span className="h-9 w-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                {editingPackage ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </span>
              {editingPackage ? "Edit Package" : "Create Package"}
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">Complete all sections. The Detail page reflects exactly what you configure here.</DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-center gap-1 p-1 bg-slate-950 rounded-full w-fit mx-auto mb-3 shrink-0 border border-slate-800">
            <button
              type="button"
              onClick={() => setEditingLocale("en")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${editingLocale === "en" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setEditingLocale("ar")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${editingLocale === "ar" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              العربية
            </button>
          </div>

          {loadingAdminInput ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : (
          <form onSubmit={handleSave} className="flex-1 overflow-hidden flex flex-col min-h-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
              <TabsList className="grid bg-slate-950 p-1 rounded-xl shrink-0 overflow-x-auto" style={{ gridTemplateColumns: `repeat(${isFixed ? 7 : 6}, 1fr)` }}>
                {["basic","details","pricing","itinerary","hotels","tours",...(isFixed ? ["departures","flights"] : [])].slice(0, isFixed ? 7 : 6).map(t => (
                  <TabsTrigger key={t} value={t} className={tabCls}>{t === "basic" ? "Basic" : t === "details" ? "Details" : t === "pricing" ? "Pricing" : t === "itinerary" ? "Itinerary" : t === "hotels" ? "Hotels" : t === "tours" ? "Opt. Tours" : t === "departures" ? "Departures" : "Flights"}</TabsTrigger>
                ))}
              </TabsList>


              <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-1">
```

Note the unclosed `{loadingAdminInput ? (...) : ( <form>` conditional opened here — Step 18 closes it around the existing `</form>` closing tag, right before the `</Dialog>`.

- [ ] **Step 10: Replace the Basic tab**

Current:
```tsx
                {/* ── BASIC TAB ── */}
                <TabsContent value="basic" className="space-y-4 m-0">
                  <div className={sectionCls}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><FieldLabel icon={FileText} color="text-blue-400">Package Title *</FieldLabel><Input required placeholder="e.g. Maldives Paradise 4D/3N" value={formTitle} onChange={e => setFormTitle(e.target.value)} className={inputCls} /></div>
                      <div><FieldLabel icon={Tags} color="text-violet-400">Category *</FieldLabel>
                        <select disabled={category !== "all"} value={formCategory} onChange={e => setFormCategory(e.target.value)} className="w-full h-10 border border-slate-800 bg-slate-950 text-white rounded-xl px-3 text-sm outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-60">
                          <option value="holidays">Holidays</option><option value="cruise">Cruise</option><option value="medical">Medical Tourism</option><option value="kerala">Kerala Tourism</option><option value="fixed-departure">Fixed Departure</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div><FieldLabel icon={DollarSign} color="text-emerald-400">Base Price (QAR) *</FieldLabel><Input required type="number" min="0" placeholder="3499" value={formPrice} onChange={e => setFormPrice(e.target.value)} className={inputCls} /></div>
                      <div><FieldLabel icon={Clock} color="text-amber-400">Duration *</FieldLabel><Input required placeholder="5 Days / 4 Nights" value={formDuration} onChange={e => setFormDuration(e.target.value)} className={inputCls} /></div>
                      <div><FieldLabel icon={MapPin} color="text-blue-400">Location *</FieldLabel><Input required placeholder="Munnar, Kerala" value={formLocation} onChange={e => setFormLocation(e.target.value)} className={inputCls} /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div><FieldLabel icon={MapPin} color="text-indigo-400">Continent</FieldLabel>
                        <select value={formContinent} onChange={e => setFormContinent(e.target.value)} className="w-full h-10 border border-slate-800 bg-slate-950 text-white rounded-xl px-3 text-sm outline-none focus:ring-1 focus:ring-blue-500">
                          {["Asia","Europe","Africa","North America","South America","Oceania"].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="md:col-span-3"><FieldLabel icon={ImageIcon} color="text-blue-400">Hero Image URL</FieldLabel><Input type="url" placeholder="https://images.unsplash.com/…" value={formImage} onChange={e => setFormImage(e.target.value)} className={inputCls} /></div>
                    </div>
                    {formImage && <div className="relative h-32 w-full rounded-xl overflow-hidden border border-slate-800"><img src={formImage} alt="preview" className="object-cover w-full h-full" /></div>}
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-800 bg-slate-950/30">
                      <input type="checkbox" id="featured" checked={formFeatured} onChange={e => setFormFeatured(e.target.checked)} className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-blue-600 cursor-pointer" />
                      <label htmlFor="featured" className="text-xs font-semibold text-slate-300 cursor-pointer">Mark as Featured — highlights this package in the home carousel</label>
                    </div>
                  </div>
                </TabsContent>
```

Replace with:
```tsx
                {/* ── BASIC TAB ── */}
                <TabsContent value="basic" className="space-y-4 m-0">
                  <div className={sectionCls}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><FieldLabel icon={FileText} color="text-blue-400">Package Title *</FieldLabel><BilingualInput locale={editingLocale} required placeholder={editingLocale === "en" ? "e.g. Maldives Paradise 4D/3N" : "مثال: جزر المالديف 4 أيام/3 ليالٍ"} valueEn={formTitleEn} valueAr={formTitleAr} onChangeEn={setFormTitleEn} onChangeAr={setFormTitleAr} className={inputCls} /></div>
                      <div><FieldLabel icon={Tags} color="text-violet-400">Category *</FieldLabel>
                        <select disabled={category !== "all"} value={formCategory} onChange={e => setFormCategory(e.target.value)} className="w-full h-10 border border-slate-800 bg-slate-950 text-white rounded-xl px-3 text-sm outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-60">
                          <option value="holidays">Holidays</option><option value="cruise">Cruise</option><option value="medical">Medical Tourism</option><option value="kerala">Kerala Tourism</option><option value="fixed-departure">Fixed Departure</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div><FieldLabel icon={DollarSign} color="text-emerald-400">Base Price (QAR) *</FieldLabel><Input required type="number" min="0" placeholder="3499" value={formPrice} onChange={e => setFormPrice(e.target.value)} className={inputCls} /></div>
                      <div><FieldLabel icon={Clock} color="text-amber-400">Duration *</FieldLabel><BilingualInput locale={editingLocale} required placeholder={editingLocale === "en" ? "5 Days / 4 Nights" : "5 أيام / 4 ليالٍ"} valueEn={formDurationEn} valueAr={formDurationAr} onChangeEn={setFormDurationEn} onChangeAr={setFormDurationAr} className={inputCls} /></div>
                      <div><FieldLabel icon={MapPin} color="text-blue-400">Location *</FieldLabel><BilingualInput locale={editingLocale} required placeholder={editingLocale === "en" ? "Munnar, Kerala" : "مونار، كيرالا"} valueEn={formLocationEn} valueAr={formLocationAr} onChangeEn={setFormLocationEn} onChangeAr={setFormLocationAr} className={inputCls} /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div><FieldLabel icon={MapPin} color="text-indigo-400">Continent</FieldLabel>
                        <select value={formContinent} onChange={e => setFormContinent(e.target.value)} className="w-full h-10 border border-slate-800 bg-slate-950 text-white rounded-xl px-3 text-sm outline-none focus:ring-1 focus:ring-blue-500">
                          {["Asia","Europe","Africa","North America","South America","Oceania"].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="md:col-span-3"><FieldLabel icon={ImageIcon} color="text-blue-400">Hero Image URL</FieldLabel><Input type="url" placeholder="https://images.unsplash.com/…" value={formImage} onChange={e => setFormImage(e.target.value)} className={inputCls} /></div>
                    </div>
                    {formImage && <div className="relative h-32 w-full rounded-xl overflow-hidden border border-slate-800"><img src={formImage} alt="preview" className="object-cover w-full h-full" /></div>}
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-800 bg-slate-950/30">
                      <input type="checkbox" id="featured" checked={formFeatured} onChange={e => setFormFeatured(e.target.checked)} className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-blue-600 cursor-pointer" />
                      <label htmlFor="featured" className="text-xs font-semibold text-slate-300 cursor-pointer">Mark as Featured — highlights this package in the home carousel</label>
                    </div>
                  </div>
                </TabsContent>
```

- [ ] **Step 11: Replace the Details tab**

Current:
```tsx
                {/* ── DETAILS TAB ── */}
                <TabsContent value="details" className="space-y-4 m-0">
                  <div className={sectionCls}>
                    <div><FieldLabel icon={FileText} color="text-violet-400">Description</FieldLabel><Textarea placeholder="Write a captivating summary…" value={formDescription} onChange={e => setFormDescription(e.target.value)} className="min-h-[72px] border-slate-800 bg-slate-950/40 text-white rounded-xl text-sm" /></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><FieldLabel icon={Check} color="text-emerald-400">Inclusions (comma-separated)</FieldLabel><Textarea placeholder="Flights, Hotel, Breakfast, Guided Tours" value={formIncludes} onChange={e => setFormIncludes(e.target.value)} className="h-20 border-slate-800 bg-slate-950/40 text-white rounded-xl text-sm" /></div>
                      <div><FieldLabel icon={X} color="text-red-400">Exclusions (comma-separated)</FieldLabel><Textarea placeholder="Visa fees, Travel insurance, Tips" value={formExclusions} onChange={e => setFormExclusions(e.target.value)} className="h-20 border-slate-800 bg-slate-950/40 text-white rounded-xl text-sm" /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div><FieldLabel icon={Users}>Group Size</FieldLabel><Input placeholder="Max 15" value={formGroupSize} onChange={e => setFormGroupSize(e.target.value)} className={inputCls} /></div>
                      <div><FieldLabel>Meals</FieldLabel><Input placeholder="Breakfast & Dinner" value={formMeals} onChange={e => setFormMeals(e.target.value)} className={inputCls} /></div>
                      <div><FieldLabel>Accommodation</FieldLabel><Input placeholder="4-Star Hotel" value={formAccommodation} onChange={e => setFormAccommodation(e.target.value)} className={inputCls} /></div>
                    </div>
                    <div><FieldLabel>Cancellation Policy (one rule per line)</FieldLabel><Textarea placeholder="Free cancellation up to 30 days before travel…" value={formCancellationPolicy} onChange={e => setFormCancellationPolicy(e.target.value)} className="h-20 border-slate-800 bg-slate-950/40 text-white rounded-xl text-sm" /></div>
                  </div>
                </TabsContent>
```

Replace with:
```tsx
                {/* ── DETAILS TAB ── */}
                <TabsContent value="details" className="space-y-4 m-0">
                  <div className={sectionCls}>
                    <div><FieldLabel icon={FileText} color="text-violet-400">Description</FieldLabel><BilingualTextarea locale={editingLocale} placeholder={editingLocale === "en" ? "Write a captivating summary…" : "اكتب ملخصًا جذابًا…"} valueEn={formDescriptionEn} valueAr={formDescriptionAr} onChangeEn={setFormDescriptionEn} onChangeAr={setFormDescriptionAr} className="min-h-[72px] border-slate-800 bg-slate-950/40 text-white rounded-xl text-sm" /></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><FieldLabel icon={Check} color="text-emerald-400">Inclusions (comma-separated)</FieldLabel><BilingualTextarea locale={editingLocale} placeholder={editingLocale === "en" ? "Flights, Hotel, Breakfast, Guided Tours" : "رحلات جوية، فندق، إفطار، جولات مرشدة"} valueEn={formIncludesEn} valueAr={formIncludesAr} onChangeEn={setFormIncludesEn} onChangeAr={setFormIncludesAr} className="h-20 border-slate-800 bg-slate-950/40 text-white rounded-xl text-sm" /></div>
                      <div><FieldLabel icon={X} color="text-red-400">Exclusions (comma-separated)</FieldLabel><BilingualTextarea locale={editingLocale} placeholder={editingLocale === "en" ? "Visa fees, Travel insurance, Tips" : "رسوم التأشيرة، تأمين السفر، الإكراميات"} valueEn={formExclusionsEn} valueAr={formExclusionsAr} onChangeEn={setFormExclusionsEn} onChangeAr={setFormExclusionsAr} className="h-20 border-slate-800 bg-slate-950/40 text-white rounded-xl text-sm" /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div><FieldLabel icon={Users}>Group Size</FieldLabel><BilingualInput locale={editingLocale} placeholder={editingLocale === "en" ? "Max 15" : "بحد أقصى 15"} valueEn={formGroupSizeEn} valueAr={formGroupSizeAr} onChangeEn={setFormGroupSizeEn} onChangeAr={setFormGroupSizeAr} className={inputCls} /></div>
                      <div><FieldLabel>Meals</FieldLabel><BilingualInput locale={editingLocale} placeholder={editingLocale === "en" ? "Breakfast & Dinner" : "إفطار وعشاء"} valueEn={formMealsEn} valueAr={formMealsAr} onChangeEn={setFormMealsEn} onChangeAr={setFormMealsAr} className={inputCls} /></div>
                      <div><FieldLabel>Accommodation</FieldLabel><BilingualInput locale={editingLocale} placeholder={editingLocale === "en" ? "4-Star Hotel" : "فندق 4 نجوم"} valueEn={formAccommodationEn} valueAr={formAccommodationAr} onChangeEn={setFormAccommodationEn} onChangeAr={setFormAccommodationAr} className={inputCls} /></div>
                    </div>
                    <div><FieldLabel>Cancellation Policy (one rule per line)</FieldLabel><BilingualTextarea locale={editingLocale} placeholder={editingLocale === "en" ? "Free cancellation up to 30 days before travel…" : "إلغاء مجاني حتى 30 يومًا قبل السفر…"} valueEn={formCancellationPolicyEn} valueAr={formCancellationPolicyAr} onChangeEn={setFormCancellationPolicyEn} onChangeAr={setFormCancellationPolicyAr} className="h-20 border-slate-800 bg-slate-950/40 text-white rounded-xl text-sm" /></div>
                  </div>
                </TabsContent>
```

- [ ] **Step 12: Pricing tab — no change**

The `{/* ── PRICING TAB ── */}` block (standard/offer pricing) is untouched — nothing bilingual there. Skip past it.

- [ ] **Step 13: Replace the Itinerary tab**

Current:
```tsx
                {/* ── ITINERARY TAB ── */}
                <TabsContent value="itinerary" className="space-y-4 m-0">
                  <div className={sectionCls}>
                    <div><FieldLabel icon={Upload} color="text-blue-400">Itinerary PDF / File URL</FieldLabel><Input type="url" placeholder="https://example.com/itinerary.pdf" value={formItineraryFileUrl} onChange={e => setFormItineraryFileUrl(e.target.value)} className={inputCls} /></div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white">Daily Itinerary <span className="text-slate-500 font-normal">({formItinerary.length} days)</span></h3>
                      <Button type="button" onClick={addDay} className="h-8 px-3 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-lg cursor-pointer gap-1"><Plus className="w-3 h-3" />Add Day</Button>
                    </div>
                    {formItinerary.map((day, i) => (
                      <div key={i} className="p-4 rounded-2xl border border-slate-800 bg-slate-950/30 space-y-3 relative group">
                        <button type="button" onClick={() => removeDay(i)} className="absolute top-3 right-3 p-1.5 text-slate-600 hover:text-red-400 bg-slate-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"><Trash className="w-4 h-4" /></button>
                        <div className="flex gap-3">
                          <div className="w-16 shrink-0"><FieldLabel>Day</FieldLabel><Input type="number" min="1" value={day.day} onChange={e => updateDay(i, "day", parseInt(e.target.value))} className="h-9 border-slate-800 bg-slate-900 text-center text-sm" /></div>
                          <div className="flex-1"><FieldLabel>Title</FieldLabel><Input placeholder="e.g. Arrival in Paris" value={day.title} onChange={e => updateDay(i, "title", e.target.value)} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                        </div>
                        <div><FieldLabel>Description</FieldLabel><Textarea placeholder="Describe the day's activities…" value={day.desc} onChange={e => updateDay(i, "desc", e.target.value)} className="min-h-[60px] border-slate-800 bg-slate-900 text-sm" /></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div><FieldLabel>Highlights (comma-separated)</FieldLabel><Input placeholder="Airport pickup, Hotel check-in" value={day.highlights?.join(", ")} onChange={e => updateDay(i, "highlights", e.target.value)} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                          <div><FieldLabel icon={Camera} color="text-teal-400">Photo URLs (comma-separated)</FieldLabel><Input placeholder="https://…, https://…, https://…" value={day.images?.join(", ")} onChange={e => updateDay(i, "images", e.target.value)} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                        </div>
                        {day.images && day.images.length > 0 && (
                          <div className="flex gap-2 flex-wrap">
                            {day.images.slice(0, 3).map((img, ii) => (
                              <div key={ii} className="w-16 h-12 rounded-lg overflow-hidden border border-slate-700"><img src={img} alt="" className="object-cover w-full h-full" /></div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </TabsContent>
```

Replace with:
```tsx
                {/* ── ITINERARY TAB ── */}
                <TabsContent value="itinerary" className="space-y-4 m-0">
                  <div className={sectionCls}>
                    <div><FieldLabel icon={Upload} color="text-blue-400">Itinerary PDF / File URL</FieldLabel><Input type="url" placeholder="https://example.com/itinerary.pdf" value={formItineraryFileUrl} onChange={e => setFormItineraryFileUrl(e.target.value)} className={inputCls} /></div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white">Daily Itinerary <span className="text-slate-500 font-normal">({formItinerary.length} days)</span></h3>
                      <Button type="button" onClick={addDay} className="h-8 px-3 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-lg cursor-pointer gap-1"><Plus className="w-3 h-3" />Add Day</Button>
                    </div>
                    {formItinerary.map((day, i) => (
                      <div key={i} className="p-4 rounded-2xl border border-slate-800 bg-slate-950/30 space-y-3 relative group">
                        <button type="button" onClick={() => removeDay(i)} className="absolute top-3 right-3 p-1.5 text-slate-600 hover:text-red-400 bg-slate-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"><Trash className="w-4 h-4" /></button>
                        <div className="flex gap-3">
                          <div className="w-16 shrink-0"><FieldLabel>Day</FieldLabel><Input type="number" min="1" value={day.day} onChange={e => updateDayNumber(i, parseInt(e.target.value))} className="h-9 border-slate-800 bg-slate-900 text-center text-sm" /></div>
                          <div className="flex-1"><FieldLabel>Title</FieldLabel><BilingualInput locale={editingLocale} placeholder={editingLocale === "en" ? "e.g. Arrival in Paris" : "مثال: الوصول إلى باريس"} valueEn={day.title.en} valueAr={day.title.ar} onChangeEn={v => updateDayField(i, "title", "en", v)} onChangeAr={v => updateDayField(i, "title", "ar", v)} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                        </div>
                        <div><FieldLabel>Description</FieldLabel><BilingualTextarea locale={editingLocale} placeholder={editingLocale === "en" ? "Describe the day's activities…" : "صف أنشطة اليوم…"} valueEn={day.desc.en} valueAr={day.desc.ar} onChangeEn={v => updateDayField(i, "desc", "en", v)} onChangeAr={v => updateDayField(i, "desc", "ar", v)} className="min-h-[60px] border-slate-800 bg-slate-900 text-sm" /></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div><FieldLabel>Highlights (comma-separated)</FieldLabel><BilingualInput locale={editingLocale} placeholder={editingLocale === "en" ? "Airport pickup, Hotel check-in" : "الاستقبال من المطار، تسجيل الدخول للفندق"} valueEn={day.highlights.map(h => h.en).join(", ")} valueAr={day.highlights.map(h => h.ar).join(", ")} onChangeEn={v => updateDayHighlights(i, "en", v)} onChangeAr={v => updateDayHighlights(i, "ar", v)} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                          <div><FieldLabel icon={Camera} color="text-teal-400">Photo URLs (comma-separated)</FieldLabel><Input placeholder="https://…, https://…, https://…" value={day.images?.join(", ")} onChange={e => updateDayImages(i, e.target.value)} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                        </div>
                        {day.images && day.images.length > 0 && (
                          <div className="flex gap-2 flex-wrap">
                            {day.images.slice(0, 3).map((img, ii) => (
                              <div key={ii} className="w-16 h-12 rounded-lg overflow-hidden border border-slate-700"><img src={img} alt="" className="object-cover w-full h-full" /></div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </TabsContent>
```

- [ ] **Step 14: Replace the Hotels tab**

Current:
```tsx
                {/* ── HOTELS TAB ── */}
                <TabsContent value="hotels" className="space-y-3 m-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">Hotels <span className="text-slate-500 font-normal">({formHotels.length})</span></h3>
                    <Button type="button" onClick={addHotel} className="h-8 px-3 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-lg cursor-pointer gap-1"><Plus className="w-3 h-3" />Add Hotel</Button>
                  </div>
                  {formHotels.map((hotel, i) => (
                    <div key={i} className="p-4 rounded-2xl border border-slate-800 bg-slate-950/30 space-y-3 relative group">
                      <button type="button" onClick={() => removeHotel(i)} className="absolute top-3 right-3 p-1.5 text-slate-600 hover:text-red-400 bg-slate-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"><Trash className="w-4 h-4" /></button>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="md:col-span-2"><FieldLabel icon={Building} color="text-emerald-400">Hotel Name</FieldLabel><Input placeholder="Grand Hyatt" value={hotel.name} onChange={e => updateHotel(i, "name", e.target.value)} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                        <div><FieldLabel>Stars (1–5)</FieldLabel><Input type="number" min="1" max="5" value={hotel.rating} onChange={e => updateHotel(i, "rating", parseInt(e.target.value))} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                        <div><FieldLabel>Nights</FieldLabel><Input type="number" min="1" value={hotel.nights} onChange={e => updateHotel(i, "nights", parseInt(e.target.value))} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                        <div><FieldLabel>Room Type</FieldLabel><Input placeholder="Deluxe King Room" value={hotel.roomType || ""} onChange={e => updateHotel(i, "roomType", e.target.value)} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                        <div><FieldLabel>Badge Label</FieldLabel><Input placeholder="Luxury Pick" value={hotel.badge || ""} onChange={e => updateHotel(i, "badge", e.target.value)} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                        <div><FieldLabel>Check-in Date</FieldLabel><Input placeholder="08 Aug 2026" value={hotel.checkIn || ""} onChange={e => updateHotel(i, "checkIn", e.target.value)} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                        <div><FieldLabel>Check-out Date</FieldLabel><Input placeholder="11 Aug 2026" value={hotel.checkOut || ""} onChange={e => updateHotel(i, "checkOut", e.target.value)} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                        <div className="md:col-span-4"><FieldLabel icon={ImageIcon} color="text-blue-400">Hotel Image URL</FieldLabel><Input type="url" placeholder="https://images.unsplash.com/…" value={hotel.image || ""} onChange={e => updateHotel(i, "image", e.target.value)} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                        <div className="md:col-span-4"><FieldLabel>Location / Address</FieldLabel><Input placeholder="City Centre, Dubai" value={hotel.location} onChange={e => updateHotel(i, "location", e.target.value)} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                        <div className="md:col-span-4"><FieldLabel>Amenities (comma-separated)</FieldLabel><Input placeholder="Free WiFi, Breakfast, Pool, Spa, Airport Transfer" value={hotel.amenities?.join(", ") || ""} onChange={e => updateHotel(i, "amenities", e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean))} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                      </div>
                      {hotel.image && <div className="h-24 w-full rounded-xl overflow-hidden border border-slate-700"><img src={hotel.image} alt="" className="object-cover w-full h-full" /></div>}
                    </div>
                  ))}
                </TabsContent>
```

Replace with:
```tsx
                {/* ── HOTELS TAB ── */}
                <TabsContent value="hotels" className="space-y-3 m-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">Hotels <span className="text-slate-500 font-normal">({formHotels.length})</span></h3>
                    <Button type="button" onClick={addHotel} className="h-8 px-3 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-lg cursor-pointer gap-1"><Plus className="w-3 h-3" />Add Hotel</Button>
                  </div>
                  {formHotels.map((hotel, i) => (
                    <div key={i} className="p-4 rounded-2xl border border-slate-800 bg-slate-950/30 space-y-3 relative group">
                      <button type="button" onClick={() => removeHotel(i)} className="absolute top-3 right-3 p-1.5 text-slate-600 hover:text-red-400 bg-slate-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"><Trash className="w-4 h-4" /></button>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="md:col-span-2"><FieldLabel icon={Building} color="text-emerald-400">Hotel Name</FieldLabel><Input placeholder="Grand Hyatt" value={hotel.name} onChange={e => updateHotelPlain(i, "name", e.target.value)} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                        <div><FieldLabel>Stars (1–5)</FieldLabel><Input type="number" min="1" max="5" value={hotel.rating} onChange={e => updateHotelNumber(i, "rating", parseInt(e.target.value))} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                        <div><FieldLabel>Nights</FieldLabel><Input type="number" min="1" value={hotel.nights} onChange={e => updateHotelNumber(i, "nights", parseInt(e.target.value))} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                        <div><FieldLabel>Room Type</FieldLabel><BilingualInput locale={editingLocale} placeholder={editingLocale === "en" ? "Deluxe King Room" : "غرفة ديلوكس بسرير كينج"} valueEn={hotel.roomType?.en ?? ""} valueAr={hotel.roomType?.ar ?? ""} onChangeEn={v => updateHotelBilingual(i, "roomType", "en", v)} onChangeAr={v => updateHotelBilingual(i, "roomType", "ar", v)} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                        <div><FieldLabel>Badge Label</FieldLabel><BilingualInput locale={editingLocale} placeholder={editingLocale === "en" ? "Luxury Pick" : "اختيار فاخر"} valueEn={hotel.badge?.en ?? ""} valueAr={hotel.badge?.ar ?? ""} onChangeEn={v => updateHotelBilingual(i, "badge", "en", v)} onChangeAr={v => updateHotelBilingual(i, "badge", "ar", v)} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                        <div><FieldLabel>Check-in Date</FieldLabel><Input placeholder="08 Aug 2026" value={hotel.checkIn || ""} onChange={e => updateHotelPlain(i, "checkIn", e.target.value)} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                        <div><FieldLabel>Check-out Date</FieldLabel><Input placeholder="11 Aug 2026" value={hotel.checkOut || ""} onChange={e => updateHotelPlain(i, "checkOut", e.target.value)} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                        <div className="md:col-span-4"><FieldLabel icon={ImageIcon} color="text-blue-400">Hotel Image URL</FieldLabel><Input type="url" placeholder="https://images.unsplash.com/…" value={hotel.image || ""} onChange={e => updateHotelPlain(i, "image", e.target.value)} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                        <div className="md:col-span-4"><FieldLabel>Location / Address</FieldLabel><Input placeholder="City Centre, Dubai" value={hotel.location} onChange={e => updateHotelPlain(i, "location", e.target.value)} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                        <div className="md:col-span-4"><FieldLabel>Amenities (comma-separated)</FieldLabel><BilingualInput locale={editingLocale} placeholder={editingLocale === "en" ? "Free WiFi, Breakfast, Pool, Spa, Airport Transfer" : "واي فاي مجاني، إفطار، مسبح، سبا، نقل من المطار"} valueEn={(hotel.amenities ?? []).map(a => a.en).join(", ")} valueAr={(hotel.amenities ?? []).map(a => a.ar).join(", ")} onChangeEn={v => updateHotelAmenities(i, "en", v)} onChangeAr={v => updateHotelAmenities(i, "ar", v)} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                      </div>
                      {hotel.image && <div className="h-24 w-full rounded-xl overflow-hidden border border-slate-700"><img src={hotel.image} alt="" className="object-cover w-full h-full" /></div>}
                    </div>
                  ))}
                </TabsContent>
```

- [ ] **Step 15: Replace the Optional Tours tab**

Current:
```tsx
                {/* ── OPTIONAL TOURS TAB ── */}
                <TabsContent value="tours" className="space-y-3 m-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">Optional Tours <span className="text-slate-500 font-normal">({formOptionalTours.length})</span></h3>
                    <Button type="button" onClick={addTour} className="h-8 px-3 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-lg cursor-pointer gap-1"><Plus className="w-3 h-3" />Add Tour</Button>
                  </div>
                  {formOptionalTours.map((tour) => (
                    <div key={tour.id} className="p-4 rounded-2xl border border-slate-800 bg-slate-950/30 space-y-3 relative group">
                      <button type="button" onClick={() => removeTour(tour.id)} className="absolute top-3 right-3 p-1.5 text-slate-600 hover:text-red-400 bg-slate-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"><Trash className="w-4 h-4" /></button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div><FieldLabel>Tour Title</FieldLabel><Input placeholder="Kyoto City Tour w/ Lunch" value={tour.title} onChange={e => updateTour(tour.id, "title", e.target.value)} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                        <div><FieldLabel>Tag</FieldLabel>
                          <select value={tour.tag} onChange={e => updateTour(tour.id, "tag", e.target.value)} className="w-full h-9 border border-slate-800 bg-slate-900 text-white rounded-xl px-3 text-sm outline-none focus:ring-1 focus:ring-blue-500">
                            <option value="Optional">Optional</option><option value="Mandatory">Mandatory</option>
                          </select>
                        </div>
                      </div>
                      <div><FieldLabel>Description</FieldLabel><Textarea placeholder="Describe this optional tour…" value={tour.desc} onChange={e => updateTour(tour.id, "desc", e.target.value)} className="min-h-[60px] border-slate-800 bg-slate-900 text-sm" /></div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {(["adult","single","child611","child25","infant"] as const).map(f => (
                          <div key={f}><FieldLabel>{f === "child611" ? "Child 6–11" : f === "child25" ? "Child 2–5" : f.charAt(0).toUpperCase() + f.slice(1)} (QAR)</FieldLabel><Input type="number" min="0" placeholder="0" value={tour[f] || ""} onChange={e => updateTour(tour.id, f, Number(e.target.value))} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                        ))}
                      </div>
                      <div><FieldLabel icon={Camera} color="text-teal-400">Photo URLs (comma-separated, up to 3)</FieldLabel><Input placeholder="https://…, https://…, https://…" value={tour.images?.join(", ") || ""} onChange={e => updateTour(tour.id, "images", e.target.value)} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                      {tour.images && tour.images.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {tour.images.slice(0, 3).map((img, ii) => (
                            <div key={ii} className="w-20 h-14 rounded-lg overflow-hidden border border-slate-700"><img src={img} alt="" className="object-cover w-full h-full" /></div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </TabsContent>
```

Replace with:
```tsx
                {/* ── OPTIONAL TOURS TAB ── */}
                <TabsContent value="tours" className="space-y-3 m-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">Optional Tours <span className="text-slate-500 font-normal">({formOptionalTours.length})</span></h3>
                    <Button type="button" onClick={addTour} className="h-8 px-3 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-lg cursor-pointer gap-1"><Plus className="w-3 h-3" />Add Tour</Button>
                  </div>
                  {formOptionalTours.map((tour) => (
                    <div key={tour.id} className="p-4 rounded-2xl border border-slate-800 bg-slate-950/30 space-y-3 relative group">
                      <button type="button" onClick={() => removeTour(tour.id)} className="absolute top-3 right-3 p-1.5 text-slate-600 hover:text-red-400 bg-slate-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"><Trash className="w-4 h-4" /></button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div><FieldLabel>Tour Title</FieldLabel><BilingualInput locale={editingLocale} placeholder={editingLocale === "en" ? "Kyoto City Tour w/ Lunch" : "جولة مدينة كيوتو مع الغداء"} valueEn={tour.title.en} valueAr={tour.title.ar} onChangeEn={v => updateTourBilingual(tour.id, "title", "en", v)} onChangeAr={v => updateTourBilingual(tour.id, "title", "ar", v)} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                        <div><FieldLabel>Tag</FieldLabel>
                          <select value={tour.tag} onChange={e => updateTourTag(tour.id, e.target.value as "Mandatory" | "Optional")} className="w-full h-9 border border-slate-800 bg-slate-900 text-white rounded-xl px-3 text-sm outline-none focus:ring-1 focus:ring-blue-500">
                            <option value="Optional">Optional</option><option value="Mandatory">Mandatory</option>
                          </select>
                        </div>
                      </div>
                      <div><FieldLabel>Description</FieldLabel><BilingualTextarea locale={editingLocale} placeholder={editingLocale === "en" ? "Describe this optional tour…" : "صف هذه الجولة الاختيارية…"} valueEn={tour.desc.en} valueAr={tour.desc.ar} onChangeEn={v => updateTourBilingual(tour.id, "desc", "en", v)} onChangeAr={v => updateTourBilingual(tour.id, "desc", "ar", v)} className="min-h-[60px] border-slate-800 bg-slate-900 text-sm" /></div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {(["adult","single","child611","child25","infant"] as const).map(f => (
                          <div key={f}><FieldLabel>{f === "child611" ? "Child 6–11" : f === "child25" ? "Child 2–5" : f.charAt(0).toUpperCase() + f.slice(1)} (QAR)</FieldLabel><Input type="number" min="0" placeholder="0" value={tour[f] || ""} onChange={e => updateTourPrice(tour.id, f, Number(e.target.value))} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                        ))}
                      </div>
                      <div><FieldLabel icon={Camera} color="text-teal-400">Photo URLs (comma-separated, up to 3)</FieldLabel><Input placeholder="https://…, https://…, https://…" value={tour.images?.join(", ") || ""} onChange={e => updateTourImages(tour.id, e.target.value)} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                      {tour.images && tour.images.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {tour.images.slice(0, 3).map((img, ii) => (
                            <div key={ii} className="w-20 h-14 rounded-lg overflow-hidden border border-slate-700"><img src={img} alt="" className="object-cover w-full h-full" /></div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </TabsContent>
```

- [ ] **Step 16: Replace the Departure Dates tab**

Current:
```tsx
                {/* ── DEPARTURE DATES TAB (fixed-departure only) ── */}
                <TabsContent value="departures" className="space-y-3 m-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">Departure Dates <span className="text-slate-500 font-normal">({formDepartures.length})</span></h3>
                    <Button type="button" onClick={addDeparture} className="h-8 px-3 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-lg cursor-pointer gap-1"><Plus className="w-3 h-3" />Add Date</Button>
                  </div>
                  {formDepartures.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-32 rounded-2xl border border-dashed border-slate-700 text-slate-500 text-sm gap-2">
                      <Calendar className="w-6 h-6" /><span>No departure dates yet. Click &quot;Add Date&quot; to add one.</span>
                    </div>
                  )}
                  {formDepartures.map((dep) => (
                    <div key={dep.id} className="p-4 rounded-2xl border border-slate-800 bg-slate-950/30 space-y-3 relative group">
                      <button type="button" onClick={() => removeDeparture(dep.id)} className="absolute top-3 right-3 p-1.5 text-slate-600 hover:text-red-400 bg-slate-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"><Trash className="w-4 h-4" /></button>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="md:col-span-2"><FieldLabel icon={Calendar} color="text-blue-400">Departure Date</FieldLabel><Input placeholder="08 Aug 2026" value={dep.date} onChange={e => updateDeparture(dep.id, "date", e.target.value)} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                        <div><FieldLabel>Seats Status</FieldLabel><Input placeholder="4 Seats Left" value={dep.seats} onChange={e => updateDeparture(dep.id, "seats", e.target.value)} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                        <div><FieldLabel>Urgency Color</FieldLabel>
                          <select value={dep.urgency} onChange={e => updateDeparture(dep.id, "urgency", e.target.value)} className="w-full h-9 border border-slate-800 bg-slate-900 text-white rounded-xl px-3 text-sm outline-none focus:ring-1 focus:ring-blue-500">
                            <option value="green">Green — Available</option><option value="amber">Amber — Filling Fast</option><option value="red">Red — Almost Full</option>
                          </select>
                        </div>
                      </div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Per-Person Prices (QAR)</p>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {([["adult","Adult"],["single","Single"],["child611","Child 6–11"],["child25","Child 2–5"],["infant","Infant"]] as const).map(([f, label]) => (
                          <div key={f}><FieldLabel>{label}</FieldLabel><Input type="number" min="0" placeholder="0" value={dep[f] || ""} onChange={e => updateDeparture(dep.id, f, Number(e.target.value))} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                        ))}
                      </div>
                    </div>
                  ))}
                </TabsContent>
```

Replace with:
```tsx
                {/* ── DEPARTURE DATES TAB (fixed-departure only) ── */}
                <TabsContent value="departures" className="space-y-3 m-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">Departure Dates <span className="text-slate-500 font-normal">({formDepartures.length})</span></h3>
                    <Button type="button" onClick={addDeparture} className="h-8 px-3 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-lg cursor-pointer gap-1"><Plus className="w-3 h-3" />Add Date</Button>
                  </div>
                  {formDepartures.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-32 rounded-2xl border border-dashed border-slate-700 text-slate-500 text-sm gap-2">
                      <Calendar className="w-6 h-6" /><span>No departure dates yet. Click &quot;Add Date&quot; to add one.</span>
                    </div>
                  )}
                  {formDepartures.map((dep) => (
                    <div key={dep.id} className="p-4 rounded-2xl border border-slate-800 bg-slate-950/30 space-y-3 relative group">
                      <button type="button" onClick={() => removeDeparture(dep.id)} className="absolute top-3 right-3 p-1.5 text-slate-600 hover:text-red-400 bg-slate-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"><Trash className="w-4 h-4" /></button>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="md:col-span-2"><FieldLabel icon={Calendar} color="text-blue-400">Departure Date</FieldLabel><Input placeholder="08 Aug 2026" value={dep.date} onChange={e => updateDepartureDate(dep.id, e.target.value)} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                        <div><FieldLabel>Seats Status</FieldLabel><BilingualInput locale={editingLocale} placeholder={editingLocale === "en" ? "4 Seats Left" : "4 مقاعد متبقية"} valueEn={dep.seats.en} valueAr={dep.seats.ar} onChangeEn={v => updateDepartureSeats(dep.id, "en", v)} onChangeAr={v => updateDepartureSeats(dep.id, "ar", v)} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                        <div><FieldLabel>Urgency Color</FieldLabel>
                          <select value={dep.urgency} onChange={e => updateDepartureUrgency(dep.id, e.target.value as "red" | "amber" | "green")} className="w-full h-9 border border-slate-800 bg-slate-900 text-white rounded-xl px-3 text-sm outline-none focus:ring-1 focus:ring-blue-500">
                            <option value="green">Green — Available</option><option value="amber">Amber — Filling Fast</option><option value="red">Red — Almost Full</option>
                          </select>
                        </div>
                      </div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Per-Person Prices (QAR)</p>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {([["adult","Adult"],["single","Single"],["child611","Child 6–11"],["child25","Child 2–5"],["infant","Infant"]] as const).map(([f, label]) => (
                          <div key={f}><FieldLabel>{label}</FieldLabel><Input type="number" min="0" placeholder="0" value={dep[f] || ""} onChange={e => updateDeparturePrice(dep.id, f, Number(e.target.value))} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                        ))}
                      </div>
                    </div>
                  ))}
                </TabsContent>
```

- [ ] **Step 17: Flights tab — no change**

The `{/* ── FLIGHTS TAB (fixed-departure only) ── */}` block is untouched — flight fields (`airline`, `flightNo`, `from`/`fromCity`, `to`/`toCity`, `departure`, `arrival`, `duration`, `class`, `date`) are codes/times/proper nouns, not translatable prose (per the spec's explicit out-of-scope list). Skip past it.

- [ ] **Step 18: Close the loading conditional and verify the dialog's structural JSX**

Current (the tail of the dialog form, unchanged since Plan 2a):
```tsx
              </div>{/* end scroll area */}

              <DialogFooter className="gap-2 border-t border-slate-800/80 pt-4 mt-3 shrink-0">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} disabled={submitting} className="h-11 px-5 border-slate-800 text-slate-400 hover:text-white rounded-xl font-bold cursor-pointer">Cancel</Button>
                <Button type="submit" disabled={submitting} className="h-11 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg cursor-pointer flex items-center gap-1.5">
                  {submitting ? <><Loader2 className="h-4 w-4 animate-spin" />Saving…</> : editingPackage ? "Save Changes" : "Create Package"}
                </Button>
              </DialogFooter>
            </Tabs>
          </form>
        </DialogContent>
      </Dialog>
```

Replace with:
```tsx
              </div>{/* end scroll area */}

              <DialogFooter className="gap-2 border-t border-slate-800/80 pt-4 mt-3 shrink-0">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} disabled={submitting} className="h-11 px-5 border-slate-800 text-slate-400 hover:text-white rounded-xl font-bold cursor-pointer">Cancel</Button>
                <Button type="submit" disabled={submitting} className="h-11 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg cursor-pointer flex items-center gap-1.5">
                  {submitting ? <><Loader2 className="h-4 w-4 animate-spin" />Saving…</> : editingPackage ? "Save Changes" : "Create Package"}
                </Button>
              </DialogFooter>
            </Tabs>
          </form>
          )}
        </DialogContent>
      </Dialog>
```

This closes the `{loadingAdminInput ? (...spinner...) : (` conditional opened in Step 9 — the spinner branch renders in place of the `<form>` while `GET /api/packages/[id]/admin` is in flight; once it resolves, `resetForm(editingAdminInput)` (Step 5) has already populated every doubled field and the form renders with the fetched data.

- [ ] **Step 19: Full verification**

Run, in order:

```bash
npx tsc --noEmit
```
Expected: 0 errors. If any remain, they'll be in `CategoryPackagesTable.tsx` — check for a leftover single-language field reference (`formTitle` instead of `formTitleEn`/`formTitleAr`) or a stale helper name (`updateDay`/`updateHotel`/`updateTour`/`updateDeparture` instead of the split helpers from Step 7).

```bash
npm run build
```
Expected: build succeeds.

```bash
npm run lint
```
Expected: no *new* errors introduced by this file beyond the pre-existing `react-hooks/refs` errors in `KeralaTourismClient.tsx` documented in `CLAUDE.md` (unrelated file, untouched by this plan).

```bash
npm test
```
Expected: all tests across the repo pass (Tasks 3 and 4's new/updated tests, plus Plan 2a's untouched tests for `toggleFeatured`/`delete`).

- [ ] **Step 20: Commit**

```bash
git add src/components/admin/CategoryPackagesTable.tsx
git commit -m "feat: bilingual admin authoring UI for package form"
```
