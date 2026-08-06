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
