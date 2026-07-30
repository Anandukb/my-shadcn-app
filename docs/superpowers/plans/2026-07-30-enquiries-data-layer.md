# Enquiries Data Layer & API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the backend for real enquiry capture — a Supabase `enquiries` table, a repository, Zod validation, basic IP-based rate limiting, and a fire-and-forget email notification, exposed via `POST/GET /api/enquiries`.

**Architecture:** Mirrors the existing packages backend's repository-only-Supabase-access pattern: a single `enquiriesRepository` module is the only code that touches the `enquiries`/`enquiry_rate_limits` tables, everything else (rate limiting, email, validation) is a small standalone module the route handler composes. Rate limiting and email notification are deliberately isolated behind their own functions so either mechanism is swappable later without touching the route handler, matching this repo's stated backend-portability goal.

**Tech Stack:** Supabase (Postgres), Zod, Vitest, `resend` (new dependency, for transactional email).

This is **Plan 3a of 3** (enquiry capture subsystem), following the design in `docs/superpowers/specs/2026-07-30-enquiry-capture-design.md`. Plan 3b (wiring the four forms to this API) follows once this plan is complete. Depends on Plan 1's `requireAdminSession()`/`createAdminClient()` (already built).

## Global Constraints

- `enquiries.type` is one of exactly: `contact` | `hotel_booking` | `hotel_search` | `book_now`.
- `name` is nullable (the `hotel_search` flow never collects one); `email`/`phone` are required for all four types.
- `package_id` is set only for `book_now` enquiries, nullable otherwise.
- Form-specific fields live in the `details` JSONB column, validated per-type by a Zod discriminated union — never as individual SQL columns.
- Rate limit: **5 submissions per IP per 10-minute fixed window** (not sliding). `window_start` is wall-clock time floored to the nearest 10-minute boundary. Missing IP info **fails open** (request is allowed) — this is a spam deterrent, not a security boundary.
- Email notification is fire-and-forget: a failure to send must never fail the `POST /api/enquiries` request or throw past `sendEnquiryNotification`'s own boundary. An unset `RESEND_API_KEY`/`ENQUIRY_NOTIFY_EMAIL` must no-op (log a warning), not throw.
- Repository-only Supabase access: only `src/lib/enquiries-repository.ts` and `src/lib/rate-limit.ts` touch Supabase directly, matching the existing `packages-repository.ts` boundary.
- Error shape matches the existing packages API convention: `{ "error": string }`, with `details: parsed.error.flatten()` added on 400s.
- Follow the repository's existing code style: TypeScript strict, no comments except where a non-obvious constraint needs explaining.

---

## File Structure

| File | Change | Responsibility |
|---|---|---|
| `supabase/migrations/<timestamp>_create_enquiries.sql` | Create | `enquiries` + `enquiry_rate_limits` tables, RLS enabled with no permissive policies (service-role-only access). |
| `src/lib/enquiries/types.ts` | Create | `EnquiryRow` (DB shape), `Enquiry` (app-facing shape), `rowToEnquiry` mapper. |
| `src/lib/enquiries/schema.ts` | Create | `enquiryInputSchema` — Zod discriminated union validating `POST /api/enquiries` bodies. |
| `src/lib/enquiries/schema.test.ts` | Create | Tests for all 4 discriminated-union variants. |
| `src/lib/rate-limit.ts` | Create | `checkRateLimit(ipAddress)` — fixed-window IP rate limiting against `enquiry_rate_limits`. |
| `src/lib/rate-limit.test.ts` | Create | Tests for under/at-threshold and fail-open behavior. |
| `src/lib/notify-enquiry.ts` | Create | `sendEnquiryNotification(enquiry)` — Resend email, swallows all failures. |
| `src/lib/notify-enquiry.test.ts` | Create | Tests for the no-op and swallowed-failure paths. |
| `src/lib/enquiries-repository.ts` | Create | `create(input)`, `listAll()` — the only Supabase access point for enquiries. |
| `src/lib/enquiries-repository.test.ts` | Create | Tests against a mocked Supabase client. |
| `src/app/api/enquiries/route.ts` | Create | `POST` (public, rate-limited, validated) and `GET` (admin-gated). |
| `package.json` | Modify | Add `resend` dependency. |

---

### Task 1: Migration — `enquiries` and `enquiry_rate_limits` tables

**Files:**
- Create: `supabase/migrations/<timestamp>_create_enquiries.sql`

**Interfaces:**
- Produces: `public.enquiries` (columns: `id`, `type`, `name`, `email`, `phone`, `message`, `status`, `package_id`, `details`, `created_at`) and `public.enquiry_rate_limits` (columns: `ip_address`, `window_start`, `count`), consumed by Task 4's `EnquiryRow` type and Task 6's `checkRateLimit`.

- [ ] **Step 1: Create the migration file**

```bash
npx supabase migration new create_enquiries
```

Open the generated `supabase/migrations/<timestamp>_create_enquiries.sql` and replace its contents with:

```sql
create table if not exists public.enquiries (
  id bigint generated always as identity primary key,
  type text not null check (type in ('contact', 'hotel_booking', 'hotel_search', 'book_now')),
  name text,
  email text not null,
  phone text not null,
  message text,
  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  package_id bigint references public.packages (id),
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.enquiries enable row level security;

-- No permissive policies: enquiries contain customer PII (name/email/phone).
-- All access goes through the service-role client in Route Handlers, which
-- bypasses RLS entirely. RLS is enabled purely as defense-in-depth in case
-- a direct anon-key path is ever added by mistake — the default with zero
-- policies is deny-all for anon/authenticated roles, which is exactly what
-- we want here (unlike packages, nothing about enquiries should be public).

create table if not exists public.enquiry_rate_limits (
  ip_address text not null,
  window_start timestamptz not null,
  count integer not null default 1,
  primary key (ip_address, window_start)
);

alter table public.enquiry_rate_limits enable row level security;
```

- [ ] **Step 2: Verify the migration file was written correctly**

Read the generated file back and confirm both `create table` statements and both `enable row level security` statements are present, matching the SQL above exactly.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/*_create_enquiries.sql
git commit -m "feat: add enquiries and enquiry_rate_limits tables"
```

---

### Task 2: Types — `EnquiryRow`, `Enquiry`, `rowToEnquiry`

**Files:**
- Create: `src/lib/enquiries/types.ts`

**Interfaces:**
- Produces: `EnquiryType`, `EnquiryStatus`, `EnquiryRow`, `Enquiry`, `rowToEnquiry(row: EnquiryRow): Enquiry` — consumed by Task 3's schema (`EnquiryType`), Task 5's repository (all of the above), and Task 7's route (`Enquiry`).

- [ ] **Step 1: Write the file**

```ts
export type EnquiryType = "contact" | "hotel_booking" | "hotel_search" | "book_now";
export type EnquiryStatus = "new" | "contacted" | "closed";

export interface EnquiryRow {
  id: number;
  type: EnquiryType;
  name: string | null;
  email: string;
  phone: string;
  message: string | null;
  status: EnquiryStatus;
  package_id: number | null;
  details: Record<string, unknown>;
  created_at: string;
}

export interface Enquiry {
  id: number;
  type: EnquiryType;
  name: string | null;
  email: string;
  phone: string;
  message: string | null;
  status: EnquiryStatus;
  packageId: number | null;
  details: Record<string, unknown>;
  createdAt: string;
}

export function rowToEnquiry(row: EnquiryRow): Enquiry {
  return {
    id: row.id,
    type: row.type,
    name: row.name,
    email: row.email,
    phone: row.phone,
    message: row.message,
    status: row.status,
    packageId: row.package_id,
    details: row.details,
    createdAt: row.created_at,
  };
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit` → expect 0 errors (this file has no dependents yet).

- [ ] **Step 3: Commit**

```bash
git add src/lib/enquiries/types.ts
git commit -m "feat: add Enquiry types and row mapper"
```

---

### Task 3: Schema — Zod discriminated union

**Files:**
- Create: `src/lib/enquiries/schema.ts`
- Test: `src/lib/enquiries/schema.test.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks (pure Zod).
- Produces: `enquiryInputSchema`, `type EnquiryInput = z.infer<typeof enquiryInputSchema>` — consumed by Task 5's repository (`create(input: EnquiryInput)`) and Task 7's route.

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/enquiries/schema.test.ts
import { describe, it, expect } from "vitest";
import { enquiryInputSchema } from "./schema";

describe("enquiryInputSchema", () => {
  it("validates a contact enquiry", () => {
    const result = enquiryInputSchema.safeParse({
      type: "contact",
      name: "Sarah Jenkins",
      email: "sarah@example.com",
      phone: "+974 5555 5555",
      message: "Interested in a Maldives package",
      details: { service: "holiday" },
    });
    expect(result.success).toBe(true);
  });

  it("rejects a contact enquiry missing the required message", () => {
    const result = enquiryInputSchema.safeParse({
      type: "contact",
      name: "Sarah Jenkins",
      email: "sarah@example.com",
      phone: "+974 5555 5555",
      message: "",
      details: { service: "holiday" },
    });
    expect(result.success).toBe(false);
  });

  it("validates a hotel_booking enquiry", () => {
    const result = enquiryInputSchema.safeParse({
      type: "hotel_booking",
      name: "Ahmed Al-Farsi",
      email: "ahmed@example.com",
      phone: "+974 5555 5556",
      details: {
        destination: "Dubai",
        checkInDate: "2026-08-01T00:00:00.000Z",
        checkOutDate: "2026-08-05T00:00:00.000Z",
        rooms: "1",
        adults: "2",
        children: "0",
        nationality: "Qatari",
        specialRequests: "High floor please",
      },
    });
    expect(result.success).toBe(true);
  });

  it("rejects a hotel_booking enquiry with hotel_search-shaped details (missing nationality/specialRequests)", () => {
    const result = enquiryInputSchema.safeParse({
      type: "hotel_booking",
      name: "Ahmed Al-Farsi",
      email: "ahmed@example.com",
      phone: "+974 5555 5556",
      details: {
        destination: "Dubai",
        checkInDate: "2026-08-01T00:00:00.000Z",
        checkOutDate: "2026-08-05T00:00:00.000Z",
        rooms: "1",
        adults: "2",
        children: "0",
      },
    });
    expect(result.success).toBe(false);
  });

  it("validates a hotel_search enquiry with no name", () => {
    const result = enquiryInputSchema.safeParse({
      type: "hotel_search",
      email: "guest@example.com",
      phone: "+974 5555 5557",
      details: {
        destination: "Bangkok",
        checkInDate: "2026-09-01T00:00:00.000Z",
        checkOutDate: "2026-09-04T00:00:00.000Z",
        rooms: "1",
        adults: "2",
        children: "0",
      },
    });
    expect(result.success).toBe(true);
  });

  it("validates a book_now enquiry with an optional packageId", () => {
    const result = enquiryInputSchema.safeParse({
      type: "book_now",
      name: "Fatima Noor",
      email: "fatima@example.com",
      phone: "+974 5555 5558",
      packageId: 12,
      details: {
        destination: "Maldives Escape",
        travelDate: "2026-10-01",
        travelers: "2",
      },
    });
    expect(result.success).toBe(true);
  });

  it("validates a book_now enquiry without a packageId", () => {
    const result = enquiryInputSchema.safeParse({
      type: "book_now",
      name: "Fatima Noor",
      email: "fatima@example.com",
      phone: "+974 5555 5558",
      details: {
        destination: "Maldives Escape",
        travelDate: "2026-10-01",
        travelers: "2",
      },
    });
    expect(result.success).toBe(true);
  });

  it("rejects an unknown type", () => {
    const result = enquiryInputSchema.safeParse({
      type: "carnival_cruise",
      email: "x@example.com",
      phone: "123",
      details: {},
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = enquiryInputSchema.safeParse({
      type: "contact",
      name: "Sarah Jenkins",
      email: "not-an-email",
      phone: "+974 5555 5555",
      message: "Hi",
      details: { service: "holiday" },
    });
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/enquiries/schema.test.ts`
Expected: FAIL — `Cannot find module './schema'` (file doesn't exist yet).

- [ ] **Step 3: Write the implementation**

```ts
// src/lib/enquiries/schema.ts
import { z } from "zod";

const contactDetailsSchema = z.object({
  service: z.string(),
});

const hotelBookingDetailsSchema = z.object({
  destination: z.string(),
  checkInDate: z.string(),
  checkOutDate: z.string(),
  rooms: z.string(),
  adults: z.string(),
  children: z.string(),
  nationality: z.string(),
  specialRequests: z.string(),
});

const hotelSearchDetailsSchema = z.object({
  destination: z.string(),
  checkInDate: z.string(),
  checkOutDate: z.string(),
  rooms: z.string(),
  adults: z.string(),
  children: z.string(),
});

const bookNowDetailsSchema = z.object({
  destination: z.string(),
  travelDate: z.string(),
  travelers: z.string(),
});

export const enquiryInputSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("contact"),
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(1),
    message: z.string().min(1),
    details: contactDetailsSchema,
  }),
  z.object({
    type: z.literal("hotel_booking"),
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(1),
    message: z.string().optional(),
    details: hotelBookingDetailsSchema,
  }),
  z.object({
    type: z.literal("hotel_search"),
    name: z.string().optional(),
    email: z.string().email(),
    phone: z.string().min(1),
    message: z.string().optional(),
    details: hotelSearchDetailsSchema,
  }),
  z.object({
    type: z.literal("book_now"),
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(1),
    message: z.string().optional(),
    packageId: z.number().optional(),
    details: bookNowDetailsSchema,
  }),
]);

export type EnquiryInput = z.infer<typeof enquiryInputSchema>;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/enquiries/schema.test.ts`
Expected: PASS (9/9 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/enquiries/schema.ts src/lib/enquiries/schema.test.ts
git commit -m "feat: add enquiry input schema (discriminated union per type)"
```

---

### Task 4: Rate limiting

**Files:**
- Create: `src/lib/rate-limit.ts`
- Test: `src/lib/rate-limit.test.ts`

**Interfaces:**
- Consumes: `createAdminClient` from `@/lib/supabase/admin` (existing).
- Produces: `checkRateLimit(ipAddress: string | null): Promise<boolean>` — `true` means allowed, `false` means over the limit. Consumed by Task 7's route.

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/rate-limit.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const selectMock = vi.fn();
const eqMock = vi.fn();
const maybeSingleMock = vi.fn();
const upsertMock = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: () => ({
      select: selectMock,
      upsert: upsertMock,
    }),
  }),
}));

import { checkRateLimit } from "./rate-limit";

beforeEach(() => {
  vi.clearAllMocks();
  selectMock.mockReturnValue({ eq: eqMock });
  eqMock.mockReturnValue({ eq: eqMock, maybeSingle: maybeSingleMock });
  upsertMock.mockResolvedValue({ error: null });
});

describe("checkRateLimit", () => {
  it("allows the request when there is no existing row for the window", async () => {
    maybeSingleMock.mockResolvedValue({ data: null, error: null });

    const allowed = await checkRateLimit("1.2.3.4");

    expect(allowed).toBe(true);
    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({ ip_address: "1.2.3.4", count: 1 }),
      expect.any(Object)
    );
  });

  it("allows the request when under the threshold and increments the count", async () => {
    maybeSingleMock.mockResolvedValue({ data: { count: 3 }, error: null });

    const allowed = await checkRateLimit("1.2.3.4");

    expect(allowed).toBe(true);
    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({ ip_address: "1.2.3.4", count: 4 }),
      expect.any(Object)
    );
  });

  it("blocks the request when at the threshold", async () => {
    maybeSingleMock.mockResolvedValue({ data: { count: 5 }, error: null });

    const allowed = await checkRateLimit("1.2.3.4");

    expect(allowed).toBe(false);
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it("fails open when the IP address is missing", async () => {
    const allowed = await checkRateLimit(null);

    expect(allowed).toBe(true);
    expect(selectMock).not.toHaveBeenCalled();
    expect(upsertMock).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/rate-limit.test.ts`
Expected: FAIL — `Cannot find module './rate-limit'`.

- [ ] **Step 3: Write the implementation**

```ts
// src/lib/rate-limit.ts
import { createAdminClient } from "@/lib/supabase/admin";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;

function currentWindowStart(): string {
  const now = Date.now();
  const floored = now - (now % WINDOW_MS);
  return new Date(floored).toISOString();
}

export async function checkRateLimit(ipAddress: string | null): Promise<boolean> {
  if (!ipAddress) return true;

  const supabase = createAdminClient();
  const windowStart = currentWindowStart();

  const { data: existing, error: selectError } = await supabase
    .from("enquiry_rate_limits")
    .select("count")
    .eq("ip_address", ipAddress)
    .eq("window_start", windowStart)
    .maybeSingle();

  if (selectError) throw new Error(`Failed to check rate limit: ${selectError.message}`);

  const currentCount = (existing as { count: number } | null)?.count ?? 0;

  if (currentCount >= MAX_PER_WINDOW) return false;

  // Read-then-write, not atomic — acceptable for a spam deterrent (not a
  // security boundary): a rare race under concurrent requests from the same
  // IP in the same 10-minute window can let one extra request through, but
  // can never let unbounded requests through.
  const { error: upsertError } = await supabase
    .from("enquiry_rate_limits")
    .upsert(
      { ip_address: ipAddress, window_start: windowStart, count: currentCount + 1 },
      { onConflict: "ip_address,window_start" }
    );

  if (upsertError) throw new Error(`Failed to record rate limit: ${upsertError.message}`);

  return true;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/rate-limit.test.ts`
Expected: PASS (4/4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/rate-limit.ts src/lib/rate-limit.test.ts
git commit -m "feat: add fixed-window IP rate limiting for enquiry submissions"
```

---

### Task 5: Email notification

**Files:**
- Modify: `package.json` (add `resend` dependency)
- Create: `src/lib/notify-enquiry.ts`
- Test: `src/lib/notify-enquiry.test.ts`

**Interfaces:**
- Consumes: `Enquiry` from `@/lib/enquiries/types` (Task 2).
- Produces: `sendEnquiryNotification(enquiry: Enquiry): Promise<void>` — consumed by Task 7's route. Never throws.

- [ ] **Step 1: Install the dependency**

```bash
npm install resend
```

- [ ] **Step 2: Write the failing test**

```ts
// src/lib/notify-enquiry.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Enquiry } from "@/lib/enquiries/types";

const sendMock = vi.fn();

vi.mock("resend", () => ({
  // A named function expression, not an arrow function: notify-enquiry.ts
  // calls `new Resend(apiKey)`, and arrow functions have no [[Construct]]
  // slot in JS — this must be constructible.
  Resend: vi.fn().mockImplementation(function Resend() {
    return { emails: { send: sendMock } };
  }),
}));

import { sendEnquiryNotification } from "./notify-enquiry";

const baseEnquiry: Enquiry = {
  id: 1,
  type: "contact",
  name: "Sarah Jenkins",
  email: "sarah@example.com",
  phone: "+974 5555 5555",
  message: "Interested in a Maldives package",
  status: "new",
  packageId: null,
  details: { service: "holiday" },
  createdAt: "2026-07-30T10:00:00.000Z",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("sendEnquiryNotification", () => {
  it("no-ops when ENQUIRY_NOTIFY_EMAIL is unset", async () => {
    vi.stubEnv("ENQUIRY_NOTIFY_EMAIL", "");
    vi.stubEnv("RESEND_API_KEY", "re_test_key");

    await sendEnquiryNotification(baseEnquiry);

    expect(sendMock).not.toHaveBeenCalled();
    vi.unstubAllEnvs();
  });

  it("no-ops when RESEND_API_KEY is unset", async () => {
    vi.stubEnv("ENQUIRY_NOTIFY_EMAIL", "hello@maramholidays.com");
    vi.stubEnv("RESEND_API_KEY", "");

    await sendEnquiryNotification(baseEnquiry);

    expect(sendMock).not.toHaveBeenCalled();
    vi.unstubAllEnvs();
  });

  it("sends a notification email with the enquiry details when both env vars are set", async () => {
    vi.stubEnv("ENQUIRY_NOTIFY_EMAIL", "hello@maramholidays.com");
    vi.stubEnv("RESEND_API_KEY", "re_test_key");
    sendMock.mockResolvedValue({ data: { id: "email_1" }, error: null });

    await sendEnquiryNotification(baseEnquiry);

    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "hello@maramholidays.com",
        subject: expect.stringContaining("contact"),
      })
    );
    vi.unstubAllEnvs();
  });

  it("swallows an error thrown by Resend rather than propagating it", async () => {
    vi.stubEnv("ENQUIRY_NOTIFY_EMAIL", "hello@maramholidays.com");
    vi.stubEnv("RESEND_API_KEY", "re_test_key");
    sendMock.mockRejectedValue(new Error("Resend API error"));

    await expect(sendEnquiryNotification(baseEnquiry)).resolves.toBeUndefined();
    vi.unstubAllEnvs();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run src/lib/notify-enquiry.test.ts`
Expected: FAIL — `Cannot find module './notify-enquiry'`.

- [ ] **Step 4: Write the implementation**

```ts
// src/lib/notify-enquiry.ts
import { Resend } from "resend";
import type { Enquiry } from "@/lib/enquiries/types";

function formatEnquiryText(enquiry: Enquiry): string {
  const lines = [
    `Type: ${enquiry.type}`,
    `Name: ${enquiry.name ?? "(not provided)"}`,
    `Email: ${enquiry.email}`,
    `Phone: ${enquiry.phone}`,
  ];

  if (enquiry.message) lines.push(`Message: ${enquiry.message}`);
  if (enquiry.packageId) lines.push(`Package ID: ${enquiry.packageId}`);

  lines.push("", "Details:", JSON.stringify(enquiry.details, null, 2));

  return lines.join("\n");
}

export async function sendEnquiryNotification(enquiry: Enquiry): Promise<void> {
  const notifyEmail = process.env.ENQUIRY_NOTIFY_EMAIL;
  const apiKey = process.env.RESEND_API_KEY;

  if (!notifyEmail || !apiKey) {
    console.warn("Enquiry notification skipped: ENQUIRY_NOTIFY_EMAIL or RESEND_API_KEY not set.");
    return;
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: "enquiries@maramholidays.com",
      to: notifyEmail,
      subject: `New ${enquiry.type} enquiry from ${enquiry.name ?? enquiry.email}`,
      text: formatEnquiryText(enquiry),
    });
  } catch (error) {
    console.error("Failed to send enquiry notification email:", error);
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/lib/notify-enquiry.test.ts`
Expected: PASS (4/4 tests).

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/lib/notify-enquiry.ts src/lib/notify-enquiry.test.ts
git commit -m "feat: add Resend email notification for new enquiries"
```

---

### Task 6: Repository — `create`, `listAll`

**Files:**
- Create: `src/lib/enquiries-repository.ts`
- Test: `src/lib/enquiries-repository.test.ts`

**Interfaces:**
- Consumes: `createAdminClient` (existing), `EnquiryRow`/`Enquiry`/`rowToEnquiry` (Task 2), `EnquiryInput` (Task 3).
- Produces: `enquiriesRepository.create(input: EnquiryInput): Promise<Enquiry>`, `enquiriesRepository.listAll(): Promise<Enquiry[]>` — consumed by Task 7's route.

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/enquiries-repository.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const selectMock = vi.fn();
const insertMock = vi.fn();
const orderMock = vi.fn();
const singleMock = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: () => ({
      select: selectMock,
      insert: insertMock,
    }),
  }),
}));

import { enquiriesRepository } from "./enquiries-repository";
import type { EnquiryInput } from "@/lib/enquiries/schema";

function makeRawRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    type: "contact",
    name: "Sarah Jenkins",
    email: "sarah@example.com",
    phone: "+974 5555 5555",
    message: "Interested in a Maldives package",
    status: "new",
    package_id: null,
    details: { service: "holiday" },
    created_at: "2026-07-30T10:00:00.000Z",
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  selectMock.mockReturnValue({ order: orderMock, single: singleMock });
  insertMock.mockReturnValue({ select: selectMock });
});

describe("enquiriesRepository.create", () => {
  it("creates a contact enquiry and maps the row to camelCase", async () => {
    singleMock.mockResolvedValue({ data: makeRawRow(), error: null });

    const input: EnquiryInput = {
      type: "contact",
      name: "Sarah Jenkins",
      email: "sarah@example.com",
      phone: "+974 5555 5555",
      message: "Interested in a Maldives package",
      details: { service: "holiday" },
    };

    const result = await enquiriesRepository.create(input);

    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "contact",
        name: "Sarah Jenkins",
        email: "sarah@example.com",
        phone: "+974 5555 5555",
        message: "Interested in a Maldives package",
        package_id: null,
        details: { service: "holiday" },
      })
    );
    expect(result.id).toBe(1);
    expect(result.packageId).toBeNull();
    expect(result.createdAt).toBe("2026-07-30T10:00:00.000Z");
  });

  it("passes packageId through as package_id for a book_now enquiry", async () => {
    singleMock.mockResolvedValue({
      data: makeRawRow({ type: "book_now", package_id: 12, message: null, details: { destination: "Maldives", travelDate: "2026-10-01", travelers: "2" } }),
      error: null,
    });

    const input: EnquiryInput = {
      type: "book_now",
      name: "Fatima Noor",
      email: "fatima@example.com",
      phone: "+974 5555 5558",
      packageId: 12,
      details: { destination: "Maldives", travelDate: "2026-10-01", travelers: "2" },
    };

    const result = await enquiriesRepository.create(input);

    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({ package_id: 12 }));
    expect(result.packageId).toBe(12);
  });

  it("passes name through as null for a hotel_search enquiry", async () => {
    singleMock.mockResolvedValue({
      data: makeRawRow({ type: "hotel_search", name: null, message: null, details: { destination: "Bangkok", checkInDate: "2026-09-01", checkOutDate: "2026-09-04", rooms: "1", adults: "2", children: "0" } }),
      error: null,
    });

    const input: EnquiryInput = {
      type: "hotel_search",
      email: "guest@example.com",
      phone: "+974 5555 5557",
      details: { destination: "Bangkok", checkInDate: "2026-09-01", checkOutDate: "2026-09-04", rooms: "1", adults: "2", children: "0" },
    };

    const result = await enquiriesRepository.create(input);

    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({ name: null }));
    expect(result.name).toBeNull();
  });

  it("throws when the insert fails", async () => {
    singleMock.mockResolvedValue({ data: null, error: { message: "db error" } });

    const input: EnquiryInput = {
      type: "contact",
      name: "Sarah Jenkins",
      email: "sarah@example.com",
      phone: "+974 5555 5555",
      message: "Hi",
      details: { service: "holiday" },
    };

    await expect(enquiriesRepository.create(input)).rejects.toThrow("Failed to create enquiry");
  });
});

describe("enquiriesRepository.listAll", () => {
  it("returns all enquiries ordered by newest first", async () => {
    orderMock.mockResolvedValue({ data: [makeRawRow(), makeRawRow({ id: 2 })], error: null });

    const result = await enquiriesRepository.listAll();

    expect(orderMock).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(1);
  });

  it("throws when the fetch fails", async () => {
    orderMock.mockResolvedValue({ data: null, error: { message: "db error" } });

    await expect(enquiriesRepository.listAll()).rejects.toThrow("Failed to fetch enquiries");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/enquiries-repository.test.ts`
Expected: FAIL — `Cannot find module './enquiries-repository'`.

- [ ] **Step 3: Write the implementation**

```ts
// src/lib/enquiries-repository.ts
import { createAdminClient } from "@/lib/supabase/admin";
import { rowToEnquiry } from "@/lib/enquiries/types";
import type { EnquiryRow, Enquiry } from "@/lib/enquiries/types";
import type { EnquiryInput } from "@/lib/enquiries/schema";

const TABLE = "enquiries";

export const enquiriesRepository = {
  async create(input: EnquiryInput): Promise<Enquiry> {
    const supabase = createAdminClient();

    const insertRow = {
      type: input.type,
      name: input.name ?? null,
      email: input.email,
      phone: input.phone,
      message: input.message ?? null,
      package_id: input.type === "book_now" ? (input.packageId ?? null) : null,
      details: input.details,
    };

    const { data, error } = await supabase.from(TABLE).insert(insertRow).select().single();

    if (error) throw new Error(`Failed to create enquiry: ${error.message}`);

    return rowToEnquiry(data as EnquiryRow);
  },

  async listAll(): Promise<Enquiry[]> {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from(TABLE).select("*").order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to fetch enquiries: ${error.message}`);

    return (data as EnquiryRow[]).map(rowToEnquiry);
  },
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/enquiries-repository.test.ts`
Expected: PASS (6/6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/enquiries-repository.ts src/lib/enquiries-repository.test.ts
git commit -m "feat: add enquiries repository (create, listAll)"
```

---

### Task 7: API route — `POST`/`GET /api/enquiries`

**Files:**
- Create: `src/app/api/enquiries/route.ts`

**Interfaces:**
- Consumes: `enquiriesRepository` (Task 6), `enquiryInputSchema` (Task 3), `checkRateLimit` (Task 4), `sendEnquiryNotification` (Task 5), `requireAdminSession`/`UnauthorizedError` (existing, `@/lib/admin-auth`).

- [ ] **Step 1: Write the route**

```ts
// src/app/api/enquiries/route.ts
import { NextResponse } from "next/server";
import { enquiriesRepository } from "@/lib/enquiries-repository";
import { enquiryInputSchema } from "@/lib/enquiries/schema";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendEnquiryNotification } from "@/lib/notify-enquiry";
import { requireAdminSession, UnauthorizedError } from "@/lib/admin-auth";

function getClientIp(request: Request): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (!forwardedFor) return null;
  return forwardedFor.split(",")[0].trim();
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const allowed = await checkRateLimit(ip);

  if (!allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  const body = await request.json();
  const parsed = enquiryInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid enquiry data", details: parsed.error.flatten() }, { status: 400 });
  }

  const created = await enquiriesRepository.create(parsed.data);

  void sendEnquiryNotification(created);

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

  const enquiries = await enquiriesRepository.listAll();
  return NextResponse.json({ enquiries });
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: 0 errors.

Run: `npm run build`
Expected: build succeeds, `/api/enquiries` appears in the route manifest.

- [ ] **Step 3: Full test suite**

Run: `npm test`
Expected: all tests pass (this plan's new tests plus every existing test, unmodified).

- [ ] **Step 4: Commit**

```bash
git add src/app/api/enquiries/route.ts
git commit -m "feat: add POST/GET /api/enquiries route"
```

---

## Environment Setup (manual, not code)

Before the email notification can actually deliver, add these to `.env.local` (server-only, never committed — same handling as the existing Supabase keys):

```
RESEND_API_KEY=<from your Resend account>
ENQUIRY_NOTIFY_EMAIL=hello@maramholidays.com
```

Until a Resend account exists with a verified sending domain, `sendEnquiryNotification` will no-op and log a warning (per Task 5) — enquiries still save correctly, they just won't trigger an email yet. This is expected and does not block finishing this plan.

## Self-Review Notes

**Spec coverage:** Every section of `docs/superpowers/specs/2026-07-30-enquiry-capture-design.md`'s Plan 3a scope is covered — `enquiries`/`enquiry_rate_limits` tables (Task 1), types/mapper (Task 2), discriminated-union schema for all 4 types (Task 3), fixed-window rate limiting with fail-open (Task 4), fire-and-forget Resend notification with no-op-when-unset (Task 5), repository (Task 6), and the route wiring rate-limit → validate → create → notify (Task 7). `GET /api/enquiries` is included per the spec's non-goal note (endpoint exists, no UI consumes it here).

**Placeholder scan:** No TBD/TODO markers; every step has complete, runnable code.

**Type consistency:** `EnquiryInput` (Task 3) is consumed identically in Task 6's `create(input: EnquiryInput)` and Task 7's route; `Enquiry`/`EnquiryRow`/`rowToEnquiry` (Task 2) are consumed identically in Task 5's `sendEnquiryNotification(enquiry: Enquiry)` and Task 6's repository. `checkRateLimit(ipAddress: string | null): Promise<boolean>` (Task 4) matches its Task 7 call site exactly.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-30-enquiries-data-layer.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
