# Package Image Upload Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a real file-upload capability to the admin package form's 4 image fields (hero, hotel, itinerary day photos, optional tour photos), replacing the paste-a-URL-only workflow, and remove the hardcoded Unsplash fallback image.

**Architecture:** A new admin-gated API route (`POST /api/admin/upload-image`) validates and uploads a file via Plan A's existing `uploadAsset()` utility. A small client helper (`uploadImage()`) wraps the fetch call. A new reusable `ImageUploadButton` component (matching this file's existing `BilingualInput`/`BilingualTextarea` convention) is wired into all 4 image fields — filling single-image fields directly, appending to multi-image fields' comma-separated lists.

**Tech Stack:** Next.js Route Handlers, Supabase Storage (`site-assets` bucket, existing), Vitest.

This is **Plan C of 3** (image storage subsystem), following Plan A (`docs/superpowers/plans/2026-08-01-image-storage-migration.md`) and Plan B (`docs/superpowers/plans/2026-08-04-marketing-image-migration.md`), both already implemented. Depends on `uploadAsset(bucket, path, file: Buffer, contentType): Promise<string>` (`src/lib/storage.ts`), `requireAdminSession()`/`UnauthorizedError` (`src/lib/admin-auth.ts`), and `extractErrorMessage(res, fallback): Promise<string>` (`src/lib/extract-error-message.ts`), all already built.

## Global Constraints

- Accepted file types: exactly `image/jpeg`, `image/png`, `image/webp` — anything else is rejected with 400.
- Max file size: 5MB — larger files are rejected with 400.
- Uploaded files are stored at `site-assets/packages/<uuid>.<ext>` — a random UUID filename, never the package ID (uploads can happen before a package is saved/has an ID).
- No bulk migration of existing package image URLs — this plan only adds upload capability going forward.
- No deletion/cleanup of orphaned Storage objects when a URL is replaced.
- The URL text input on every image field stays visible and manually editable — the upload button is additive, not a replacement.
- Multi-image fields (itinerary day photos, tour photos) append the uploaded URL to the existing comma-separated list; they never replace the whole list.
- `CategoryPackagesTable.tsx`'s hardcoded Unsplash fallback (`image: formImage || "https://images.unsplash.com/..."`) is removed; the Hero Image field becomes required, matching Title/Price/Location/Duration's existing required-field pattern.
- Follow the repository's existing code style: TypeScript strict, no comments except where a non-obvious constraint needs explaining.

---

## File Structure

| File | Change | Responsibility |
|---|---|---|
| `src/app/api/admin/upload-image/route.ts` | Create | `POST` — admin-gated, validates file type/size, uploads via `uploadAsset`, returns `{ url }`. |
| `src/app/api/admin/upload-image/route.test.ts` | Create | Tests for auth/validation/success paths. |
| `src/lib/upload-image.ts` | Create | `uploadImage(file: File): Promise<string>` — client-side fetch wrapper. |
| `src/lib/upload-image.test.ts` | Create | Tests for success/error paths. |
| `src/components/admin/CategoryPackagesTable.tsx` | Modify | New `ImageUploadButton` component; wired into all 4 image fields; fallback removed, Hero Image required. |

---

### Task 1: Upload API route

**Files:**
- Create: `src/app/api/admin/upload-image/route.ts`
- Test: `src/app/api/admin/upload-image/route.test.ts`

**Interfaces:**
- Consumes: `requireAdminSession`/`UnauthorizedError` (`@/lib/admin-auth`, existing), `uploadAsset` (`@/lib/storage`, existing).
- Produces: `POST /api/admin/upload-image` — consumed by Task 3's `uploadImage()` client helper.

- [ ] **Step 1: Write the failing test**

```ts
// src/app/api/admin/upload-image/route.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { UnauthorizedError } from "@/lib/admin-auth";

const requireAdminSessionMock = vi.fn();
const uploadAssetMock = vi.fn();

vi.mock("@/lib/admin-auth", async () => {
  const actual = await vi.importActual<typeof import("@/lib/admin-auth")>("@/lib/admin-auth");
  return {
    ...actual,
    requireAdminSession: () => requireAdminSessionMock(),
  };
});

vi.mock("@/lib/storage", () => ({
  uploadAsset: (...args: unknown[]) => uploadAssetMock(...args),
}));

import { POST } from "./route";

function makeRequest(file: File | null): Request {
  const formData = new FormData();
  if (file) formData.set("file", file);
  return new Request("http://localhost/api/admin/upload-image", { method: "POST", body: formData });
}

beforeEach(() => {
  vi.clearAllMocks();
  requireAdminSessionMock.mockResolvedValue({ id: "admin-1" });
});

describe("POST /api/admin/upload-image", () => {
  it("returns 401 when not an admin", async () => {
    requireAdminSessionMock.mockRejectedValue(new UnauthorizedError());

    const file = new File(["fake-bytes"], "photo.jpg", { type: "image/jpeg" });
    const res = await POST(makeRequest(file));

    expect(res.status).toBe(401);
    expect(uploadAssetMock).not.toHaveBeenCalled();
  });

  it("returns 400 when no file is provided", async () => {
    const res = await POST(makeRequest(null));

    expect(res.status).toBe(400);
    expect(uploadAssetMock).not.toHaveBeenCalled();
  });

  it("returns 400 for a disallowed file type", async () => {
    const file = new File(["fake-bytes"], "doc.pdf", { type: "application/pdf" });
    const res = await POST(makeRequest(file));

    expect(res.status).toBe(400);
    expect(uploadAssetMock).not.toHaveBeenCalled();
  });

  it("returns 400 for a file over 5MB", async () => {
    const bigContent = new Uint8Array(5 * 1024 * 1024 + 1);
    const file = new File([bigContent], "big.jpg", { type: "image/jpeg" });
    const res = await POST(makeRequest(file));

    expect(res.status).toBe(400);
    expect(uploadAssetMock).not.toHaveBeenCalled();
  });

  it("uploads a valid file and returns its URL", async () => {
    uploadAssetMock.mockResolvedValue("https://example.supabase.co/storage/v1/object/public/site-assets/packages/abc123.jpg");

    const file = new File(["fake-bytes"], "photo.jpg", { type: "image/jpeg" });
    const res = await POST(makeRequest(file));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.url).toBe("https://example.supabase.co/storage/v1/object/public/site-assets/packages/abc123.jpg");
    expect(uploadAssetMock).toHaveBeenCalledTimes(1);
    const [bucket, path, buffer, contentType] = uploadAssetMock.mock.calls[0];
    expect(bucket).toBe("site-assets");
    expect(path).toMatch(/^packages\/[0-9a-f-]+\.jpg$/);
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(contentType).toBe("image/jpeg");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/app/api/admin/upload-image/route.test.ts`
Expected: FAIL — `Cannot find module './route'`.

- [ ] **Step 3: Write the implementation**

```ts
// src/app/api/admin/upload-image/route.ts
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { requireAdminSession, UnauthorizedError } from "@/lib/admin-auth";
import { uploadAsset } from "@/lib/storage";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    await requireAdminSession();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw error;
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const extension = ALLOWED_TYPES[file.type];
  if (!extension) {
    return NextResponse.json({ error: "File must be JPEG, PNG, or WebP" }, { status: 400 });
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "File must be 5MB or smaller" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const path = `packages/${randomUUID()}.${extension}`;
  const url = await uploadAsset("site-assets", path, buffer, file.type);

  return NextResponse.json({ url });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/app/api/admin/upload-image/route.test.ts`
Expected: PASS (5/5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/app/api/admin/upload-image/route.ts src/app/api/admin/upload-image/route.test.ts
git commit -m "feat: add admin-gated image upload API route"
```

---

### Task 2: Client-side upload helper

**Files:**
- Create: `src/lib/upload-image.ts`
- Test: `src/lib/upload-image.test.ts`

**Interfaces:**
- Consumes: `extractErrorMessage` (`@/lib/extract-error-message`, existing).
- Produces: `uploadImage(file: File): Promise<string>` — consumed by Task 3's `ImageUploadButton`.

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/upload-image.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

import { uploadImage } from "./upload-image";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("uploadImage", () => {
  it("posts the file as FormData and returns the URL on success", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ url: "https://example.supabase.co/storage/v1/object/public/site-assets/packages/abc.jpg" }),
    });

    const file = new File(["fake-bytes"], "photo.jpg", { type: "image/jpeg" });
    const url = await uploadImage(file);

    expect(url).toBe("https://example.supabase.co/storage/v1/object/public/site-assets/packages/abc.jpg");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/upload-image",
      expect.objectContaining({ method: "POST" })
    );
    const [, options] = fetchMock.mock.calls[0];
    expect(options.body).toBeInstanceOf(FormData);
  });

  it("throws with the extracted error message on failure", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({ error: "File must be JPEG, PNG, or WebP" }),
    });

    const file = new File(["fake-bytes"], "doc.pdf", { type: "application/pdf" });

    await expect(uploadImage(file)).rejects.toThrow("File must be JPEG, PNG, or WebP");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/upload-image.test.ts`
Expected: FAIL — `Cannot find module './upload-image'`.

- [ ] **Step 3: Write the implementation**

```ts
// src/lib/upload-image.ts
import { extractErrorMessage } from "@/lib/extract-error-message";

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.set("file", file);

  const res = await fetch("/api/admin/upload-image", { method: "POST", body: formData });

  if (!res.ok) throw new Error(await extractErrorMessage(res, "Failed to upload image"));

  const json = await res.json();
  return json.url as string;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/upload-image.test.ts`
Expected: PASS (2/2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/upload-image.ts src/lib/upload-image.test.ts
git commit -m "feat: add client-side uploadImage helper"
```

---

### Task 3: `ImageUploadButton` component + wire into all 4 image fields, remove fallback

**Files:**
- Modify: `src/components/admin/CategoryPackagesTable.tsx`

**Interfaces:**
- Consumes: `uploadImage` (`@/lib/upload-image`, Task 2).

This is one task (not split further) because the new component and its 4 call sites are tightly coupled to this single file's existing state/handler patterns — a reviewer needs to see the component and all 4 usages together to judge correctness.

- [ ] **Step 1: Add the import**

Current (top of file, the last existing import line):
```tsx
import { extractErrorMessage } from "@/lib/extract-error-message";
```

Replace with:
```tsx
import { extractErrorMessage } from "@/lib/extract-error-message";
import { uploadImage } from "@/lib/upload-image";
```

- [ ] **Step 2: Add the `ImageUploadButton` component**

Current (immediately after the `FieldLabel` component definition):
```tsx
function FieldLabel({ children, icon: Icon, color = "text-blue-400" }: { children: React.ReactNode; icon?: any; color?: string }) {
  return (
    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
      {Icon && <Icon className={`h-3.5 w-3.5 ${color}`} />}
      {children}
    </label>
  );
}
```

Replace with:
```tsx
function FieldLabel({ children, icon: Icon, color = "text-blue-400" }: { children: React.ReactNode; icon?: any; color?: string }) {
  return (
    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
      {Icon && <Icon className={`h-3.5 w-3.5 ${color}`} />}
      {children}
    </label>
  );
}

function ImageUploadButton({ onUploaded }: { onUploaded: (url: string) => void }) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError(null);
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onUploaded(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
      <Button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="h-9 px-3 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-lg cursor-pointer gap-1.5 shrink-0"
      >
        {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
        Upload
      </Button>
      {error && <span className="text-[11px] text-red-400">{error}</span>}
    </div>
  );
}
```

- [ ] **Step 3: Wire the Hero Image field, remove the fallback, add required validation**

Current (`handleSave`'s validation check):
```tsx
    if (!formTitleEn || !formPrice || !formLocationEn || !formDurationEn) {
      setActiveTab("basic");
      setEditingLocale("en");
      setSaveError("Please fill in the required fields (Title, Price, Duration, Location) on the Basic tab.");
      return;
    }
```

Replace with:
```tsx
    if (!formTitleEn || !formPrice || !formLocationEn || !formDurationEn || !formImage) {
      setActiveTab("basic");
      setEditingLocale("en");
      setSaveError("Please fill in the required fields (Title, Price, Duration, Location, Hero Image) on the Basic tab.");
      return;
    }
```

Current (the `image` field in `handleSave`'s `data` object):
```tsx
      image: formImage || "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1200",
```

Replace with:
```tsx
      image: formImage,
```

Current (the Hero Image field's grid row and preview):
```tsx
                      <div className="md:col-span-3"><FieldLabel icon={ImageIcon} color="text-blue-400">Hero Image URL</FieldLabel><Input type="url" placeholder="https://images.unsplash.com/…" value={formImage} onChange={e => setFormImage(e.target.value)} className={inputCls} /></div>
                    </div>
                    {formImage && <div className="relative h-32 w-full rounded-xl overflow-hidden border border-slate-800"><img src={formImage} alt="preview" className="object-cover w-full h-full" /></div>}
```

Replace with:
```tsx
                      <div className="md:col-span-3"><FieldLabel icon={ImageIcon} color="text-blue-400">Hero Image URL *</FieldLabel>
                        <div className="flex gap-2">
                          <Input required type="url" placeholder="https://images.unsplash.com/…" value={formImage} onChange={e => setFormImage(e.target.value)} className={inputCls} />
                          <ImageUploadButton onUploaded={setFormImage} />
                        </div>
                      </div>
                    </div>
                    {formImage && <div className="relative h-32 w-full rounded-xl overflow-hidden border border-slate-800"><img src={formImage} alt="preview" className="object-cover w-full h-full" /></div>}
```

- [ ] **Step 4: Wire the Hotel Image field**

Current:
```tsx
                        <div className="md:col-span-4"><FieldLabel icon={ImageIcon} color="text-blue-400">Hotel Image URL</FieldLabel><Input type="url" placeholder="https://images.unsplash.com/…" value={hotel.image || ""} onChange={e => updateHotelPlain(i, "image", e.target.value)} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
```

Replace with:
```tsx
                        <div className="md:col-span-4"><FieldLabel icon={ImageIcon} color="text-blue-400">Hotel Image URL</FieldLabel>
                          <div className="flex gap-2">
                            <Input type="url" placeholder="https://images.unsplash.com/…" value={hotel.image || ""} onChange={e => updateHotelPlain(i, "image", e.target.value)} className="h-9 border-slate-800 bg-slate-900 text-sm" />
                            <ImageUploadButton onUploaded={url => updateHotelPlain(i, "image", url)} />
                          </div>
                        </div>
```

- [ ] **Step 5: Wire the Itinerary Day Photos field (append)**

Current:
```tsx
                          <div><FieldLabel icon={Camera} color="text-teal-400">Photo URLs (comma-separated)</FieldLabel><Input placeholder="https://…, https://…, https://…" value={day.images?.join(", ")} onChange={e => updateDayImages(i, e.target.value)} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
```

Replace with:
```tsx
                          <div><FieldLabel icon={Camera} color="text-teal-400">Photo URLs (comma-separated)</FieldLabel>
                            <div className="flex gap-2">
                              <Input placeholder="https://…, https://…, https://…" value={day.images?.join(", ")} onChange={e => updateDayImages(i, e.target.value)} className="h-9 border-slate-800 bg-slate-900 text-sm" />
                              <ImageUploadButton onUploaded={url => updateDayImages(i, [...(day.images ?? []), url].join(", "))} />
                            </div>
                          </div>
```

- [ ] **Step 6: Wire the Optional Tour Photos field (append)**

Current:
```tsx
                      <div><FieldLabel icon={Camera} color="text-teal-400">Photo URLs (comma-separated, up to 3)</FieldLabel><Input placeholder="https://…, https://…, https://…" value={tour.images?.join(", ") || ""} onChange={e => updateTourImages(tour.id, e.target.value)} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
```

Replace with:
```tsx
                      <div><FieldLabel icon={Camera} color="text-teal-400">Photo URLs (comma-separated, up to 3)</FieldLabel>
                        <div className="flex gap-2">
                          <Input placeholder="https://…, https://…, https://…" value={tour.images?.join(", ") || ""} onChange={e => updateTourImages(tour.id, e.target.value)} className="h-9 border-slate-800 bg-slate-900 text-sm" />
                          <ImageUploadButton onUploaded={url => updateTourImages(tour.id, [...(tour.images ?? []), url].join(", "))} />
                        </div>
                      </div>
```

- [ ] **Step 7: Verify**

Run: `npx tsc --noEmit`
Expected: 0 errors.

Run: `npm run build`
Expected: build succeeds.

Grep-check: `grep -n "images.unsplash.com/photo-1476514525535" src/components/admin/CategoryPackagesTable.tsx` → expect no matches (the hardcoded fallback is gone; the two remaining `images.unsplash.com` occurrences in this file — the placeholder-text strings in the Hero/Hotel `<Input placeholder=...>` props — are unrelated and untouched, since they're just example text shown when a field is empty, not a stored value).

- [ ] **Step 8: Full verification**

Run: `npm run lint`
Expected: no *new* errors beyond the pre-existing baseline (117 problems / 37 errors / 80 warnings as of the end of Plan B — mostly `react-hooks/refs` in `KeralaTourismClient.tsx`, unrelated to this file).

Run: `npm test`
Expected: all tests pass (this plan's 7 new tests plus every existing test, unmodified).

**Manual verification note:** if a dev server and browser are available, start `npm run dev`, open the admin dashboard's package create/edit form, and manually upload a real image file to each of the 4 fields, confirming the URL fills in and the preview renders. If you cannot reach a running dev server or browser in this environment, say so explicitly rather than claiming this was verified — the grep-check and `tsc`/`build`/`lint`/`test` passing confirm the code is correctly wired, not that a real upload round-trip was exercised.

- [ ] **Step 9: Commit**

```bash
git add src/components/admin/CategoryPackagesTable.tsx
git commit -m "feat: wire image upload into all 4 package image fields, remove hardcoded fallback"
```

## Self-Review Notes

**Spec coverage:** Every section of `docs/superpowers/specs/2026-08-07-package-image-upload-design.md` is covered — the upload route with type/size validation (Task 1), the client helper (Task 2), and all 4 image fields wired plus the fallback removal and required-field validation (Task 3).

**Placeholder scan:** No TBD/TODO markers; every step has complete, runnable code.

**Type consistency:** `uploadAsset(bucket: string, path: string, file: Buffer, contentType: string): Promise<string>` (existing, from Plan A) is called identically in Task 1's route. `uploadImage(file: File): Promise<string>` (Task 2) is called identically by `ImageUploadButton` in all 4 of Task 3's wiring steps. `ImageUploadButton`'s `onUploaded: (url: string) => void` prop is supplied a matching callback shape at all 4 call sites (`setFormImage` directly for the single-value case; an inline arrow calling the existing `updateHotelPlain`/`updateDayImages`/`updateTourImages` setters for the others, following those setters' pre-existing signatures unchanged from Plan 2b).

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-08-07-package-image-upload.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
