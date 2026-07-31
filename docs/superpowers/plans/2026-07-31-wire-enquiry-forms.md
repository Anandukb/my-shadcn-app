# Wire Enquiry Forms Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `setTimeout` fakes in the four enquiry forms (`contact`, `hotel-booking`, the `hotels` search modal, `BookNowDialog`) with real `POST /api/enquiries` calls via TanStack Query, so submitted enquiries actually reach the database and trigger a notification.

**Architecture:** Each form gets a `useMutation` calling `POST /api/enquiries` with a body shaped for its `type`, following the exact `mutateAsync` + `try/catch` + error-state pattern already established and reviewed in `CategoryPackagesTable.tsx`. A shared `extractErrorMessage` helper (extracted from that file, where it was previously duplicated locally) parses the API's `{ error, details }` response shape into a human-readable message for all five call sites.

**Tech Stack:** `@tanstack/react-query` (already installed and provider-mounted in `ClientLayout.tsx`), Vitest.

This is **Plan 3b of 3** (enquiry capture subsystem), following Plan 3a (`docs/superpowers/plans/2026-07-30-enquiries-data-layer.md`, already implemented — `POST /api/enquiries` exists and validates the exact bodies this plan constructs). Depends on nothing else new.

## Global Constraints

- Each form's `type` and `details` shape must match Plan 3a's `enquiryInputSchema` exactly: `contact` → `{ service }`; `hotel_booking` → `{ destination, checkInDate, checkOutDate, rooms, adults, children, nationality, specialRequests }`; `hotel_search` → `{ destination, checkInDate, checkOutDate, rooms, adults, children }`; `book_now` → `{ destination, travelDate, travelers }`.
- Dates are sent as ISO strings (`Date.toISOString()`), never raw `Date` objects.
- `name`/`email`/`phone`/`message` are top-level request fields, never nested inside `details`.
- `BookNowDialog` must include `packageId` (from its `initial` prop, converted to `number`) in the request body when present — this is a fix, since it's currently silently dropped.
- `BookNowDialog`'s email field becomes required in the UI (drop the "optional" label, add the `required` attribute) — Plan 3a's schema already requires email for all four types; the UI must match.
- Existing UI (spinners, success screens, field layout, styling) is preserved as-is — only the fake submit body and the addition of visible error feedback change.
- Error feedback style matches each form's existing visual theme (dark glassmorphic for `contact`, light `slate`/`white` for `hotel-booking` and the `hotels` search modal, `primary`-themed for `BookNowDialog`) — not copy-pasted from the admin dashboard's dark-slate styling verbatim.
- Follow the repository's existing code style: TypeScript strict, no comments except where a non-obvious constraint needs explaining.

---

## File Structure

| File | Change | Responsibility |
|---|---|---|
| `src/lib/extract-error-message.ts` | Create | Shared response-error-parsing helper, extracted from `CategoryPackagesTable.tsx`'s local duplicate. |
| `src/lib/extract-error-message.test.ts` | Create | Tests for the extraction logic. |
| `src/components/admin/CategoryPackagesTable.tsx` | Modify | Remove the local `extractErrorMessage` function, import the shared one instead. |
| `src/app/[locale]/contact/page.tsx` | Modify | Wire `handleSubmit` to `POST /api/enquiries` (`type: "contact"`). |
| `src/app/[locale]/hotel-booking/HotelBookingClient.tsx` | Modify | Wire `handleSubmit` to `POST /api/enquiries` (`type: "hotel_booking"`). |
| `src/app/[locale]/hotels/HotelsLandingClient.tsx` | Modify | Wire the search-modal `handleSubmit` to `POST /api/enquiries` (`type: "hotel_search"`). |
| `src/components/layout/BookNowDialog.tsx` | Modify | Wire `handleSubmit` to `POST /api/enquiries` (`type: "book_now"`, includes `packageId`); make email required in the UI. |

---

### Task 1: Shared error-message helper

**Files:**
- Create: `src/lib/extract-error-message.ts`
- Test: `src/lib/extract-error-message.test.ts`
- Modify: `src/components/admin/CategoryPackagesTable.tsx:96-114` (delete the local function), `src/components/admin/CategoryPackagesTable.tsx` imports (add the new import)

**Interfaces:**
- Produces: `extractErrorMessage(res: Response, fallback: string): Promise<string>` — consumed by Tasks 2-5 and by `CategoryPackagesTable.tsx`'s existing mutations (unchanged behavior, new import source).

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/extract-error-message.test.ts
import { describe, it, expect } from "vitest";
import { extractErrorMessage } from "./extract-error-message";

function makeResponse(body: unknown): Response {
  return { json: async () => body } as unknown as Response;
}

function makeUnparsableResponse(): Response {
  return {
    json: async () => {
      throw new Error("not json");
    },
  } as unknown as Response;
}

describe("extractErrorMessage", () => {
  it("returns the error field when present with no details", async () => {
    const res = makeResponse({ error: "Unauthorized" });
    const message = await extractErrorMessage(res, "fallback");
    expect(message).toBe("Unauthorized");
  });

  it("combines field errors into the message", async () => {
    const res = makeResponse({
      error: "Invalid enquiry data",
      details: { fieldErrors: { email: ["Invalid email"] }, formErrors: [] },
    });
    const message = await extractErrorMessage(res, "fallback");
    expect(message).toBe("Invalid enquiry data — email: Invalid email");
  });

  it("combines form errors into the message", async () => {
    const res = makeResponse({
      error: "Invalid enquiry data",
      details: { formErrors: ["Body is required"], fieldErrors: {} },
    });
    const message = await extractErrorMessage(res, "fallback");
    expect(message).toBe("Invalid enquiry data — Body is required");
  });

  it("falls back to the fallback message when the body has no error field", async () => {
    const res = makeResponse({});
    const message = await extractErrorMessage(res, "fallback");
    expect(message).toBe("fallback");
  });

  it("falls back to the fallback message when the response body is not JSON", async () => {
    const res = makeUnparsableResponse();
    const message = await extractErrorMessage(res, "fallback");
    expect(message).toBe("fallback");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/extract-error-message.test.ts`
Expected: FAIL — `Cannot find module './extract-error-message'`.

- [ ] **Step 3: Write the implementation**

```ts
// src/lib/extract-error-message.ts
export async function extractErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const json = await res.json();
    if (json?.details?.formErrors?.length || json?.details?.fieldErrors) {
      const fieldMessages = json.details.fieldErrors
        ? Object.entries(json.details.fieldErrors as Record<string, string[]>)
            .filter(([, msgs]) => Array.isArray(msgs) && msgs.length > 0)
            .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
        : [];
      const formMessages: string[] = json.details.formErrors ?? [];
      const combined = [...formMessages, ...fieldMessages].join("; ");
      if (combined) return `${json.error ?? fallback} — ${combined}`;
    }
    if (typeof json?.error === "string") return json.error;
  } catch {
    // response body wasn't JSON — fall through to the generic message
  }
  return fallback;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/extract-error-message.test.ts`
Expected: PASS (5/5 tests).

- [ ] **Step 5: Remove the duplicate from `CategoryPackagesTable.tsx` and import the shared version**

Current (`src/components/admin/CategoryPackagesTable.tsx`, the top of the file):
```tsx
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
```

Replace with:
```tsx
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { extractErrorMessage } from "@/lib/extract-error-message";
```

Current (`src/components/admin/CategoryPackagesTable.tsx:96-114`):
```tsx
async function extractErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const json = await res.json();
    if (json?.details?.formErrors?.length || json?.details?.fieldErrors) {
      const fieldMessages = json.details.fieldErrors
        ? Object.entries(json.details.fieldErrors as Record<string, string[]>)
            .filter(([, msgs]) => Array.isArray(msgs) && msgs.length > 0)
            .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
        : [];
      const formMessages: string[] = json.details.formErrors ?? [];
      const combined = [...formMessages, ...fieldMessages].join("; ");
      if (combined) return `${json.error ?? fallback} — ${combined}`;
    }
    if (typeof json?.error === "string") return json.error;
  } catch {
    // response body wasn't JSON — fall through to the generic message
  }
  return fallback;
}

export default function CategoryPackagesTable({ category, pageTitle }: Props) {
```

Replace with:
```tsx
export default function CategoryPackagesTable({ category, pageTitle }: Props) {
```

(Just delete the local function — the fetch-helper function above it, `fetchPackages`, and everything else stays untouched.)

- [ ] **Step 6: Verify**

Run: `npx tsc --noEmit`
Expected: 0 errors.

Run: `npm test`
Expected: all tests pass (this task's 5 new tests plus every existing test, unmodified — `CategoryPackagesTable.tsx` has no dedicated test file, so nothing else is affected).

- [ ] **Step 7: Commit**

```bash
git add src/lib/extract-error-message.ts src/lib/extract-error-message.test.ts src/components/admin/CategoryPackagesTable.tsx
git commit -m "refactor: extract extractErrorMessage into a shared module"
```

---

### Task 2: Wire the contact form

**Files:**
- Modify: `src/app/[locale]/contact/page.tsx`

**Interfaces:**
- Consumes: `extractErrorMessage` (Task 1).

- [ ] **Step 1: Replace the imports**

Current (`src/app/[locale]/contact/page.tsx:1-11`):
```tsx
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Phone, Mail, MapPin, Clock, Send, CheckCircle2 } from "lucide-react";
import Image from "next/image";
```

Replace with:
```tsx
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Phone, Mail, MapPin, Clock, Send, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { extractErrorMessage } from "@/lib/extract-error-message";
```

- [ ] **Step 2: Replace the state and submit handler**

Current (`src/app/[locale]/contact/page.tsx:13-33`):
```tsx
export default function ContactPage() {
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        service: "holiday",
        message: ""
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        // Simulate email submission
        setTimeout(() => {
            setSubmitting(false);
            setFormSubmitted(true);
            setFormData({ name: "", email: "", phone: "", service: "holiday", message: "" });
        }, 1500);
    };
```

Replace with:
```tsx
export default function ContactPage() {
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        service: "holiday",
        message: ""
    });

    const submitMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/enquiries", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "contact",
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    message: formData.message,
                    details: { service: formData.service },
                }),
            });
            if (!res.ok) throw new Error(await extractErrorMessage(res, "Failed to submit enquiry"));
            return res.json();
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);
        try {
            await submitMutation.mutateAsync();
            setFormSubmitted(true);
            setFormData({ name: "", email: "", phone: "", service: "holiday", message: "" });
        } catch (error) {
            console.error(error);
            setSubmitError(error instanceof Error ? error.message : "Something went wrong. Please try again.");
        }
    };
```

- [ ] **Step 3: Add the error banner and swap `submitting` for `submitMutation.isPending`**

Current:
```tsx
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-black text-foreground uppercase tracking-widest">Your Message</label>
                                                <Textarea
                                                    required
                                                    rows={4}
                                                    placeholder="Please specify any dynamic dates, passenger details, or medical recovery needs..."
                                                    value={formData.message}
                                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                    className="bg-white/5 border border-white/10 text-white rounded-xl focus:border-emerald-500/50"
                                                />
                                            </div>

                                            <Button
                                                type="submit"
                                                disabled={submitting}
                                                className="w-full h-14 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-full font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-95 transition-all duration-300 border-0 flex items-center justify-center gap-2 cursor-pointer"
                                            >
                                                {submitting ? (
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <>
                                                        <Send className="h-4 w-4" />
                                                        <span>Send Enquiry Message</span>
                                                    </>
                                                )}
                                            </Button>
```

Replace with:
```tsx
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-black text-foreground uppercase tracking-widest">Your Message</label>
                                                <Textarea
                                                    required
                                                    rows={4}
                                                    placeholder="Please specify any dynamic dates, passenger details, or medical recovery needs..."
                                                    value={formData.message}
                                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                    className="bg-white/5 border border-white/10 text-white rounded-xl focus:border-emerald-500/50"
                                                />
                                            </div>

                                            {submitError && (
                                                <div className="px-4 py-3 rounded-xl border border-red-400/40 bg-red-500/10 text-red-200 text-xs font-medium">
                                                    {submitError}
                                                </div>
                                            )}

                                            <Button
                                                type="submit"
                                                disabled={submitMutation.isPending}
                                                className="w-full h-14 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-full font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-95 transition-all duration-300 border-0 flex items-center justify-center gap-2 cursor-pointer"
                                            >
                                                {submitMutation.isPending ? (
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <>
                                                        <Send className="h-4 w-4" />
                                                        <span>Send Enquiry Message</span>
                                                    </>
                                                )}
                                            </Button>
```

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit` → expect 0 errors.
Run: `npm run build` → expect success.
Grep-check: `grep -n "setTimeout\|submitting" src/app/[locale]/contact/page.tsx` → expect no matches (the fake `setTimeout` and the old `submitting` state name are both gone).

- [ ] **Step 5: Commit**

```bash
git add "src/app/[locale]/contact/page.tsx"
git commit -m "feat: wire contact form to POST /api/enquiries"
```

---

### Task 3: Wire the hotel-booking form

**Files:**
- Modify: `src/app/[locale]/hotel-booking/HotelBookingClient.tsx`

**Interfaces:**
- Consumes: `extractErrorMessage` (Task 1).

- [ ] **Step 1: Replace the imports**

Current (`src/app/[locale]/hotel-booking/HotelBookingClient.tsx:1-25`):
```tsx
"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./datepicker-custom.css";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Hotel, 
  Calendar, 
  MapPin, 
  Users, 
  Mail, 
  Phone, 
  User, 
  Globe,
  CheckCircle2,
  ArrowLeft,
  Send
} from "lucide-react";
import { Link } from "@/i18n/navigation";
```

Replace with:
```tsx
"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./datepicker-custom.css";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Hotel, 
  Calendar, 
  MapPin, 
  Users, 
  Mail, 
  Phone, 
  User, 
  Globe,
  CheckCircle2,
  ArrowLeft,
  Send
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { extractErrorMessage } from "@/lib/extract-error-message";
```

- [ ] **Step 2: Replace the state and submit handler**

Current (`src/app/[locale]/hotel-booking/HotelBookingClient.tsx:27-64`):
```tsx
export default function HotelBookingClient() {
  const [formData, setFormData] = useState({
    // Hotel Details
    destination: "",
    checkInDate: null as Date | null,
    checkOutDate: null as Date | null,
    rooms: "1",
    adults: "2",
    children: "0",
    
    // User Details
    fullName: "",
    email: "",
    phone: "",
    nationality: "",
    
    // Additional Info
    specialRequests: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };
```

Replace with:
```tsx
export default function HotelBookingClient() {
  const [formData, setFormData] = useState({
    // Hotel Details
    destination: "",
    checkInDate: null as Date | null,
    checkOutDate: null as Date | null,
    rooms: "1",
    adults: "2",
    children: "0",
    
    // User Details
    fullName: "",
    email: "",
    phone: "",
    nationality: "",
    
    // Additional Info
    specialRequests: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "hotel_booking",
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          details: {
            destination: formData.destination,
            checkInDate: formData.checkInDate?.toISOString() ?? "",
            checkOutDate: formData.checkOutDate?.toISOString() ?? "",
            rooms: formData.rooms,
            adults: formData.adults,
            children: formData.children,
            nationality: formData.nationality,
            specialRequests: formData.specialRequests,
          },
        }),
      });
      if (!res.ok) throw new Error(await extractErrorMessage(res, "Failed to submit enquiry"));
      return res.json();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    try {
      await submitMutation.mutateAsync();
      setIsSubmitted(true);
    } catch (error) {
      console.error(error);
      setSubmitError(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    }
  };
```

- [ ] **Step 3: Add the error banner and swap `isSubmitting` for `submitMutation.isPending`**

Current:
```tsx
                {/* Submit Button */}
                <div className="border-t pt-8">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-14 text-lg font-bold bg-teal-600 hover:bg-teal-700 shadow-lg"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Submit Enquiry
                      </>
                    )}
                  </Button>
                  
                  <p className="text-center text-sm text-muted-foreground mt-4">
                    By submitting, you agree to our terms and conditions. We'll respond within 24 hours.
                  </p>
                </div>
```

Replace with:
```tsx
                {/* Submit Button */}
                <div className="border-t pt-8">
                  {submitError && (
                    <div className="mb-4 px-4 py-3 rounded-xl border border-red-300 bg-red-50 text-red-700 text-sm font-medium">
                      {submitError}
                    </div>
                  )}
                  <Button
                    type="submit"
                    disabled={submitMutation.isPending}
                    className="w-full h-14 text-lg font-bold bg-teal-600 hover:bg-teal-700 shadow-lg"
                  >
                    {submitMutation.isPending ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Submit Enquiry
                      </>
                    )}
                  </Button>
                  
                  <p className="text-center text-sm text-muted-foreground mt-4">
                    By submitting, you agree to our terms and conditions. We'll respond within 24 hours.
                  </p>
                </div>
```

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit` → expect 0 errors.
Run: `npm run build` → expect success.
Grep-check: `grep -n "setTimeout\|isSubmitting" src/app/[locale]/hotel-booking/HotelBookingClient.tsx` → expect no matches.

- [ ] **Step 5: Commit**

```bash
git add "src/app/[locale]/hotel-booking/HotelBookingClient.tsx"
git commit -m "feat: wire hotel-booking form to POST /api/enquiries"
```

---

### Task 4: Wire the hotels search modal

**Files:**
- Modify: `src/app/[locale]/hotels/HotelsLandingClient.tsx`

**Interfaces:**
- Consumes: `extractErrorMessage` (Task 1).

- [ ] **Step 1: Replace the imports**

Current (`src/app/[locale]/hotels/HotelsLandingClient.tsx:1-31`):
```tsx
"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./datepicker-custom.css";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Hotel, 
  Calendar, 
  MapPin, 
  Users, 
  Search,
  CheckCircle2,
  Star,
  Shield,
  Clock,
  Sparkles,
  X,
  Mail,
  Phone,
  Send,
  Award,
  TrendingUp,
  Zap
} from "lucide-react";
import { Link } from "@/i18n/navigation";
```

Replace with:
```tsx
"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./datepicker-custom.css";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Hotel, 
  Calendar, 
  MapPin, 
  Users, 
  Search,
  CheckCircle2,
  Star,
  Shield,
  Clock,
  Sparkles,
  X,
  Mail,
  Phone,
  Send,
  Award,
  TrendingUp,
  Zap
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { extractErrorMessage } from "@/lib/extract-error-message";
```

- [ ] **Step 2: Replace the state and submit handler**

Current:
```tsx
export default function HotelsLandingClient() {
  const [searchData, setSearchData] = useState({
    destination: "",
    checkInDate: null as Date | null,
    checkOutDate: null as Date | null,
    rooms: "1",
    adults: "2",
    children: "0",
  });

  const [showModal, setShowModal] = useState(false);
  const [contactData, setContactData] = useState({
    email: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const bookingData = {
      ...searchData,
      ...contactData,
    };
    console.log("Booking data:", bookingData);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setContactData({ email: "", phone: "" });
  };
```

Replace with:
```tsx
export default function HotelsLandingClient() {
  const [searchData, setSearchData] = useState({
    destination: "",
    checkInDate: null as Date | null,
    checkOutDate: null as Date | null,
    rooms: "1",
    adults: "2",
    children: "0",
  });

  const [showModal, setShowModal] = useState(false);
  const [contactData, setContactData] = useState({
    email: "",
    phone: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowModal(true);
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "hotel_search",
          email: contactData.email,
          phone: contactData.phone,
          details: {
            destination: searchData.destination,
            checkInDate: searchData.checkInDate?.toISOString() ?? "",
            checkOutDate: searchData.checkOutDate?.toISOString() ?? "",
            rooms: searchData.rooms,
            adults: searchData.adults,
            children: searchData.children,
          },
        }),
      });
      if (!res.ok) throw new Error(await extractErrorMessage(res, "Failed to submit enquiry"));
      return res.json();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    try {
      await submitMutation.mutateAsync();
      setIsSubmitted(true);
    } catch (error) {
      console.error(error);
      setSubmitError(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setContactData({ email: "", phone: "" });
    setSubmitError(null);
  };
```

- [ ] **Step 3: Reset `submitError` on the success screen's "Search More Hotels" reset**

Current:
```tsx
                      <Button
                        onClick={() => {
                          setIsSubmitted(false);
                          setShowModal(false);
                          setSearchData({
                            destination: "",
                            checkInDate: null,
                            checkOutDate: null,
                            rooms: "1",
                            adults: "2",
                            children: "0",
                          });
                          setContactData({ email: "", phone: "" });
                        }}
                        className="w-full h-12 bg-teal-600 hover:bg-teal-700 font-bold"
                      >
                        Search More Hotels
                      </Button>
```

Replace with:
```tsx
                      <Button
                        onClick={() => {
                          setIsSubmitted(false);
                          setShowModal(false);
                          setSearchData({
                            destination: "",
                            checkInDate: null,
                            checkOutDate: null,
                            rooms: "1",
                            adults: "2",
                            children: "0",
                          });
                          setContactData({ email: "", phone: "" });
                          setSubmitError(null);
                        }}
                        className="w-full h-12 bg-teal-600 hover:bg-teal-700 font-bold"
                      >
                        Search More Hotels
                      </Button>
```

- [ ] **Step 4: Add the error banner and swap `isSubmitting` for `submitMutation.isPending`**

Current:
```tsx
                    {/* Contact Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div>
                        <label className="block text-sm font-bold mb-2 flex items-center gap-2">
                          <Mail className="w-4 h-4 text-blue-600" />
                          Email Address
                        </label>
                        <Input
                          type="email"
                          value={contactData.email}
                          onChange={(e) => setContactData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="your.email@example.com"
                          required
                          className="h-12 border-2 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold mb-2 flex items-center gap-2">
                          <Phone className="w-4 h-4 text-blue-600" />
                          Phone Number
                        </label>
                        <Input
                          type="tel"
                          value={contactData.phone}
                          onChange={(e) => setContactData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="+971 50 123 4567"
                          required
                          className="h-12 border-2 focus:border-blue-500"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-14 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 font-bold text-lg shadow-lg"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5 mr-2" />
                            Submit Enquiry
                          </>
                        )}
                      </Button>

                      <p className="text-xs text-center text-muted-foreground leading-relaxed">
                        By submitting, you agree to our terms and conditions. We'll respond within 24 hours with personalized hotel options.
                      </p>
                    </form>
```

Replace with:
```tsx
                    {/* Contact Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div>
                        <label className="block text-sm font-bold mb-2 flex items-center gap-2">
                          <Mail className="w-4 h-4 text-blue-600" />
                          Email Address
                        </label>
                        <Input
                          type="email"
                          value={contactData.email}
                          onChange={(e) => setContactData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="your.email@example.com"
                          required
                          className="h-12 border-2 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold mb-2 flex items-center gap-2">
                          <Phone className="w-4 h-4 text-blue-600" />
                          Phone Number
                        </label>
                        <Input
                          type="tel"
                          value={contactData.phone}
                          onChange={(e) => setContactData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="+971 50 123 4567"
                          required
                          className="h-12 border-2 focus:border-blue-500"
                        />
                      </div>

                      {submitError && (
                        <div className="px-4 py-3 rounded-xl border border-red-300 bg-red-50 text-red-700 text-sm font-medium">
                          {submitError}
                        </div>
                      )}

                      <Button
                        type="submit"
                        disabled={submitMutation.isPending}
                        className="w-full h-14 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 font-bold text-lg shadow-lg"
                      >
                        {submitMutation.isPending ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5 mr-2" />
                            Submit Enquiry
                          </>
                        )}
                      </Button>

                      <p className="text-xs text-center text-muted-foreground leading-relaxed">
                        By submitting, you agree to our terms and conditions. We'll respond within 24 hours with personalized hotel options.
                      </p>
                    </form>
```

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit` → expect 0 errors.
Run: `npm run build` → expect success.
Grep-check: `grep -n "console.log(\"Booking data\|isSubmitting" src/app/[locale]/hotels/HotelsLandingClient.tsx` → expect no matches.

- [ ] **Step 6: Commit**

```bash
git add "src/app/[locale]/hotels/HotelsLandingClient.tsx"
git commit -m "feat: wire hotels search modal to POST /api/enquiries"
```

---

### Task 5: Wire BookNowDialog, fix the dropped packageId, require email, and final verification

**Files:**
- Modify: `src/components/layout/BookNowDialog.tsx`

**Interfaces:**
- Consumes: `extractErrorMessage` (Task 1).

- [ ] **Step 1: Replace the imports**

Current (`src/components/layout/BookNowDialog.tsx:1-15`):
```tsx
"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Check, Mail, MapPin, Phone, Send, Users } from "lucide-react";
```

Replace with:
```tsx
"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Check, Mail, MapPin, Phone, Send, Users } from "lucide-react";
import { extractErrorMessage } from "@/lib/extract-error-message";
```

- [ ] **Step 2: Replace the state, effect, and submit handler**

Current (`src/components/layout/BookNowDialog.tsx:96-127`):
```tsx
  const t = useTranslations("bookNow");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Re-seed the form whenever the dialog opens with new initial data
  useEffect(() => {
    if (!open) return;
    setForm({
      ...emptyForm,
      destination: initial?.destination ?? initial?.packageTitle ?? "",
      travelDate: initial?.travelDate ?? "",
    });
    setIsSubmitted(false);
  }, [open, initial]);

  const update = useCallback(
    (key: keyof FormState) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((prev) => ({ ...prev, [key]: e.target.value })),
    []
  );

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // TODO: hook into your real booking endpoint
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
  }, []);
```

Replace with:
```tsx
  const t = useTranslations("bookNow");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Re-seed the form whenever the dialog opens with new initial data
  useEffect(() => {
    if (!open) return;
    setForm({
      ...emptyForm,
      destination: initial?.destination ?? initial?.packageTitle ?? "",
      travelDate: initial?.travelDate ?? "",
    });
    setIsSubmitted(false);
    setSubmitError(null);
  }, [open, initial]);

  const update = useCallback(
    (key: keyof FormState) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((prev) => ({ ...prev, [key]: e.target.value })),
    []
  );

  const submitMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "book_now",
          name: form.name,
          email: form.email,
          phone: form.phone,
          message: form.message || undefined,
          packageId: initial?.packageId !== undefined ? Number(initial.packageId) : undefined,
          details: {
            destination: form.destination,
            travelDate: form.travelDate,
            travelers: form.travelers,
          },
        }),
      });
      if (!res.ok) throw new Error(await extractErrorMessage(res, "Failed to submit enquiry"));
      return res.json();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    try {
      await submitMutation.mutateAsync();
      setIsSubmitted(true);
    } catch (error) {
      console.error(error);
      setSubmitError(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    }
  };
```

- [ ] **Step 3: Make the email field required (drop the "optional" label)**

Current:
```tsx
                <div>
                  <label className="text-sm font-bold mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    {t("email")}{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      {t("optional")}
                    </span>
                  </label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={update("email")}
                    placeholder="you@example.com"
                    className="h-12 border-2 focus:border-primary"
                  />
                </div>
```

Replace with:
```tsx
                <div>
                  <label className="text-sm font-bold mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    {t("email")}
                  </label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={update("email")}
                    placeholder="you@example.com"
                    required
                    className="h-12 border-2 focus:border-primary"
                  />
                </div>
```

- [ ] **Step 4: Add the error banner and swap `isSubmitting` for `submitMutation.isPending`**

Current:
```tsx
              <div>
                <label className="text-sm font-bold mb-2 block">
                  {t("message")}{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    {t("optional")}
                  </span>
                </label>
                <Textarea
                  value={form.message}
                  onChange={update("message")}
                  placeholder={t("messagePlaceholder")}
                  rows={3}
                  className="border-2 focus:border-primary resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 bg-primary hover:bg-primary/90 font-bold text-lg shadow-lg cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {t("submitting")}
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    {t("submit")}
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center pt-1">
                {t("disclaimer")}
              </p>
```

Replace with:
```tsx
              <div>
                <label className="text-sm font-bold mb-2 block">
                  {t("message")}{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    {t("optional")}
                  </span>
                </label>
                <Textarea
                  value={form.message}
                  onChange={update("message")}
                  placeholder={t("messagePlaceholder")}
                  rows={3}
                  className="border-2 focus:border-primary resize-none"
                />
              </div>

              {submitError && (
                <div className="px-4 py-3 rounded-xl border border-red-300 bg-red-50 text-red-700 text-sm font-medium">
                  {submitError}
                </div>
              )}

              <Button
                type="submit"
                disabled={submitMutation.isPending}
                className="w-full h-14 bg-primary hover:bg-primary/90 font-bold text-lg shadow-lg cursor-pointer"
              >
                {submitMutation.isPending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {t("submitting")}
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    {t("submit")}
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center pt-1">
                {t("disclaimer")}
              </p>
```

- [ ] **Step 5: Verify this task**

Run: `npx tsc --noEmit` → expect 0 errors.
Run: `npm run build` → expect success.
Grep-check: `grep -n "setTimeout\|isSubmitting" src/components/layout/BookNowDialog.tsx` → expect no matches. `grep -n "packageId" src/components/layout/BookNowDialog.tsx` → expect the new reference inside `submitMutation`.

- [ ] **Step 6: Full plan verification**

This is the last task in the plan — run the complete verification sequence:

```bash
npx tsc --noEmit
```
Expected: 0 errors.

```bash
npm run build
```
Expected: build succeeds.

```bash
npm run lint
```
Expected: no *new* errors beyond the pre-existing baseline documented in `CLAUDE.md` (`~44` pre-existing errors, mostly `react-hooks/refs` in `KeralaTourismClient.tsx` — unrelated to this plan).

```bash
npm test
```
Expected: all tests pass (this plan's 5 new tests in `extract-error-message.test.ts` plus every existing test, unmodified).

**Manual verification note:** this repo has no component/UI test framework (no Jest/RTL/Playwright — confirmed in `CLAUDE.md` and unchanged by this plan, which deliberately doesn't add one). If a dev server and a configured Supabase project are available in your environment, start `npm run dev` and manually submit each of the four forms once, confirming: (a) a new row appears in the `enquiries` table for each `type`, (b) a deliberately-invalid submission (e.g. malformed email) shows the new inline error banner instead of failing silently. If you cannot reach a live dev server/Supabase project from this environment, say so explicitly in your report rather than claiming this was verified — `tsc`/`build`/`test` passing confirms the code is correct and wired, not that a live round-trip was exercised.

- [ ] **Step 7: Commit**

```bash
git add src/components/layout/BookNowDialog.tsx
git commit -m "feat: wire BookNowDialog to POST /api/enquiries, thread packageId, require email"
```

## Self-Review Notes

**Spec coverage:** All four forms from `docs/superpowers/specs/2026-07-30-enquiry-capture-design.md`'s Frontend Wiring section are covered (Tasks 2-5), each sending the exact `type`/`details` shape from that section. The `BookNowDialog` `packageId` fix and the email-required UI change (both explicitly decided during this plan's authoring) are in Task 5. The shared `extractErrorMessage` extraction (Task 1) is a targeted improvement to avoid a 5th duplicate of a non-trivial function, not a spec requirement — noted here for transparency.

**Placeholder scan:** No TBD/TODO markers; every step has complete, runnable code. `BookNowDialog.tsx`'s original code contained a genuine `// TODO: hook into your real booking endpoint` comment — this plan removes it as part of Task 5, not something introduced by this plan.

**Type consistency:** `extractErrorMessage(res: Response, fallback: string): Promise<string>` (Task 1) is called identically (two positional args, same order) in Tasks 2-5 and in the refactored `CategoryPackagesTable.tsx`. Every form's request body matches Plan 3a's `enquiryInputSchema` variant for its `type` exactly (cross-checked against `docs/superpowers/plans/2026-07-30-enquiries-data-layer.md`'s Task 3).

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-31-wire-enquiry-forms.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
