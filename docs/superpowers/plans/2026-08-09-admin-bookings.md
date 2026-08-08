# Admin Bookings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an admin `/admin/bookings` page for recording confirmed bookings, and let admins create a booking directly from an enquiry row (pre-filled, auto-archiving the source enquiry).

**Architecture:** A new `bookings` table (freeform — package link optional) with its own repository/route layer mirroring the existing `packages`/`enquiries` patterns exactly, plus a shared `CreateBookingDialog` opened either standalone (from the bookings page) or pre-filled from an `EnquiriesTable` row.

**Tech Stack:** Next.js App Router, Supabase Postgres, `@tanstack/react-query`, zod, Vitest.

## Global Constraints

- Bookings are freeform: `package_id` is optional (nullable FK), not every booking references a catalog package.
- Only `status` (confirmed/cancelled/completed) and `payment_status` (unpaid/partial/paid) are editable after creation — no full edit, no delete.
- Creating a booking from an enquiry archives that enquiry server-side (idempotent — never errors if already archived), but a failure to archive must never roll back or block the successful booking creation.
- No search/filter/pagination on the bookings list.
- Follow existing repository/route conventions exactly: `BookingNotFoundError` mirrors `PackageNotFoundError`/`EnquiryNotFoundError`; `bookingsRepository.update` mirrors `packagesRepository.update`'s fetch-then-merge-then-update shape; API routes mirror `packages/[id]/route.ts`'s admin-gate → validate → try/catch-404 structure.
- No dedicated test files for API routes or components — matches this codebase's established convention.
- TypeScript strict, no comments except where a non-obvious constraint needs explaining.

---

## File Structure

| File | Change | Responsibility |
|---|---|---|
| `supabase/migrations/20260809120000_create_bookings.sql` | Create | `bookings` table. |
| `src/lib/bookings/types.ts` | Create | `BookingStatus`, `PaymentStatus`, `BookingRow`, `Booking`, `rowToBooking`. |
| `src/lib/bookings/schema.ts` | Create | zod schemas for create + update payloads. |
| `src/lib/bookings-repository.ts` | Create | `create`, `listAll`, `update`, `BookingNotFoundError`. |
| `src/lib/bookings-repository.test.ts` | Create | Repository unit tests. |
| `src/lib/enquiries-repository.ts` | Modify | Adds `archive(id)`. |
| `src/lib/enquiries-repository.test.ts` | Modify | Tests for `archive`. |
| `src/app/api/bookings/route.ts` | Create | `POST` (create, archives source enquiry if any), `GET` (list). |
| `src/app/api/bookings/[id]/route.ts` | Create | `PATCH` (status/payment). |
| `src/components/admin/CreateBookingDialog.tsx` | Create | Shared create-booking form, standalone or enquiry-prefilled. |
| `src/app/[locale]/(admin)/admin/(dashboard)/bookings/page.tsx` | Create | Page wrapper. |
| `src/components/admin/BookingsTable.tsx` | Create | List + status/payment controls + "Create Booking" button. |
| `src/components/admin/EnquiriesTable.tsx` | Modify | Adds a "Create Booking" button per row. |
| `src/components/admin/DashboardShell.tsx` | Modify | Adds "Bookings" sidebar entry. |

---

### Task 1: Migration + types + schema

**Files:**
- Create: `supabase/migrations/20260809120000_create_bookings.sql`
- Create: `src/lib/bookings/types.ts`
- Create: `src/lib/bookings/schema.ts`

**Interfaces:**
- Produces: `BookingStatus`, `PaymentStatus`, `BookingRow`, `Booking`, `rowToBooking(row): Booking`, `bookingInputSchema`, `bookingUpdateSchema`. Consumed by Task 2 (repository), Task 4 (routes), Task 5/6/7 (frontend).

- [ ] **Step 1: Create the migration**

```sql
-- supabase/migrations/20260809120000_create_bookings.sql
create table if not exists public.bookings (
  id bigint generated always as identity primary key,
  name text not null,
  email text not null,
  phone text not null,
  destination text,
  start_date date,
  end_date date,
  travelers integer,
  package_id bigint references public.packages (id),
  price numeric,
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'partial', 'paid')),
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled', 'completed')),
  enquiry_id bigint references public.enquiries (id),
  notes text,
  created_at timestamptz not null default now()
);

alter table public.bookings enable row level security;

-- No permissive policies: bookings contain customer PII (name/email/phone).
-- All access goes through the service-role client in Route Handlers, which
-- bypasses RLS entirely. RLS is enabled purely as defense-in-depth in case
-- a direct anon-key path is ever added by mistake.
```

- [ ] **Step 2: Create the types**

```ts
// src/lib/bookings/types.ts
export type BookingStatus = "confirmed" | "cancelled" | "completed";
export type PaymentStatus = "unpaid" | "partial" | "paid";

export interface BookingRow {
  id: number;
  name: string;
  email: string;
  phone: string;
  destination: string | null;
  start_date: string | null;
  end_date: string | null;
  travelers: number | null;
  package_id: number | null;
  price: number | null;
  payment_status: PaymentStatus;
  status: BookingStatus;
  enquiry_id: number | null;
  notes: string | null;
  created_at: string;
}

export interface Booking {
  id: number;
  name: string;
  email: string;
  phone: string;
  destination: string | null;
  startDate: string | null;
  endDate: string | null;
  travelers: number | null;
  packageId: number | null;
  price: number | null;
  paymentStatus: PaymentStatus;
  status: BookingStatus;
  enquiryId: number | null;
  notes: string | null;
  createdAt: string;
}

export function rowToBooking(row: BookingRow): Booking {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    destination: row.destination,
    startDate: row.start_date,
    endDate: row.end_date,
    travelers: row.travelers,
    packageId: row.package_id,
    price: row.price,
    paymentStatus: row.payment_status,
    status: row.status,
    enquiryId: row.enquiry_id,
    notes: row.notes,
    createdAt: row.created_at,
  };
}
```

- [ ] **Step 3: Create the zod schemas**

```ts
// src/lib/bookings/schema.ts
import { z } from "zod";

export const bookingInputSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  destination: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  travelers: z.number().optional(),
  packageId: z.number().optional(),
  price: z.number().optional(),
  notes: z.string().optional(),
  enquiryId: z.number().optional(),
});

export type BookingInput = z.infer<typeof bookingInputSchema>;

export const bookingUpdateSchema = z.object({
  status: z.enum(["confirmed", "cancelled", "completed"]).optional(),
  paymentStatus: z.enum(["unpaid", "partial", "paid"]).optional(),
});

export type BookingUpdateInput = z.infer<typeof bookingUpdateSchema>;
```

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit`
Expected: 0 errors (no other file references these new modules yet).

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260809120000_create_bookings.sql src/lib/bookings/types.ts src/lib/bookings/schema.ts
git commit -m "feat: add bookings schema, types, and validation"
```

---

### Task 2: `bookingsRepository`

**Files:**
- Create: `src/lib/bookings-repository.ts`
- Create: `src/lib/bookings-repository.test.ts`

**Interfaces:**
- Consumes: `Booking`, `BookingRow`, `rowToBooking` (Task 1); `BookingInput`, `BookingUpdateInput` (Task 1).
- Produces: `export class BookingNotFoundError extends Error`, `bookingsRepository.create(input: BookingInput): Promise<Booking>`, `bookingsRepository.listAll(): Promise<Booking[]>`, `bookingsRepository.update(id: number, input: BookingUpdateInput): Promise<Booking>`. Consumed by Task 4 (API routes).

- [ ] **Step 1: Write the failing tests**

```ts
// src/lib/bookings-repository.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const selectMock = vi.fn();
const insertMock = vi.fn();
const updateMock = vi.fn();
const eqMock = vi.fn();
const singleMock = vi.fn();
const orderMock = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: () => ({
      select: selectMock,
      insert: insertMock,
      update: updateMock,
    }),
  }),
}));

import { bookingsRepository, BookingNotFoundError } from "./bookings-repository";
import type { BookingInput } from "@/lib/bookings/schema";

function makeRawRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    name: "Sarah Jenkins",
    email: "sarah@example.com",
    phone: "+974 5555 5555",
    destination: "Maldives",
    start_date: "2026-10-01",
    end_date: "2026-10-05",
    travelers: 2,
    package_id: null,
    price: 3499,
    payment_status: "unpaid",
    status: "confirmed",
    enquiry_id: null,
    notes: null,
    created_at: "2026-08-09T10:00:00.000Z",
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  selectMock.mockReturnValue({ order: orderMock, single: singleMock });
  insertMock.mockReturnValue({ select: selectMock });
});

describe("bookingsRepository.create", () => {
  it("creates a booking and maps the row to camelCase", async () => {
    singleMock.mockResolvedValue({ data: makeRawRow(), error: null });

    const input: BookingInput = {
      name: "Sarah Jenkins",
      email: "sarah@example.com",
      phone: "+974 5555 5555",
      destination: "Maldives",
      startDate: "2026-10-01",
      endDate: "2026-10-05",
      travelers: 2,
      price: 3499,
    };

    const result = await bookingsRepository.create(input);

    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Sarah Jenkins",
        email: "sarah@example.com",
        phone: "+974 5555 5555",
        destination: "Maldives",
        start_date: "2026-10-01",
        end_date: "2026-10-05",
        travelers: 2,
        price: 3499,
      })
    );
    expect(result.id).toBe(1);
    expect(result.startDate).toBe("2026-10-01");
    expect(result.paymentStatus).toBe("unpaid");
  });

  it("throws when the insert fails", async () => {
    singleMock.mockResolvedValue({ data: null, error: { message: "db error" } });

    const input: BookingInput = {
      name: "Sarah Jenkins",
      email: "sarah@example.com",
      phone: "+974 5555 5555",
    };

    await expect(bookingsRepository.create(input)).rejects.toThrow("Failed to create booking");
  });
});

describe("bookingsRepository.listAll", () => {
  it("returns all bookings ordered by newest first", async () => {
    orderMock.mockResolvedValue({ data: [makeRawRow(), makeRawRow({ id: 2 })], error: null });

    const result = await bookingsRepository.listAll();

    expect(orderMock).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(1);
  });

  it("throws when the fetch fails", async () => {
    orderMock.mockResolvedValue({ data: null, error: { message: "db error" } });

    await expect(bookingsRepository.listAll()).rejects.toThrow("Failed to fetch bookings");
  });
});

describe("bookingsRepository.update", () => {
  it("throws BookingNotFoundError when the booking does not exist", async () => {
    singleMock.mockResolvedValue({ data: null, error: { code: "PGRST116" } });
    eqMock.mockReturnValue({ single: singleMock });
    selectMock.mockReturnValue({ eq: eqMock });

    await expect(bookingsRepository.update(999, { status: "cancelled" })).rejects.toThrow(
      "Booking with ID 999 not found."
    );
  });

  it("updates status and payment status together", async () => {
    const existingRow = makeRawRow();
    singleMock
      .mockResolvedValueOnce({ data: existingRow, error: null })
      .mockResolvedValueOnce({ data: { ...existingRow, status: "completed", payment_status: "paid" }, error: null });
    eqMock.mockReturnValue({ single: singleMock });
    selectMock
      .mockReturnValueOnce({ eq: eqMock })
      .mockReturnValueOnce({ single: singleMock });
    updateMock.mockReturnValue({ eq: () => ({ select: selectMock }) });

    const result = await bookingsRepository.update(1, { status: "completed", paymentStatus: "paid" });

    expect(result.status).toBe("completed");
    expect(result.paymentStatus).toBe("paid");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/bookings-repository.test.ts`
Expected: FAIL — `Cannot find module './bookings-repository'`.

- [ ] **Step 3: Implement the repository**

```ts
// src/lib/bookings-repository.ts
import { createAdminClient } from "@/lib/supabase/admin";
import { rowToBooking } from "@/lib/bookings/types";
import type { BookingRow, Booking } from "@/lib/bookings/types";
import type { BookingInput, BookingUpdateInput } from "@/lib/bookings/schema";

const TABLE = "bookings";

export class BookingNotFoundError extends Error {
  constructor(id: number) {
    super(`Booking with ID ${id} not found.`);
    this.name = "BookingNotFoundError";
  }
}

async function fetchRowById(id: number): Promise<BookingRow | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from(TABLE).select("*").eq("id", id).single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`Failed to fetch booking ${id}: ${error.message}`);
  }

  return data as BookingRow;
}

export const bookingsRepository = {
  async create(input: BookingInput): Promise<Booking> {
    const supabase = createAdminClient();

    const insertRow = {
      name: input.name,
      email: input.email,
      phone: input.phone,
      destination: input.destination ?? null,
      start_date: input.startDate ?? null,
      end_date: input.endDate ?? null,
      travelers: input.travelers ?? null,
      package_id: input.packageId ?? null,
      price: input.price ?? null,
      enquiry_id: input.enquiryId ?? null,
      notes: input.notes ?? null,
    };

    const { data, error } = await supabase.from(TABLE).insert(insertRow).select().single();

    if (error) throw new Error(`Failed to create booking: ${error.message}`);

    return rowToBooking(data as BookingRow);
  },

  async listAll(): Promise<Booking[]> {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from(TABLE).select("*").order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to fetch bookings: ${error.message}`);

    return (data as BookingRow[]).map(rowToBooking);
  },

  async update(id: number, input: BookingUpdateInput): Promise<Booking> {
    const existing = await fetchRowById(id);
    if (!existing) {
      throw new BookingNotFoundError(id);
    }

    const supabase = createAdminClient();
    const updateRow = {
      status: input.status ?? existing.status,
      payment_status: input.paymentStatus ?? existing.payment_status,
    };

    const { data, error } = await supabase.from(TABLE).update(updateRow).eq("id", id).select().single();

    if (error) throw new Error(`Failed to update booking ${id}: ${error.message}`);

    return rowToBooking(data as BookingRow);
  },
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/bookings-repository.test.ts`
Expected: PASS — all 6 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/bookings-repository.ts src/lib/bookings-repository.test.ts
git commit -m "feat: add bookingsRepository"
```

---

### Task 3: `enquiriesRepository.archive`

**Files:**
- Modify: `src/lib/enquiries-repository.ts`
- Modify: `src/lib/enquiries-repository.test.ts`

**Interfaces:**
- Produces: `enquiriesRepository.archive(id: number): Promise<Enquiry>` — idempotent (no-op update if already archived). Consumed by Task 4 (`POST /api/bookings`).

This task is independent of Tasks 1-2 — it only touches the existing enquiries repository — and can be worked in parallel conceptually, but is sequenced here to keep the ledger simple.

- [ ] **Step 1: Write the failing tests**

Append at the end of `src/lib/enquiries-repository.test.ts` (after the existing `describe("enquiriesRepository.toggleArchived", ...)` block):
```ts

describe("enquiriesRepository.archive", () => {
  it("sets archived to true when currently false", async () => {
    const existingRow = makeRawRow({ archived: false });
    singleMock
      .mockResolvedValueOnce({ data: existingRow, error: null })
      .mockResolvedValueOnce({ data: { ...existingRow, archived: true }, error: null });
    eqMock.mockReturnValue({ single: singleMock });
    selectMock
      .mockReturnValueOnce({ eq: eqMock })
      .mockReturnValueOnce({ single: singleMock });
    updateMock.mockReturnValue({ eq: () => ({ select: selectMock }) });

    const result = await enquiriesRepository.archive(1);

    expect(result.archived).toBe(true);
  });

  it("is a no-op when already archived", async () => {
    const existingRow = makeRawRow({ archived: true });
    singleMock.mockResolvedValue({ data: existingRow, error: null });
    eqMock.mockReturnValue({ single: singleMock });
    selectMock.mockReturnValue({ eq: eqMock });

    const result = await enquiriesRepository.archive(1);

    expect(result.archived).toBe(true);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("throws EnquiryNotFoundError when the enquiry does not exist", async () => {
    singleMock.mockResolvedValue({ data: null, error: { code: "PGRST116" } });
    eqMock.mockReturnValue({ single: singleMock });
    selectMock.mockReturnValue({ eq: eqMock });

    await expect(enquiriesRepository.archive(999)).rejects.toThrow("Enquiry with ID 999 not found.");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/enquiries-repository.test.ts`
Expected: FAIL — `enquiriesRepository.archive is not a function`.

- [ ] **Step 3: Implement `archive`**

Current (`src/lib/enquiries-repository.ts`, end of the `enquiriesRepository` object, after `toggleArchived`):
```ts
  async toggleArchived(id: number): Promise<Enquiry> {
    const existing = await fetchRowById(id);
    if (!existing) {
      throw new EnquiryNotFoundError(id);
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from(TABLE)
      .update({ archived: !existing.archived })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(`Failed to toggle archived for enquiry ${id}: ${error.message}`);

    return rowToEnquiry(data as EnquiryRow);
  },
};
```

Replace with:
```ts
  async toggleArchived(id: number): Promise<Enquiry> {
    const existing = await fetchRowById(id);
    if (!existing) {
      throw new EnquiryNotFoundError(id);
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from(TABLE)
      .update({ archived: !existing.archived })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(`Failed to toggle archived for enquiry ${id}: ${error.message}`);

    return rowToEnquiry(data as EnquiryRow);
  },

  async archive(id: number): Promise<Enquiry> {
    const existing = await fetchRowById(id);
    if (!existing) {
      throw new EnquiryNotFoundError(id);
    }

    if (existing.archived) {
      return rowToEnquiry(existing);
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from(TABLE)
      .update({ archived: true })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(`Failed to archive enquiry ${id}: ${error.message}`);

    return rowToEnquiry(data as EnquiryRow);
  },
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/enquiries-repository.test.ts`
Expected: PASS — all tests in the file, including the 3 new `archive` tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/enquiries-repository.ts src/lib/enquiries-repository.test.ts
git commit -m "feat: add enquiriesRepository.archive"
```

---

### Task 4: API routes

**Files:**
- Create: `src/app/api/bookings/route.ts`
- Create: `src/app/api/bookings/[id]/route.ts`

**Interfaces:**
- Consumes: `bookingsRepository.create/listAll/update`, `BookingNotFoundError` (Task 2); `bookingInputSchema`, `bookingUpdateSchema` (Task 1); `enquiriesRepository.archive` (Task 3); `requireAdminSession`, `UnauthorizedError` (existing, unchanged).
- Produces: `POST /api/bookings`, `GET /api/bookings`, `PATCH /api/bookings/:id`. Consumed by Task 5/6/7 (frontend).

- [ ] **Step 1: Create the collection route**

```ts
// src/app/api/bookings/route.ts
import { NextResponse } from "next/server";
import { bookingsRepository } from "@/lib/bookings-repository";
import { enquiriesRepository } from "@/lib/enquiries-repository";
import { bookingInputSchema } from "@/lib/bookings/schema";
import { requireAdminSession, UnauthorizedError } from "@/lib/admin-auth";

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
  const parsed = bookingInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid booking data", details: parsed.error.flatten() }, { status: 400 });
  }

  const created = await bookingsRepository.create(parsed.data);

  if (parsed.data.enquiryId != null) {
    try {
      await enquiriesRepository.archive(parsed.data.enquiryId);
    } catch {
      // Booking already created successfully; a failure to archive the
      // source enquiry must not roll back or fail this response.
    }
  }

  return NextResponse.json(created, { status: 201 });
}

export async function GET() {
  try {
    await requireAdminSession();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw error;
  }

  const bookings = await bookingsRepository.listAll();
  return NextResponse.json({ bookings });
}
```

- [ ] **Step 2: Create the item route**

```ts
// src/app/api/bookings/[id]/route.ts
import { NextResponse } from "next/server";
import { bookingsRepository, BookingNotFoundError } from "@/lib/bookings-repository";
import { bookingUpdateSchema } from "@/lib/bookings/schema";
import { requireAdminSession, UnauthorizedError } from "@/lib/admin-auth";

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
  const parsed = bookingUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid booking data", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const updated = await bookingsRepository.update(Number(id), parsed.data);
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof BookingNotFoundError) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    throw error;
  }
}
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit`
Expected: 0 errors.

Run: `npm run build`
Expected: build succeeds, `/api/bookings` and `/api/bookings/[id]` appear in the route manifest.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/bookings/route.ts "src/app/api/bookings/[id]/route.ts"
git commit -m "feat: add bookings API routes"
```

---

### Task 5: `CreateBookingDialog`

**Files:**
- Create: `src/components/admin/CreateBookingDialog.tsx`

**Interfaces:**
- Consumes: `POST /api/bookings` (Task 4); `Enquiry` (existing, from `@/lib/enquiries/types`); `Package` (existing, from `@/types/package`); `GET /api/packages?category=all` (existing, unchanged).
- Produces: `export default function CreateBookingDialog({ open, onOpenChange, sourceEnquiry, onCreated }: Props)`. Consumed by Task 6 (`BookingsTable`) and Task 7 (`EnquiriesTable`).

- [ ] **Step 1: Create the component**

```tsx
// src/components/admin/CreateBookingDialog.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { extractErrorMessage } from "@/lib/extract-error-message";
import type { Enquiry } from "@/lib/enquiries/types";
import type { Booking } from "@/lib/bookings/types";
import type { Package } from "@/types/package";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceEnquiry?: Enquiry | null;
  onCreated?: () => void;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: string;
  packageId: string;
  price: string;
  notes: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  phone: "",
  destination: "",
  startDate: "",
  endDate: "",
  travelers: "",
  packageId: "",
  price: "",
  notes: "",
};

function formFromEnquiry(enquiry: Enquiry): FormState {
  const d = enquiry.details;
  return {
    name: enquiry.name ?? "",
    email: enquiry.email,
    phone: enquiry.phone,
    destination: typeof d.destination === "string" ? d.destination : "",
    startDate: typeof d.checkInDate === "string" ? d.checkInDate.slice(0, 10) : typeof d.travelDate === "string" ? d.travelDate.slice(0, 10) : "",
    endDate: typeof d.checkOutDate === "string" ? d.checkOutDate.slice(0, 10) : "",
    travelers: "",
    packageId: enquiry.packageId != null ? String(enquiry.packageId) : "",
    price: "",
    notes: enquiry.message ?? "",
  };
}

async function fetchAllPackages(): Promise<Package[]> {
  const res = await fetch("/api/packages?category=all");
  if (!res.ok) throw new Error("Failed to load packages");
  const json = await res.json();
  return json.packages as Package[];
}

const inputCls = "h-10 border-slate-800 bg-slate-950/40 text-white rounded-xl text-sm placeholder-slate-600 focus-visible:ring-blue-500";
const labelCls = "text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block";

export default function CreateBookingDialog({ open, onOpenChange, sourceEnquiry, onCreated }: Props) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  useEffect(() => {
    if (open) {
      setForm(sourceEnquiry ? formFromEnquiry(sourceEnquiry) : EMPTY_FORM);
    }
  }, [open, sourceEnquiry]);

  const { data: packages = [] } = useQuery({
    queryKey: ["packages", "all"],
    queryFn: fetchAllPackages,
    enabled: open,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          destination: form.destination || undefined,
          startDate: form.startDate || undefined,
          endDate: form.endDate || undefined,
          travelers: form.travelers ? Number(form.travelers) : undefined,
          packageId: form.packageId ? Number(form.packageId) : undefined,
          price: form.price ? Number(form.price) : undefined,
          notes: form.notes || undefined,
          enquiryId: sourceEnquiry?.id,
        }),
      });
      if (!res.ok) throw new Error(await extractErrorMessage(res, "Failed to create booking"));
      return res.json() as Promise<Booking>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      if (sourceEnquiry) {
        queryClient.invalidateQueries({ queryKey: ["enquiries"] });
      }
      onOpenChange(false);
      onCreated?.();
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-slate-900 border-slate-800/80 text-white rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Create Booking</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            createMutation.mutate();
          }}
          className="space-y-4 mt-2"
        >
          <div>
            <label className={labelCls}>Name *</label>
            <Input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Email *</label>
              <Input required type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Phone *</label>
              <Input required value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Destination</label>
            <Input value={form.destination} onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))} className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Start Date</label>
              <Input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>End Date</label>
              <Input type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Travelers</label>
              <Input type="number" min="0" value={form.travelers} onChange={(e) => setForm((f) => ({ ...f, travelers: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Price (QAR)</label>
              <Input type="number" min="0" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Package (optional)</label>
            <select
              value={form.packageId}
              onChange={(e) => setForm((f) => ({ ...f, packageId: e.target.value }))}
              className="h-10 w-full rounded-xl border border-slate-800 bg-slate-950/40 text-white text-sm px-3"
            >
              <option value="">None</option>
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.title} — {pkg.location}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Notes</label>
            <Textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} className="bg-slate-950/40 border-slate-800 text-white rounded-xl text-sm" rows={3} />
          </div>

          {createMutation.isError && (
            <p className="text-sm text-red-400">{createMutation.error instanceof Error ? createMutation.error.message : "Failed to create booking"}</p>
          )}

          <Button type="submit" disabled={createMutation.isPending} className="w-full h-11 bg-blue-600 hover:bg-blue-500 font-bold rounded-xl cursor-pointer">
            {createMutation.isPending ? "Creating..." : "Create Booking"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/CreateBookingDialog.tsx
git commit -m "feat: add CreateBookingDialog"
```

---

### Task 6: Bookings page + `BookingsTable` + sidebar entry

**Files:**
- Create: `src/app/[locale]/(admin)/admin/(dashboard)/bookings/page.tsx`
- Create: `src/components/admin/BookingsTable.tsx`
- Modify: `src/components/admin/DashboardShell.tsx`

**Interfaces:**
- Consumes: `GET /api/bookings`, `PATCH /api/bookings/:id` (Task 4); `CreateBookingDialog` (Task 5); `Booking`, `BookingStatus`, `PaymentStatus` (Task 1).

- [ ] **Step 1: Create `BookingsTable`**

```tsx
// src/components/admin/BookingsTable.tsx
"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, CalendarCheck, AlertCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { extractErrorMessage } from "@/lib/extract-error-message";
import type { Booking, BookingStatus, PaymentStatus } from "@/lib/bookings/types";
import CreateBookingDialog from "@/components/admin/CreateBookingDialog";

async function fetchBookings(): Promise<Booking[]> {
  const res = await fetch("/api/bookings");
  if (!res.ok) throw new Error(await extractErrorMessage(res, "Failed to load bookings"));
  const json = await res.json();
  return json.bookings as Booking[];
}

async function updateBooking(id: number, data: { status?: BookingStatus; paymentStatus?: PaymentStatus }): Promise<Booking> {
  const res = await fetch(`/api/bookings/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await extractErrorMessage(res, "Failed to update booking"));
  return res.json() as Promise<Booking>;
}

const STATUS_OPTIONS: BookingStatus[] = ["confirmed", "cancelled", "completed"];
const PAYMENT_OPTIONS: PaymentStatus[] = ["unpaid", "partial", "paid"];

const selectCls = "h-8 rounded-lg border border-slate-800 bg-slate-950/40 text-white text-xs px-2 cursor-pointer";

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function BookingRow({ booking }: { booking: Booking }) {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (data: { status?: BookingStatus; paymentStatus?: PaymentStatus }) => updateBooking(booking.id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bookings"] }),
  });

  return (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-slate-800/60 last:border-b-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white truncate">{booking.name}</p>
        <p className="text-xs text-slate-400 truncate">{booking.email} · {booking.phone}</p>
      </div>
      <div className="w-40 shrink-0 text-xs text-slate-400 truncate">{booking.destination ?? "—"}</div>
      <div className="w-40 shrink-0 text-xs text-slate-500">{formatDate(booking.startDate)} → {formatDate(booking.endDate)}</div>
      <div className="w-20 shrink-0 text-xs text-slate-300">{booking.price != null ? `QAR ${booking.price}` : "—"}</div>
      <select
        value={booking.status}
        onChange={(e) => updateMutation.mutate({ status: e.target.value as BookingStatus })}
        disabled={updateMutation.isPending}
        className={selectCls}
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <select
        value={booking.paymentStatus}
        onChange={(e) => updateMutation.mutate({ paymentStatus: e.target.value as PaymentStatus })}
        disabled={updateMutation.isPending}
        className={selectCls}
      >
        {PAYMENT_OPTIONS.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>
    </div>
  );
}

export default function BookingsTable() {
  const [createOpen, setCreateOpen] = useState(false);

  const { data: bookings = [], isLoading, error } = useQuery({
    queryKey: ["bookings"],
    queryFn: fetchBookings,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button onClick={() => setCreateOpen(true)} className="h-11 px-5 bg-blue-600 hover:bg-blue-500 font-bold rounded-xl gap-1.5 shadow-lg cursor-pointer">
          <Plus className="h-5 w-5" />Create Booking
        </Button>
      </div>

      <div className="border border-slate-800/80 rounded-2xl overflow-hidden bg-slate-900/15">
        {isLoading ? (
          <div className="flex h-72 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-72 text-center p-6">
            <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
            <h3 className="text-base font-bold text-slate-350">Failed to load bookings</h3>
            <p className="text-xs text-slate-500 max-w-xs mt-1">
              {error instanceof Error ? error.message : "Something went wrong. Please try again."}
            </p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-72 text-center p-6">
            <CalendarCheck className="h-12 w-12 text-slate-600 mb-3" />
            <h3 className="text-base font-bold text-slate-350">No Bookings Yet</h3>
            <p className="text-xs text-slate-500 max-w-xs mt-1">
              Bookings you create here, or convert from an enquiry, will appear here.
            </p>
          </div>
        ) : (
          <div>
            {bookings.map((booking) => (
              <BookingRow key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </div>

      <CreateBookingDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
```

- [ ] **Step 2: Create the page wrapper**

```tsx
// src/app/[locale]/(admin)/admin/(dashboard)/bookings/page.tsx
"use client";

import React from "react";
import DashboardShell from "@/components/admin/DashboardShell";
import BookingsTable from "@/components/admin/BookingsTable";

export default function AdminBookingsPage() {
  return (
    <DashboardShell title="Bookings">
      <BookingsTable />
    </DashboardShell>
  );
}
```

- [ ] **Step 3: Add the sidebar entry**

Current (`src/components/admin/DashboardShell.tsx`, `lucide-react` import block):
```tsx
import {
  LayoutDashboard,
  Layers,
  Palmtree,
  Ship,
  Stethoscope,
  MapPin,
  CalendarDays,
  LogOut,
  Menu,
  X,
  Bell,
  ExternalLink,
  ChevronRight,
  User,
  Inbox
} from "lucide-react";
```

Replace with:
```tsx
import {
  LayoutDashboard,
  Layers,
  Palmtree,
  Ship,
  Stethoscope,
  MapPin,
  CalendarDays,
  LogOut,
  Menu,
  X,
  Bell,
  ExternalLink,
  ChevronRight,
  User,
  Inbox,
  CalendarCheck
} from "lucide-react";
```

Current (`src/components/admin/DashboardShell.tsx`, `menuItems` array):
```tsx
    {
      name: "Enquiries",
      href: "/admin/enquiries",
      icon: Inbox,
    },
    {
      name: "Holidays",
      href: "/admin/holidays",
      icon: Palmtree,
    },
```

Replace with:
```tsx
    {
      name: "Enquiries",
      href: "/admin/enquiries",
      icon: Inbox,
    },
    {
      name: "Bookings",
      href: "/admin/bookings",
      icon: CalendarCheck,
    },
    {
      name: "Holidays",
      href: "/admin/holidays",
      icon: Palmtree,
    },
```

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit`
Expected: 0 errors.

Run: `npm run build`
Expected: build succeeds, `/admin/bookings` in the route manifest.

- [ ] **Step 5: Commit**

```bash
git add "src/app/[locale]/(admin)/admin/(dashboard)/bookings/page.tsx" src/components/admin/BookingsTable.tsx src/components/admin/DashboardShell.tsx
git commit -m "feat: add admin bookings page and sidebar entry"
```

---

### Task 7: "Create Booking" button on `EnquiriesTable`

**Files:**
- Modify: `src/components/admin/EnquiriesTable.tsx`

**Interfaces:**
- Consumes: `CreateBookingDialog` (Task 5).

- [ ] **Step 1: Add the import and per-row dialog state**

Current (`src/components/admin/EnquiriesTable.tsx`, imports):
```tsx
import {
  Loader2, Inbox, ChevronDown, Mail, Phone,
  ExternalLink, AlertCircle, Archive, ArchiveRestore,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Enquiry, EnquiryType } from "@/lib/enquiries/types";
import { extractErrorMessage } from "@/lib/extract-error-message";
```

Replace with:
```tsx
import {
  Loader2, Inbox, ChevronDown, Mail, Phone,
  ExternalLink, AlertCircle, Archive, ArchiveRestore, CalendarPlus,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Enquiry, EnquiryType } from "@/lib/enquiries/types";
import { extractErrorMessage } from "@/lib/extract-error-message";
import CreateBookingDialog from "@/components/admin/CreateBookingDialog";
```

- [ ] **Step 2: Add the "Create Booking" button to `EnquiryRow`**

Current (`src/components/admin/EnquiriesTable.tsx`, inside `EnquiryRow`, the row div's children after the timestamp span and before the archive button):
```tsx
        <span
          className="shrink-0 text-xs text-slate-500 w-28 text-right"
          title={enquiry.createdAt}
        >
          {relativeTime(enquiry.createdAt)}
        </span>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleArchive(enquiry.id);
          }}
          disabled={isTogglingArchive}
          title={enquiry.archived ? "Unarchive" : "Archive"}
          className="shrink-0 p-2 rounded-xl text-slate-600 hover:text-slate-300 hover:bg-slate-800/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {enquiry.archived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
        </button>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </div>
      {expanded && <EnquiryDetails enquiry={enquiry} />}
    </div>
  );
}
```

Replace with:
```tsx
        <span
          className="shrink-0 text-xs text-slate-500 w-28 text-right"
          title={enquiry.createdAt}
        >
          {relativeTime(enquiry.createdAt)}
        </span>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setBookingDialogOpen(true);
          }}
          title="Create Booking"
          className="shrink-0 p-2 rounded-xl text-slate-600 hover:text-slate-300 hover:bg-slate-800/30 transition-all cursor-pointer"
        >
          <CalendarPlus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleArchive(enquiry.id);
          }}
          disabled={isTogglingArchive}
          title={enquiry.archived ? "Unarchive" : "Archive"}
          className="shrink-0 p-2 rounded-xl text-slate-600 hover:text-slate-300 hover:bg-slate-800/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {enquiry.archived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
        </button>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </div>
      {expanded && <EnquiryDetails enquiry={enquiry} />}
      <CreateBookingDialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen} sourceEnquiry={enquiry} />
    </div>
  );
}
```

- [ ] **Step 3: Add the `bookingDialogOpen` state**

Current (`src/components/admin/EnquiriesTable.tsx`, start of `EnquiryRow`):
```tsx
  const [expanded, setExpanded] = useState(false);
```

Replace with:
```tsx
  const [expanded, setExpanded] = useState(false);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
```

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit`
Expected: 0 errors.

Run: `npm run build`
Expected: build succeeds, `/admin/enquiries` unaffected in the manifest.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/EnquiriesTable.tsx
git commit -m "feat: add Create Booking button to EnquiriesTable rows"
```

---

### Task 8: Final verification

**Files:**
- None (verification-only task).

- [ ] **Step 1: Full type check**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: build succeeds; `/admin/bookings`, `/api/bookings`, `/api/bookings/[id]` present in the route manifest.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: no *new* errors beyond the pre-existing baseline (102 problems / 37 errors / 65 warnings, confirmed current as of the prior Enquiries Archive work in this repo).

- [ ] **Step 4: Full test suite**

Run: `npm test`
Expected: all existing tests still pass, plus the new `bookings-repository.test.ts` tests (6) and the 3 new `enquiriesRepository.archive` tests (96/96 total, up from 90/90).

**Manual verification note:** if a dev server, browser, and admin login are available in your environment, start `npm run dev`, open `/admin/bookings`, click "Create Booking," fill the form, submit, confirm it appears in the list with status/payment dropdowns that update on change; then open `/admin/enquiries`, click the "Create Booking" icon on a non-archived row, confirm the dialog opens pre-filled, submit, and confirm the source enquiry is now archived (toggle "Show archived" to see it). If you cannot reach a running dev server in this environment, say so explicitly in your report rather than claiming this was verified.

- [ ] **Step 5: No commit for this task** (verification only — nothing to commit unless a prior step's verification uncovers something to fix, in which case fix it as part of re-running the relevant earlier task).

## Self-Review Notes

**Spec coverage:** Every section of `docs/superpowers/specs/2026-08-09-admin-bookings-design.md` is covered — migration/types/schema (Task 1), repository (Task 2), enquiry-archive addition (Task 3), API routes with fire-and-forget archive-on-convert (Task 4), the shared create dialog with enquiry pre-fill (Task 5), the bookings page/table/sidebar (Task 6), the enquiries-row integration (Task 7), verification (Task 8). Non-goals respected: no full edit endpoint exists (only `status`/`paymentStatus` in `bookingUpdateSchema`), no delete route, no search/filter/pagination in `BookingsTable`.

**Placeholder scan:** No TBD/TODO markers; every step has complete, runnable code.

**Type consistency:** `Booking`/`BookingStatus`/`PaymentStatus` (Task 1) flow unchanged through `bookingsRepository` (Task 2, `create`/`listAll`/`update` all typed against them), the API routes' `NextResponse.json` payloads (Task 4), and `CreateBookingDialog`/`BookingsTable` (Task 5/6, `Booking` imported and read consistently — `startDate`/`endDate`/`packageId`/`paymentStatus` camelCase throughout, never the snake_case row shape leaking into the frontend). `BookingNotFoundError` is defined once (Task 2) and imported by name, unchanged, in Task 4. `bookingInputSchema`'s `BookingInput` type (Task 1) matches exactly what `CreateBookingDialog`'s `fetch` body sends (Task 5) and what `bookingsRepository.create` destructures (Task 2) — every field name lines up (`packageId`, `startDate`, `endDate`, `enquiryId`).

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-08-09-admin-bookings.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
