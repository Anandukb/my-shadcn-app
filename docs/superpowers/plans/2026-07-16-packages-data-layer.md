# Packages Data Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the fake package data layer (`data/packages.ts`, `data/packages.json`, `lib/api.ts`, `lib/packages-service.ts`) with a real Supabase-backed `packages` table and repository, wire every public page and the admin dashboard to it, while keeping the DB schema fully bilingual-shaped from day one.

**Architecture:** A `packages` table stores bilingual content (`title_en`/`title_ar`, and `{en,ar}` pairs nested inside JSONB columns for itinerary/hotels/tours/etc.), but the bilingual complexity is entirely encapsulated inside `src/lib/packages/mappers.ts`. Every consumer of the repository — every public page, the admin dashboard, the admin CRUD table — keeps using the exact same `Package` TypeScript type that exists today (single-language, unchanged). Public reads resolve to the requesting page's `locale`; admin reads/writes always resolve to English for this plan, with existing Arabic content preserved (not clobbered) on update. A follow-up plan (2b) will build the bilingual *authoring* UI that lets admins actually edit the Arabic side.

**Tech Stack:** Supabase (Postgres + `@supabase/supabase-js`, reusing Plan 1's `src/lib/supabase/admin.ts`), `@tanstack/react-query`, `zod` (new dependency, for API request validation).

This is part of **Plan 2 of 3** for the Supabase backend design (`docs/superpowers/specs/2026-07-14-supabase-backend-design.md`), split into 2a (this plan) and 2b (bilingual admin authoring UI, not yet written). Depends on Plan 1 (`docs/superpowers/plans/2026-07-14-supabase-foundation-and-admin-auth.md`), already implemented — reuses `src/lib/supabase/admin.ts` and `src/lib/admin-auth.ts`'s `requireAdminSession()`.

## Global Constraints

- Category is restricted to exactly these 5 values: `cruise`, `fixed-departure`, `holidays`, `kerala`, `medical`. `"all"` is a UI-only concept (used by `/admin/packages` to mean "no filter") and is never itself a stored category value.
- Browser and Server Components never call Supabase directly — all package data access goes through `src/lib/packages-repository.ts`, which uses the service-role client (`src/lib/supabase/admin.ts`) server-side only, consistent with Plan 1's architecture.
- RLS is enabled on the `packages` table as defense-in-depth only (not the primary authorization boundary — that's `requireAdminSession()` in the Route Handlers).
- All admin-only Route Handlers (`POST`/`PATCH`/`DELETE`) must call `requireAdminSession()` from `src/lib/admin-auth.ts` (Plan 1) before touching data.
- Follow the repository's existing code style: TypeScript strict, no comments except where a non-obvious constraint needs explaining.
- The `Package` type in `src/types/package.ts` does not change in this plan — it stays single-language, exactly as it is today. Bilingual storage is an implementation detail of the repository, invisible to every consumer.

---

## File Structure

| File | Change | Responsibility |
|---|---|---|
| `supabase/migrations/<timestamp>_create_packages.sql` | Create | `packages` table, bilingual-shaped columns, CHECK constraint, RLS. |
| `scripts/seed-packages.mjs` | Create | One-time script: reads `src/data/packages.json`, inserts rows via the service-role client. |
| `src/lib/packages/types.ts` | Create | `BilingualText`, `PackageRow`, and related row-shape types (the DB's internal bilingual shape). |
| `src/lib/packages/mappers.ts` | Create | `rowToPackage(row, locale)`, `rowToAdminPackage(row)`, `packageInputToInsertRow(input)`, `packageInputToUpdateRow(input, existing)` — the only place bilingual logic lives. |
| `src/lib/packages/mappers.test.ts` | Create | Tests for the mapping/fallback logic above. |
| `src/lib/packages-repository.ts` | Create | Public API: `getAll(locale)`, `getByCategory(category, locale)`, `getById(id, locale)`, `create(input)`, `update(id, input)`, `delete(id)`, `toggleFeatured(id)`. Admin code gets the English view by calling `getByCategory`/`getById` with `locale: "en"` — no separate "raw" functions needed. Replaces `lib/api.ts` and `lib/packages-service.ts`. |
| `src/lib/packages-repository.test.ts` | Create | Tests (mocked Supabase admin client). |
| `src/app/api/packages/route.ts` | Modify | `GET` (public, category + locale query params) and `POST` (admin, create). |
| `src/app/api/packages/[id]/route.ts` | Create | `GET` (public, single package + locale), `PATCH` (admin, update), `DELETE` (admin). |
| `src/app/api/packages/[id]/feature/route.ts` | Create | `PATCH` (admin, toggle featured). |
| `src/components/providers/QueryProvider.tsx` | Create | Mounts a single `QueryClientProvider`. |
| `src/components/layout/ClientLayout.tsx` | Modify | Wrap children in `QueryProvider`. |
| `src/components/packages/CommonListingPage.tsx` | Modify | Accept a `locale` prop, call the repository instead of `lib/api`. |
| `src/app/[locale]/holiday-packages/page.tsx` | Modify | Pass `locale` through to `CommonListingPage`. |
| `src/app/[locale]/fixed-departures/page.tsx` | Modify | Same. |
| `src/app/[locale]/packages/page.tsx` | Modify | Same. |
| `src/app/[locale]/packages/[id]/page.tsx` | Modify | Pass `locale`, call the repository instead of `lib/api`. |
| `src/app/[locale]/cruise-packages/page.tsx` | Modify | Replace manual `allPackages` filtering with `CommonListingPage`, matching its siblings. |
| `src/app/[locale]/medical-tourism/MedicalTourismClient.tsx` | Create | The existing page's JSX, extracted, accepting a `packages: Package[]` prop instead of importing `allPackages`. |
| `src/app/[locale]/medical-tourism/page.tsx` | Modify | Reduced to a thin server wrapper (matches the existing `kerala-tourism/page.tsx` pattern), calling the repository. |
| `src/app/[locale]/kerala-tourism/page.tsx` | Modify | Call the repository instead of `allPackages`. |
| `src/components/admin/CategoryPackagesTable.tsx` | Modify | Swap `packagesService` for TanStack Query + `fetch` calls to the new API routes. No shape changes — it keeps using `Package`/`Omit<Package,"id">`/`Partial<Package>` exactly as today. |
| `src/app/[locale]/(admin)/admin/(dashboard)/page.tsx` | Modify | Swap `packagesService.getAll()` + the `packages_updated` window event for `useQuery`. |
| `src/data/packages.ts`, `src/data/packages.json`, `src/lib/api.ts`, `src/lib/packages-service.ts` | Delete | Superseded by the repository (last task, after everything else is verified working). |

---

### Task 1: TanStack Query provider

**Files:**
- Create: `src/components/providers/QueryProvider.tsx`
- Modify: `src/components/layout/ClientLayout.tsx`

**Interfaces:**
- Produces: `QueryProvider` component, wrapping `children` in a `QueryClientProvider`. Consumed by every later task that uses `useQuery`/`useMutation` (Tasks 12, 13).

- [ ] **Step 1: Install the dependency**

```bash
npm install @tanstack/react-query
```

- [ ] **Step 2: Create the provider**

```tsx
// src/components/providers/QueryProvider.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
```

- [ ] **Step 3: Wrap `ClientLayout` with it**

Read `src/components/layout/ClientLayout.tsx` first to find its current outermost returned element. Add the import:

```tsx
import { QueryProvider } from "@/components/providers/QueryProvider";
```

Wrap the component's entire returned JSX (both the admin-route branch and the marketing-site branch) in `<QueryProvider>...</QueryProvider>` — every route needs it since both the admin dashboard (Task 12/13) and nothing else currently needs it, but wrapping unconditionally at the top keeps this simple and matches the plan's "single `QueryClientProvider` mounted once" requirement.

- [ ] **Step 4: Verify**

Run: `npm run build`
Expected: compiles successfully, same route list as before.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/components/providers/QueryProvider.tsx src/components/layout/ClientLayout.tsx
git commit -m "feat: add TanStack Query provider"
```

---

### Task 2: `packages` table SQL migration

**Files:**
- Create: `supabase/migrations/<timestamp>_create_packages.sql` (filename timestamp generated by the CLI)

**Interfaces:**
- Produces: `public.packages` table, consumed by `src/lib/packages-repository.ts` (Task 4).

- [ ] **Step 1: Create the migration file**

```bash
npx supabase migration new create_packages
```

Open the generated `supabase/migrations/<timestamp>_create_packages.sql` and replace its contents with:

```sql
create table if not exists public.packages (
  id bigint generated always as identity primary key,
  category text not null check (category in ('cruise', 'fixed-departure', 'holidays', 'kerala', 'medical')),
  slug text unique,
  price numeric not null,
  continent text not null,
  rating numeric not null default 5.0,
  reviews integer not null default 0,
  featured boolean not null default false,
  duration text not null,
  image text not null,
  group_size text,
  meals text,
  accommodation text,
  itinerary_file_url text,

  title_en text not null,
  title_ar text,
  description_en text not null,
  description_ar text,
  location_en text not null,
  location_ar text,

  includes jsonb not null default '[]',
  exclusions jsonb not null default '[]',
  cancellation_policy jsonb not null default '[]',
  pricing jsonb,
  offer_pricing jsonb,
  itinerary jsonb not null default '[]',
  departure_dates jsonb not null default '[]',
  flights jsonb not null default '[]',
  hotels jsonb not null default '[]',
  optional_tours jsonb not null default '[]',

  created_by uuid references public.profiles (id),
  updated_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.packages enable row level security;

-- Defense-in-depth only: primary authorization lives in TypeScript
-- (see src/lib/admin-auth.ts). All writes go through the service-role
-- client in Route Handlers, which bypasses RLS entirely — this SELECT
-- policy exists only in case a direct anon-key read path is ever added.
create policy "Packages are viewable by everyone"
  on public.packages for select
  using (true);
```

- [ ] **Step 2: Review checklist**

Confirm the file has, in order: table creation with the CHECK constraint on `category`, `enable row level security`, and the SELECT policy. No INSERT/UPDATE/DELETE policies exist (all writes go through the service-role client, which bypasses RLS).

- [ ] **Step 3: Apply the migration**

```bash
npx supabase db push
```

Verify in the Supabase dashboard (**Table Editor**) that `packages` now exists with the expected columns.

- [ ] **Step 4: Commit**

```bash
git add supabase/
git commit -m "feat: add packages table migration"
```

---

### Task 3: Bilingual row types + mapping helpers

**Files:**
- Create: `src/lib/packages/types.ts`
- Create: `src/lib/packages/mappers.ts`
- Create: `src/lib/packages/mappers.test.ts`

**Interfaces:**
- Consumes: `Package`, `ItineraryDay`, `HotelDetails`, `DepartureDate`, `OptionalTour`, `FlightDetails`, `PackagePrice` from `src/types/package.ts` (unchanged).
- Produces: `BilingualText`, `PackageRow` (from `types.ts`); `rowToPackage(row: PackageRow, locale: 'en' | 'ar'): Package`, `rowToAdminPackage(row: PackageRow): Package`, `packageInputToInsertRow(input: Omit<Package, 'id'>): Record<string, unknown>`, `packageInputToUpdateRow(input: Partial<Package>, existing: PackageRow): Record<string, unknown>` (from `mappers.ts`) — consumed by Task 4's repository.

- [ ] **Step 1: Write the row types**

```ts
// src/lib/packages/types.ts
import type { FlightDetails, PackagePrice } from "@/types/package";

export interface BilingualText {
  en: string;
  ar: string;
}

export interface PackageRowItineraryDay {
  day: number;
  title: BilingualText;
  desc: BilingualText;
  highlights: BilingualText[];
  images?: string[];
}

export interface PackageRowHotel {
  name: string;
  rating: number;
  location: string;
  nights: number;
  checkIn?: string;
  checkOut?: string;
  roomType?: BilingualText;
  description?: BilingualText;
  image?: string;
  badge?: BilingualText;
  amenities?: BilingualText[];
}

export interface PackageRowOptionalTour {
  id: string;
  title: BilingualText;
  tag: "Mandatory" | "Optional";
  desc: BilingualText;
  adult: number;
  single: number;
  child611: number;
  child25: number;
  infant: number;
  images: string[];
}

export interface PackageRowDepartureDate {
  id: string;
  date: string;
  adult: number;
  single: number;
  child611: number;
  child25: number;
  infant: number;
  seats: BilingualText;
  urgency: "red" | "amber" | "green";
}

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

- [ ] **Step 2: Write the failing mapper tests**

These tests cover the risky logic — bilingual fallback-to-English behavior and merge-preserving updates — not every mechanical field copy.

```ts
// src/lib/packages/mappers.test.ts
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
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `npm test -- src/lib/packages/mappers.test.ts`
Expected: FAIL — `Cannot find module './mappers'`.

- [ ] **Step 4: Implement the mappers**

```ts
// src/lib/packages/mappers.ts
import type { Package, ItineraryDay, HotelDetails, OptionalTour, DepartureDate } from "@/types/package";
import type {
  BilingualText,
  PackageRow,
  PackageRowItineraryDay,
  PackageRowHotel,
  PackageRowOptionalTour,
  PackageRowDepartureDate,
} from "./types";

function pick(text: BilingualText | null | undefined, locale: "en" | "ar"): string {
  if (!text) return "";
  if (locale === "ar" && text.ar) return text.ar;
  return text.en;
}

function pickList(list: BilingualText[] | null | undefined, locale: "en" | "ar"): string[] {
  if (!list) return [];
  return list.map((item) => pick(item, locale));
}

export function rowToPackage(row: PackageRow, locale: "en" | "ar"): Package {
  return {
    id: row.id,
    category: row.category,
    title: pick({ en: row.title_en, ar: row.title_ar ?? "" }, locale),
    description: pick({ en: row.description_en, ar: row.description_ar ?? "" }, locale),
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
    cancellationPolicy: pickList(row.cancellation_policy, locale),
    pricing: row.pricing ?? undefined,
    offerPricing: row.offer_pricing ?? undefined,
    itineraryFileUrl: row.itinerary_file_url ?? undefined,
    itinerary: row.itinerary.map(
      (day): ItineraryDay => ({
        day: day.day,
        title: pick(day.title, locale),
        desc: pick(day.desc, locale),
        highlights: pickList(day.highlights, locale),
        images: day.images,
      })
    ),
    departureDates: row.departure_dates.map(
      (dep): DepartureDate => ({
        id: dep.id,
        date: dep.date,
        adult: dep.adult,
        single: dep.single,
        child611: dep.child611,
        child25: dep.child25,
        infant: dep.infant,
        seats: pick(dep.seats, locale),
        urgency: dep.urgency,
      })
    ),
    flights: row.flights,
    hotels: row.hotels.map(
      (hotel): HotelDetails => ({
        name: hotel.name,
        rating: hotel.rating,
        location: hotel.location,
        nights: hotel.nights,
        checkIn: hotel.checkIn,
        checkOut: hotel.checkOut,
        roomType: hotel.roomType ? pick(hotel.roomType, locale) : undefined,
        description: hotel.description ? pick(hotel.description, locale) : undefined,
        image: hotel.image,
        badge: hotel.badge ? pick(hotel.badge, locale) : undefined,
        amenities: hotel.amenities ? pickList(hotel.amenities, locale) : undefined,
      })
    ),
    optionalTours: row.optional_tours.map(
      (tour): OptionalTour => ({
        id: tour.id,
        title: pick(tour.title, locale),
        tag: tour.tag,
        desc: pick(tour.desc, locale),
        adult: tour.adult,
        single: tour.single,
        child611: tour.child611,
        child25: tour.child25,
        infant: tour.infant,
        images: tour.images,
      })
    ),
  };
}

export function rowToAdminPackage(row: PackageRow): Package {
  return rowToPackage(row, "en");
}

function wrap(en: string): BilingualText {
  return { en, ar: "" };
}

function wrapList(list: string[]): BilingualText[] {
  return list.map((en) => ({ en, ar: "" }));
}

export function packageInputToInsertRow(input: Omit<Package, "id">): Record<string, unknown> {
  return {
    category: input.category,
    price: input.price,
    continent: input.continent,
    rating: input.rating,
    reviews: input.reviews,
    featured: input.featured,
    duration: input.duration,
    image: input.image,
    group_size: input.groupSize ?? null,
    meals: input.meals ?? null,
    accommodation: input.accommodation ?? null,
    itinerary_file_url: input.itineraryFileUrl ?? null,
    title_en: input.title,
    title_ar: null,
    description_en: input.description,
    description_ar: null,
    location_en: input.location,
    location_ar: null,
    includes: wrapList(input.includes ?? []),
    exclusions: wrapList(input.exclusions ?? []),
    cancellation_policy: wrapList(input.cancellationPolicy ?? []),
    pricing: input.pricing ?? null,
    offer_pricing: input.offerPricing ?? null,
    itinerary: (input.itinerary ?? []).map(
      (day): PackageRowItineraryDay => ({
        day: day.day,
        title: wrap(day.title),
        desc: wrap(day.desc),
        highlights: wrapList(day.highlights ?? []),
        images: day.images,
      })
    ),
    departure_dates: (input.departureDates ?? []).map(
      (dep): PackageRowDepartureDate => ({
        id: dep.id,
        date: dep.date,
        adult: dep.adult,
        single: dep.single,
        child611: dep.child611,
        child25: dep.child25,
        infant: dep.infant,
        seats: wrap(dep.seats),
        urgency: dep.urgency,
      })
    ),
    flights: input.flights ?? [],
    hotels: (input.hotels ?? []).map(
      (hotel): PackageRowHotel => ({
        name: hotel.name,
        rating: hotel.rating,
        location: hotel.location,
        nights: hotel.nights,
        checkIn: hotel.checkIn,
        checkOut: hotel.checkOut,
        roomType: hotel.roomType !== undefined ? wrap(hotel.roomType) : undefined,
        description: hotel.description !== undefined ? wrap(hotel.description) : undefined,
        image: hotel.image,
        badge: hotel.badge !== undefined ? wrap(hotel.badge) : undefined,
        amenities: hotel.amenities !== undefined ? wrapList(hotel.amenities) : undefined,
      })
    ),
    optional_tours: (input.optionalTours ?? []).map(
      (tour): PackageRowOptionalTour => ({
        id: tour.id,
        title: wrap(tour.title),
        tag: tour.tag,
        desc: wrap(tour.desc),
        adult: tour.adult,
        single: tour.single,
        child611: tour.child611,
        child25: tour.child25,
        infant: tour.infant,
        images: tour.images,
      })
    ),
  };
}

// Index-based Arabic-preservation: this assumes array items keep their
// position between edits (the admin form resubmits whole arrays, not
// per-item diffs). If an admin reorders or deletes a middle item, the
// Arabic side could misalign with the wrong item. Acceptable for this
// plan since the admin form is English-only — Plan 2b's proper bilingual
// editing UI will edit en/ar together per item, removing this limitation.
export function packageInputToUpdateRow(input: Partial<Package>, existing: PackageRow): Record<string, unknown> {
  const merged: Record<string, unknown> = {};

  if (input.category !== undefined) merged.category = input.category;
  if (input.price !== undefined) merged.price = input.price;
  if (input.continent !== undefined) merged.continent = input.continent;
  if (input.rating !== undefined) merged.rating = input.rating;
  if (input.reviews !== undefined) merged.reviews = input.reviews;
  if (input.featured !== undefined) merged.featured = input.featured;
  if (input.duration !== undefined) merged.duration = input.duration;
  if (input.image !== undefined) merged.image = input.image;
  if (input.groupSize !== undefined) merged.group_size = input.groupSize;
  if (input.meals !== undefined) merged.meals = input.meals;
  if (input.accommodation !== undefined) merged.accommodation = input.accommodation;
  if (input.itineraryFileUrl !== undefined) merged.itinerary_file_url = input.itineraryFileUrl;

  if (input.title !== undefined) {
    merged.title_en = input.title;
    merged.title_ar = existing.title_ar;
  }
  if (input.description !== undefined) {
    merged.description_en = input.description;
    merged.description_ar = existing.description_ar;
  }
  if (input.location !== undefined) {
    merged.location_en = input.location;
    merged.location_ar = existing.location_ar;
  }

  if (input.includes !== undefined) {
    merged.includes = input.includes.map((en, i) => ({ en, ar: existing.includes[i]?.ar ?? "" }));
  }
  if (input.exclusions !== undefined) {
    merged.exclusions = input.exclusions.map((en, i) => ({ en, ar: existing.exclusions[i]?.ar ?? "" }));
  }
  if (input.cancellationPolicy !== undefined) {
    merged.cancellation_policy = input.cancellationPolicy.map((en, i) => ({
      en,
      ar: existing.cancellation_policy[i]?.ar ?? "",
    }));
  }
  if (input.pricing !== undefined) merged.pricing = input.pricing;
  if (input.offerPricing !== undefined) merged.offer_pricing = input.offerPricing;

  if (input.itinerary !== undefined) {
    merged.itinerary = input.itinerary.map((day, i) => {
      const existingDay = existing.itinerary[i];
      return {
        day: day.day,
        title: { en: day.title, ar: existingDay?.title.ar ?? "" },
        desc: { en: day.desc, ar: existingDay?.desc.ar ?? "" },
        highlights: (day.highlights ?? []).map((en, j) => ({
          en,
          ar: existingDay?.highlights[j]?.ar ?? "",
        })),
        images: day.images,
      };
    });
  }

  if (input.departureDates !== undefined) {
    merged.departure_dates = input.departureDates.map((dep, i) => {
      const existingDep = existing.departure_dates[i];
      return {
        id: dep.id,
        date: dep.date,
        adult: dep.adult,
        single: dep.single,
        child611: dep.child611,
        child25: dep.child25,
        infant: dep.infant,
        seats: { en: dep.seats, ar: existingDep?.seats.ar ?? "" },
        urgency: dep.urgency,
      };
    });
  }

  if (input.flights !== undefined) merged.flights = input.flights;

  if (input.hotels !== undefined) {
    merged.hotels = input.hotels.map((hotel, i) => {
      const existingHotel = existing.hotels[i];
      return {
        name: hotel.name,
        rating: hotel.rating,
        location: hotel.location,
        nights: hotel.nights,
        checkIn: hotel.checkIn,
        checkOut: hotel.checkOut,
        roomType: hotel.roomType !== undefined ? { en: hotel.roomType, ar: existingHotel?.roomType?.ar ?? "" } : undefined,
        description:
          hotel.description !== undefined
            ? { en: hotel.description, ar: existingHotel?.description?.ar ?? "" }
            : undefined,
        image: hotel.image,
        badge: hotel.badge !== undefined ? { en: hotel.badge, ar: existingHotel?.badge?.ar ?? "" } : undefined,
        amenities:
          hotel.amenities !== undefined
            ? hotel.amenities.map((en, j) => ({ en, ar: existingHotel?.amenities?.[j]?.ar ?? "" }))
            : undefined,
      };
    });
  }

  if (input.optionalTours !== undefined) {
    merged.optional_tours = input.optionalTours.map((tour, i) => {
      const existingTour = existing.optional_tours[i];
      return {
        id: tour.id,
        title: { en: tour.title, ar: existingTour?.title.ar ?? "" },
        tag: tour.tag,
        desc: { en: tour.desc, ar: existingTour?.desc.ar ?? "" },
        adult: tour.adult,
        single: tour.single,
        child611: tour.child611,
        child25: tour.child25,
        infant: tour.infant,
        images: tour.images,
      };
    });
  }

  return merged;
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm test -- src/lib/packages/mappers.test.ts`
Expected: all tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/packages/
git commit -m "feat: add bilingual package row types and mappers"
```

---

### Task 4: Packages repository

**Files:**
- Create: `src/lib/packages-repository.ts`
- Create: `src/lib/packages-repository.test.ts`

**Interfaces:**
- Consumes: `createAdminClient` from `src/lib/supabase/admin.ts` (Plan 1); `rowToPackage`, `rowToAdminPackage`, `packageInputToInsertRow`, `packageInputToUpdateRow` from `src/lib/packages/mappers.ts` (Task 3); `PackageRow` from `src/lib/packages/types.ts` (Task 3).
- Produces: `packagesRepository` object with `getAll(locale)`, `getByCategory(category, locale)`, `getById(id, locale)`, `create(input)`, `update(id, input)`, `delete(id)`, `toggleFeatured(id)` — consumed by every page/API route in Tasks 6–13. Admin code gets the English view by passing `locale: "en"` to the same public functions — there is no separate "raw" read path.

- [ ] **Step 1: Write the failing tests**

```ts
// src/lib/packages-repository.test.ts
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
    selectMock.mockReturnValue({ eq: eqMock });
    updateMock.mockReturnValue({ eq: () => ({ select: selectMock }) });

    const result = await packagesRepository.toggleFeatured(1);
    expect(result.featured).toBe(true);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- src/lib/packages-repository.test.ts`
Expected: FAIL — `Cannot find module './packages-repository'`.

- [ ] **Step 3: Implement the repository**

```ts
// src/lib/packages-repository.ts
import { createAdminClient } from "@/lib/supabase/admin";
import { rowToPackage, rowToAdminPackage, packageInputToInsertRow, packageInputToUpdateRow } from "@/lib/packages/mappers";
import type { PackageRow } from "@/lib/packages/types";
import type { Package } from "@/types/package";

const TABLE = "packages";

async function fetchRowById(id: number): Promise<PackageRow | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from(TABLE).select("*").eq("id", id).single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`Failed to fetch package ${id}: ${error.message}`);
  }

  return data as PackageRow;
}

export const packagesRepository = {
  async getAll(locale: "en" | "ar"): Promise<Package[]> {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from(TABLE).select("*").order("id", { ascending: true });

    if (error) throw new Error(`Failed to fetch packages: ${error.message}`);

    return (data as PackageRow[]).map((row) => rowToPackage(row, locale));
  },

  async getByCategory(category: string, locale: "en" | "ar"): Promise<Package[]> {
    const supabase = createAdminClient();

    if (category === "all") {
      return this.getAll(locale);
    }

    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .eq("category", category)
      .order("id", { ascending: true });

    if (error) throw new Error(`Failed to fetch packages for category ${category}: ${error.message}`);

    return (data as PackageRow[]).map((row) => rowToPackage(row, locale));
  },

  async getById(id: number, locale: "en" | "ar"): Promise<Package | null> {
    const row = await fetchRowById(id);
    return row ? rowToPackage(row, locale) : null;
  },

  async create(input: Omit<Package, "id">): Promise<Package> {
    const supabase = createAdminClient();
    const insertRow = packageInputToInsertRow(input);

    const { data, error } = await supabase.from(TABLE).insert(insertRow).select().single();

    if (error) throw new Error(`Failed to create package: ${error.message}`);

    return rowToAdminPackage(data as PackageRow);
  },

  async update(id: number, input: Partial<Package>): Promise<Package> {
    const existing = await fetchRowById(id);
    if (!existing) {
      throw new Error(`Package with ID ${id} not found.`);
    }

    const supabase = createAdminClient();
    const updateRow = packageInputToUpdateRow(input, existing);

    const { data, error } = await supabase.from(TABLE).update(updateRow).eq("id", id).select().single();

    if (error) throw new Error(`Failed to update package ${id}: ${error.message}`);

    return rowToAdminPackage(data as PackageRow);
  },

  async delete(id: number): Promise<boolean> {
    const supabase = createAdminClient();
    const { error } = await supabase.from(TABLE).delete().eq("id", id);

    if (error) throw new Error(`Failed to delete package ${id}: ${error.message}`);

    return true;
  },

  async toggleFeatured(id: number): Promise<Package> {
    const existing = await fetchRowById(id);
    if (!existing) {
      throw new Error(`Package with ID ${id} not found.`);
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from(TABLE)
      .update({ featured: !existing.featured })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(`Failed to toggle featured for package ${id}: ${error.message}`);

    return rowToAdminPackage(data as PackageRow);
  },
};
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- src/lib/packages-repository.test.ts`
Expected: all tests PASS.

- [ ] **Step 5: Run the full suite and commit**

Run: `npm test` → expect all tests across the repo PASS.

```bash
git add src/lib/packages-repository.ts src/lib/packages-repository.test.ts
git commit -m "feat: add packages repository"
```

---

### Task 5: Seed script

**Files:**
- Create: `scripts/seed-packages.mjs`

**Interfaces:**
- Consumes: `src/data/packages.json` (still present at this point in the plan — deleted only in Task 14).

- [ ] **Step 1: Write the seed script**

```js
// scripts/seed-packages.mjs
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envFile = readFileSync(path.resolve(__dirname, "../.env.local"), "utf-8");
  const env = {};
  for (const line of envFile.split("\n")) {
    const match = line.match(/^([A-Z_]+)=(.*)$/);
    if (match) env[match[1]] = match[2];
  }
  return env;
}

function toBilingual(en) {
  return { en, ar: "" };
}

function mapPackageToRow(pkg) {
  return {
    category: pkg.category,
    price: pkg.price,
    continent: pkg.continent,
    rating: pkg.rating,
    reviews: pkg.reviews,
    featured: pkg.featured,
    duration: pkg.duration,
    image: pkg.image,
    group_size: pkg.groupSize ?? null,
    meals: pkg.meals ?? null,
    accommodation: pkg.accommodation ?? null,
    itinerary_file_url: pkg.itineraryFileUrl ?? null,
    title_en: pkg.title,
    title_ar: null,
    description_en: pkg.description,
    description_ar: null,
    location_en: pkg.location,
    location_ar: null,
    includes: (pkg.includes ?? []).map(toBilingual),
    exclusions: (pkg.exclusions ?? []).map(toBilingual),
    cancellation_policy: (pkg.cancellationPolicy ?? []).map(toBilingual),
    pricing: pkg.pricing ?? null,
    offer_pricing: pkg.offerPricing ?? null,
    itinerary: (pkg.itinerary ?? []).map((day) => ({
      day: day.day,
      title: toBilingual(day.title),
      desc: toBilingual(day.desc),
      highlights: (day.highlights ?? []).map(toBilingual),
      images: day.images,
    })),
    departure_dates: (pkg.departureDates ?? []).map((dep) => ({
      id: dep.id,
      date: dep.date,
      adult: dep.adult,
      single: dep.single,
      child611: dep.child611,
      child25: dep.child25,
      infant: dep.infant,
      seats: toBilingual(dep.seats),
      urgency: dep.urgency,
    })),
    flights: pkg.flights ?? [],
    hotels: (pkg.hotels ?? []).map((hotel) => ({
      name: hotel.name,
      rating: hotel.rating,
      location: hotel.location,
      nights: hotel.nights,
      checkIn: hotel.checkIn,
      checkOut: hotel.checkOut,
      roomType: hotel.roomType !== undefined ? toBilingual(hotel.roomType) : undefined,
      description: hotel.description !== undefined ? toBilingual(hotel.description) : undefined,
      image: hotel.image,
      badge: hotel.badge !== undefined ? toBilingual(hotel.badge) : undefined,
      amenities: hotel.amenities !== undefined ? hotel.amenities.map(toBilingual) : undefined,
    })),
    optional_tours: (pkg.optionalTours ?? []).map((tour) => ({
      id: tour.id,
      title: toBilingual(tour.title),
      tag: tour.tag,
      desc: toBilingual(tour.desc),
      adult: tour.adult,
      single: tour.single,
      child611: tour.child611,
      child25: tour.child25,
      infant: tour.infant,
      images: tour.images,
    })),
  };
}

async function main() {
  const env = loadEnv();
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { count, error: countError } = await supabase.from("packages").select("*", { count: "exact", head: true });
  if (countError) {
    console.error("Failed to check existing packages:", countError);
    process.exit(1);
  }
  if (count && count > 0) {
    console.log(`packages table already has ${count} rows — skipping seed to avoid duplicates.`);
    process.exit(0);
  }

  const packagesJsonPath = path.resolve(__dirname, "../src/data/packages.json");
  const packages = JSON.parse(readFileSync(packagesJsonPath, "utf-8"));
  const rows = packages.map(mapPackageToRow);

  const { data, error } = await supabase.from("packages").insert(rows).select("id, title_en");
  if (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }

  console.log(`Seeded ${data.length} packages:`);
  for (const row of data) {
    console.log(`  - #${row.id}: ${row.title_en}`);
  }
}

main();
```

- [ ] **Step 2: Run it against the real project**

```bash
node scripts/seed-packages.mjs
```

Expected: prints a list of seeded packages (or a message that the table already has rows, if run twice).

- [ ] **Step 3: Verify in the dashboard**

Check **Table Editor → packages** in the Supabase dashboard — row count should match `src/data/packages.json`'s package count.

- [ ] **Step 4: Commit**

```bash
git add scripts/seed-packages.mjs
git commit -m "feat: add one-time packages seed script"
```

---

### Task 6: Public API routes

**Files:**
- Modify: `src/app/api/packages/route.ts`
- Create: `src/app/api/packages/[id]/route.ts`
- Create: `src/app/api/packages/[id]/feature/route.ts`

**Interfaces:**
- Consumes: `packagesRepository` (Task 4), `requireAdminSession`, `UnauthorizedError` from `src/lib/admin-auth.ts` (Plan 1).
- Produces: the HTTP API surface consumed by `CategoryPackagesTable` (Task 13) and the admin dashboard (Task 12).

- [ ] **Step 1: Install zod**

```bash
npm install zod
```

- [ ] **Step 2: Write a shared package input schema**

```ts
// src/lib/packages/schema.ts
import { z } from "zod";

const packagePriceSchema = z.object({
  adult: z.number(),
  stag: z.number(),
  child0to1: z.number(),
  child2to5: z.number(),
  child6to12: z.number(),
});

const itineraryDaySchema = z.object({
  day: z.number(),
  title: z.string(),
  desc: z.string(),
  highlights: z.array(z.string()),
  images: z.array(z.string()).optional(),
});

const departureDateSchema = z.object({
  id: z.string(),
  date: z.string(),
  adult: z.number(),
  single: z.number(),
  child611: z.number(),
  child25: z.number(),
  infant: z.number(),
  seats: z.string(),
  urgency: z.enum(["red", "amber", "green"]),
});

const flightDetailsSchema = z.object({
  type: z.string(),
  airline: z.string(),
  flightNo: z.string().optional(),
  from: z.string().optional(),
  fromCity: z.string().optional(),
  to: z.string().optional(),
  toCity: z.string().optional(),
  departure: z.string(),
  arrival: z.string(),
  duration: z.string(),
  class: z.string().optional(),
  date: z.string().optional(),
});

const hotelDetailsSchema = z.object({
  name: z.string(),
  rating: z.number(),
  location: z.string(),
  nights: z.number(),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  roomType: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  badge: z.string().optional(),
  amenities: z.array(z.string()).optional(),
});

const optionalTourSchema = z.object({
  id: z.string(),
  title: z.string(),
  tag: z.enum(["Mandatory", "Optional"]),
  desc: z.string(),
  adult: z.number(),
  single: z.number(),
  child611: z.number(),
  child25: z.number(),
  infant: z.number(),
  images: z.array(z.string()),
});

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

- [ ] **Step 3: Replace `src/app/api/packages/route.ts`**

Current content reads `allPackages` directly and supports `?id=`/`?category=` on GET only. Replace the entire file with:

```ts
// src/app/api/packages/route.ts
import { NextResponse } from "next/server";
import { packagesRepository } from "@/lib/packages-repository";
import { requireAdminSession, UnauthorizedError } from "@/lib/admin-auth";
import { packageInputSchema } from "@/lib/packages/schema";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? "all";
  const locale = searchParams.get("locale") === "ar" ? "ar" : "en";

  const packages = await packagesRepository.getByCategory(category, locale);

  return NextResponse.json({ packages });
}

export async function POST(request: Request) {
  try {
    await requireAdminSession();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw error;
  }

  const body = await request.json();
  const parsed = packageInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid package data", details: parsed.error.flatten() }, { status: 400 });
  }

  const created = await packagesRepository.create(parsed.data);
  return NextResponse.json(created, { status: 201 });
}
```

- [ ] **Step 4: Create `src/app/api/packages/[id]/route.ts`**

```ts
// src/app/api/packages/[id]/route.ts
import { NextResponse } from "next/server";
import { packagesRepository } from "@/lib/packages-repository";
import { requireAdminSession, UnauthorizedError } from "@/lib/admin-auth";
import { packageUpdateSchema } from "@/lib/packages/schema";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") === "ar" ? "ar" : "en";

  const pkg = await packagesRepository.getById(Number(id), locale);

  if (!pkg) {
    return NextResponse.json({ error: "Package not found" }, { status: 404 });
  }

  return NextResponse.json(pkg);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminSession();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw error;
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = packageUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid package data", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const updated = await packagesRepository.update(Number(id), parsed.data);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Package not found" }, { status: 404 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminSession();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw error;
  }

  const { id } = await params;
  await packagesRepository.delete(Number(id));

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 5: Create `src/app/api/packages/[id]/feature/route.ts`**

```ts
// src/app/api/packages/[id]/feature/route.ts
import { NextResponse } from "next/server";
import { packagesRepository } from "@/lib/packages-repository";
import { requireAdminSession, UnauthorizedError } from "@/lib/admin-auth";

export async function PATCH(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminSession();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw error;
  }

  const { id } = await params;

  try {
    const updated = await packagesRepository.toggleFeatured(Number(id));
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Package not found" }, { status: 404 });
  }
}
```

- [ ] **Step 6: Verify**

Run: `npx tsc --noEmit` → expect no errors.
Run: `npm run build` → expect the route list to include `/api/packages`, `/api/packages/[id]`, `/api/packages/[id]/feature`.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json src/lib/packages/schema.ts src/app/api/packages/
git commit -m "feat: add public/admin package API routes"
```

---

### Task 7: `CommonListingPage` + its 3 callers — locale wiring

**Files:**
- Modify: `src/components/packages/CommonListingPage.tsx`
- Modify: `src/app/[locale]/holiday-packages/page.tsx`
- Modify: `src/app/[locale]/fixed-departures/page.tsx`
- Modify: `src/app/[locale]/packages/page.tsx`

**Interfaces:**
- Consumes: `packagesRepository.getByCategory(category, locale)` (Task 4).

- [ ] **Step 1: Replace `CommonListingPage.tsx`**

```tsx
// src/components/packages/CommonListingPage.tsx
import React from "react";
import { PackageListingLayout } from "@/components/packages/PackageListingLayout";
import { packagesRepository } from "@/lib/packages-repository";

interface CommonListingPageProps {
  category: string;
  title: string;
  subtitle: string;
  badgeText: string;
  bgImage: string;
  locale: string;
}

export default async function CommonListingPage({
  category,
  title,
  subtitle,
  badgeText,
  bgImage,
  locale,
}: CommonListingPageProps) {
  const resolvedLocale = locale === "ar" ? "ar" : "en";
  const packages = await packagesRepository.getByCategory(category, resolvedLocale);

  return (
    <PackageListingLayout
      title={title}
      subtitle={subtitle}
      badgeText={badgeText}
      bgImage={bgImage}
      packages={packages}
    />
  );
}
```

- [ ] **Step 2: Replace `src/app/[locale]/holiday-packages/page.tsx`**

```tsx
import React from "react";
import CommonListingPage from "@/components/packages/CommonListingPage";

export default async function PackagesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <CommonListingPage
      category="holidays"
      title="Holiday Packages"
      subtitle="Find the perfect holiday package tailored to your sense of adventure"
      badgeText="Curated Experiences"
      bgImage="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2400&auto=format&fit=crop"
      locale={locale}
    />
  );
}
```

- [ ] **Step 3: Replace `src/app/[locale]/fixed-departures/page.tsx`**

```tsx
import React from "react";
import CommonListingPage from "@/components/packages/CommonListingPage";

export default async function FixedDeparturesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <CommonListingPage
      category="fixed-departure"
      title="Fixed Departures"
      subtitle="Explore our curated group tours with guaranteed departure dates."
      badgeText="Group Tours"
      bgImage="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2400&auto=format&fit=crop"
      locale={locale}
    />
  );
}
```

- [ ] **Step 4: Replace `src/app/[locale]/packages/page.tsx`**

```tsx
import React from "react";
import CommonListingPage from "@/components/packages/CommonListingPage";

export default async function PackagesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <CommonListingPage
      category="all"
      title="All Destinations & Packages"
      subtitle="Explore our entire collection of tours, medical trips, and vacations globally."
      badgeText="Explore All"
      bgImage="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2400&auto=format&fit=crop"
      locale={locale}
    />
  );
}
```

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit` → expect no errors (some may remain from files not yet migrated in later tasks — only fix errors in the 4 files touched by this task).

- [ ] **Step 6: Commit**

```bash
git add src/components/packages/CommonListingPage.tsx src/app/\[locale\]/holiday-packages/page.tsx src/app/\[locale\]/fixed-departures/page.tsx src/app/\[locale\]/packages/page.tsx
git commit -m "feat: wire CommonListingPage and its callers to the packages repository"
```

---

### Task 8: Package detail page — locale + repository swap

**Files:**
- Modify: `src/app/[locale]/packages/[id]/page.tsx`

**Interfaces:**
- Consumes: `packagesRepository.getById(id, locale)` (Task 4).

- [ ] **Step 1: Replace the file**

```tsx
import { packagesRepository } from "@/lib/packages-repository";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import PackageDetailClient from "./PackageDetailClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}): Promise<Metadata> {
  const { id, locale } = await params;
  const resolvedLocale = locale === "ar" ? "ar" : "en";
  const pkg = await packagesRepository.getById(Number(id), resolvedLocale);

  if (!pkg) {
    return {
      title: "Package Not Found",
    };
  }

  return {
    title: `${pkg.title} | Premium Travel`,
    description: pkg.description,
    openGraph: {
      title: pkg.title,
      description: pkg.description,
      images: [pkg.image],
    },
  };
}

export default async function PackageDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  const resolvedLocale = locale === "ar" ? "ar" : "en";
  const pkg = await packagesRepository.getById(Number(id), resolvedLocale);

  if (!pkg) {
    notFound();
  }

  return <PackageDetailClient pkg={pkg} />;
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit` → no errors in this file.

- [ ] **Step 3: Commit**

```bash
git add "src/app/[locale]/packages/[id]/page.tsx"
git commit -m "feat: wire package detail page to the packages repository"
```

---

### Task 9: Cruise-packages reconciliation

**Files:**
- Modify: `src/app/[locale]/cruise-packages/page.tsx`

**Interfaces:**
- Consumes: `CommonListingPage` (Task 7).

- [ ] **Step 1: Replace the file**

Current content manually filters `allPackages` and renders `PackageListingLayout` directly (a `"use client"` component with an unused `useTranslations()` call). Replace entirely with:

```tsx
import React from "react";
import CommonListingPage from "@/components/packages/CommonListingPage";

export default async function CruisePackagesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <CommonListingPage
      category="cruise"
      title="Cruise Packages"
      subtitle="Sail through crystal clear waters and discover amazing ports of call"
      badgeText="Luxury Cruises"
      bgImage="https://images.unsplash.com/photo-1569931728440-1488c2cfd34b?q=80&w=2400&auto=format&fit=crop"
      locale={locale}
    />
  );
}
```

This drops the `"use client"` directive (no longer needed — nothing in this page requires client-side interactivity) and the manual `allPackages` filtering, now matching the same pattern as `holiday-packages`/`fixed-departures`/`packages`.

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit` → no errors in this file.
Run: `npm run build` → `/cruise-packages` route still present.

- [ ] **Step 3: Commit**

```bash
git add "src/app/[locale]/cruise-packages/page.tsx"
git commit -m "refactor: reconcile cruise-packages with the shared listing pattern"
```

---

### Task 10: Medical-tourism split + locale

**Files:**
- Create: `src/app/[locale]/medical-tourism/MedicalTourismClient.tsx`
- Modify: `src/app/[locale]/medical-tourism/page.tsx`

**Interfaces:**
- Consumes: `packagesRepository.getByCategory("medical", locale)` (Task 4).
- Produces: `MedicalTourismClient` accepting `{ packages: Package[] }`, matching the existing `KeralaTourismClient` pattern.

- [ ] **Step 1: Create `MedicalTourismClient.tsx`**

Copy the ENTIRE current content of `src/app/[locale]/medical-tourism/page.tsx` into the new file, with exactly these changes:
- Rename the component from `MedicalTourismPage` to `MedicalTourismClient`.
- Add `import type { Package } from "@/types/package";` to the imports.
- Change the component signature to accept a `packages` prop: `export default function MedicalTourismClient({ packages }: { packages: Package[] })`.
- Remove the line `import { allPackages } from "@/data/packages";`.
- Remove the line `const medicalPackages = allPackages.filter(p => p.id >= 21 && p.id <= 23);` (this was the hardcoded ID-range hack being fixed).
- Everywhere the old file referenced `medicalPackages`, use `packages` instead (this appears once, in the `{medicalPackages.map((pkg, idx) => (` line inside "Section 4: Curated Packages Section" — change to `{packages.map((pkg, idx) => (`).

The rest of the ~600-line file (hero section, storytelling sections, carousel, testimonials, CTA) is copied verbatim — no other changes.

- [ ] **Step 2: Replace `medical-tourism/page.tsx`**

```tsx
import React from "react";
import { packagesRepository } from "@/lib/packages-repository";
import { MedicalTourismClient } from "./MedicalTourismClient";

export default async function MedicalTourismPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const resolvedLocale = locale === "ar" ? "ar" : "en";
  const packages = await packagesRepository.getByCategory("medical", resolvedLocale);

  return <MedicalTourismClient packages={packages} />;
}
```

Note: `MedicalTourismClient` must be exported as a named export (`export function MedicalTourismClient(...)`, not `export default`) to match this import — adjust Step 1's component declaration accordingly: `export function MedicalTourismClient({ packages }: { packages: Package[] }) { ... }`.

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit` → no errors in these two files.
Run: `npm run build` → `/medical-tourism` route still present, no new errors.

- [ ] **Step 4: Commit**

```bash
git add "src/app/[locale]/medical-tourism/"
git commit -m "refactor: split medical-tourism into server wrapper + client component, fix hardcoded ID-range filter"
```

---

### Task 11: Kerala-tourism — locale + repository

**Files:**
- Modify: `src/app/[locale]/kerala-tourism/page.tsx`

**Interfaces:**
- Consumes: `packagesRepository.getByCategory(category, locale)` (Task 4).

- [ ] **Step 1: Replace the file**

Current logic combines `category === "kerala"` packages with `category === "medical"` packages located in Kerala. Preserve this exact filter semantics:

```tsx
import React from "react";
import { packagesRepository } from "@/lib/packages-repository";
import { KeralaTourismClient } from "@/components/packages/KeralaTourismClient";

export default async function KeralaTourismPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const resolvedLocale = locale === "ar" ? "ar" : "en";

  const [keralaCategoryPackages, medicalPackages] = await Promise.all([
    packagesRepository.getByCategory("kerala", resolvedLocale),
    packagesRepository.getByCategory("medical", resolvedLocale),
  ]);

  const keralaPackages = [
    ...keralaCategoryPackages,
    ...medicalPackages.filter((pkg) => pkg.location.toLowerCase().includes("kerala")),
  ];

  return <KeralaTourismClient packages={keralaPackages} />;
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit` → no errors in this file.
Run: `npm run build` → `/kerala-tourism` route still present.

- [ ] **Step 3: Commit**

```bash
git add "src/app/[locale]/kerala-tourism/page.tsx"
git commit -m "feat: wire kerala-tourism to the packages repository"
```

---

### Task 12: Admin dashboard overview — TanStack Query

**Files:**
- Modify: `src/app/[locale]/(admin)/admin/(dashboard)/page.tsx`

**Interfaces:**
- Consumes: `useQuery` from `@tanstack/react-query` (Task 1); `GET /api/packages` (Task 6).

- [ ] **Step 1: Replace the imports and data-fetching**

Current (lines 1–48):
```tsx
"use client";

import React, { useEffect, useState } from "react";
import DashboardShell from "@/components/admin/DashboardShell";
import { packagesService } from "@/lib/packages-service";
import { Package } from "@/types/package";
import { Link } from "@/i18n/navigation";
import { 
  Layers, 
  Star, 
  DollarSign, 
  Award, 
  Palmtree, 
  Ship, 
  Stethoscope, 
  MapPin, 
  CalendarDays,
  Plus,
  ArrowRight,
  TrendingUp,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboardPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  // Load packages data
  useEffect(() => {
    async function loadData() {
      try {
        const data = await packagesService.getAll();
        setPackages(data);
      } catch (err) {
        console.error("Failed to load packages in dashboard", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    // Listen to changes in packages to reload
    window.addEventListener("packages_updated", loadData);
    return () => window.removeEventListener("packages_updated", loadData);
  }, []);
```

Replace with:
```tsx
"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardShell from "@/components/admin/DashboardShell";
import { Package } from "@/types/package";
import { Link } from "@/i18n/navigation";
import { 
  Layers, 
  Star, 
  DollarSign, 
  Award, 
  Palmtree, 
  Ship, 
  Stethoscope, 
  MapPin, 
  CalendarDays,
  Plus,
  ArrowRight,
  TrendingUp,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboardPage() {
  const { data: packages = [], isLoading: loading } = useQuery({
    queryKey: ["packages"],
    queryFn: async () => {
      const res = await fetch("/api/packages");
      if (!res.ok) throw new Error("Failed to load packages");
      const json = await res.json();
      return json.packages as Package[];
    },
  });
```

- [ ] **Step 2: Fix the now-stale Activity Log copy**

Find (around line 290):
```tsx
                      <p className="font-bold text-slate-200">Loaded package storage database</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Static packages.json mounted inside LocalStorage</p>
```

Replace with:
```tsx
                      <p className="font-bold text-slate-200">Loaded package data from Supabase</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Live packages table, fetched via the packages API</p>
```

Find (around line 306):
```tsx
                      <p className="font-bold text-slate-200">Auth Gate Secured</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Session cookies and LocalStorage validated</p>
```

Replace with:
```tsx
                      <p className="font-bold text-slate-200">Auth Gate Secured</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Supabase Auth session verified server-side</p>
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit` → no errors in this file.
Run: `npm run build` → `/admin` route still present.

- [ ] **Step 4: Commit**

```bash
git add "src/app/[locale]/(admin)/admin/(dashboard)/page.tsx"
git commit -m "feat: wire admin dashboard overview to TanStack Query"
```

---

### Task 13: `CategoryPackagesTable` — TanStack Query + fetch

**Files:**
- Modify: `src/components/admin/CategoryPackagesTable.tsx`

**Interfaces:**
- Consumes: `useQuery`/`useMutation`/`useQueryClient` from `@tanstack/react-query` (Task 1); `GET/POST /api/packages`, `PATCH/DELETE /api/packages/[id]`, `PATCH /api/packages/[id]/feature` (Task 6).
- No shape changes: still uses `Package`, `Omit<Package, "id">`, `Partial<Package>` exactly as today.

- [ ] **Step 1: Replace the import and remove local list-state**

Current (lines 1–46):
```tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  Package, PackagePrice, ItineraryDay, FlightDetails,
  HotelDetails, DepartureDate, OptionalTour,
} from "@/types/package";
import { packagesService } from "@/lib/packages-service";
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

export default function CategoryPackagesTable({ category, pageTitle }: Props) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
```

Replace with:
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

async function fetchPackages(category: string): Promise<Package[]> {
  const res = await fetch(`/api/packages?category=${encodeURIComponent(category)}`);
  if (!res.ok) throw new Error("Failed to load packages");
  const json = await res.json();
  return json.packages as Package[];
}

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
```

- [ ] **Step 2: Remove the old `loading`/`submitting` state and `loadPackages`/`useEffect`**

Find and remove these lines entirely (they're superseded by the `useQuery`/`useMutation` hooks added in Step 1):
```tsx
  const [isFormOpen, setIsFormOpen] = useState(false);
```
— keep this line and everything below it in the original state block EXCEPT these two, which must be deleted:
```tsx
  const [submitting, setSubmitting] = useState(false);
```
(now derived from the mutations, not local state)

And remove this entire block (previously right after the form-field `useState` declarations):
```tsx
  const loadPackages = async () => {
    setLoading(true);
    try { setPackages(await packagesService.getByCategory(category)); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadPackages(); }, [category]);
```

- [ ] **Step 3: Replace the four handler functions**

Current:
```tsx
  const handleToggleFeatured = async (id: number) => {
    try {
      await packagesService.toggleFeatured(id);
      setPackages(prev => prev.map(p => p.id === id ? { ...p, featured: !p.featured } : p));
    } catch (e) { console.error(e); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formPrice || !formLocation || !formDuration) { setActiveTab("basic"); return; }
    setSubmitting(true);
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
      if (editingPackage) await packagesService.update(editingPackage.id, data);
      else await packagesService.create(data);
      setIsFormOpen(false);
      await loadPackages();
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPackage) return;
    setSubmitting(true);
    try { await packagesService.delete(deletingPackage.id); setIsDeleteOpen(false); await loadPackages(); }
    catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };
```

Replace with:
```tsx
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

- [ ] **Step 4: Verify no other `packagesService` references remain**

```bash
grep -n "packagesService" src/components/admin/CategoryPackagesTable.tsx
```

Expected: no output.

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit` → no errors in this file.
Run: `npm run build` → compiles successfully.

- [ ] **Step 6: Commit**

```bash
git add src/components/admin/CategoryPackagesTable.tsx
git commit -m "feat: wire CategoryPackagesTable to TanStack Query and the packages API"
```

---

### Task 14: Cleanup — delete the fake data layer

**Files:**
- Delete: `src/data/packages.ts`
- Delete: `src/data/packages.json`
- Delete: `src/lib/api.ts`
- Delete: `src/lib/packages-service.ts`

- [ ] **Step 1: Confirm nothing still imports the files to be deleted**

```bash
grep -rl "from \"@/data/packages\"\|from '@/data/packages'" src/
grep -rl "from \"@/lib/api\"\|from '@/lib/api'" src/
grep -rl "from \"@/lib/packages-service\"\|from '@/lib/packages-service'" src/
```

Expected: no output for any of the three (every consumer was migrated in Tasks 7–13).

- [ ] **Step 2: Delete the files**

```bash
rm src/data/packages.ts src/data/packages.json src/lib/api.ts src/lib/packages-service.ts
```

- [ ] **Step 3: Verify the build**

Run: `npm run build` → expect the same route list as before, no new errors.

- [ ] **Step 4: Run the full test suite**

Run: `npm test` → expect all tests to pass (no test references the deleted files, since Task 4's tests mock the Supabase client, not the old data files).

- [ ] **Step 5: Commit**

```bash
git add -A src/data src/lib/api.ts src/lib/packages-service.ts
git commit -m "chore: remove fake packages data layer, superseded by the repository"
```

---

## Self-Review Notes

- **Spec coverage:** Data Model's `packages` table → Task 2. Repository layer replacing `lib/api.ts`/`lib/packages-service.ts` → Tasks 3–4. Seed script → Task 5. API surface (`GET/POST /api/packages`, `GET/PATCH/DELETE /api/packages/[id]`, `PATCH /api/packages/[id]/feature`) → Task 6. TanStack Query for admin dashboard and CRUD table → Tasks 1, 12, 13. Public consumer migration (including the two previously-flagged fragilities: cruise-packages' inconsistent implementation, medical-tourism's hardcoded ID range) → Tasks 7–11. Cleanup of the old fake layer → Task 14. Bilingual schema per the user's explicit "full depth" decision → Task 3's row types and mappers. The bilingual *admin authoring UI* (double-language inputs) is explicitly out of scope here — Plan 2b.
- **Placeholder scan:** no TBD/TODO markers. Every step contains complete, runnable code.
- **Type consistency:** `packagesRepository`'s public functions (`getAll`, `getByCategory`, `getById`) consistently take `locale: "en" | "ar"` as their last parameter and return `Package`/`Package[]` (the unchanged public type) across Tasks 4, 7, 8, 9, 10, 11. Admin code gets the English view by calling these same functions with `locale: "en"` — there is no separate "raw" read path, which was removed during self-review as dead code (nothing in the plan called it; the admin CRUD table's `fetch` to `/api/packages` already gets English by omitting the `locale` query param, which the route defaults to `"en"`). Mutation functions (`create`, `update`, `toggleFeatured`) consistently return the English-resolved `Package` view via `rowToAdminPackage`, and are only reachable through the Route Handlers from Task 6 (admin-gated via `requireAdminSession`), never called directly from client code — matching Plan 1's "browser never talks to Supabase directly" architecture.
