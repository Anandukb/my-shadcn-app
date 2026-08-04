# Marketing Image Migration Design (Plan B)

**Date:** 2026-08-04
**Status:** Approved for planning

## Context

This is Plan B of the 3-plan image-storage migration (`docs/superpowers/specs/2026-08-01-image-storage-migration-design.md`). Plan A (already implemented) built the `site-assets` Supabase Storage bucket and a reusable `uploadAsset()` utility, and migrated the 5 local brand images. This plan migrates the ~101 hardcoded `images.unsplash.com` URL occurrences scattered across marketing pages and a couple of adjacent data/template files, re-hosting them on the same `site-assets` bucket under a `marketing/` prefix.

## Current-State Survey

- **101 total occurrences, 64 unique underlying photos** (deduplicated by Unsplash photo ID — the stable segment between `photo-` and `?`; many photos are referenced at 2-3 different widths via query params, e.g. `?w=400` vs `?w=2400`, for the same photo).
- **15 real files** carry these references (down from an initial count of 17 — 2 are dead code, see below):
  - 13 page/component files across marketing pages (`HomeClient.tsx`, `about`, `contact`, `cruise-packages`, `fixed-departures`, `global-visa` x2, `holiday-packages`, `hotels/HotelsLandingClient.tsx`, `medical-tourism/MedicalTourismClient.tsx`, `packages/page.tsx`, `packages/[id]/PackageDetailClient.tsx`, `components/packages/KeralaTourismClient.tsx`, `components/packages/PackageIncludes.tsx`).
  - `src/lib/data/visa.ts` — a static data file (country/visa info), not a page component, but same decorative/non-admin-editable character.
  - `PackageDetailClient.tsx`'s 23 occurrences are entirely inside `buildSharedData()` — hardcoded, templated demo content (same itinerary/hotel photos reused regardless of destination, per `CLAUDE.md`'s existing notes) baked into frontend code, not stored in the `packages` database table.
- **2 dead files** (`src/app/[locale]/global-visa/page copy.tsx`, `global-visa/[country]/page copy.tsx`) — already flagged in `CLAUDE.md` as unreachable duplicates (Next.js only routes `page.tsx`). Deleted rather than migrated.
- **One broken/fragile pattern found and fixed as part of this plan**: `HomeClient.tsx:409` computes a fake avatar URL via `photo-${1500648767791 + i}` (incrementing a fixed Unsplash photo ID by loop index for `i = 0, 1, 2`), which produces incorrect/likely-broken images for most values of `i`. Fixed by pointing at the 3 real testimonial avatar photos already used elsewhere in the same file (`Aisha M.`/`Omar K.`/`Sara L.`, at `HomeClient.tsx:783-785`).
- **Explicitly out of scope**: `src/components/admin/CategoryPackagesTable.tsx:293`'s single hardcoded Unsplash fallback URL (the default image used when an admin creates a package without providing one). This is admin/package-creation territory, not marketing content — it naturally belongs with Plan C's package-image and upload-UI work, where the whole default-image behavior may be revisited anyway.

## Goals

- Re-host all 64 unique marketing/decorative photos on the `site-assets` bucket (Plan A's bucket, `marketing/` prefix), reusing `uploadAsset()` as-is.
- Delete the 2 dead `page copy.tsx` files.
- Fix `HomeClient.tsx`'s broken fake-avatar loop.
- Zero visual regression: every current call site's `width`/`height`/`fill`/CSS-background usage is preserved; only the underlying URL changes.

## Non-Goals

- `CategoryPackagesTable.tsx`'s package-creation default image URL (Plan C's territory, see above).
- Anything in the `packages` database table's `image`/nested JSONB fields (Plan C).
- Per-size stored variants — a single high-resolution source per photo is stored, and `next/image`'s existing optimizer continues to handle all downsizing at render time, exactly as it does today for the brand assets migrated in Plan A.

## Architecture

- **Migration script** (`scripts/migrate-marketing-images.mjs`, mirroring Plan A's `migrate-brand-assets.mjs` convention — own `.env.local` loader, own bare Supabase client, no `@/` imports): iterates a hardcoded array of the 64 unique photo IDs (compiled via a repo-wide grep+dedup during plan-writing, not discovered at runtime), and for each ID:
  1. `fetch`es `https://images.unsplash.com/photo-${id}?q=80&w=2400&auto=format&fit=crop&fm=jpg` (fixed high resolution matching the largest width any current call site requests, `fm=jpg` forcing a consistent format regardless of what any individual call site's original query params requested).
  2. Reads the response into a `Buffer`.
  3. Calls `uploadAsset("site-assets", `marketing/${id}.jpg`, buffer, "image/jpeg")` (Plan A's existing utility, unmodified).
  4. Prints an `old photo ID → new Storage URL` line for manual verification.
- **URL lookup module** (`src/lib/marketing-images.ts`): exports `marketingImageUrl(photoId: string): string`, computing the same deterministic Storage path pattern as Plan A's `brand-assets.ts` (via `getSupabaseEnv().url` + the fixed `marketing/` prefix + `.jpg`). A single parameterized function rather than 64 named constants — appropriate given the volume, and still centralizes URL construction in one place.
- **Code swap**: every hardcoded `https://images.unsplash.com/photo-<id>?...` literal (regardless of its original query string) across the 15 files is replaced with `marketingImageUrl("<id>")`. Because every call site already carries its own sizing mechanism (`next/image`'s `width`/`height`/`fill` props, or a fixed-size CSS `bg-[url(...)]`), storing one high-res source per photo and swapping the URL requires no per-call-site size logic.
- **`next.config.ts`**: no change needed — Plan A already added the Supabase Storage hostname to `images.remotePatterns`.

## Testing

`marketingImageUrl()` gets a small Vitest unit test asserting its URL construction for a sample photo ID (e.g. confirming the `marketing/<id>.jpg` path and bucket segment appear correctly in the output) — no mocking needed, since it's pure string construction with no Supabase Storage calls of its own (unlike `uploadAsset`, which already has its own test coverage from Plan A). The migration script itself is not unit tested, matching the precedent set by both `scripts/seed-packages.mjs` and Plan A's `migrate-brand-assets.mjs` (one-time operational scripts, not covered).

## Error Handling

Same convention as Plan A: the migration script lets fetch/upload failures crash loudly with a non-zero exit — a one-time manual operation, not a production request path — and prints its full mapping table afterward for manual spot-checking (opening a handful of the resulting URLs directly, same as Plan A's Task 4).

## Rollout

Same ordering discipline as Plan A, extended by one step for the dead-file cleanup: migrate the 64 photos → spot-check a sample of the resulting URLs load (HTTP 200) → swap the 15 files' hardcoded URLs for `marketingImageUrl(...)` calls (including the `HomeClient.tsx` avatar-loop fix) → delete the 2 dead `page copy.tsx` files → final verification (`tsc`, `build`, `lint`, `test`, grep-check for any remaining `images.unsplash.com` reference outside the explicitly out-of-scope `CategoryPackagesTable.tsx` line). The site is never broken mid-migration — the original Unsplash URLs keep working right up until the swap step runs for each file.
