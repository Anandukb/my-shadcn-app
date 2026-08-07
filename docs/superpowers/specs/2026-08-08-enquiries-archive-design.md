# Enquiries Archive Design

**Date:** 2026-08-08
**Status:** Approved for planning

## Context

The Admin Enquiries Inbox (`docs/superpowers/specs/2026-08-08-admin-enquiries-inbox-design.md`) shipped as a read-only, unfiltered list — its own design explicitly deferred any status/visibility management as a non-goal. As real enquiries accumulate, admins need a way to get handled/irrelevant ones out of the default view without deleting them. This adds that: an "archive" action per enquiry, plus a way to still see archived ones when needed.

## Goals

- Each enquiry row gets an Archive/Unarchive action, one click, no confirmation dialog.
- Archived enquiries are hidden from the default list view.
- A "Show archived" toggle reveals them again, with an Unarchive action to bring them back.

## Non-Goals

- Any change to the existing `status` column (new/contacted/closed) or its semantics — archiving is an orthogonal visibility flag, not a lifecycle stage. An enquiry can be archived regardless of its status.
- Deleting enquiries — archiving never removes data, only hides it from the default view.
- Search, filtering by type/date, or pagination — still out of scope, per the original inbox design's non-goals.
- Bulk archive/unarchive — one enquiry at a time, matching the existing one-row-at-a-time interaction model (row expand, package link, etc.).

## Architecture

- **Migration**: new file `supabase/migrations/<timestamp>_add_enquiries_archived.sql` — `alter table public.enquiries add column archived boolean not null default false;`. Existing rows default to unarchived; no backfill needed.
- **Types** (`src/lib/enquiries/types.ts`, modified): add `archived: boolean` to both `EnquiryRow` and `Enquiry`, mapped through `rowToEnquiry`.
- **Repository** (`src/lib/enquiries-repository.ts`, modified): add an `EnquiryNotFoundError` class (mirrors `PackageNotFoundError` in `src/lib/packages-repository.ts`) and a `toggleArchived(id: number): Promise<Enquiry>` method that fetches the row, flips `archived`, updates, and returns the mapped `Enquiry` — directly mirrors `packagesRepository.toggleFeatured`.
- **API route** (new file `src/app/api/enquiries/[id]/archive/route.ts`): `PATCH`, no request body, admin-gated via `requireAdminSession()` (same 401 pattern as every other admin route in this codebase), calls `enquiriesRepository.toggleArchived(id)`, returns the updated enquiry as JSON, 404 if the id doesn't exist. Directly mirrors `src/app/api/packages/[id]/feature/route.ts`.
- **Frontend** (`src/components/admin/EnquiriesTable.tsx`, modified):
  - A "Show archived" toggle in the table header area, default off.
  - Filtering: `enquiries.filter(e => showArchived || !e.archived)` applied client-side — `GET /api/enquiries` is unchanged and still returns every enquiry (archived or not) in one call.
  - An Archive/Unarchive icon button (lucide-react `Archive` / `ArchiveRestore`) on each collapsed row, next to the existing type badge/timestamp.
  - A `toggleArchivedMutation` via `useMutation`, calling `PATCH /api/enquiries/${id}/archive` and invalidating the `["enquiries"]` query on success — same shape as `CategoryPackagesTable.tsx`'s existing `toggleFeaturedMutation`.
  - The archive button calls `event.stopPropagation()` so clicking it doesn't also toggle the row's expand/collapse state.

## Data Handling & Edge Cases

- When "Show archived" is on, archived rows render with reduced opacity so they're visually distinct from active ones; their action button reads "Unarchive" instead of "Archive."
- No optimistic update — matches `toggleFeaturedMutation`'s existing pattern exactly: mutate, then invalidate and refetch on success. No new error-UI pattern introduced; mutation failure surfaces the same way `CategoryPackagesTable.tsx`'s existing mutations already do (silently fails, list stays in its pre-mutation state since no invalidation fired).
- 404 (enquiry not found — not currently reachable since there's no delete path, but handled defensively to match `toggleFeatured`'s existing check) returns a JSON error response from the route; the frontend mutation's failure path matches the pattern above.

## Testing

- `enquiriesRepository.toggleArchived` gets a unit test in `src/lib/enquiries-repository.test.ts`, alongside the existing `create`/`listAll` tests, following the exact mocking pattern already used by `packagesRepository.toggleFeatured`'s test in `src/lib/packages-repository.test.ts`: verifies the flag flips `false → true`, and throws `EnquiryNotFoundError` for a nonexistent id.
- No dedicated test for the new API route — matches this codebase's established convention (only `src/app/api/admin/upload-image/route.test.ts` exists as a route-level test in the whole `src/app/api` tree; every other route, including the `packages/[id]/feature` route this one mirrors, has no route test, relying on repository-level tests for logic coverage).
- No component test for the `EnquiriesTable.tsx` changes — matches this file's own already-established no-test-file precedent from the original inbox implementation.
