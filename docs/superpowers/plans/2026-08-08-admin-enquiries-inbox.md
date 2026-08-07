# Admin Enquiries Inbox Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a read-only admin dashboard page listing all submitted customer enquiries, newest first, with expandable per-row detail.

**Architecture:** A new `EnquiriesTable` component fetches `GET /api/enquiries` (existing, admin-gated, unchanged) via `useQuery`, following `CategoryPackagesTable.tsx`'s established data-fetching and styling conventions exactly. A new thin page wrapper mounts it inside `DashboardShell`, and a new sidebar entry links to it. Zero backend changes.

**Tech Stack:** Next.js App Router, `@tanstack/react-query` (existing), Tailwind (existing dark dashboard theme).

This plan has no earlier or later plans — it's a small, self-contained follow-on to the already-implemented enquiries backend (Plan 3a: `docs/superpowers/plans/2026-07-30-enquiries-data-layer.md`) and form wiring (Plan 3b: `docs/superpowers/plans/2026-07-31-wire-enquiry-forms.md`). Depends on `GET /api/enquiries` (`src/app/api/enquiries/route.ts`), `Enquiry`/`EnquiryType` (`src/lib/enquiries/types.ts`), and `extractErrorMessage` (`src/lib/extract-error-message.ts`), all already built.

## Global Constraints

- Read-only — no status management (marking contacted/closed), no filtering, no search, no pagination.
- `name` displays as `"—"` when `null` (the `hotel_search` type never collects one).
- The `details` object's fields are rendered with human-readable labels per type, never as raw JSON — the exact field/label mapping per type is given in Task 2.
- `book_now` enquiries with a non-null `packageId` show a link to `/admin/packages` (no per-package admin detail route exists to link to more specifically).
- Follow the repository's existing code style: TypeScript strict, no comments except where a non-obvious constraint needs explaining.

---

## File Structure

| File | Change | Responsibility |
|---|---|---|
| `src/components/admin/EnquiriesTable.tsx` | Create | Fetches and renders the enquiries list with expandable rows. |
| `src/app/[locale]/(admin)/admin/(dashboard)/enquiries/page.tsx` | Create | Thin page wrapper (`DashboardShell` + `EnquiriesTable`). |
| `src/components/admin/DashboardShell.tsx` | Modify | Add an "Enquiries" sidebar entry. |

---

### Task 1: Sidebar entry + page wrapper

**Files:**
- Modify: `src/components/admin/DashboardShell.tsx`
- Create: `src/app/[locale]/(admin)/admin/(dashboard)/enquiries/page.tsx`

**Interfaces:**
- Produces: the route `/admin/enquiries`, consumed by Task 2's `EnquiriesTable` (imported into the new page file).

This task is split first because it's independently verifiable (the page renders, even with a placeholder body) before Task 2's larger data-fetching component is built.

- [ ] **Step 1: Add the sidebar entry**

Current (`src/components/admin/DashboardShell.tsx`, the `menuItems` array):
```tsx
  const menuItems = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      name: "All Packages",
      href: "/admin/packages",
      icon: Layers,
    },
    {
      name: "Holidays",
      href: "/admin/holidays",
      icon: Palmtree,
    },
```

Replace with:
```tsx
  const menuItems = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      name: "All Packages",
      href: "/admin/packages",
      icon: Layers,
    },
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

Current (`src/components/admin/DashboardShell.tsx`, the `lucide-react` import block):
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
  User
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
  Inbox
} from "lucide-react";
```

- [ ] **Step 2: Create the page wrapper**

```tsx
// src/app/[locale]/(admin)/admin/(dashboard)/enquiries/page.tsx
"use client";

import React from "react";
import DashboardShell from "@/components/admin/DashboardShell";
import EnquiriesTable from "@/components/admin/EnquiriesTable";

export default function AdminEnquiriesPage() {
  return (
    <DashboardShell title="Enquiries">
      <EnquiriesTable />
    </DashboardShell>
  );
}
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit`
Expected: errors referencing `EnquiriesTable` not existing yet (Task 2 creates it) — this is expected at this checkpoint; no other errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/DashboardShell.tsx "src/app/[locale]/(admin)/admin/(dashboard)/enquiries/page.tsx"
git commit -m "feat: add Enquiries sidebar entry and admin page route"
```

---

### Task 2: `EnquiriesTable` component

**Files:**
- Create: `src/components/admin/EnquiriesTable.tsx`

**Interfaces:**
- Consumes: `Enquiry`, `EnquiryType` (`@/lib/enquiries/types`, existing), `extractErrorMessage` (`@/lib/extract-error-message`, existing), `GET /api/enquiries` (existing, returns `{ enquiries: Enquiry[] }`).
- Produces: the default-exported `EnquiriesTable` component, consumed by Task 1's page wrapper (already written, this task fills the gap).

- [ ] **Step 1: Write the component**

```tsx
// src/components/admin/EnquiriesTable.tsx
"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Loader2, Inbox, ChevronDown, Mail, Phone, Calendar, MapPin,
  Users, MessageSquare, ExternalLink, AlertCircle,
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

const TYPE_LABELS: Record<EnquiryType, string> = {
  contact: "Contact",
  hotel_booking: "Hotel Booking",
  hotel_search: "Hotel Search",
  book_now: "Book Now",
};

const TYPE_BADGE_COLORS: Record<EnquiryType, string> = {
  contact: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  hotel_booking: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  hotel_search: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  book_now: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffMs = now - then;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString();
}

function formatDetailDate(value: unknown): string {
  if (typeof value !== "string" || !value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function DetailField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm text-slate-200">{value}</p>
    </div>
  );
}

function EnquiryDetails({ enquiry }: { enquiry: Enquiry }) {
  const d = enquiry.details;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-5 bg-slate-950/40 border-t border-slate-800/60">
      {enquiry.message && (
        <div className="col-span-2 md:col-span-3">
          <DetailField label="Message" value={enquiry.message} />
        </div>
      )}

      {enquiry.type === "contact" && (
        <DetailField label="Service" value={String(d.service ?? "—")} />
      )}

      {(enquiry.type === "hotel_booking" || enquiry.type === "hotel_search") && (
        <>
          <DetailField label="Destination" value={String(d.destination ?? "—")} />
          <DetailField label="Check-in" value={formatDetailDate(d.checkInDate)} />
          <DetailField label="Check-out" value={formatDetailDate(d.checkOutDate)} />
          <DetailField label="Rooms" value={String(d.rooms ?? "—")} />
          <DetailField label="Adults" value={String(d.adults ?? "—")} />
          <DetailField label="Children" value={String(d.children ?? "—")} />
        </>
      )}

      {enquiry.type === "hotel_booking" && (
        <>
          <DetailField label="Nationality" value={String(d.nationality ?? "—")} />
          {d.specialRequests ? (
            <div className="col-span-2 md:col-span-3">
              <DetailField label="Special Requests" value={String(d.specialRequests)} />
            </div>
          ) : null}
        </>
      )}

      {enquiry.type === "book_now" && (
        <>
          <DetailField label="Destination" value={String(d.destination ?? "—")} />
          <DetailField label="Travel Date" value={formatDetailDate(d.travelDate)} />
          <DetailField label="Travelers" value={String(d.travelers ?? "—")} />
          {enquiry.packageId !== null && (
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Package</p>
              <Link
                href="/admin/packages"
                className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 hover:underline"
              >
                #{enquiry.packageId} <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}

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
          title={new Date(enquiry.createdAt).toLocaleString()}
        >
          {relativeTime(enquiry.createdAt)}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>
      {expanded && <EnquiryDetails enquiry={enquiry} />}
    </div>
  );
}

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
              Submissions from the contact, hotel booking, and booking forms will appear here.
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

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: 0 errors.

Run: `npm run build`
Expected: build succeeds, `/admin/enquiries` appears in the route manifest.

Grep-check: `grep -n "child611\|child25" src/lib/enquiries/types.ts` → expect no matches (confirming `Enquiry`'s `details` is the generic `Record<string, unknown>`, unlike `PackageAdminInput`'s optional-tour pricing fields — this is a sanity check that Task 2's code isn't confusing the two `details`/pricing shapes from different features).

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/EnquiriesTable.tsx
git commit -m "feat: add EnquiriesTable admin component"
```

---

### Task 3: Final verification

**Files:**
- None (verification-only task).

- [ ] **Step 1: Full type check**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: build succeeds; `/admin/enquiries` present in the route manifest.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: no *new* errors beyond the pre-existing baseline (102 problems / 37 errors / 65 warnings, confirmed as of the most recent prior work in this repo).

- [ ] **Step 4: Full test suite**

Run: `npm test`
Expected: all existing tests still pass unmodified (this plan adds no new tests, per the spec's Testing section — no backend changes, and `EnquiriesTable.tsx` follows `CategoryPackagesTable.tsx`'s established no-dedicated-test-file precedent).

**Manual verification note:** if a dev server, browser, and a way to submit a live enquiry are available in your environment, start `npm run dev`, submit a test enquiry through one of the 4 public forms (e.g. the contact page), then log into `/admin/enquiries` and confirm it appears with the correct expanded details. If you cannot reach a running dev server or submit a live enquiry in this environment, say so explicitly in your report rather than claiming this was verified — `tsc`/`build`/`lint`/`test` passing confirms the code is correctly wired, not that a live round-trip was exercised.

- [ ] **Step 5: No commit for this task** (verification only — nothing to commit unless a prior step's verification uncovers something to fix, in which case fix it as part of re-running the relevant earlier task).

## Self-Review Notes

**Spec coverage:** Every section of `docs/superpowers/specs/2026-08-08-admin-enquiries-inbox-design.md` is covered — sidebar entry + page route (Task 1), the table component with all 4 types' detail rendering, loading/empty/error states, relative time, and the `book_now`/`packageId` link (Task 2), final verification (Task 3).

**Placeholder scan:** No TBD/TODO markers; every step has complete, runnable code.

**Type consistency:** `Enquiry`/`EnquiryType` (consumed from `@/lib/enquiries/types`, unchanged from Plan 3a) are used identically in `fetchEnquiries`'s return type and every component's props. `fetchEnquiries(): Promise<Enquiry[]>` matches the exact shape `GET /api/enquiries` returns (`{ enquiries: Enquiry[] }`, unwrapped the same way `CategoryPackagesTable.tsx`'s `fetchPackages` unwraps `{ packages: Package[] }`). No new types are introduced that could drift from existing ones.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-08-08-admin-enquiries-inbox.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
