# Image Storage Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a public Supabase Storage bucket, build a reusable upload utility, migrate the 5 actively-referenced local brand images out of `public/images/` into it, and switch the 6 code call sites over.

**Architecture:** A new `site-assets` Storage bucket (public-read, write-only via the service-role client) holds uploaded files under a `brand/` prefix for this plan. `src/lib/storage.ts` exports a generic `uploadAsset()` used by the app (and reused as-is by a later plan's admin upload feature); a standalone Node script (mirroring the existing `scripts/seed-packages.mjs` convention — its own env loader, its own inline Supabase client, no imports from `src/`) performs the actual one-time upload of the 5 files.

**Tech Stack:** Supabase Storage, `@supabase/supabase-js`, Vitest, plain Node ESM (`.mjs`) for the one-time script.

This is **Plan A of 3** (image storage subsystem), following the design in `docs/superpowers/specs/2026-08-01-image-storage-migration-design.md`. Plans B (marketing-page Unsplash URLs) and C (package images + admin upload UI) follow later and reuse this plan's `uploadAsset()` utility. Depends on the existing `createAdminClient()` (`src/lib/supabase/admin.ts`) and `getSupabaseEnv()` (`src/lib/supabase/env.ts`), both already built.

## Global Constraints

- Bucket name is exactly `site-assets`, public, with a public SELECT policy on `storage.objects` and **zero** INSERT/UPDATE/DELETE policies — all writes go through the service-role client, matching the `enquiries` table's established zero-permissive-write-policy pattern.
- Only 5 local files are migrated (the ones actually referenced in code): `Logo.png`, `Logo2.png`, `travel-pic.png`, `munnar-hillstation.jpg`, `theyyam-image.webp`. `summer-holidays.png` is unreferenced dead weight — deleted, not migrated. `public/svg/*` and the root `public/*.svg` files are explicitly out of scope (bundled UI-chrome icons, not content imagery) — do not touch them.
- Rollout order matters: migrate → verify the live URLs load → switch code references → delete the original local files. The site must never be broken mid-migration — old local files keep working right up until the code referencing them is switched over.
- Follow the repository's existing code style: TypeScript strict, no comments except where a non-obvious constraint needs explaining.

---

## File Structure

| File | Change | Responsibility |
|---|---|---|
| `supabase/migrations/<timestamp>_create_site_assets_bucket.sql` | Create | `site-assets` Storage bucket + public-read policy. |
| `src/lib/storage.ts` | Create | `uploadAsset(bucket, path, file, contentType): Promise<string>` — the only app code that writes to Storage. |
| `src/lib/storage.test.ts` | Create | Tests against a mocked Supabase client. |
| `scripts/migrate-brand-assets.mjs` | Create | One-time script uploading the 5 local files to `site-assets/brand/`. |
| `src/lib/brand-assets.ts` | Create | Named URL constants for the 5 migrated images, derived from `getSupabaseEnv()`. |
| `next.config.ts` | Modify | Add the Supabase Storage hostname to `images.remotePatterns`. |
| `src/components/layout/Header.tsx` | Modify | Swap 2 local `/images/...` references for the new constants. |
| `src/components/layout/Footer.tsx` | Modify | Swap 2 local `/images/...` references for the new constants. |
| `src/components/packages/KeralaTourismClient.tsx` | Modify | Swap 2 local `/images/...` references for the new constants. |
| `public/images/Logo.png`, `Logo2.png`, `travel-pic.png`, `munnar-hillstation.jpg`, `theyyam-image.webp`, `summer-holidays.png` | Delete | Removed once migration is verified live. |

---

### Task 1: Migration — `site-assets` Storage bucket

**Files:**
- Create: `supabase/migrations/<timestamp>_create_site_assets_bucket.sql`

**Interfaces:**
- Produces: `storage.buckets` row `id = 'site-assets'`, consumed by Task 2's `uploadAsset` and Task 3's migration script.

- [ ] **Step 1: Create the migration file**

```bash
npx supabase migration new create_site_assets_bucket
```

Open the generated `supabase/migrations/<timestamp>_create_site_assets_bucket.sql` and replace its contents with:

```sql
insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true);

create policy "site-assets are publicly readable"
  on storage.objects for select
  using (bucket_id = 'site-assets');
```

- [ ] **Step 2: Verify the migration file was written correctly**

Read the generated file back and confirm both statements are present, matching the SQL above exactly — in particular, confirm no `insert`/`update`/`delete` policy was accidentally added.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/*_create_site_assets_bucket.sql
git commit -m "feat: add site-assets Storage bucket"
```

---

### Task 2: `uploadAsset` utility

**Files:**
- Create: `src/lib/storage.ts`
- Test: `src/lib/storage.test.ts`

**Interfaces:**
- Consumes: `createAdminClient` from `@/lib/supabase/admin` (existing).
- Produces: `uploadAsset(bucket: string, path: string, file: Buffer, contentType: string): Promise<string>` — consumed by Plan C's future admin upload route (not part of this plan) and exercised directly by this plan's tests. Note: `scripts/migrate-brand-assets.mjs` (Task 3) does **not** import this function — plain Node ESM scripts in this repo can't resolve the `@/` path alias or safely import `server-only`-guarded modules outside the Next.js build, so the script reimplements the same two Storage calls inline, mirroring the existing `scripts/seed-packages.mjs` convention of constructing its own bare Supabase client.

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/storage.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const uploadMock = vi.fn();
const getPublicUrlMock = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    storage: {
      from: () => ({
        upload: uploadMock,
        getPublicUrl: getPublicUrlMock,
      }),
    },
  }),
}));

import { uploadAsset } from "./storage";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("uploadAsset", () => {
  it("uploads the file and returns the public URL", async () => {
    uploadMock.mockResolvedValue({ error: null });
    getPublicUrlMock.mockReturnValue({
      data: { publicUrl: "https://example.supabase.co/storage/v1/object/public/site-assets/brand/Logo.png" },
    });

    const file = Buffer.from("fake-image-bytes");
    const url = await uploadAsset("site-assets", "brand/Logo.png", file, "image/png");

    expect(uploadMock).toHaveBeenCalledWith("brand/Logo.png", file, { contentType: "image/png", upsert: true });
    expect(url).toBe("https://example.supabase.co/storage/v1/object/public/site-assets/brand/Logo.png");
  });

  it("throws a descriptive error when the upload fails", async () => {
    uploadMock.mockResolvedValue({ error: { message: "storage error" } });

    const file = Buffer.from("fake-image-bytes");

    await expect(uploadAsset("site-assets", "brand/Logo.png", file, "image/png")).rejects.toThrow(
      "Failed to upload brand/Logo.png to site-assets: storage error"
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/storage.test.ts`
Expected: FAIL — `Cannot find module './storage'`.

- [ ] **Step 3: Write the implementation**

```ts
// src/lib/storage.ts
import { createAdminClient } from "@/lib/supabase/admin";

export async function uploadAsset(
  bucket: string,
  path: string,
  file: Buffer,
  contentType: string
): Promise<string> {
  const supabase = createAdminClient();

  const { error } = await supabase.storage.from(bucket).upload(path, file, { contentType, upsert: true });

  if (error) throw new Error(`Failed to upload ${path} to ${bucket}: ${error.message}`);

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);

  return data.publicUrl;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/storage.test.ts`
Expected: PASS (2/2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/storage.ts src/lib/storage.test.ts
git commit -m "feat: add uploadAsset Storage utility"
```

---

### Task 3: One-time migration script

**Files:**
- Create: `scripts/migrate-brand-assets.mjs`

**Interfaces:**
- Consumes: nothing from earlier tasks' TypeScript exports (standalone script, see Task 2's note on why). Reads `.env.local` directly, same as `scripts/seed-packages.mjs`.
- Produces: uploads the 5 files to `site-assets/brand/` in the live Supabase project — consumed by Task 4 (running it) and Task 5 (the resulting URLs, which are deterministic and don't need to be copied from this script's output).

- [ ] **Step 1: Write the script**

```js
// scripts/migrate-brand-assets.mjs
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envFile = readFileSync(path.resolve(__dirname, "../.env.local"), "utf-8");
  const env = {};
  for (const line of envFile.split("\n")) {
    const match = line.match(/^([A-Z_]+)=(.*)$/);
    if (match) env[match[1]] = match[2];
  }
  return env;
}

const CONTENT_TYPES = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

const FILES = ["Logo.png", "Logo2.png", "travel-pic.png", "munnar-hillstation.jpg", "theyyam-image.webp"];

async function main() {
  const env = loadEnv();
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const results = [];

  for (const filename of FILES) {
    const localPath = path.resolve(__dirname, "../public/images", filename);
    const file = readFileSync(localPath);
    const ext = path.extname(filename).toLowerCase();
    const contentType = CONTENT_TYPES[ext];
    const storagePath = `brand/${filename}`;

    const { error: uploadError } = await supabase.storage
      .from("site-assets")
      .upload(storagePath, file, { contentType, upsert: true });

    if (uploadError) {
      console.error(`Failed to upload ${filename}:`, uploadError);
      process.exit(1);
    }

    const { data } = supabase.storage.from("site-assets").getPublicUrl(storagePath);
    results.push({ filename, url: data.publicUrl });
  }

  console.log("Migrated brand assets:");
  for (const { filename, url } of results) {
    console.log(`  ${filename} -> ${url}`);
  }
}

main();
```

- [ ] **Step 2: Verify the script reads correctly**

Read the file back and confirm it matches the code above exactly — in particular, confirm the `FILES` array has exactly these 5 entries (not `summer-holidays.png`, which is being deleted, not migrated).

- [ ] **Step 3: Commit**

```bash
git add scripts/migrate-brand-assets.mjs
git commit -m "feat: add brand asset migration script"
```

---

### Task 4: Run the migration script against the live project

**Files:**
- None (operational step — this task runs Task 3's script, no new files).

**Interfaces:**
- Consumes: `scripts/migrate-brand-assets.mjs` (Task 3), `supabase/migrations/*_create_site_assets_bucket.sql` (Task 1 — must already be applied to the live project before this step; if it hasn't been, run `npx supabase db push` first).

- [ ] **Step 1: Confirm the bucket migration is live**

```bash
npx supabase migration list
```

Expected: the `create_site_assets_bucket` migration's timestamp appears under both `local` and `remote` columns. If it's only under `local`, run `npx supabase db push` first and re-check.

- [ ] **Step 2: Run the migration script**

```bash
node scripts/migrate-brand-assets.mjs
```

Expected: prints `Migrated brand assets:` followed by 5 lines, one per file, each showing a `https://<project-ref>.supabase.co/storage/v1/object/public/site-assets/brand/<filename>` URL.

- [ ] **Step 3: Spot-check the URLs**

Open at least 2 of the 5 printed URLs directly (e.g. via `curl -I <url>` checking for a `200` status, or by fetching them) to confirm the files are actually publicly readable, not just that the upload call succeeded.

```bash
curl -sI "<one of the printed Logo.png URLs>" | head -1
curl -sI "<one of the printed munnar-hillstation.jpg URLs>" | head -1
```

Expected: both show `HTTP/2 200` (or `HTTP/1.1 200`).

If this environment cannot reach the live Supabase project or the network is unavailable, report this honestly as a concern rather than claiming verification — do not fabricate a result.

- [ ] **Step 4: Record the outcome**

No commit for this task (nothing in the repo changes — this only affects the live Supabase project's Storage). Note the outcome (success + spot-check results, or any blocker) in your task report.

---

### Task 5: Brand asset URL constants + Next.js image config

**Files:**
- Create: `src/lib/brand-assets.ts`
- Modify: `next.config.ts`

**Interfaces:**
- Consumes: `getSupabaseEnv` from `@/lib/supabase/env` (existing).
- Produces: `LOGO_URL`, `LOGO_SECONDARY_URL`, `TRAVEL_PIC_URL`, `MUNNAR_HILLSTATION_URL`, `THEYYAM_IMAGE_URL` (all `string`) — consumed by Task 6's 6 call-site updates.

- [ ] **Step 1: Write `src/lib/brand-assets.ts`**

```ts
import { getSupabaseEnv } from "@/lib/supabase/env";

function brandAssetUrl(filename: string): string {
  const { url } = getSupabaseEnv();
  return `${url}/storage/v1/object/public/site-assets/brand/${filename}`;
}

export const LOGO_URL = brandAssetUrl("Logo.png");
export const LOGO_SECONDARY_URL = brandAssetUrl("Logo2.png");
export const TRAVEL_PIC_URL = brandAssetUrl("travel-pic.png");
export const MUNNAR_HILLSTATION_URL = brandAssetUrl("munnar-hillstation.jpg");
export const THEYYAM_IMAGE_URL = brandAssetUrl("theyyam-image.webp");
```

- [ ] **Step 2: Update `next.config.ts`**

Current (`next.config.ts`, full file):
```ts
import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com", // already used in your Hero
      },
      {
        protocol: "https",
        hostname: "source.unsplash.com", // <-- add this one
      },
    ],
  },
};

export default withNextIntl(nextConfig);
```

Replace with:
```ts
import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHostname = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com", // already used in your Hero
      },
      {
        protocol: "https",
        hostname: "source.unsplash.com", // <-- add this one
      },
      ...(supabaseHostname
        ? [{ protocol: "https" as const, hostname: supabaseHostname }]
        : []),
    ],
  },
};

export default withNextIntl(nextConfig);
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/brand-assets.ts next.config.ts
git commit -m "feat: add brand asset URL constants, allow Supabase Storage images"
```

---

### Task 6: Switch the 6 call sites, delete the local files, final verification

**Files:**
- Modify: `src/components/layout/Header.tsx:62`, `src/components/layout/Header.tsx:132`
- Modify: `src/components/layout/Footer.tsx:33`, `src/components/layout/Footer.tsx:47`
- Modify: `src/components/packages/KeralaTourismClient.tsx:786`, `src/components/packages/KeralaTourismClient.tsx:1029`
- Delete: `public/images/Logo.png`, `public/images/Logo2.png`, `public/images/travel-pic.png`, `public/images/munnar-hillstation.jpg`, `public/images/theyyam-image.webp`, `public/images/summer-holidays.png`

**Interfaces:**
- Consumes: `LOGO_URL`, `LOGO_SECONDARY_URL`, `TRAVEL_PIC_URL`, `MUNNAR_HILLSTATION_URL`, `THEYYAM_IMAGE_URL` (Task 5).

This task only proceeds once Task 4 has confirmed the images are live and publicly reachable — swapping these references before that would break the site's images.

- [ ] **Step 1: Update `Header.tsx`'s two `Image` references**

Current:
```tsx
                <Link href="/" className="flex items-center gap-3 shrink-0">
                    <div className="relative h-10 w-40">
                        <Image
                            src="/images/Logo2.png"
                            alt={t('title')}
                            fill
                            className="object-contain object-left"
                            priority
                        />
                    </div>
                </Link>
```

Replace with:
```tsx
                <Link href="/" className="flex items-center gap-3 shrink-0">
                    <div className="relative h-10 w-40">
                        <Image
                            src={LOGO_SECONDARY_URL}
                            alt={t('title')}
                            fill
                            className="object-contain object-left"
                            priority
                        />
                    </div>
                </Link>
```

Current:
```tsx
                            <div className="relative w-32 h-10">
                                <Image
                                    src="/images/Logo.png"
                                    alt={t('title')}
                                    fill
                                    className="object-contain object-left"
                                />
                            </div>
```

Replace with:
```tsx
                            <div className="relative w-32 h-10">
                                <Image
                                    src={LOGO_URL}
                                    alt={t('title')}
                                    fill
                                    className="object-contain object-left"
                                />
                            </div>
```

Add the import — current (`Header.tsx:1-14`, the full top-of-file import block):
```tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import {
    Menu, Phone, Mail, Home, Package, MapPin, Globe2, Stethoscope, Info, TreePalm
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import LanguageSwitcher from "../LanguageSwitcher";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
```

Replace with:
```tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import {
    Menu, Phone, Mail, Home, Package, MapPin, Globe2, Stethoscope, Info, TreePalm
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import LanguageSwitcher from "../LanguageSwitcher";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LOGO_URL, LOGO_SECONDARY_URL } from "@/lib/brand-assets";
```

- [ ] **Step 2: Update `Footer.tsx`'s two image references**

Current:
```tsx
export function SiteFooter() {
    return (
        <div className="flex flex-col w-full relative mt-16">
            <div className="w-full relative pointer-events-none -mb-1 z-10 overflow-hidden">
                {/* Note: This pulls the silhouette image placed in public/images/ */}
                <img
                    src="/images/travel-pic.png"
                    alt="Travel Landscape"
                    className="w-full h-auto min-h-[80px] md:min-h-[150px] object-cover object-bottom"
                    onError={(e) => {
                        // Fallback if image isn't named correctly yet
                        e.currentTarget.style.display = 'none';
                    }}
                />
            </div>
```

Replace with:
```tsx
export function SiteFooter() {
    return (
        <div className="flex flex-col w-full relative mt-16">
            <div className="w-full relative pointer-events-none -mb-1 z-10 overflow-hidden">
                <img
                    src={TRAVEL_PIC_URL}
                    alt="Travel Landscape"
                    className="w-full h-auto min-h-[80px] md:min-h-[150px] object-cover object-bottom"
                    onError={(e) => {
                        // Fallback if image isn't named correctly yet
                        e.currentTarget.style.display = 'none';
                    }}
                />
            </div>
```

(The stale "pulls the silhouette image placed in public/images/" comment is removed since it's no longer accurate — the `onError` fallback handler itself is left untouched, it's still reasonable defensive code.)

Current:
```tsx
                        <div className="h-20 w-64 relative">
                            <Image src="/images/Logo2.png" alt="Maram Holidays Logo" fill className="bg-white object-contain object-left" />
                        </div>
```

Replace with:
```tsx
                        <div className="h-20 w-64 relative">
                            <Image src={LOGO_SECONDARY_URL} alt="Maram Holidays Logo" fill className="bg-white object-contain object-left" />
                        </div>
```

Add the import — current (`Footer.tsx:1-9`, the full top-of-file import block):
```tsx
"use client";

import React from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Phone, Mail, MapPin, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
```

Replace with:
```tsx
"use client";

import React from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Phone, Mail, MapPin, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { LOGO_SECONDARY_URL, TRAVEL_PIC_URL } from "@/lib/brand-assets";
```

- [ ] **Step 3: Update `KeralaTourismClient.tsx`'s two image references**

Current:
```tsx
                                                <Image
                                                    src="/images/munnar-hillstation.jpg"
                                                    alt="Tea plantations of Munnar"
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                                                />
```

Replace with:
```tsx
                                                <Image
                                                    src={MUNNAR_HILLSTATION_URL}
                                                    alt="Tea plantations of Munnar"
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                                                />
```

Current:
```tsx
                                                        <Image
                                                            src="/images/theyyam-image.webp"
                                                            alt="Theyyam ritual fire performance"
                                                            fill
                                                            className="object-cover group-hover:scale-105 transition-transform duration-1000"
                                                        />
```

Replace with:
```tsx
                                                        <Image
                                                            src={THEYYAM_IMAGE_URL}
                                                            alt="Theyyam ritual fire performance"
                                                            fill
                                                            className="object-cover group-hover:scale-105 transition-transform duration-1000"
                                                        />
```

Add the import — current (`KeralaTourismClient.tsx:1-11`, the top of the import block up to the `Package` type import):
```tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PackageCard } from "@/components/packages/PackageCard";
import { Package } from "@/types/package";
```

Replace with:
```tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PackageCard } from "@/components/packages/PackageCard";
import { Package } from "@/types/package";
import { MUNNAR_HILLSTATION_URL, THEYYAM_IMAGE_URL } from "@/lib/brand-assets";
```

- [ ] **Step 4: Delete the local image files**

```bash
git rm public/images/Logo.png public/images/Logo2.png public/images/travel-pic.png public/images/munnar-hillstation.jpg public/images/theyyam-image.webp public/images/summer-holidays.png
```

- [ ] **Step 5: Full verification**

Run, in order:

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
Expected: no *new* errors beyond the pre-existing baseline documented in `CLAUDE.md` (~44 errors, mostly `react-hooks/refs` in `KeralaTourismClient.tsx` — unrelated to this change, this plan doesn't touch that file's hooks, only its two `Image` `src` props).

```bash
npm test
```
Expected: all tests pass (this plan's 2 new tests plus every existing test, unmodified).

Grep-check: `grep -rn "/images/Logo\|/images/travel-pic\|/images/munnar\|/images/theyyam" src/` → expect no matches (all 6 call sites now use the imported constants, not local paths).

**Manual verification note:** start `npm run dev` and visit the home page and the Kerala tourism page if a browser is available in your environment; confirm the logo (header, footer), the footer's travel-pic silhouette, and the two Kerala hero images all render correctly from the new Supabase Storage URLs. If you cannot reach a running dev server or browser in this environment, say so explicitly in your report rather than claiming this was verified — the grep-check and `tsc`/`build` passing confirm the code is wired correctly, not that the images visually render.

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/Header.tsx src/components/layout/Footer.tsx src/components/packages/KeralaTourismClient.tsx
git commit -m "feat: switch brand images to Supabase Storage, remove local copies"
```

## Self-Review Notes

**Spec coverage:** Every section of `docs/superpowers/specs/2026-08-01-image-storage-migration-design.md` is covered — bucket + policies (Task 1), `uploadAsset` utility (Task 2), migration script (Task 3), live run + spot-check (Task 4), constants + Next.js config (Task 5), call-site switch + cleanup + final verification (Task 6). The spec's explicit exclusions (`public/svg/*`, root SVGs, `summer-holidays.png` migration) are honored — `summer-holidays.png` is deleted in Task 6, not migrated by Task 3's `FILES` array.

**Placeholder scan:** No TBD/TODO markers; every step has complete, runnable code.

**Type consistency:** `uploadAsset(bucket: string, path: string, file: Buffer, contentType: string): Promise<string>` (Task 2) is called identically in its own test (Task 2) and mirrored (not imported, per Task 2's own interface note) in Task 3's script. The 5 constant names exported from `src/lib/brand-assets.ts` (Task 5) match exactly what Task 6 imports and uses at each of the 6 call sites — no name drift (e.g. `LOGO_SECONDARY_URL` is used consistently for `Logo2.png` in both Header.tsx and Footer.tsx, never confused with `LOGO_URL`/`Logo.png`).

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-08-01-image-storage-migration.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
