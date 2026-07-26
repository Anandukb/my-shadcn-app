# Bilingual Admin Authoring UI Design

**Date:** 2026-07-27
**Status:** Approved for planning

## Context

Plan 2a (`docs/superpowers/plans/2026-07-16-packages-data-layer.md`) built a fully bilingual-shaped `packages` schema and repository, but deliberately kept the admin authoring form single-language (English only) — the repository transparently wrapped English-only admin input into the bilingual DB shape, preserving any existing Arabic content on update rather than exposing it for editing. This is Plan 2b: the actual bilingual authoring UI that lets admins view and edit both languages.

This is part of **Plan 2 of 3** for the Supabase backend design (`docs/superpowers/specs/2026-07-14-supabase-backend-design.md`). Depends on Plan 2a, already implemented.

## Scope

**In scope — exactly the fields already bilingual in Plan 2a's schema, plus 4 fields promoted to bilingual by this plan:**
- Already bilingual (Plan 2a): `title`, `description`, `location` (top-level columns); `includes`, `exclusions`, `cancellationPolicy` (JSONB string lists); itinerary day `title`/`desc`/`highlights`; hotel `roomType`/`description`/`badge`/`amenities`; optional tour `title`/`desc`; departure-date `seats`.
- Newly bilingual (this plan): `duration`, `groupSize`, `meals`, `accommodation` — plain single-language text columns today, promoted to `_en`/`_ar` pairs via a small migration, backfilling `_en` from existing data.

**Explicitly out of scope:** `category`, `price`, `image`, `continent`, `rating`, `reviews`, `featured`, `itineraryFileUrl`, `pricing`/`offerPricing` (numeric only), `flights` (proper nouns/codes, not prose), hotel `name`/`location`/`nights`/`checkIn`/`checkOut`/`image`, optional tour `tag`/pricing fields/`images`, departure-date `date`/pricing/`urgency`. None of these carry translatable prose.

**Arabic remains optional everywhere** — an admin can save a package with English filled and Arabic blank; `rowToPackage`'s existing fallback-to-English behavior (Plan 2a) is unchanged and continues to cover this. Only English fields keep today's required-field validation (Title, Price, Location, Duration).

## Data Layer Changes

### Migration
Alter `packages`: add `duration_en`, `duration_ar`, `group_size_en`, `group_size_ar`, `meals_en`, `meals_ar`, `accommodation_en`, `accommodation_ar`. Backfill each `_en` column from the corresponding existing column (`duration`, `group_size`, `meals`, `accommodation`) for all current rows — `duration` is `NOT NULL` today so every row has a real value to copy; `group_size`/`meals`/`accommodation` are nullable, so a `NULL` source copies to a `NULL` `_en` value, same as today. Drop the four old columns afterward. `duration_en` stays `NOT NULL`; the other three `_en` columns and all four `_ar` columns stay nullable.

### Types (`src/lib/packages/types.ts`)
- `PackageRow` gains the 4 new bilingual column pairs, dropping the 4 old single-language ones.
- New `PackageAdminInput` type: the bilingual admin-facing input/output shape — every top-level bilingual field as `BilingualText`, nested arrays reusing the *existing* `PackageRowItineraryDay`/`PackageRowHotel`/`PackageRowOptionalTour`/`PackageRowDepartureDate` types from Plan 2a directly (they're already bilingual-shaped, built for exactly this). Omits server-managed fields (`id`, `created_at`, `updated_at`, `created_by`, `updated_by`).

### Mappers (`src/lib/packages/mappers.ts`)
- `rowToPackage(row, locale)`: extended so the 4 newly-bilingual fields go through the same `pick()`/fallback-to-English resolution already used for `title`/`description`/`location` — same pattern, no new logic.
- `rowToAdminInput(row: PackageRow): PackageAdminInput` (new): returns the full bilingual view for populating the edit form — unlike Plan 2a's `rowToAdminPackage` (English-only), this exposes both languages.
- `packageAdminInputToRow(input: PackageAdminInput | Partial<PackageAdminInput>)`: flattens bilingual top-level fields into `_en`/`_ar` columns; JSONB-shaped nested fields pass through as-is (already row-shaped).
- Update-merge logic (per explicit decision): kept, but simplified. Since the form now submits complete bilingual objects rather than English-only, the merge no longer needs Plan 2a's index-by-index "preserve this array item's Arabic side" reconciliation — it becomes a plain "was this top-level key present in the request" merge against the existing row, then flattened via `packageAdminInputToRow`.

### Repository (`src/lib/packages-repository.ts`)
- `getAdminInputById(id: number): Promise<PackageAdminInput | null>` (new) — full bilingual fetch, used only when opening the edit dialog. The admin table's list view keeps using Plan 2a's `getByCategory(category, "en")` (English-resolved) — no need to load Arabic just to render a list.
- `create(input: PackageAdminInput): Promise<Package>` and `update(id, input: Partial<PackageAdminInput>): Promise<Package>` now take the bilingual admin shape directly instead of Plan 2a's single-language `Package`-based input.
- `toggleFeatured`/`delete` unchanged (content-free mutations, unaffected by this plan).

### API
- New admin-only route `GET /api/packages/[id]/admin` — gated by `requireAdminSession()` (Plan 1), returns `PackageAdminInput`.
- `POST /api/packages` / `PATCH /api/packages/[id]` — zod schemas updated to validate the bilingual shape (`BilingualText` object per translatable field, Arabic side optional/nullable).

## Form UI (`src/components/admin/CategoryPackagesTable.tsx`)

- **Global language toggle**: `editingLocale: "en" | "ar"` state, rendered as a pill switch at the top of the create/edit dialog, above the tab list — visible and effective across all 7 tabs.
- **Field state**: bilingual fields double into `_en`/`_ar` state pairs (e.g. `formTitleEn`/`formTitleAr`), matching the component's existing one-`useState`-per-field convention. Two small new wrapper components — `<BilingualInput>` (wrapping `Input`) and `<BilingualTextarea>` (wrapping `Textarea`) — each take `locale`, `valueEn`, `valueAr`, `onChangeEn`, `onChangeAr` and resolve the displayed value/`onChange` from `editingLocale`, so individual field JSX doesn't repeat that branch.
- **Nested arrays** (itinerary days, hotels, optional tours): bilingual sub-fields stored directly in the `{en, ar}` shape the repository types already define, so form state doubles as the `PackageAdminInput` payload with no reshaping before submit. `highlights`/`amenities` stay comma-separated-text inputs, one per language, paired by array index (same convention as Plan 2a's `includes`/`exclusions`).
- **Edit-open data loading**: `handleOpenEdit` now triggers a `useQuery` against `GET /api/packages/[id]/admin` (enabled only while the dialog is open for an existing package), populating every doubled form field once it resolves, with a loading state in the dialog meanwhile. Create (no existing package) skips this — starts with empty bilingual fields.
- **Tabs touched**: Basic (title, location, duration), Details (description, includes, exclusions, groupSize, meals, accommodation, cancellationPolicy), Itinerary (day title/desc/highlights), Hotels (roomType/description/badge/amenities), Optional Tours (title/desc), Departures (seats — fixed-departure only). Pricing and Flights tabs are untouched.

## Testing

Extends Plan 2a's existing Vitest coverage (mocked Supabase client) rather than introducing new test infrastructure:
- `rowToAdminInput` and `packageAdminInputToRow` get unit tests analogous to Plan 2a's `rowToPackage`/`packageInputToInsertRow` tests.
- The simplified merge logic gets a test confirming an update that omits a top-level key preserves the existing row's value for that key (both languages), and a test confirming an included key overwrites both languages from the submitted bilingual value.
- No new UI/component test framework — consistent with this repo's existing scope boundary (no Jest/Playwright/RTL anywhere in the project).

## Error Handling

Unchanged from Plan 2a's established pattern: zod `safeParse` → 400 on invalid shape; `requireAdminSession()` → 401; `PackageNotFoundError` → 404; anything else → uncaught, surfaces as 500 (Plan 2a's final review explicitly assessed this as an acceptable, low-risk gap for a fully admin-only, internally-used API).
