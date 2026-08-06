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
