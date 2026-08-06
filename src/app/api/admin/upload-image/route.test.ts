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
