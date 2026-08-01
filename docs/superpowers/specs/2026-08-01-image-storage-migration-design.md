# Image Storage Migration Design

**Date:** 2026-08-01
**Status:** Approved for planning

## Context

The site currently has no consistent image hosting story. Images live in three disconnected places:

1. **Local brand assets** in `public/images/` and `public/svg/` — genuinely owned files (logos, a couple of hero photos), shipped as part of the Next.js build/deploy bundle.
2. **Hardcoded `images.unsplash.com` URLs directly in ~17 page/component files' JSX** (~101 occurrences) — third-party stock photos used for decorative hero/background sections on marketing pages.
3. **The `packages` table's `image` column and nested JSONB fields** (hotel images, itinerary photos, tour images) — also currently Unsplash URLs, stored as row data and editable via the admin dashboard's plain-text image-URL fields.

The user wants all three migrated to Supabase Storage. Given the combined size, this is split into three sub-projects, following the same pattern used for the earlier Supabase backend work:

- **Plan A** (this spec covers only this) — Storage infrastructure + local brand assets.
- **Plan B** — Marketing page Unsplash URL migration (~101 hardcoded URLs across 17 files).
- **Plan C** — Package image migration (hotels/itinerary/tours) + real file-upload capability added to the admin dashboard (currently a paste-a-URL text field; the goal is a file picker that uploads directly to Storage).

Plan A is a prerequisite for Plan C: its upload utility is reused directly by Plan C's admin upload feature.

## Current-State Survey

Of the 6 image files in `public/images/`, 5 are actually referenced in code:

| File | Referenced in |
|---|---|
| `Logo.png` | `src/components/layout/Header.tsx:132` |
| `Logo2.png` | `src/components/layout/Header.tsx:62`, `src/components/layout/Footer.tsx:47` |
| `travel-pic.png` | `src/components/layout/Footer.tsx:33` |
| `munnar-hillstation.jpg` | `src/components/packages/KeralaTourismClient.tsx:786` |
| `theyyam-image.webp` | `src/components/packages/KeralaTourismClient.tsx:1029` |

`summer-holidays.png` is unreferenced anywhere in `src/` — dead weight, deleted rather than migrated.

`public/svg/*` (logo SVG, social-media icons) and `public/*.svg` (Next.js/Vercel default icons) are explicitly **out of scope** — these are small, bundled UI-chrome assets (icons used inline in the app shell), not content imagery, and migrating them adds indirection for no real benefit.

`public/lottie-json.json` (79MB animation config) and `public/whatsapp-avatar.webm` (video) are unrelated to this project (not images) and untouched.

## Goals

- Create a Supabase Storage bucket (`site-assets`) with public-read access, matching these images' current public visibility, and no permissive write policies (writes only via the service-role client, consistent with this app's established RLS-as-defense-in-depth pattern).
- Build a reusable `uploadAsset` utility, generic enough for Plan C's admin file-upload feature to reuse without modification.
- Migrate the 5 actively-referenced local images to Storage, update their 6 call sites, delete the local files (and the dead `summer-holidays.png`) once verified.

## Non-Goals

- Migrating `public/svg/*` icons or the Next.js default SVGs (out of scope, see above).
- Anything from Plan B (marketing-page Unsplash URLs) or Plan C (package images, admin upload UI) — separate specs/plans.
- Image optimization/transformation (resizing, format conversion) — Supabase Storage serves the files as-is; `next/image`'s existing optimization pipeline (already configured via `remotePatterns`) continues to handle resizing at render time, unchanged.

## Architecture

- **Bucket:** `site-assets`, public bucket, created via a new Supabase migration (`supabase/migrations/<timestamp>_create_site_assets_bucket.sql`), same convention as the `packages`/`enquiries` table migrations. Folder-prefixed for organization: this plan populates `brand/`; Plan B/C will later add `marketing/` and `packages/` under the same bucket.
- **Upload utility:** `src/lib/storage.ts`, exporting `uploadAsset(bucket: string, path: string, file: Buffer, contentType: string): Promise<string>`. Uses the existing `createAdminClient()` (service-role, server-only — never called from client code). Calls `.storage.from(bucket).upload(path, file, { contentType, upsert: true })`, then `.storage.from(bucket).getPublicUrl(path)`, returning the resulting public URL string. Throws a plain `Error` with a descriptive message on any Storage failure.
- **Migration script:** `scripts/migrate-brand-assets.ts`, a one-time Node/TS script (run via `npx tsx scripts/migrate-brand-assets.ts` or equivalent, matching how the earlier packages seed script was invoked). Reads each of the 5 referenced files from `public/images/`, infers `contentType` from file extension, calls `uploadAsset("site-assets", "brand/<filename>", ...)` for each, and prints a table of `local path → new public URL` for manual verification. `upsert: true` in the utility makes this safely re-runnable.
- **Constants file:** `src/lib/brand-assets.ts`, exporting named URL constants (`LOGO_URL`, `LOGO_SECONDARY_URL`, `TRAVEL_PIC_URL`, `MUNNAR_HILLSTATION_URL`, `THEYYAM_IMAGE_URL`), each built from `NEXT_PUBLIC_SUPABASE_URL` + the known bucket/path — so the 6 JSX call sites import a name instead of repeating a long Storage URL, and there's one place to update if the bucket or project ever changes.
- **Config:** `next.config.ts`'s `images.remotePatterns` gains an entry for the Supabase project's storage hostname (`<project-ref>.supabase.co`).

## Storage Bucket & Access Policies

```sql
insert into storage.buckets (id, name, public) values ('site-assets', 'site-assets', true);

create policy "site-assets are publicly readable"
  on storage.objects for select
  using (bucket_id = 'site-assets');
```

No `insert`/`update`/`delete` policies are created for `storage.objects` on this bucket — matching the `enquiries` table's zero-permissive-write-policy pattern. All uploads go through the service-role client (this plan's migration script now; Plan C's admin upload API route later), which bypasses RLS entirely. A public (anon/authenticated) client can read objects in this bucket but can never write, update, or delete them.

## Testing

`uploadAsset` gets a Vitest unit test mocking the Supabase client's `.storage.from().upload()`/`.getPublicUrl()` chain — same mocking style as `packages-repository.test.ts` (mock `createAdminClient`, assert on the constructed call and the returned URL). Covers: successful upload returning the expected public URL, and a thrown error on upload failure. This is the only unit-testable piece — the migration script itself is a thin, one-time orchestrator over 5 real local files and isn't unit tested, matching the precedent set by the earlier packages seed script (also untested, also a one-time operational script).

## Error Handling

`uploadAsset` throws a plain `Error` with a descriptive message (`Failed to upload ${path} to ${bucket}: ${error.message}`) on any Storage failure — consistent with every other repository/utility function in this codebase. The migration script does not catch or retry: it's a one-time manual operation run directly by a developer, not a production request path, so letting an error crash the script with a non-zero exit is the correct, simplest behavior — no graceful degradation needed here.

## Rollout

After the migration script runs successfully and the printed URLs are manually spot-checked (e.g. opening each in a browser), the 6 JSX call sites are updated to import from `src/lib/brand-assets.ts` instead of using local `/images/...` paths, `next.config.ts` is updated, and finally the 5 migrated files plus the dead `summer-holidays.png` are deleted from `public/images/`. This ordering (migrate → verify → switch references → delete originals) means the site is never broken mid-migration — the old local files keep working right up until the code that references them is switched over.
