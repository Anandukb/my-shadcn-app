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
