# Admin Bookings Design

**Date:** 2026-08-09
**Status:** Approved for planning

## Context

Maram Holidays' admin dashboard has an Enquiries Inbox (`docs/superpowers/specs/2026-08-08-admin-enquiries-inbox-design.md`) for customer leads, but no way to record an actual confirmed booking once a lead turns into business. This adds a `bookings` concept: a new admin page listing bookings, a way to create one from scratch, and a way to create one directly from an enquiry row — converting a lead into a booking in one action.

## Goals

- A new admin dashboard page (`/admin/bookings`) listing all bookings, newest first, with status and payment status visible and editable per row.
- A "Create Booking" form admins can open from the bookings page (blank) or from an enquiry row on `/admin/enquiries` (pre-filled from that enquiry's details).
- Creating a booking from an enquiry archives that enquiry, so it drops out of the active inbox once converted.
- Bookings are freeform: a booking may optionally reference a catalog package, but doesn't have to (covers hotel-only, visa-only, or fully custom trips).

## Non-Goals

- Payment processing — `payment_status` is a manual admin-set field, not connected to any payment gateway.
- Editing trip details (customer info, dates, destination, price) after a booking is created — only `status` and `payment_status` are editable post-creation. A future follow-on if full editing is ever needed.
- Deleting bookings — `status: cancelled` covers "no longer valid," matching how `enquiries` also has no delete path.
- Search, filtering, or pagination on the bookings list — same minimal-scope precedent as the enquiries inbox.
- Any change to the 4 existing enquiry-submitting public forms.

## Architecture

- **Migration**: new `supabase/migrations/<timestamp>_create_bookings.sql` creating `public.bookings`: `id bigint generated always as identity primary key`, `name text not null`, `email text not null`, `phone text not null`, `destination text`, `start_date date`, `end_date date`, `travelers integer`, `package_id bigint references public.packages (id)`, `price numeric`, `payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'partial', 'paid'))`, `status text not null default 'confirmed' check (status in ('confirmed', 'cancelled', 'completed'))`, `enquiry_id bigint references public.enquiries (id)`, `notes text`, `created_at timestamptz not null default now()`. RLS enabled with zero policies — same defense-in-depth stance as `enquiries` (service-role client bypasses RLS; deny-all is correct since bookings contain customer PII and no anon/authenticated path should ever reach this table).
- **Types**: `src/lib/bookings/types.ts` — `BookingStatus`, `PaymentStatus`, `BookingRow`, `Booking`, `rowToBooking`, mirroring `src/lib/enquiries/types.ts`'s structure exactly (snake_case row → camelCase domain object).
- **Schema**: `src/lib/bookings/schema.ts` — a zod `bookingInputSchema` for `POST /api/bookings`'s request body, mirroring `src/lib/enquiries/schema.ts`'s conventions (not a discriminated union, since bookings have one shape regardless of source).
- **Repository**: `src/lib/bookings-repository.ts` — `create(input): Promise<Booking>`, `listAll(): Promise<Booking[]>` (ordered newest-first), `updateStatus(id, status): Promise<Booking>`, `updatePaymentStatus(id, paymentStatus): Promise<Booking>`. The latter two mirror `enquiriesRepository.toggleArchived`'s fetch-then-update shape, but set an explicit passed-in value rather than flipping a boolean (status/payment are 3-valued, not booleans).
- **Enquiries repository addition**: `src/lib/enquiries-repository.ts` gains `archive(id: number): Promise<Enquiry>` — fetches the row, and if `archived` is already `true` returns it unchanged (idempotent no-op), otherwise sets `archived: true` and returns the updated row. Distinct from the existing `toggleArchived` (used by the UI's archive button), which always flips.
- **API routes** (all admin-gated via `requireAdminSession()`, matching every other admin route):
  - `POST /api/bookings` — validates via `bookingInputSchema`, calls `bookingsRepository.create`. If the validated input includes a non-null `enquiryId`, additionally calls `enquiriesRepository.archive(enquiryId)` after the booking is created (not blocking the response on failure — logged but not thrown, so a transient archive failure never loses the booking write, mirroring the fire-and-forget style already used for `sendEnquiryNotification` in `POST /api/enquiries`).
  - `GET /api/bookings` — calls `bookingsRepository.listAll()`, returns `{ bookings }`.
  - `PATCH /api/bookings/[id]` — accepts `{ status? , paymentStatus? }`, calls the corresponding repository method(s), returns the updated `Booking`. 404 via a new `BookingNotFoundError` (mirrors `EnquiryNotFoundError`/`PackageNotFoundError`).
- **Frontend**:
  - `src/app/[locale]/(admin)/admin/(dashboard)/bookings/page.tsx` — thin `DashboardShell` + `BookingsTable` wrapper, following the `holidays/page.tsx`/`enquiries/page.tsx` template exactly.
  - `src/components/admin/BookingsTable.tsx` — `useQuery(["bookings"], ...)` list, following `EnquiriesTable.tsx`'s loading/empty/error conventions. Each row shows name/email/phone/destination/dates/price, plus two `<select>` controls (status, payment) that `PATCH` on change and invalidate `["bookings"]`. A "Create Booking" button in the header opens `CreateBookingDialog` with no pre-fill.
  - `src/components/admin/CreateBookingDialog.tsx` — a shadcn `Dialog` form (name, email, phone, destination, start date, end date, travelers, price, notes, and an optional package `<select>` populated via the existing `GET /api/packages?category=all`). Accepts an optional `sourceEnquiry: Enquiry` prop; when present, initializes form state from the enquiry's `name`/`email`/`phone`/`details.destination`/`details.checkInDate` or `details.travelDate`/`packageId`, and includes `enquiryId` in the `POST /api/bookings` payload. `onSuccess` invalidates `["bookings"]` and, when opened from an enquiry, also invalidates `["enquiries"]` (so the now-archived source enquiry disappears from the default view immediately).
  - `src/components/admin/EnquiriesTable.tsx` — each row gets a "Create Booking" button (opens `CreateBookingDialog` with `sourceEnquiry={enquiry}`), placed alongside the existing archive button.
  - `src/components/admin/DashboardShell.tsx` — new sidebar entry `{ name: "Bookings", href: "/admin/bookings", icon: CalendarCheck }` (from `lucide-react`), inserted after "Enquiries."

## Data Handling & Edge Cases

- **Pre-fill gaps**: `contact`-type enquiries have no `destination`/dates in `details`, so those dialog fields open blank — admin fills them in manually before submitting. `hotel_booking`/`hotel_search` supply `destination`/`checkInDate` (mapped to the dialog's start date; `checkOutDate` to end date). `book_now` supplies `destination`/`travelDate` (mapped to start date) and `packageId` (pre-selects the package dropdown).
- **Archive-on-convert failure isolation**: if `enquiriesRepository.archive` throws after the booking was already created, the route still returns 201 with the created booking — the enquiry just remains visible in the inbox (a harmless, correctable state, not a data-loss risk) rather than rolling back the successful booking write.
- **Idempotent archive**: converting from an enquiry that's already archived (e.g., a double-click or a race) is a no-op on the enquiry side, not an error.
- **Price/dates optional-ish**: `price`, `start_date`, `end_date`, `destination`, `travelers`, `package_id`, `notes` are all nullable in the schema (matching the freeform, package-optional design decision) — only `name`, `email`, `phone` are required, matching the minimum viable contact info every enquiry type already guarantees except `hotel_search`'s null `name` (which the dialog requires the admin to fill in before a booking can be created, since a booking always needs a named customer).
- **Status/payment dropdowns**: mutate immediately on change (no separate save step), consistent with the archive toggle's immediate-mutation UX already established.

## Testing

- `bookingsRepository.create`, `.listAll`, `.updateStatus`, `.updatePaymentStatus` — unit tests in `src/lib/bookings-repository.test.ts`, following the exact Supabase-client mocking conventions in `enquiries-repository.test.ts`/`packages-repository.test.ts`.
- `enquiriesRepository.archive` — unit tests appended to the existing `src/lib/enquiries-repository.test.ts` (sets `archived: true` from `false`; no-ops when already `true`).
- No dedicated API route tests — matches this codebase's established convention (only one route in the entire `src/app/api` tree has a route-level test).
- No component tests for `BookingsTable.tsx`, `CreateBookingDialog.tsx`, or the `EnquiriesTable.tsx` addition — matches the established no-component-test-framework precedent in this codebase.
