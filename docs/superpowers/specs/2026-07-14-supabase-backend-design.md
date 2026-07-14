# Supabase Backend Design

**Date:** 2026-07-14
**Status:** Approved for planning

## Context

The site (Maram Holidays, Next.js 16 App Router) currently has no real backend:

- Package/tour catalog data lives in two disconnected static sources — `src/data/packages.ts` (read by `src/lib/api.ts` and the GET-only `src/app/api/packages/route.ts`) and `src/data/packages.json` (seeded once into `localStorage["maram_packages"]`, read/written only by `src/lib/packages-service.ts`, which the admin dashboard's CRUD table uses). Admin edits never reach the static files or the API route — they only ever persist in the editing browser's `localStorage`.
- Admin login (`/admin/login`) checks a hardcoded email/password and sets `localStorage.admin_auth = "true"`; every dashboard page's `AdminGuard` checks the same flag client-side. There is no server-side or middleware protection at all, and no real write API exists to secure in the first place.
- Every customer-facing form — `contact`, `hotel-booking`, the `hotels` landing search modal, and the global `BookNowDialog` — fakes success with a `setTimeout` and never calls a real API or notification service. No enquiry submitted through the site today reaches anyone.

This design replaces all three of the above with a Supabase-backed system, scoped as a single coherent backend rather than three separate efforts, per the user's decision to design them together.

## Goals

- Real, persistent package catalog data with working admin CRUD.
- Real admin authentication (multiple admin accounts) with server-enforced authorization.
- Real enquiry capture for all four currently-fake forms.
- Bilingual (English/Arabic) content support for package data from day one, matching the site's existing `next-intl` `en`/`ar` locales.
- **Backend portability**: the application must not become tightly coupled to Supabase specifically. If the project moves to a different backend later, that should require rewriting an internal implementation layer, not every page/component that touches data.

## Non-goals (for this design)

- A full admin "leads inbox" UI for viewing submitted enquiries (the `enquiries` table and a `GET /api/enquiries` endpoint are included so this is a small follow-on, not a redesign, but building that UI is out of scope here).
- Normalizing every nested package field (itinerary, flights, hotels, etc.) into separate relational tables — see Data Model rationale.
- Automated end-to-end/integration test infrastructure beyond a minimal unit-test setup for the repository layer.
- Rate-limiting implementation specifics (provider choice, exact thresholds) — flagged as required before launch, but the concrete mechanism is an implementation-time decision.

## Architecture

The browser and Server Components never call Supabase directly. All data access goes through an internal **repository layer** in TypeScript:

- `lib/packages-repository.ts` — replaces both `lib/api.ts` and `lib/packages-service.ts`. Exposes `getAll()`, `getByCategory(category)`, `getById(id)`, `create(input)`, `update(id, input)`, `delete(id)`, `toggleFeatured(id)` — matching today's `packagesService` shape so calling code (`CommonListingPage`, `PackageDetailClient`, `CategoryPackagesTable`, admin overview page, `cruise-packages`, `medical-tourism`, `kerala-tourism`) needs minimal changes.
- `lib/enquiries-repository.ts` — new. `create(input)` for the four currently-fake forms; `listAll()` reserved for a future admin inbox (non-goal above, but the shape exists).
- `lib/admin-auth.ts` — wraps Supabase Auth session verification, used by Route Handlers and a server-side admin guard.

These modules call Supabase using the **service-role key**, server-side only (inside Route Handlers and Server Components — never bundled into client code). Row Level Security is enabled on every table as defense-in-depth, but it is explicitly **not** the primary authorization boundary: authorization and validation logic lives in TypeScript in the repository/Route Handlers. This is the deliberate choice that satisfies the portability goal — RLS policies and Postgres triggers are Supabase/Postgres-specific and would not carry over to a different backend, whereas TypeScript logic does.

## Data Model

### `packages`

Scalar/filterable fields as real columns (these are queried, sorted, or filtered on today):

| Column | Type | Notes |
|---|---|---|
| `id` | `bigint identity` (PK) | Kept numeric to match existing `/packages/[id]` links. |
| `category` | `text` | CHECK-constrained to `cruise \| fixed-departure \| holidays \| kerala \| medical` — the five values in use today (fixes today's unvalidated `category: string`). `"all"` is a UI-only concept (used by `/admin/packages` to mean "no filter") and is never itself stored as a category value. |
| `slug` | `text unique` | Reserved for future clean URLs; not required to be used immediately. |
| `price` | `numeric` | |
| `continent` | `text` | |
| `rating` | `numeric`, `reviews` | `int` |
| `featured` | `boolean` | |
| `created_at` / `updated_at` | `timestamptz` | |
| `created_by` / `updated_by` | `uuid` (FK → `profiles.id`) | Audit trail, enabled by multiple admin accounts. |

Bilingual scalar content as column pairs: `title_en` / `title_ar`, `description_en` / `description_ar`, `location_en` / `location_ar`.

Deeply-nested, admin-authored content stays as **JSONB columns**, each holding bilingual text sub-fields (`{en, ar}`) where relevant: `includes`, `pricing`, `offer_pricing`, `flights`, `hotels`, `itinerary`, `departure_dates` (retains the existing `urgency: red|amber|green` field), `optional_tours`, `cancellation_policy`, `group_size`, `meals`, `accommodation`, `exclusions`.

**Rationale for JSONB over full normalization:** nothing in the app queries into this nested content today (e.g. "packages containing a specific flight number," "day 3 of the itinerary") — it is always read and written as one whole blob per package, closely matching the existing `Package` TypeScript type. Normalizing into six additional child tables would add migration and join complexity with no corresponding query benefit. If a future requirement needs to query into this data, that specific slice can be normalized then.

### `enquiries`

One unified table for all four forms (contact, hotel-booking, hotel-search modal, book-now), rather than one table per form:

| Column | Type | Notes |
|---|---|---|
| `id` | `bigint identity` (PK) | |
| `type` | `text` | Discriminator: `contact` \| `hotel_booking` \| `hotel_search` \| `book_now`. |
| `name`, `email`, `phone`, `message` | `text` | Common fields present across all four forms. |
| `status` | `text`, default `'new'` | `new` \| `contacted` \| `closed` — supports a future triage UI. |
| `package_id` | `bigint` (FK → `packages.id`, nullable) | Set for `book_now` enquiries tied to a specific package. |
| `details` | `jsonb` | Form-specific extra fields (destination, check-in/out, rooms, adults/children, nationality, special requests, service, etc.) — kept as JSONB rather than one column per possible field across four different forms, which would produce a mostly-null sparse table. |
| `created_at` | `timestamptz` | |

### `profiles`

1:1 with Supabase's built-in `auth.users`:

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` (PK, FK → `auth.users.id`) | |
| `full_name` | `text` | |
| `role` | `text`, default `'admin'` | Every account created today is an admin; this column is the seam for adding non-admin roles later without a schema redesign. |

## Auth

Admin login moves to real Supabase Auth (`signInWithPassword`) via `@supabase/ssr`, with sessions stored in httpOnly cookies rather than `localStorage.admin_auth`. This replaces:

- The hardcoded credential check in `/admin/login`.
- `AdminGuard`'s client-only `localStorage` check — replaced by a server-side session check (in the `(admin)` route group's layout, or middleware) that verifies the session before any dashboard page renders. This closes the gap where anyone could bypass admin auth via devtools.

Multiple admin accounts are supported from day one (per the scoping decision); all accounts are equally privileged for now (`profiles.role = 'admin'`), with `role` reserved for future differentiation.

## API Surface

Route Handlers under `src/app/api/`:

| Endpoint | Access | Purpose |
|---|---|---|
| `GET /api/packages` | Public | List/filter packages (by category), calls the repository. |
| `GET /api/packages/[id]` | Public | Single package detail. |
| `POST /api/packages` | Admin only | Create — checks Supabase Auth session via `lib/admin-auth.ts` before calling the repository. |
| `PATCH /api/packages/[id]` | Admin only | Update. |
| `DELETE /api/packages/[id]` | Admin only | Delete. |
| `PATCH /api/packages/[id]/feature` | Admin only | Toggle featured flag. |
| `POST /api/enquiries` | Public, unauthenticated | Create an enquiry; `type` in the body selects which form submitted it. |
| `GET /api/enquiries` | Admin only | List enquiries (repository method exists; endpoint/UI consumption is a non-goal here — see above). |

Public package reads happen server-side in Server Components calling the repository directly (no client-side fetch, no extra network hop) — this preserves SSR/SEO characteristics for the marketing pages. The Route Handlers above exist for client-initiated operations: admin dashboard mutations and the public enquiry forms.

## Client-side data fetching: TanStack Query

Public marketing/listing pages remain server-rendered and do not use TanStack Query — there is no client-side query to manage there. It is used in exactly two places where client components currently hand-roll fetch/mutation state:

1. **Admin dashboard** (`CategoryPackagesTable`, admin overview page): `useQuery(['packages', category])` for the list; `useMutation` for create/update/delete/toggleFeatured, each calling `queryClient.invalidateQueries(['packages'])` on success. This entirely replaces the current `localStorage` + hand-rolled `packages_updated` `window` event pub/sub mechanism with standard cache invalidation, and enables optimistic updates (e.g. toggling featured flips instantly, then reconciles with the server response).
2. **The four enquiry forms** (`contact`, `hotel-booking`, `hotels` search modal, `BookNowDialog`): each gets a `useMutation` calling `POST /api/enquiries`, replacing their individual hand-rolled `setTimeout` fakes with consistent loading/success/error state.

A single `QueryClientProvider` is mounted once in `src/components/layout/ClientLayout.tsx`. `@tanstack/react-query` is a new dependency — not currently installed.

## Error Handling

- Repository functions throw typed errors: `NotFoundError`, `ValidationError`, `UnauthorizedError`.
- Route Handlers catch these and map them to HTTP status codes with a consistent JSON error shape: `{ "error": string }` (404 / 400 / 401 / 403 / 500 respectively).
- Zod schemas validate every `POST`/`PATCH` request body (package create/update, enquiry submission). Validation logic lives in TypeScript rather than relying solely on Postgres constraints, consistent with the portability goal.

## Security

- `POST /api/enquiries` is public and unauthenticated by necessity (anonymous site visitors submit enquiries). This is an open write endpoint and **requires rate limiting before launch** — treated as launch-blocking, not optional. Concrete mechanism (e.g. IP-based throttling via Upstash Redis, or a Supabase Edge Function counter) is an implementation-time decision, not fixed by this design.
- RLS is enabled on all three tables as defense-in-depth even though it is not the primary authorization mechanism (see Architecture).
- The Supabase service-role key is server-only and must never be exposed to client bundles or committed to version control.

## Migration Plan

1. Create the Supabase project. Add env vars: `SUPABASE_SERVICE_ROLE_KEY` (server-only), `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon key is used only for the Supabase Auth client-side sign-in flow via `@supabase/ssr`, not for data access).
2. Write the SQL migration creating `packages`, `enquiries`, `profiles`, enabling RLS on all three with minimal defense-in-depth policies.
3. Write a one-time seed script that reads `src/data/packages.json` and inserts rows into `packages`, leaving `*_ar` columns `null` (Arabic content does not exist yet and will be backfilled by admins later).
4. Implement `lib/packages-repository.ts`, `lib/enquiries-repository.ts`, `lib/admin-auth.ts`, keeping the `packages` repository's function signatures close to today's `packagesService` to minimize churn in calling code.
5. Replace `/admin/login` and `AdminGuard` with real Supabase Auth + a server-side session check.
6. Add `@tanstack/react-query`; wire the admin dashboard and the four enquiry forms to it as described above.
7. Wire the four forms' submit handlers to `POST /api/enquiries`.
8. Delete `src/data/packages.ts`, `src/data/packages.json`, and the `localStorage`-based `packagesService` once the migration is verified working end-to-end.
9. Fix the hardcoded ID-range filters in `medical-tourism` (`p.id >= 21 && p.id <= 23`) and `kerala-tourism` to query by the real `category` column instead — naturally fixed by having real filterable columns, and removes a previously-flagged fragility.

## Testing

No test runner exists in this repo today (confirmed — no Jest/Vitest/Playwright config). This design adds a minimal Vitest setup scoped specifically to the repository layer (unit tests against a mocked Supabase client), since that layer is the portability boundary this whole design exists to protect, and is worth the small setup cost even though the rest of the app remains untested.

## Open Questions / Follow-ups (not blocking implementation)

- Concrete rate-limiting mechanism for `POST /api/enquiries` (see Security).
- Whether/when to build the admin "leads inbox" UI consuming `GET /api/enquiries` (non-goal, but the data model supports it).
- Whether `slug` on `packages` should be adopted for URLs now or remains unused until a later SEO push.
