# Enquiries Archive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a one-click Archive/Unarchive action to each enquiry in the admin Enquiries Inbox, with a "Show archived" toggle to reveal archived enquiries again.

**Architecture:** A new `archived boolean` column on `enquiries` (independent of the existing `status` column), a `toggleArchived` repository method and a `PATCH /api/enquiries/[id]/archive` route mirroring the codebase's existing `packagesRepository.toggleFeatured` / `PATCH /api/packages/[id]/feature` pattern exactly, and a small `EnquiriesTable.tsx` UI addition (per-row button + header toggle + client-side filter).

**Tech Stack:** Next.js App Router, Supabase Postgres, `@tanstack/react-query`, Vitest.

## Global Constraints

- Archiving is orthogonal to the existing `status` column (new/contacted/closed) — no change to `status` semantics.
- No delete, no bulk actions, no search/filter/pagination beyond the single "Show archived" toggle.
- Follow existing repository conventions exactly: `EnquiryNotFoundError` mirrors `PackageNotFoundError`, `toggleArchived` mirrors `toggleFeatured`, the API route mirrors `src/app/api/packages/[id]/feature/route.ts`.
- No dedicated test file for the API route or for `EnquiriesTable.tsx` — matches this codebase's established convention (only `src/app/api/admin/upload-image/route.test.ts` exists as a route-level test anywhere in `src/app/api`; every other route relies on repository-level tests).
- TypeScript strict, no comments except where a non-obvious constraint needs explaining.

---

## File Structure

| File | Change | Responsibility |
|---|---|---|
| `supabase/migrations/20260808120000_add_enquiries_archived.sql` | Create | Adds the `archived boolean` column. |
| `src/lib/enquiries/types.ts` | Modify | Adds `archived` to `EnquiryRow`/`Enquiry`/`rowToEnquiry`. |
| `src/lib/enquiries-repository.ts` | Modify | Adds `EnquiryNotFoundError`, `fetchRowById`, `toggleArchived`. |
| `src/lib/enquiries-repository.test.ts` | Modify | Tests for `toggleArchived`. |
| `src/app/api/enquiries/[id]/archive/route.ts` | Create | Admin-gated `PATCH` endpoint. |
| `src/components/admin/EnquiriesTable.tsx` | Modify | Archive button per row + "Show archived" toggle + filtering. |

---

### Task 1: Migration + types

**Files:**
- Create: `supabase/migrations/20260808120000_add_enquiries_archived.sql`
- Modify: `src/lib/enquiries/types.ts`

**Interfaces:**
- Produces: `EnquiryRow.archived: boolean`, `Enquiry.archived: boolean`, both mapped by `rowToEnquiry`. Consumed by Task 2 (repository), Task 4 (frontend).

- [ ] **Step 1: Create the migration**

```sql
-- supabase/migrations/20260808120000_add_enquiries_archived.sql
alter table public.enquiries add column archived boolean not null default false;
```

- [ ] **Step 2: Update `EnquiryRow` and `Enquiry`**

Current (`src/lib/enquiries/types.ts:4-15`):
```ts
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
```

Replace with:
```ts
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
  archived: boolean;
  created_at: string;
}
```

Current (`src/lib/enquiries/types.ts:17-28`):
```ts
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
```

Replace with:
```ts
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
  archived: boolean;
  createdAt: string;
}
```

Current (`src/lib/enquiries/types.ts:30-43`):
```ts
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

Replace with:
```ts
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
    archived: row.archived,
    createdAt: row.created_at,
  };
}
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit`
Expected: errors in `src/lib/enquiries-repository.test.ts` (`makeRawRow` missing `archived`) and anywhere else `EnquiryRow`/`Enquiry` object literals are constructed without `archived` — expected at this checkpoint, resolved in Task 2.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260808120000_add_enquiries_archived.sql src/lib/enquiries/types.ts
git commit -m "feat: add archived column to enquiries schema and types"
```

---

### Task 2: Repository `toggleArchived`

**Files:**
- Modify: `src/lib/enquiries-repository.ts`
- Modify: `src/lib/enquiries-repository.test.ts`

**Interfaces:**
- Consumes: `Enquiry`, `EnquiryRow` with `archived: boolean` (Task 1).
- Produces: `export class EnquiryNotFoundError extends Error` and `enquiriesRepository.toggleArchived(id: number): Promise<Enquiry>`, both from `src/lib/enquiries-repository.ts`. Consumed by Task 3 (API route).

- [ ] **Step 1: Write the failing tests**

Current (`src/lib/enquiries-repository.test.ts:4-16`):
```ts
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
```

Replace with:
```ts
const selectMock = vi.fn();
const insertMock = vi.fn();
const orderMock = vi.fn();
const singleMock = vi.fn();
const updateMock = vi.fn();
const eqMock = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: () => ({
      select: selectMock,
      insert: insertMock,
      update: updateMock,
    }),
  }),
}));
```

Current (`src/lib/enquiries-repository.test.ts:21-35`):
```ts
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
```

Replace with:
```ts
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
    archived: false,
    created_at: "2026-07-30T10:00:00.000Z",
    ...overrides,
  };
}
```

Append at the end of `src/lib/enquiries-repository.test.ts` (after the existing `describe("enquiriesRepository.listAll", ...)` block):
```ts

describe("enquiriesRepository.toggleArchived", () => {
  it("flips the archived flag from false to true", async () => {
    const existingRow = makeRawRow({ archived: false });
    singleMock
      .mockResolvedValueOnce({ data: existingRow, error: null })
      .mockResolvedValueOnce({ data: { ...existingRow, archived: true }, error: null });
    eqMock.mockReturnValue({ single: singleMock });
    selectMock
      .mockReturnValueOnce({ eq: eqMock })
      .mockReturnValueOnce({ single: singleMock });
    updateMock.mockReturnValue({ eq: () => ({ select: selectMock }) });

    const result = await enquiriesRepository.toggleArchived(1);

    expect(result.archived).toBe(true);
  });

  it("throws EnquiryNotFoundError when the enquiry does not exist", async () => {
    singleMock.mockResolvedValue({ data: null, error: { code: "PGRST116" } });
    eqMock.mockReturnValue({ single: singleMock });
    selectMock.mockReturnValue({ eq: eqMock });

    await expect(enquiriesRepository.toggleArchived(999)).rejects.toThrow("Enquiry with ID 999 not found.");
    expect(updateMock).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/enquiries-repository.test.ts`
Expected: FAIL — `enquiriesRepository.toggleArchived is not a function`.

- [ ] **Step 3: Implement `toggleArchived`**

Replace the full contents of `src/lib/enquiries-repository.ts` with:
```ts
// src/lib/enquiries-repository.ts
import { createAdminClient } from "@/lib/supabase/admin";
import { rowToEnquiry } from "@/lib/enquiries/types";
import type { EnquiryRow, Enquiry } from "@/lib/enquiries/types";
import type { EnquiryInput } from "@/lib/enquiries/schema";

const TABLE = "enquiries";

export class EnquiryNotFoundError extends Error {
  constructor(id: number) {
    super(`Enquiry with ID ${id} not found.`);
    this.name = "EnquiryNotFoundError";
  }
}

async function fetchRowById(id: number): Promise<EnquiryRow | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from(TABLE).select("*").eq("id", id).single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`Failed to fetch enquiry ${id}: ${error.message}`);
  }

  return data as EnquiryRow;
}

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

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/enquiries-repository.test.ts`
Expected: PASS — all tests in the file, including the 2 new `toggleArchived` tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/enquiries-repository.ts src/lib/enquiries-repository.test.ts
git commit -m "feat: add enquiriesRepository.toggleArchived"
```

---

### Task 3: API route

**Files:**
- Create: `src/app/api/enquiries/[id]/archive/route.ts`

**Interfaces:**
- Consumes: `enquiriesRepository.toggleArchived(id: number): Promise<Enquiry>`, `EnquiryNotFoundError` (Task 2); `requireAdminSession`, `UnauthorizedError` from `@/lib/admin-auth` (existing, unchanged).
- Produces: `PATCH /api/enquiries/:id/archive` — 200 with the updated `Enquiry` JSON, 401 if unauthenticated, 404 if the id doesn't exist. Consumed by Task 4 (frontend).

- [ ] **Step 1: Create the route**

```ts
// src/app/api/enquiries/[id]/archive/route.ts
import { NextResponse } from "next/server";
import { enquiriesRepository, EnquiryNotFoundError } from "@/lib/enquiries-repository";
import { requireAdminSession, UnauthorizedError } from "@/lib/admin-auth";

export async function PATCH(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminSession();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw error;
  }

  const { id } = await params;

  try {
    const updated = await enquiriesRepository.toggleArchived(Number(id));
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof EnquiryNotFoundError) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    }
    throw error;
  }
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: 0 errors.

Run: `npm run build`
Expected: build succeeds, `/api/enquiries/[id]/archive` appears in the route manifest.

- [ ] **Step 3: Commit**

```bash
git add "src/app/api/enquiries/[id]/archive/route.ts"
git commit -m "feat: add PATCH /api/enquiries/:id/archive endpoint"
```

---

### Task 4: `EnquiriesTable.tsx` UI

**Files:**
- Modify: `src/components/admin/EnquiriesTable.tsx`

**Interfaces:**
- Consumes: `PATCH /api/enquiries/:id/archive` (Task 3), `Enquiry.archived: boolean` (Task 1).

- [ ] **Step 1: Update imports and add the mutation fetch helper**

Current (`src/components/admin/EnquiriesTable.tsx:1-19`):
```tsx
// src/components/admin/EnquiriesTable.tsx
"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Loader2, Inbox, ChevronDown, Mail, Phone,
  ExternalLink, AlertCircle,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Enquiry, EnquiryType } from "@/lib/enquiries/types";
import { extractErrorMessage } from "@/lib/extract-error-message";

async function fetchEnquiries(): Promise<Enquiry[]> {
  const res = await fetch("/api/enquiries");
  if (!res.ok) throw new Error(await extractErrorMessage(res, "Failed to load enquiries"));
  const json = await res.json();
  return json.enquiries as Enquiry[];
}
```

Replace with:
```tsx
// src/components/admin/EnquiriesTable.tsx
"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Loader2, Inbox, ChevronDown, Mail, Phone,
  ExternalLink, AlertCircle, Archive, ArchiveRestore,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Enquiry, EnquiryType } from "@/lib/enquiries/types";
import { extractErrorMessage } from "@/lib/extract-error-message";

async function fetchEnquiries(): Promise<Enquiry[]> {
  const res = await fetch("/api/enquiries");
  if (!res.ok) throw new Error(await extractErrorMessage(res, "Failed to load enquiries"));
  const json = await res.json();
  return json.enquiries as Enquiry[];
}

async function toggleArchived(id: number): Promise<Enquiry> {
  const res = await fetch(`/api/enquiries/${id}/archive`, { method: "PATCH" });
  if (!res.ok) throw new Error(await extractErrorMessage(res, "Failed to update enquiry"));
  return res.json() as Promise<Enquiry>;
}
```

- [ ] **Step 2: Replace `EnquiryRow` with an archive-aware, non-nested-button version**

The existing `EnquiryRow` wraps its entire clickable row in a `<button>`. Adding an Archive button inside that would nest a `<button>` inside a `<button>`, which is invalid HTML — browsers auto-close the outer button, breaking the click handler. This step switches the row's expand/collapse control from a `<button>` to a `<div role="button" tabIndex={0}>` with keyboard support, so the Archive control can be a real sibling `<button>`.

Current (`src/components/admin/EnquiriesTable.tsx:122-153`):
```tsx
function EnquiryRow({ enquiry }: { enquiry: Enquiry }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-b border-slate-800/60 last:border-b-0">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-slate-900/30 transition-colors cursor-pointer"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white truncate">{enquiry.name ?? "—"}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
            <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{enquiry.email}</span>
            <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{enquiry.phone}</span>
          </div>
        </div>
        <span className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold border ${TYPE_BADGE_COLORS[enquiry.type]}`}>
          {TYPE_LABELS[enquiry.type]}
        </span>
        <span
          className="shrink-0 text-xs text-slate-500 w-28 text-right"
          title={enquiry.createdAt}
        >
          {relativeTime(enquiry.createdAt)}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>
      {expanded && <EnquiryDetails enquiry={enquiry} />}
    </div>
  );
}
```

Replace with:
```tsx
function EnquiryRow({
  enquiry,
  onToggleArchive,
  isTogglingArchive,
}: {
  enquiry: Enquiry;
  onToggleArchive: (id: number) => void;
  isTogglingArchive: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`border-b border-slate-800/60 last:border-b-0 ${enquiry.archived ? "opacity-50" : ""}`}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setExpanded((prev) => !prev)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setExpanded((prev) => !prev);
          }
        }}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-slate-900/30 transition-colors cursor-pointer"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white truncate">{enquiry.name ?? "—"}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
            <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{enquiry.email}</span>
            <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{enquiry.phone}</span>
          </div>
        </div>
        <span className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold border ${TYPE_BADGE_COLORS[enquiry.type]}`}>
          {TYPE_LABELS[enquiry.type]}
        </span>
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

- [ ] **Step 3: Wire the "Show archived" toggle and mutation into `EnquiriesTable`**

Current (`src/components/admin/EnquiriesTable.tsx:155-194`):
```tsx
export default function EnquiriesTable() {
  const { data: enquiries = [], isLoading, error } = useQuery({
    queryKey: ["enquiries"],
    queryFn: fetchEnquiries,
  });

  return (
    <div className="space-y-6">
      <div className="border border-slate-800/80 rounded-2xl overflow-hidden bg-slate-900/15">
        {isLoading ? (
          <div className="flex h-72 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-72 text-center p-6">
            <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
            <h3 className="text-base font-bold text-slate-350">Failed to load enquiries</h3>
            <p className="text-xs text-slate-500 max-w-xs mt-1">
              {error instanceof Error ? error.message : "Something went wrong. Please try again."}
            </p>
          </div>
        ) : enquiries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-72 text-center p-6">
            <Inbox className="h-12 w-12 text-slate-600 mb-3" />
            <h3 className="text-base font-bold text-slate-350">No Enquiries Yet</h3>
            <p className="text-xs text-slate-500 max-w-xs mt-1">
              Submissions from the contact, hotel booking, hotel search, and booking forms will appear here.
            </p>
          </div>
        ) : (
          <div>
            {enquiries.map((enquiry) => (
              <EnquiryRow key={enquiry.id} enquiry={enquiry} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

Replace with:
```tsx
export default function EnquiriesTable() {
  const queryClient = useQueryClient();
  const [showArchived, setShowArchived] = useState(false);

  const { data: enquiries = [], isLoading, error } = useQuery({
    queryKey: ["enquiries"],
    queryFn: fetchEnquiries,
  });

  const toggleArchivedMutation = useMutation({
    mutationFn: toggleArchived,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["enquiries"] }),
  });

  const visibleEnquiries = enquiries.filter((enquiry) => showArchived || !enquiry.archived);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(event) => setShowArchived(event.target.checked)}
            className="h-4 w-4 rounded border-slate-700 bg-slate-900 accent-blue-600 cursor-pointer"
          />
          Show archived
        </label>
      </div>

      <div className="border border-slate-800/80 rounded-2xl overflow-hidden bg-slate-900/15">
        {isLoading ? (
          <div className="flex h-72 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-72 text-center p-6">
            <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
            <h3 className="text-base font-bold text-slate-350">Failed to load enquiries</h3>
            <p className="text-xs text-slate-500 max-w-xs mt-1">
              {error instanceof Error ? error.message : "Something went wrong. Please try again."}
            </p>
          </div>
        ) : visibleEnquiries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-72 text-center p-6">
            <Inbox className="h-12 w-12 text-slate-600 mb-3" />
            <h3 className="text-base font-bold text-slate-350">
              {showArchived ? "No Archived Enquiries" : "No Enquiries Yet"}
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mt-1">
              {showArchived
                ? "Enquiries you archive will show up here."
                : "Submissions from the contact, hotel booking, hotel search, and booking forms will appear here."}
            </p>
          </div>
        ) : (
          <div>
            {visibleEnquiries.map((enquiry) => (
              <EnquiryRow
                key={enquiry.id}
                enquiry={enquiry}
                onToggleArchive={(id) => toggleArchivedMutation.mutate(id)}
                isTogglingArchive={toggleArchivedMutation.isPending && toggleArchivedMutation.variables === enquiry.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit`
Expected: 0 errors.

Run: `npm run build`
Expected: build succeeds, `/admin/enquiries` route unaffected in the manifest.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/EnquiriesTable.tsx
git commit -m "feat: add archive/unarchive UI to EnquiriesTable"
```

---

### Task 5: Final verification

**Files:**
- None (verification-only task).

- [ ] **Step 1: Full type check**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: build succeeds; `/admin/enquiries` and `/api/enquiries/[id]/archive` present in the route manifest.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: no *new* errors beyond the pre-existing baseline (102 problems / 37 errors / 65 warnings, confirmed current as of the prior Admin Enquiries Inbox work in this repo).

- [ ] **Step 4: Full test suite**

Run: `npm test`
Expected: all existing tests still pass, plus the 2 new `toggleArchived` tests (90/90 total, up from 88/88).

**Manual verification note:** if a dev server, browser, and admin login are available in your environment, start `npm run dev`, open `/admin/enquiries`, click Archive on a row, confirm it disappears from the default view, toggle "Show archived", confirm it reappears dimmed with an Unarchive button, click Unarchive, confirm it returns to normal. If you cannot reach a running dev server in this environment, say so explicitly in your report rather than claiming this was verified — `tsc`/`build`/`lint`/`test` passing confirms the code is correctly wired, not that a live round-trip was exercised.

- [ ] **Step 5: No commit for this task** (verification only — nothing to commit unless a prior step's verification uncovers something to fix, in which case fix it as part of re-running the relevant earlier task).

## Self-Review Notes

**Spec coverage:** Every section of `docs/superpowers/specs/2026-08-08-enquiries-archive-design.md` is covered — migration + types (Task 1), repository + tests (Task 2), API route (Task 3), frontend toggle/button/filtering (Task 4), verification (Task 5). The spec's "no delete," "no status column change," and "no bulk actions" non-goals are respected throughout — no task touches `status`, no delete endpoint is added, every action is single-enquiry.

**Placeholder scan:** No TBD/TODO markers; every step has complete, runnable code.

**Type consistency:** `Enquiry.archived: boolean` (Task 1) flows unchanged through `enquiriesRepository.toggleArchived(id: number): Promise<Enquiry>` (Task 2), the route's `NextResponse.json(updated)` (Task 3, `updated: Enquiry`), and `EnquiriesTable.tsx`'s `toggleArchived(id: number): Promise<Enquiry>` fetch helper and `enquiry.archived` reads (Task 4) — no name or shape drift across tasks. `EnquiryNotFoundError` is defined once in Task 2 and imported by name, unchanged, in Task 3.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-08-08-enquiries-archive.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
