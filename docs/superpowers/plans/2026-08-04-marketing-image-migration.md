# Marketing Image Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-host the 63 unique Unsplash photos referenced across 15 marketing/template files onto the `site-assets` Storage bucket (built in Plan A), fix a broken fake-avatar loop and two Tailwind-incompatible background-image usages along the way, and delete 2 already-dead duplicate files.

**Architecture:** A one-time script fetches all 63 photos from Unsplash and uploads them via Plan A's existing `uploadAsset()`. A new `marketingImageUrl(photoId)` lookup function (mirroring Plan A's `brand-assets.ts` pattern) computes each photo's Storage URL. A codemod script mechanically rewrites 93 of the 95 straightforward call-site occurrences across all 15 files (JSX attributes and array/object literal values) into `marketingImageUrl(...)` calls, inserting the import automatically. The 2 Tailwind `bg-[url(...)]` occurrences (which Tailwind's compiler must see as static strings, so can't use a function call) and 1 broken dynamic avatar-ID loop are fixed by hand in a follow-up task, reusing imports the codemod already added.

**Tech Stack:** Supabase Storage (existing `site-assets` bucket from Plan A), `@supabase/supabase-js`, Node ESM scripts, Vitest.

This is **Plan B of 3** (image storage subsystem), following Plan A (`docs/superpowers/plans/2026-08-01-image-storage-migration.md`, already implemented — the `site-assets` bucket and `uploadAsset()` exist and are live). Plan C (package images + admin upload UI) follows later. Depends on `uploadAsset(bucket, path, file, contentType): Promise<string>` (`src/lib/storage.ts`) and `getSupabaseEnv()` (`src/lib/supabase/env.ts`), both already built.

## Global Constraints

- Exactly 63 unique photo IDs are migrated (deduplicated by the stable `photo-<id>` segment of each URL, ignoring query-string size variants) — the full list is given in Task 1, verbatim, and must not be altered.
- Photos are stored at `site-assets/marketing/<photo-id>.jpg`, fetched at a fixed `w=2400` resolution with `fm=jpg` forced for a consistent format — one high-res source per photo; no per-size variants are stored, matching Plan A's precedent of letting `next/image`'s existing optimizer handle all downsizing at render time.
- `src/components/admin/CategoryPackagesTable.tsx`'s hardcoded Unsplash fallback URL (package-creation default image, line 293) is explicitly **out of scope** — do not touch it. It belongs with Plan C.
- The 2 dead files (`src/app/[locale]/global-visa/page copy.tsx`, `global-visa/[country]/page copy.tsx`) are deleted, not migrated.
- The 2 Tailwind `bg-[url('...')]` occurrences (in `global-visa/page.tsx` and `global-visa/[country]/page.tsx`) must be converted to an inline `style={{ backgroundImage: ... }}` prop computed via `marketingImageUrl()` — never a hardcoded literal Storage URL, and never left as a Tailwind arbitrary-value class pointing at a JS expression (Tailwind's compiler cannot see a function call's result, only static source text).
- `HomeClient.tsx`'s broken `photo-${1500648767791 + i}` fake-avatar loop is replaced with the 3 real testimonial avatar photos already used elsewhere in the same file (`Aisha M.`/`Omar K.`/`Sara L.`), not new stock photo picks.
- Follow the repository's existing code style: TypeScript strict, no comments except where a non-obvious constraint needs explaining.

---

## File Structure

| File | Change | Responsibility |
|---|---|---|
| `scripts/migrate-marketing-images.mjs` | Create | One-time script: fetches all 63 photos from Unsplash, uploads to `site-assets/marketing/`. |
| `src/lib/marketing-images.ts` | Create | `marketingImageUrl(photoId): string` — computes each photo's Storage URL. |
| `src/lib/marketing-images.test.ts` | Create | Test for the URL construction. |
| `scripts/codemod-marketing-images.mjs` | Create | One-time codemod: rewrites 93 straightforward call sites across all 15 files, auto-inserts the import. |
| `src/app/[locale]/HomeClient.tsx` | Modify | Codemod (20 occurrences) + manual fix (avatar loop, 1 occurrence). |
| `src/app/[locale]/about/page.tsx` | Modify | Codemod (2 occurrences). |
| `src/app/[locale]/contact/page.tsx` | Modify | Codemod (1 occurrence). |
| `src/app/[locale]/cruise-packages/page.tsx` | Modify | Codemod (1 occurrence). |
| `src/app/[locale]/fixed-departures/page.tsx` | Modify | Codemod (1 occurrence). |
| `src/app/[locale]/global-visa/page.tsx` | Modify | Codemod (1 occurrence) + manual fix (bg-url → style, 1 occurrence). |
| `src/app/[locale]/global-visa/[country]/page.tsx` | Modify | Codemod (1 occurrence) + manual fix (bg-url → style, 1 occurrence). |
| `src/app/[locale]/holiday-packages/page.tsx` | Modify | Codemod (1 occurrence). |
| `src/app/[locale]/hotels/HotelsLandingClient.tsx` | Modify | Codemod (4 occurrences). |
| `src/app/[locale]/medical-tourism/MedicalTourismClient.tsx` | Modify | Codemod (9 occurrences). |
| `src/app/[locale]/packages/page.tsx` | Modify | Codemod (1 occurrence). |
| `src/app/[locale]/packages/[id]/PackageDetailClient.tsx` | Modify | Codemod (23 occurrences). |
| `src/components/packages/KeralaTourismClient.tsx` | Modify | Codemod (14 occurrences). |
| `src/components/packages/PackageIncludes.tsx` | Modify | Codemod (1 occurrence). |
| `src/lib/data/visa.ts` | Modify | Codemod (13 occurrences). |
| `src/app/[locale]/global-visa/page copy.tsx` | Delete | Dead code (unreachable, per `CLAUDE.md`). |
| `src/app/[locale]/global-visa/[country]/page copy.tsx` | Delete | Dead code (unreachable, per `CLAUDE.md`). |

---

### Task 1: Migration script — fetch and upload 63 photos

**Files:**
- Create: `scripts/migrate-marketing-images.mjs`

**Interfaces:**
- Consumes: nothing from earlier tasks' TypeScript exports (standalone script, same convention as Plan A's `migrate-brand-assets.mjs` — own `.env.local` loader, own bare Supabase client, no `@/` imports).
- Produces: uploads 63 files to `site-assets/marketing/<id>.jpg` in the live Supabase project — consumed by Task 2 (running it) and Task 3's `marketingImageUrl` (whose URL construction must match this script's storage path exactly).

- [ ] **Step 1: Write the script**

```js
// scripts/migrate-marketing-images.mjs
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

const PHOTO_IDS = [
  "1436491865332-7a61a109cc05",
  "1438761681033-6461ffad8d80",
  "1454165804606-c3d57bc86b40",
  "1469854523086-cc02fe5d8800",
  "1476514525535-07fb3b4ae5f1",
  "1477959858617-67f85cf4f1df",
  "1488646953014-85cb44e25828",
  "1494790108377-be9c29b29330",
  "1498307833015-e7b400441eb8",
  "1500375592092-40eb2168fd21",
  "1500530855697-b586d89ba3ee",
  "1500648767791-00dcc994a43e",
  "1501555088652-021faa106b9b",
  "1501594907352-04cda38ebc29",
  "1501785888041-af3ef285b470",
  "1503614472-8c93d56e92ce",
  "1505761671935-60b3a7427bad",
  "1506905925346-21bda4d32df4",
  "1507608616759-54f48f0af0ee",
  "1509316785289-025f5b846b35",
  "1512446816042-444d641267d4",
  "1512453979798-5ea266f8880c",
  "1512632578888-169bbbc64f33",
  "1513635269975-59663e0ac1ad",
  "1514282401047-d79a71a590e8",
  "1515542622106-78bda8ba0e5b",
  "1516549655169-df83a0774514",
  "1519494026892-80bbd2d6fd0d",
  "1520250497591-112f2f40a3f4",
  "1751157462805-2e88f0c6bb1a",
  "1524231757912-21f4fe3a7200",
  "1524492412937-b28074a5d7da",
  "1741230127615-8334deb6b463",
  "1530053969600-caed2596d242",
  "1530521954074-e64f6810b32d",
  "1587351021759-3e566b6af7cc",
  "1539635278303-d4002c07eae3",
  "1540555700478-4be289fbecef",
  "1541432901042-2d8bd64b4a9b",
  "1542314831-068cd1dbfeeb",
  "1543857778-c4a1a3e0b2eb",
  "1544161515-4ab6ce6db874",
  "1544367567-0f2fcb009e0b",
  "1547471080-7cc2caa01a7e",
  "1548574505-5e239809ee19",
  "1552465011-b4e21bf6e79a",
  "1552832230-c0197dd311b5",
  "1559827260-dc66d52bef19",
  "1565008576549-57569a49371d",
  "1566073771259-6a8506099945",
  "1569098644584-210bcd375b59",
  "1602174423520-daa2d87175a0",
  "1573843981267-be1999ff37cd",
  "1575881875475-31023242e3f9",
  "1741243781232-acf45970e1a5",
  "1586724237569-f3d0c1dee8c6",
  "1586773860418-d37222d8fce3",
  "1588166524941-3bf61a9c41db",
  "1590050752117-238cb0fb12b1",
  "1593693397690-362cb9666fc2",
  "1599940824399-b87987ceb72a",
  "1602216056096-3b40cc0c9944",
  "1632833239869-a37e3a5806d2",
];

async function main() {
  const env = loadEnv();
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const results = [];

  for (const photoId of PHOTO_IDS) {
    const sourceUrl = `https://images.unsplash.com/photo-${photoId}?q=80&w=2400&auto=format&fit=crop&fm=jpg`;
    const response = await fetch(sourceUrl);

    if (!response.ok) {
      console.error(`Failed to fetch ${photoId}: HTTP ${response.status}`);
      process.exit(1);
    }

    const arrayBuffer = await response.arrayBuffer();
    const file = Buffer.from(arrayBuffer);
    const storagePath = `marketing/${photoId}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from("site-assets")
      .upload(storagePath, file, { contentType: "image/jpeg", upsert: true });

    if (uploadError) {
      console.error(`Failed to upload ${photoId}:`, uploadError);
      process.exit(1);
    }

    const { data } = supabase.storage.from("site-assets").getPublicUrl(storagePath);
    results.push({ photoId, url: data.publicUrl });
  }

  console.log(`Migrated ${results.length} marketing images:`);
  for (const { photoId, url } of results) {
    console.log(`  ${photoId} -> ${url}`);
  }
}

main();
```

- [ ] **Step 2: Verify the script's photo ID list**

Read the file back and count the entries in `PHOTO_IDS`. Expected: exactly 63 entries, no duplicates.

- [ ] **Step 3: Commit**

```bash
git add scripts/migrate-marketing-images.mjs
git commit -m "feat: add marketing image migration script"
```

---

### Task 2: Run the migration script against the live project

**Files:**
- None (operational step — this task runs Task 1's script, no new files).

**Interfaces:**
- Consumes: `scripts/migrate-marketing-images.mjs` (Task 1). The `site-assets` bucket already exists live (Plan A, Task 1/4).

- [ ] **Step 1: Run the migration script**

```bash
node scripts/migrate-marketing-images.mjs
```

Expected: prints `Migrated 63 marketing images:` followed by 63 lines, each showing a `https://<project-ref>.supabase.co/storage/v1/object/public/site-assets/marketing/<photo-id>.jpg` URL. This may take a few minutes (63 sequential fetches).

- [ ] **Step 2: Spot-check the URLs**

Open at least 3 of the printed URLs to confirm they're publicly readable, not just that the upload call succeeded:

```bash
curl -sI "<one of the printed URLs>" | head -1
curl -sI "<another printed URL>" | head -1
curl -sI "<a third printed URL>" | head -1
```

Expected: all three show `HTTP/2 200` (or `HTTP/1.1 200`).

If this environment cannot reach Unsplash or the live Supabase project, report this honestly as a concern rather than claiming verification — do not fabricate a result.

- [ ] **Step 3: Record the outcome**

No commit for this task (nothing in the repo changes — this only affects the live Supabase project's Storage). Note the outcome (success + spot-check results, or any blocker) in your task report.

---

### Task 3: `marketingImageUrl` URL lookup function

**Files:**
- Create: `src/lib/marketing-images.ts`
- Test: `src/lib/marketing-images.test.ts`

**Interfaces:**
- Consumes: `getSupabaseEnv` from `@/lib/supabase/env` (existing).
- Produces: `marketingImageUrl(photoId: string): string` — consumed by Task 4's codemod output and Task 5's manual fixes.

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/marketing-images.test.ts
import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/supabase/env", () => ({
  getSupabaseEnv: () => ({ url: "https://example.supabase.co", anonKey: "anon-key" }),
}));

import { marketingImageUrl } from "./marketing-images";

describe("marketingImageUrl", () => {
  it("builds the Storage public URL for a given photo ID", () => {
    const url = marketingImageUrl("1436491865332-7a61a109cc05");
    expect(url).toBe(
      "https://example.supabase.co/storage/v1/object/public/site-assets/marketing/1436491865332-7a61a109cc05.jpg"
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/marketing-images.test.ts`
Expected: FAIL — `Cannot find module './marketing-images'`.

- [ ] **Step 3: Write the implementation**

```ts
// src/lib/marketing-images.ts
import { getSupabaseEnv } from "@/lib/supabase/env";

export function marketingImageUrl(photoId: string): string {
  const { url } = getSupabaseEnv();
  return `${url}/storage/v1/object/public/site-assets/marketing/${photoId}.jpg`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/marketing-images.test.ts`
Expected: PASS (1/1 test).

- [ ] **Step 5: Commit**

```bash
git add src/lib/marketing-images.ts src/lib/marketing-images.test.ts
git commit -m "feat: add marketingImageUrl lookup function"
```

---

### Task 4: Codemod — rewrite 93 straightforward call sites across 15 files

**Files:**
- Create: `scripts/codemod-marketing-images.mjs`
- Modify (via running the codemod): `src/app/[locale]/HomeClient.tsx`, `src/app/[locale]/about/page.tsx`, `src/app/[locale]/contact/page.tsx`, `src/app/[locale]/cruise-packages/page.tsx`, `src/app/[locale]/fixed-departures/page.tsx`, `src/app/[locale]/global-visa/page.tsx`, `src/app/[locale]/global-visa/[country]/page.tsx`, `src/app/[locale]/holiday-packages/page.tsx`, `src/app/[locale]/hotels/HotelsLandingClient.tsx`, `src/app/[locale]/medical-tourism/MedicalTourismClient.tsx`, `src/app/[locale]/packages/page.tsx`, `src/app/[locale]/packages/[id]/PackageDetailClient.tsx`, `src/components/packages/KeralaTourismClient.tsx`, `src/components/packages/PackageIncludes.tsx`, `src/lib/data/visa.ts`

**Interfaces:**
- Consumes: `marketingImageUrl` from `@/lib/marketing-images` (Task 3) — the codemod inserts `import { marketingImageUrl } from "@/lib/marketing-images";` into every file it modifies.
- Produces: rewritten source files — consumed by Task 5 (which relies on the import already being present in `HomeClient.tsx`, `global-visa/page.tsx`, and `global-visa/[country]/page.tsx`).

This task's script performs two ordered, non-overlapping regex replacements per file:
- **Pattern A** — JSX/component attributes where the URL is the literal attribute value (e.g. `src="https://images.unsplash.com/photo-ID?...⁠"` or `bgImage="https://...⁠"`): rewritten to `attr={marketingImageUrl("ID")}`.
- **Pattern B** — anywhere else the URL appears as a bare quoted string already inside a JS expression context (array literals, object property values, or a `||` fallback inside a JSX expression container like `image={data.image || "https://...⁠"}`): rewritten to `marketingImageUrl("ID")` in place, with quotes removed.

Pattern A is applied first (it always fully consumes `attr="URL"` as one match, including the `attr=` prefix), so nothing is double-processed by Pattern B on the same occurrence. Both patterns use double-quote delimiters only — the 2 Tailwind `bg-[url('...')]` occurrences use single quotes and are structurally unmatched by either pattern (left for Task 5), as is `HomeClient.tsx`'s dynamic `` `photo-${1500648767791 + i}` `` template literal (not a static quoted URL, so neither pattern's literal-ID capture group can match it).

- [ ] **Step 1: Write the codemod script**

```js
// scripts/codemod-marketing-images.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

const FILES = [
  "src/app/[locale]/HomeClient.tsx",
  "src/app/[locale]/about/page.tsx",
  "src/app/[locale]/contact/page.tsx",
  "src/app/[locale]/cruise-packages/page.tsx",
  "src/app/[locale]/fixed-departures/page.tsx",
  "src/app/[locale]/global-visa/page.tsx",
  "src/app/[locale]/global-visa/[country]/page.tsx",
  "src/app/[locale]/holiday-packages/page.tsx",
  "src/app/[locale]/hotels/HotelsLandingClient.tsx",
  "src/app/[locale]/medical-tourism/MedicalTourismClient.tsx",
  "src/app/[locale]/packages/page.tsx",
  "src/app/[locale]/packages/[id]/PackageDetailClient.tsx",
  "src/components/packages/KeralaTourismClient.tsx",
  "src/components/packages/PackageIncludes.tsx",
  "src/lib/data/visa.ts",
];

const ATTRIBUTE_PATTERN = /(\w+)="https:\/\/images\.unsplash\.com\/photo-([a-zA-Z0-9_-]+)\?[^"]*"/g;
const EXPRESSION_PATTERN = /"https:\/\/images\.unsplash\.com\/photo-([a-zA-Z0-9_-]+)\?[^"]*"/g;

const IMPORT_LINE = 'import { marketingImageUrl } from "@/lib/marketing-images";';

function insertImport(content) {
  if (content.includes(IMPORT_LINE)) return content;

  const lines = content.split("\n");
  let lastImportIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("import ")) lastImportIndex = i;
  }

  if (lastImportIndex === -1) {
    return `${IMPORT_LINE}\n${content}`;
  }

  lines.splice(lastImportIndex + 1, 0, IMPORT_LINE);
  return lines.join("\n");
}

let totalReplacements = 0;

for (const relativePath of FILES) {
  const filePath = path.resolve(repoRoot, relativePath);
  const original = readFileSync(filePath, "utf-8");

  const attributeMatches = [...original.matchAll(ATTRIBUTE_PATTERN)].length;
  const afterAttribute = original.replace(ATTRIBUTE_PATTERN, '$1={marketingImageUrl("$2")}');

  const expressionMatches = [...afterAttribute.matchAll(EXPRESSION_PATTERN)].length;
  const afterExpression = afterAttribute.replace(EXPRESSION_PATTERN, 'marketingImageUrl("$1")');

  const fileReplacements = attributeMatches + expressionMatches;
  totalReplacements += fileReplacements;

  if (fileReplacements === 0) {
    console.log(`${relativePath}: 0 replacements`);
    continue;
  }

  const finalContent = insertImport(afterExpression);
  writeFileSync(filePath, finalContent, "utf-8");
  console.log(`${relativePath}: ${fileReplacements} replacements`);
}

console.log(`Total: ${totalReplacements} replacements across ${FILES.length} files`);
```

- [ ] **Step 2: Run the codemod**

```bash
node scripts/codemod-marketing-images.mjs
```

Expected output (per-file counts, exact order matching the `FILES` array):
```
src/app/[locale]/HomeClient.tsx: 20 replacements
src/app/[locale]/about/page.tsx: 2 replacements
src/app/[locale]/contact/page.tsx: 1 replacements
src/app/[locale]/cruise-packages/page.tsx: 1 replacements
src/app/[locale]/fixed-departures/page.tsx: 1 replacements
src/app/[locale]/global-visa/page.tsx: 1 replacements
src/app/[locale]/global-visa/[country]/page.tsx: 1 replacements
src/app/[locale]/holiday-packages/page.tsx: 1 replacements
src/app/[locale]/hotels/HotelsLandingClient.tsx: 4 replacements
src/app/[locale]/medical-tourism/MedicalTourismClient.tsx: 9 replacements
src/app/[locale]/packages/page.tsx: 1 replacements
src/app/[locale]/packages/[id]/PackageDetailClient.tsx: 23 replacements
src/components/packages/KeralaTourismClient.tsx: 14 replacements
src/components/packages/PackageIncludes.tsx: 1 replacements
src/lib/data/visa.ts: 13 replacements
Total: 93 replacements across 15 files
```

If the actual counts differ from these, stop and investigate before proceeding — do not adjust the plan's expected numbers to match an unexpected result without understanding why they differ (e.g. source files changed since this plan was written).

- [ ] **Step 3: Verify each modified file compiles**

Run: `npx tsc --noEmit`
Expected: 0 errors. (`HomeClient.tsx`'s avatar-loop line and both `global-visa` files' `bg-url` lines are untouched by the codemod and still reference the old Unsplash URLs at this point — that's expected, Task 5 fixes them. This does not cause a type error since those lines are still syntactically valid TypeScript/JSX, just not yet migrated.)

- [ ] **Step 4: Verify the import was inserted correctly**

```bash
grep -L 'import { marketingImageUrl } from "@/lib/marketing-images";' \
  "src/app/[locale]/HomeClient.tsx" "src/app/[locale]/about/page.tsx" "src/app/[locale]/contact/page.tsx" \
  "src/app/[locale]/cruise-packages/page.tsx" "src/app/[locale]/fixed-departures/page.tsx" \
  "src/app/[locale]/global-visa/page.tsx" "src/app/[locale]/global-visa/[country]/page.tsx" \
  "src/app/[locale]/holiday-packages/page.tsx" "src/app/[locale]/hotels/HotelsLandingClient.tsx" \
  "src/app/[locale]/medical-tourism/MedicalTourismClient.tsx" "src/app/[locale]/packages/page.tsx" \
  "src/app/[locale]/packages/[id]/PackageDetailClient.tsx" "src/components/packages/KeralaTourismClient.tsx" \
  "src/components/packages/PackageIncludes.tsx" "src/lib/data/visa.ts"
```

Expected: no output (every file in this list has the import — `grep -L` prints files that do NOT match).

- [ ] **Step 5: Commit**

```bash
git add scripts/codemod-marketing-images.mjs \
  "src/app/[locale]/HomeClient.tsx" "src/app/[locale]/about/page.tsx" "src/app/[locale]/contact/page.tsx" \
  "src/app/[locale]/cruise-packages/page.tsx" "src/app/[locale]/fixed-departures/page.tsx" \
  "src/app/[locale]/global-visa/page.tsx" "src/app/[locale]/global-visa/[country]/page.tsx" \
  "src/app/[locale]/holiday-packages/page.tsx" "src/app/[locale]/hotels/HotelsLandingClient.tsx" \
  "src/app/[locale]/medical-tourism/MedicalTourismClient.tsx" "src/app/[locale]/packages/page.tsx" \
  "src/app/[locale]/packages/[id]/PackageDetailClient.tsx" "src/components/packages/KeralaTourismClient.tsx" \
  "src/components/packages/PackageIncludes.tsx" "src/lib/data/visa.ts"
git commit -m "feat: migrate marketing image URLs to Supabase Storage (codemod)"
```

---

### Task 5: Manual fixes — avatar loop, Tailwind bg-url, dead file deletion

**Files:**
- Modify: `src/app/[locale]/HomeClient.tsx:409`
- Modify: `src/app/[locale]/global-visa/page.tsx:61`
- Modify: `src/app/[locale]/global-visa/[country]/page.tsx:28`
- Delete: `src/app/[locale]/global-visa/page copy.tsx`, `src/app/[locale]/global-visa/[country]/page copy.tsx`

**Interfaces:**
- Consumes: `marketingImageUrl` — already imported into all three modified files by Task 4's codemod (each had at least one other codemod-matched occurrence, so the import line is already present; no new import needed).

- [ ] **Step 1: Fix `HomeClient.tsx`'s broken avatar loop**

Current (line 409, after Task 4's codemod — this exact line was NOT touched by the codemod, since its URL is a dynamic template literal, not a static quoted string):
```tsx
                    <Image src={`https://images.unsplash.com/photo-${1500648767791 + i}?q=80&w=100&auto=format&fit=crop`} alt="User" width={32} height={32} className="object-cover w-full h-full" />
```

Replace with:
```tsx
                    <Image src={marketingImageUrl(AVATAR_LOOP_PHOTO_IDS[i])} alt="User" width={32} height={32} className="object-cover w-full h-full" />
```

Immediately above the `{[...Array(3)].map((_, i) => (` line that contains this `<Image>` (find it by searching for `[...Array(3)].map((_, i) =>` in the file — it's the loop rendering the 3 overlapping avatar circles), add this constant declaration on its own line, indented to match the surrounding code:

Current:
```tsx
            <div className="flex items-center justify-between mt-auto">
              <div className="flex -space-x-2">
                {[...Array(3)].map((_, i) => (
```

Replace with:
```tsx
            <div className="flex items-center justify-between mt-auto">
              <div className="flex -space-x-2">
                {AVATAR_LOOP_PHOTO_IDS.map((_, i) => (
```

Then, near the top of the file (immediately after the last `import` line — the codemod already inserted `import { marketingImageUrl } from "@/lib/marketing-images";` there), add this constant:

```tsx
const AVATAR_LOOP_PHOTO_IDS = ["1438761681033-6461ffad8d80", "1500648767791-00dcc994a43e", "1494790108377-be9c29b29330"];
```

These are the same 3 photo IDs already used for the `Aisha M.`/`Omar K.`/`Sara L.` testimonial avatars later in this same file (lines 783-785), reused here instead of the broken computed ID.

- [ ] **Step 2: Convert `global-visa/page.tsx`'s Tailwind bg-url to an inline style**

Current (line 61, untouched by Task 4's codemod since it uses single quotes):
```tsx
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
```

Replace with:
```tsx
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${marketingImageUrl("1488646953014-85cb44e25828")})` }}
        />
```

- [ ] **Step 3: Convert `global-visa/[country]/page.tsx`'s Tailwind bg-url to an inline style**

Current (line 28, untouched by Task 4's codemod since it uses single quotes):
```tsx
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
```

Replace with:
```tsx
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${marketingImageUrl("1488646953014-85cb44e25828")})` }}
        />
```

- [ ] **Step 4: Delete the 2 dead files**

```bash
git rm "src/app/[locale]/global-visa/page copy.tsx" "src/app/[locale]/global-visa/[country]/page copy.tsx"
```

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit`
Expected: 0 errors.

Grep-check for any remaining static Unsplash URL in the 15 in-scope files (should now be zero, since Tasks 4 and 5 together cover all 95 static occurrences):
```bash
grep -rn "images.unsplash.com" \
  "src/app/[locale]/HomeClient.tsx" "src/app/[locale]/about/page.tsx" "src/app/[locale]/contact/page.tsx" \
  "src/app/[locale]/cruise-packages/page.tsx" "src/app/[locale]/fixed-departures/page.tsx" \
  "src/app/[locale]/global-visa/page.tsx" "src/app/[locale]/global-visa/[country]/page.tsx" \
  "src/app/[locale]/holiday-packages/page.tsx" "src/app/[locale]/hotels/HotelsLandingClient.tsx" \
  "src/app/[locale]/medical-tourism/MedicalTourismClient.tsx" "src/app/[locale]/packages/page.tsx" \
  "src/app/[locale]/packages/[id]/PackageDetailClient.tsx" "src/components/packages/KeralaTourismClient.tsx" \
  "src/components/packages/PackageIncludes.tsx" "src/lib/data/visa.ts"
```

Expected: no output.

- [ ] **Step 6: Commit**

```bash
git add "src/app/[locale]/HomeClient.tsx" "src/app/[locale]/global-visa/page.tsx" "src/app/[locale]/global-visa/[country]/page.tsx"
git commit -m "feat: fix broken avatar loop and Tailwind bg-url usages, delete dead page-copy files"
```

---

### Task 6: Final verification

**Files:**
- None (verification-only task).

- [ ] **Step 1: Full type check**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: no *new* errors beyond the pre-existing baseline (117 problems / 37 errors / 80 warnings, confirmed as of Plan A's completion — mostly `react-hooks/refs` in `KeralaTourismClient.tsx`, a file this plan also touches, but only for its 14 image-URL occurrences, not its hooks).

- [ ] **Step 4: Full test suite**

Run: `npm test`
Expected: all tests pass (this plan's 1 new test plus every existing test, unmodified).

- [ ] **Step 5: Confirm out-of-scope line is untouched**

```bash
grep -n "images.unsplash.com" src/components/admin/CategoryPackagesTable.tsx
```

Expected: still shows the original 3 occurrences (2 placeholder-text strings, 1 real fallback URL at line 293) — confirming this plan correctly left Plan C's territory alone.

**Manual verification note:** if a dev server and browser are available in your environment, start `npm run dev` and spot-check a few pages (home page testimonials/avatars, `global-visa`, `medical-tourism`, a package detail page) to confirm images render correctly from the new Storage URLs. If you cannot reach a running dev server or browser in this environment, say so explicitly in your report rather than claiming this was verified — the grep-checks and `tsc`/`build`/`lint`/`test` passing confirm the code is correctly wired, not that the images visually render.

- [ ] **Step 6: No commit for this task** (verification only — nothing to commit unless a prior step's verification uncovers something to fix, in which case fix it as part of re-running the relevant earlier task).

## Self-Review Notes

**Spec coverage:** Every section of `docs/superpowers/specs/2026-08-04-marketing-image-migration-design.md` is covered — migration script (Task 1), live run + spot-check (Task 2), `marketingImageUrl` (Task 3), codemod for the 93 straightforward occurrences (Task 4), the 3 special-case manual fixes plus dead-file deletion (Task 5), final verification including confirming `CategoryPackagesTable.tsx` was correctly left alone (Task 6).

**Placeholder scan:** No TBD/TODO markers; every step has complete, runnable code, including the full 63-entry photo ID array and the complete codemod regex logic.

**Type consistency:** `marketingImageUrl(photoId: string): string` (Task 3) is called identically by the codemod's generated code (Task 4, `marketingImageUrl("$1")`/`marketingImageUrl("$2")` substitutions) and by Task 5's manual fixes (`marketingImageUrl(AVATAR_LOOP_PHOTO_IDS[i])`, `marketingImageUrl("1488646953014-85cb44e25828")`). The photo ID `1488646953014-85cb44e25828` used in both Task 5 manual `bg-url` fixes matches the same ID present in Task 1's `PHOTO_IDS` array (verified: it's the 7th entry). The 3 `AVATAR_LOOP_PHOTO_IDS` in Task 5 Step 1 (`1438761681033-6461ffad8d80`, `1500648767791-00dcc994a43e`, `1494790108377-be9c29b29330`) all appear in Task 1's `PHOTO_IDS` array (entries 2, 12, and 8 respectively) — they are not new photos requiring a separate upload.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-08-04-marketing-image-migration.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
