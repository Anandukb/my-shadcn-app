# Enquiry Capture Design (Plan 3)

**Date:** 2026-07-30
**Status:** Approved for planning

## Context

Four forms across the site fake success with a `setTimeout` and never call a real API: `contact`, `hotel-booking`, the `hotels` landing page's search modal, and the global `BookNowDialog`. No enquiry submitted through the site today reaches anyone. This is Plan 3 of 3 from the original Supabase backend design (`docs/superpowers/specs/2026-07-14-supabase-backend-design.md`), which specified a unified `enquiries` table and a `POST /api/enquiries` endpoint but left rate limiting, the notification mechanism, and the exact `details` shapes as open/follow-up questions. This spec resolves those and adds one fix found during the current-state survey: `BookNowDialog` receives `packageId`/`packageTitle` as props but currently never includes them in the submitted data, so a "Book Now" click from a specific package's page can't be tied back to that package.

Given the combined size of the backend (migration, repository, rate limiting, email) and frontend (four forms) work, this is split into two sub-plans, following the same pattern as the packages work (data layer, then UI wiring):

- **Plan 3a — Enquiries data layer & API**
- **Plan 3b — Wire the four forms**

This spec covers both; each gets its own implementation plan document.

## Current-State Survey

Field inventory for the four forms, confirmed by reading each file directly:

- **`contact`** (`src/app/[locale]/contact/page.tsx`): `name`, `email`, `phone`, `service` (dropdown: `holiday`/`fixed-departure`/`visa`/`medical`/`custom`), `message`. All required except `service` (has a default).
- **`hotel-booking`** (`src/app/[locale]/hotel-booking/HotelBookingClient.tsx`): `destination`, `checkInDate`, `checkOutDate`, `rooms`, `adults`, `children`, `fullName`, `email`, `phone`, `nationality`, `specialRequests`.
- **`hotels` search modal** (`src/app/[locale]/hotels/HotelsLandingClient.tsx`): a two-step flow — a search form (`destination`, `checkInDate`, `checkOutDate`, `rooms`, `adults`, `children`) opens a modal asking for `email`/`phone`, then merges both into one submission. No `name` field exists in this flow.
- **`BookNowDialog`** (`src/components/layout/BookNowDialog.tsx`, global via `BookNowProvider`/`useBookNow()`): `name`, `phone`, `email` (optional), `destination`, `travelDate`, `travelers`, `message` (optional). Receives `packageId`/`packageTitle` via its `initial` prop but currently only seeds `destination`/`travelDate` into form state — `packageId` is dropped entirely, never reaching the fake submit.

No partial `enquiries` table, repository, or route exists yet — confirmed by grep.

## Goals

- Real, persistent capture of all four forms into a single `enquiries` table.
- Basic rate limiting on the public, unauthenticated `POST /api/enquiries` endpoint (flagged as launch-blocking in the original spec).
- An email notification sent when an enquiry is submitted, since the original spec's "leads inbox" UI is explicitly out of scope and without a notification, a captured-but-unseen enquiry doesn't actually reach anyone.
- Fix `BookNowDialog` to thread `packageId` through to the submitted enquiry.

## Non-Goals

- Admin "leads inbox" UI (unchanged from the original spec — the `GET /api/enquiries` endpoint exists for this future work, but no UI consumes it here).
- Any change to the four forms' existing visual design, field set, or client-side validation beyond replacing the fake submit with a real one and adding error feedback (previously impossible, since a `setTimeout` can't fail).
- SMS/WhatsApp notifications — email only.
- Building an actual Resend account/domain verification — that's an operational step the user does outside this codebase; the code is written to work once it's configured, via env vars.

## Architecture

**Plan 3a (backend):**
- `supabase/migrations/<timestamp>_create_enquiries.sql` — `enquiries` table + `enquiry_rate_limits` table, RLS enabled on both as defense-in-depth (not the primary authorization boundary, consistent with the rest of this app).
- `src/lib/enquiries-repository.ts` — `create(input): Promise<Enquiry>`, the only file that touches Supabase for this feature, mirroring `packages-repository.ts`'s repository-only-access pattern.
- `src/lib/enquiries/schema.ts` — Zod discriminated union (`type` selects the `details` shape) validating `POST /api/enquiries` request bodies.
- `src/lib/rate-limit.ts` — `checkRateLimit(ipAddress): Promise<boolean>`, a small standalone function so the rate-limit mechanism is swappable later without touching the route handler.
- `src/lib/notify-enquiry.ts` — `sendEnquiryNotification(enquiry): Promise<void>`, wraps Resend, isolated so the provider is swappable and so failures can be swallowed in one place.
- `src/app/api/enquiries/route.ts` — `POST` (public) and `GET` (admin-gated via `requireAdminSession()`, per the original spec, unconsumed by any UI in this plan).
- New env vars: `RESEND_API_KEY`, `ENQUIRY_NOTIFY_EMAIL` (both server-only).

**Plan 3b (frontend):**
- `contact/page.tsx`, `HotelBookingClient.tsx`, `HotelsLandingClient.tsx`, `BookNowDialog.tsx` each get a `useMutation` calling `POST /api/enquiries`, replacing their `setTimeout` fakes. Existing UI (spinners, success screens, field layout) is preserved; only the submit body changes, plus each form gains visible error feedback for the first time (a fake submit could never fail).
- `BookNowDialog`'s `handleSubmit` includes `initial?.packageId` in the request body when present.

## Data Model

### `enquiries`

| Column | Type | Notes |
|---|---|---|
| `id` | `bigint identity` (PK) | |
| `type` | `text` | CHECK-constrained: `contact` \| `hotel_booking` \| `hotel_search` \| `book_now` |
| `name` | `text`, nullable | Null for `hotel_search` (that flow never collects a name) |
| `email` | `text` | Required for all four |
| `phone` | `text` | Required for all four |
| `message` | `text`, nullable | Only `contact` and `book_now` collect a message |
| `status` | `text`, default `'new'` | `new` \| `contacted` \| `closed` |
| `package_id` | `bigint` (FK → `packages.id`, nullable) | Set only for `book_now` when opened from a package page |
| `details` | `jsonb` | Form-specific fields, see below |
| `created_at` | `timestamptz`, default `now()` | |

`details` shape per `type` (enforced by the Zod discriminated union, not by separate columns or tables — same JSONB rationale as `packages`, since nothing queries into this data today):

- `contact`: `{ service: string }`
- `hotel_booking`: `{ destination: string, checkInDate: string, checkOutDate: string, rooms: string, adults: string, children: string, nationality: string, specialRequests: string }`
- `hotel_search`: `{ destination: string, checkInDate: string, checkOutDate: string, rooms: string, adults: string, children: string }`
- `book_now`: `{ destination: string, travelDate: string, travelers: string }`

Dates are passed through as the ISO strings the forms already produce (`Date.toISOString()` on the client before submit) — stored as plain `text` inside `details`, not as SQL date columns, consistent with the JSONB-blob approach.

### `enquiry_rate_limits`

| Column | Type | Notes |
|---|---|---|
| `ip_address` | `text` | |
| `window_start` | `timestamptz` | Truncated to the current 10-minute bucket |
| `count` | `int`, default `1` | |

Primary key: `(ip_address, window_start)`. This is a **fixed window**, not sliding: `window_start` is the current wall-clock time floored down to the nearest 10-minute boundary (e.g. requests at 14:03 and 14:09 share the same `window_start` of 14:00; a request at 14:11 starts a new bucket). The route handler upserts (`count = count + 1`) and rejects with `429` if the resulting count for the current window exceeds **5 per IP per 10 minutes**. IP is read from the `x-forwarded-for` request header (set by Vercel and most hosts); if absent, the request is allowed through rather than blocked (fails open — this is a spam deterrent, not a security boundary, so failing open on missing IP info is acceptable).

## Email Notification

`src/lib/notify-enquiry.ts` exports `sendEnquiryNotification(enquiry: Enquiry): Promise<void>`, using the `resend` npm package (new dependency). Called from `POST /api/enquiries` immediately after a successful DB insert, without `await`ing its resolution in a way that blocks the response — the route returns success as soon as the DB insert succeeds. If Resend throws or rejects, the error is caught and logged server-side only; it never surfaces to the client or fails the request, since the `enquiries` row is already the durable record of the lead.

Email content: a plain-text/simple-HTML summary of all submitted fields (type, name, email, phone, message, and the type-specific `details`). Sent to `process.env.ENQUIRY_NOTIFY_EMAIL` (no hardcoded default in code — if unset, `sendEnquiryNotification` no-ops and logs a warning, rather than throwing), from an address like `enquiries@maramholidays.com`. Actually delivering requires the user to create a Resend account, verify a sending domain, and set `RESEND_API_KEY`/`ENQUIRY_NOTIFY_EMAIL` in `.env.local` — this is an operational prerequisite outside this codebase, analogous to the existing Supabase env var setup.

## API Surface

| Endpoint | Access | Purpose |
|---|---|---|
| `POST /api/enquiries` | Public, unauthenticated | Rate-limit check (429 if exceeded) → Zod validate (400 if invalid) → `enquiriesRepository.create` → fire-and-forget notification → `201` with the created row. |
| `GET /api/enquiries` | Admin only (`requireAdminSession()`) | List enquiries — included per the original spec for a future inbox UI; not consumed by any UI in this plan. |

Error shape matches the packages API's established convention: `{ error: string }`, with `details: parsed.error.flatten()` added on 400s.

## Frontend Wiring (Plan 3b)

Each form's existing `setTimeout` fake submit is replaced with a TanStack Query `useMutation` calling `POST /api/enquiries`, matching the pattern already established for the admin dashboard (`CategoryPackagesTable.tsx`). Existing UI — loading spinners, success screens, field layout and client-side `required` validation — is preserved as-is. Each form gains visible error feedback for a failed submission (rate-limited, validation failure, or server error), which was previously impossible since a fake `setTimeout` never fails.

`BookNowDialog`'s `handleSubmit` is updated to include `initial?.packageId` in the request body (mapped to the `enquiries.package_id` column) whenever present, fixing the current gap where it's silently dropped.

## Testing

Consistent with the repo's existing scope boundary (no Jest/Playwright/RTL): Vitest unit tests against a mocked Supabase client for `enquiries-repository.ts` (`create`, including the `package_id` and nullable-`name` cases), a schema test confirming each of the 4 `details` shapes validates under its correct `type` and is rejected under any other `type`, a `rate-limit.ts` test (under/at/over threshold, and the fail-open case for a missing IP), and a `notify-enquiry.ts` test confirming a Resend failure is swallowed rather than thrown, and that an unset `ENQUIRY_NOTIFY_EMAIL` no-ops rather than sending. No new UI/integration test infrastructure.

## Error Handling

Unchanged from the established pattern (Plans 1/2a/2b): Zod `safeParse` → 400; `requireAdminSession()` → 401 (only relevant to the unused `GET` endpoint here); rate limit exceeded → 429; anything else uncaught → 500. `sendEnquiryNotification` failures are explicitly never surfaced as an error — they're logged and swallowed, since the enquiry is already durably saved by the time notification is attempted.

## Security

- `POST /api/enquiries` remains public and unauthenticated by necessity; the rate limit described above is the mitigation, matching the original spec's requirement.
- RLS enabled on both new tables as defense-in-depth, consistent with the rest of this app's stated position that RLS is not the primary authorization boundary — that logic lives in TypeScript in the repository/route handler.
- `RESEND_API_KEY` is server-only, never exposed to client bundles, same handling as the existing Supabase service-role key.
