import { describe, it, expect, vi, beforeEach } from "vitest";

const selectMock = vi.fn();
const eqMock = vi.fn();
const maybeSingleMock = vi.fn();
const upsertMock = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: () => ({
      select: selectMock,
      upsert: upsertMock,
    }),
  }),
}));

import { checkRateLimit } from "./rate-limit";

beforeEach(() => {
  vi.clearAllMocks();
  selectMock.mockReturnValue({ eq: eqMock });
  eqMock.mockReturnValue({ eq: eqMock, maybeSingle: maybeSingleMock });
  upsertMock.mockResolvedValue({ error: null });
});

describe("checkRateLimit", () => {
  it("allows the request when there is no existing row for the window", async () => {
    maybeSingleMock.mockResolvedValue({ data: null, error: null });

    const allowed = await checkRateLimit("1.2.3.4");

    expect(allowed).toBe(true);
    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({ ip_address: "1.2.3.4", count: 1 }),
      expect.any(Object)
    );
  });

  it("allows the request when under the threshold and increments the count", async () => {
    maybeSingleMock.mockResolvedValue({ data: { count: 3 }, error: null });

    const allowed = await checkRateLimit("1.2.3.4");

    expect(allowed).toBe(true);
    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({ ip_address: "1.2.3.4", count: 4 }),
      expect.any(Object)
    );
  });

  it("blocks the request when at the threshold", async () => {
    maybeSingleMock.mockResolvedValue({ data: { count: 5 }, error: null });

    const allowed = await checkRateLimit("1.2.3.4");

    expect(allowed).toBe(false);
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it("fails open when the IP address is missing", async () => {
    const allowed = await checkRateLimit(null);

    expect(allowed).toBe(true);
    expect(selectMock).not.toHaveBeenCalled();
    expect(upsertMock).not.toHaveBeenCalled();
  });
});
