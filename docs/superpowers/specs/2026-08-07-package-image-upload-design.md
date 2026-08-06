# Package Image Upload Design (Plan C)

**Date:** 2026-08-07
**Status:** Approved for planning

## Context

This is Plan C of the 3-plan image-storage migration (`docs/superpowers/specs/2026-08-01-image-storage-migration-design.md`). Plans A (Storage infrastructure + brand assets) and B (marketing page Unsplash migration) are already implemented — the `site-assets` Storage bucket exists live, and `src/lib/storage.ts`'s `uploadAsset(bucket, path, file: Buffer, contentType): Promise<string>` utility exists specifically anticipating reuse here (flagged by Plan A's final review as needing "a one-line `File`→`Buffer` conversion" for admin use, not a rewrite).

The `packages` table's admin form (`src/components/admin/CategoryPackagesTable.tsx`) has 4 image fields, all currently plain-text URL inputs with no upload capability:

| Field | Shape | Current UI |
|---|---|---|
| Package hero image | single URL, `formImage` state | `<Input type="url">` |
| Hotel image | single URL per hotel, `hotel.image` | `<Input>` per hotel |
| Itinerary day photos | comma-separated URL list, `day.images` (up to 3 shown) | `<Input>` with comma-separated value |
| Optional tour photos | comma-separated URL list, `tour.images` (up to 3 shown) | `<Input>` with comma-separated value |

`CategoryPackagesTable.tsx:293` also has a hardcoded Unsplash fallback URL (`image: formImage || "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1200"`), explicitly deferred to this plan by both Plan A and Plan B's designs.

## Goals

- A new admin-gated API route that accepts a file upload and stores it on the `site-assets` bucket (Plan A's bucket) under a new `packages/` prefix.
- A small client-side helper wrapping that route, reused by all 4 image fields' new "Upload" buttons.
- Every one of the 4 image fields gets an "Upload" button alongside its existing URL input — uploading fills/appends the URL field with the result; the URL field stays visible and manually editable as a fallback.
- Remove `CategoryPackagesTable.tsx`'s hardcoded Unsplash fallback and make the Hero Image field required, matching the existing required-field pattern for Title/Price/Location/Duration.

## Non-Goals

- No bulk migration of existing package image URLs — packages keep whatever URLs they currently have (mostly templated Unsplash placeholders, per `CLAUDE.md`'s notes) until an admin manually edits that package and uploads a real photo.
- No deletion/cleanup of orphaned Storage objects when a URL is replaced — matches the existing scope boundary (no such cleanup exists for Plan A/B's assets either).
- No drag-and-drop or multi-file-at-once picker — one file per click, appended for multi-image fields, matching the form's existing one-field-one-value convention.

## Architecture

- **`POST /api/admin/upload-image`** (new route): admin-gated via the existing `requireAdminSession()`/`UnauthorizedError` pattern (`src/lib/admin-auth.ts`, unchanged). Accepts `multipart/form-data` with a single `file` field. Validates:
  - MIME type is one of `image/jpeg`, `image/png`, `image/webp` — 400 otherwise.
  - File size ≤ 5MB — 400 otherwise.
  - Converts the `File` to a `Buffer` via `Buffer.from(await file.arrayBuffer())`, generates a random filename (`crypto.randomUUID()` + the original extension, derived from MIME type — not the package ID, since uploads can happen before a package exists/has an ID), and calls `uploadAsset("site-assets", `packages/${filename}`, buffer, contentType)` (Plan A's existing utility, unmodified).
  - Returns `{ url: string }` (the uploaded file's public Storage URL) on success.
- **`src/lib/upload-image.ts`**: exports `uploadImage(file: File): Promise<string>` — builds a `FormData`, POSTs to `/api/admin/upload-image`, parses the JSON response, returns `url` or throws on a non-2xx response (reusing the same `extractErrorMessage` pattern already established in `src/lib/extract-error-message.ts` for consistent error messages).
- **Form UI** (`CategoryPackagesTable.tsx`): each of the 4 image fields gets a small "Upload" button next to its existing `<Input>`. On file selection: call `uploadImage(file)`, show a loading state on that specific button (a local per-field `uploading` boolean, not a global one — multiple fields must be independently clickable), and on success:
  - Single-image fields (hero, hotel): set the field's existing state directly (same setter the URL input's `onChange` already uses).
  - Multi-image fields (itinerary day, tour): append the new URL to the existing comma-separated value (reusing the same `updateDayImages`/`updateTourImages` setters, called with the old value + `, ` + new URL).
  - On failure: show an inline error message near the button (small local error state per field, mirroring the form's existing `saveError` pattern — not a new UI system).
- **Fallback removal**: `CategoryPackagesTable.tsx:293`'s `image: formImage || "https://images.unsplash.com/..."` becomes `image: formImage`. The Hero Image URL `<Input>` gains `required`, and `handleSave`'s existing manual validation check (`if (!formTitleEn || !formPrice || !formLocationEn || !formDurationEn)`) gains `|| !formImage` alongside the existing checks.

## Error Handling

Same conventions as every other route in this codebase: `requireAdminSession()` → 401; invalid file type/size → 400 with a descriptive `{ error: string }`; any other failure (Storage error, unexpected exception) → uncaught, surfaces as 500. `uploadImage()` on the client throws on any non-2xx response with the parsed error message, caught by the calling field's local error-state handler.

## Testing

- `src/lib/upload-image.test.ts`: mocks `fetch`, covers the success path (returns the parsed `url`) and a thrown-error path (non-2xx response).
- `src/app/api/admin/upload-image/route.test.ts`: mocks `requireAdminSession` and `uploadAsset`, covers: valid file → 200 with `{ url }`; oversized file → 400; wrong MIME type → 400; unauthenticated → 401. Same mocking conventions as this codebase's existing API route tests (no live network/Storage calls).
- No new UI/component test framework — consistent with this repo's existing scope boundary (no Jest/RTL/Playwright anywhere in the project).

## Rollout

Unlike Plan A/B (which staged migrate → verify → switch-references, since they touched existing data), this plan has no existing data to migrate — it's a single cohesive addition: build the route, the client helper, wire the 4 upload buttons, remove the hardcoded fallback, verify end-to-end.
