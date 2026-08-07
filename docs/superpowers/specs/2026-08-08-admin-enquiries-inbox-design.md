# Admin Enquiries Inbox Design

**Date:** 2026-08-08
**Status:** Approved for planning

## Context

The original Supabase backend design (`docs/superpowers/specs/2026-07-14-supabase-backend-design.md`) explicitly deferred the admin "leads inbox" UI as a non-goal, while building the `enquiries` table, repository (`enquiriesRepository.listAll()`), and an admin-gated `GET /api/enquiries` endpoint specifically to make this a small follow-on rather than a redesign. That backend work (Plan 3a) is complete and live — 4 customer-facing forms (contact, hotel-booking, hotel search modal, `BookNowDialog`) already write real enquiries to the database (Plan 3b). This is that follow-on: a page in the admin dashboard to actually view them.

## Goals

- A new admin dashboard page listing all submitted enquiries, newest first.
- Each row shows enough to triage at a glance (name, email, phone, form type, submitted time); clicking a row expands it to show the type-specific details (destination, dates, message, etc.) with proper labels, not raw JSON.
- Zero backend changes — `GET /api/enquiries` and `enquiriesRepository.listAll()` already exist and return exactly what's needed.

## Non-Goals

- Status management (marking an enquiry as "contacted"/"closed") — the `status` column exists in the database but no update path (repository method or endpoint) exists yet, and none is added here. A future, separate follow-on if needed.
- Filtering, search, or pagination — at current volume a plain chronological list is sufficient; `listAll()` has no limit today and this plan doesn't add one.
- Any change to the 4 enquiry-submitting forms themselves.

## Architecture

- **Page**: `src/app/[locale]/(admin)/admin/(dashboard)/enquiries/page.tsx` — a thin wrapper following the exact pattern of every existing category page (`DashboardShell` + a dedicated table component). Protected automatically by the existing `/admin/*` middleware guard (`src/middleware.ts`) — no new auth code.
- **Component**: `src/components/admin/EnquiriesTable.tsx` — fetches via `useQuery(["enquiries"], ...)` against `GET /api/enquiries` (existing, admin-gated, already returns `{ enquiries: Enquiry[] }` ordered newest-first via `enquiriesRepository.listAll()`). Follows `CategoryPackagesTable.tsx`'s established data-fetching, loading/empty/error-state, and styling conventions exactly (same dark dashboard theme, same `extractErrorMessage` helper for error text).
- **Sidebar**: add an "Enquiries" entry to `DashboardShell.tsx`'s `menuItems` array (an `Inbox` icon from `lucide-react`, route `/admin/enquiries`), inserted after "All Packages" and before the category-specific links — matching the existing array's structure exactly (`{ name, href, icon }`).

## Row & Detail Rendering

Each row displays: `name` (or `"—"` when `null`, which happens for `hotel_search` enquiries — the one type that never collects a name), `email`, `phone`, a human-readable type badge (`contact` → "Contact", `hotel_booking` → "Hotel Booking", `hotel_search` → "Hotel Search", `book_now` → "Book Now"), and a relative submission time (e.g. "2 hours ago", computed by a small local helper — no new date library) with the absolute ISO timestamp as a hover title.

Clicking a row expands it to show:
- `message`, when present (only `contact` always has one; `book_now` optionally does).
- The `details` object's fields, each mapped to a readable label by a small per-type formatter (not a single generic "render every key" loop, since key names like `child611`/`child25` aren't self-explanatory):
  - `contact`: Service.
  - `hotel_booking`: Destination, Check-in, Check-out, Rooms, Adults, Children, Nationality, Special Requests.
  - `hotel_search`: Destination, Check-in, Check-out, Rooms, Adults, Children.
  - `book_now`: Destination, Travel Date, Travelers.
- For `book_now` enquiries with a non-null `packageId`: a link to `/admin/packages` (the closest existing catalog view — there's no single per-package admin detail route today) noting which package ID the enquiry references.

## Data Handling & Edge Cases

- **Loading**: a spinner, matching `CategoryPackagesTable.tsx`'s existing loading UI.
- **Empty**: a friendly "No enquiries yet" state.
- **Error**: an inline error banner using the existing `extractErrorMessage(res, fallback)` helper (`src/lib/extract-error-message.ts`), matching the error-handling convention already established across the admin dashboard.
- Dates (`checkInDate`/`checkOutDate`/`travelDate`) inside `details` are stored as the ISO strings the forms produce — rendered as formatted dates (not raw ISO strings) in the expanded view.

## Testing

No new backend code, so no new API/repository tests are needed — `GET /api/enquiries` and `enquiriesRepository.listAll()` are unchanged, already tested in Plan 3a. `EnquiriesTable.tsx` itself gets no dedicated test file, matching `CategoryPackagesTable.tsx`'s own established precedent in this codebase (no component/UI test framework exists here — no Jest/RTL/Playwright).
