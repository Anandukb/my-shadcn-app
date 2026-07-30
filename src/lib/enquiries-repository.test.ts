// src/lib/enquiries-repository.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const selectMock = vi.fn();
const insertMock = vi.fn();
const orderMock = vi.fn();
const singleMock = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: () => ({
      select: selectMock,
      insert: insertMock,
    }),
  }),
}));

import { enquiriesRepository } from "./enquiries-repository";
import type { EnquiryInput } from "@/lib/enquiries/schema";

function makeRawRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    type: "contact",
    name: "Sarah Jenkins",
    email: "sarah@example.com",
    phone: "+974 5555 5555",
    message: "Interested in a Maldives package",
    status: "new",
    package_id: null,
    details: { service: "holiday" },
    created_at: "2026-07-30T10:00:00.000Z",
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  selectMock.mockReturnValue({ order: orderMock, single: singleMock });
  insertMock.mockReturnValue({ select: selectMock });
});

describe("enquiriesRepository.create", () => {
  it("creates a contact enquiry and maps the row to camelCase", async () => {
    singleMock.mockResolvedValue({ data: makeRawRow(), error: null });

    const input: EnquiryInput = {
      type: "contact",
      name: "Sarah Jenkins",
      email: "sarah@example.com",
      phone: "+974 5555 5555",
      message: "Interested in a Maldives package",
      details: { service: "holiday" },
    };

    const result = await enquiriesRepository.create(input);

    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "contact",
        name: "Sarah Jenkins",
        email: "sarah@example.com",
        phone: "+974 5555 5555",
        message: "Interested in a Maldives package",
        package_id: null,
        details: { service: "holiday" },
      })
    );
    expect(result.id).toBe(1);
    expect(result.packageId).toBeNull();
    expect(result.createdAt).toBe("2026-07-30T10:00:00.000Z");
  });

  it("passes packageId through as package_id for a book_now enquiry", async () => {
    singleMock.mockResolvedValue({
      data: makeRawRow({ type: "book_now", package_id: 12, message: null, details: { destination: "Maldives", travelDate: "2026-10-01", travelers: "2" } }),
      error: null,
    });

    const input: EnquiryInput = {
      type: "book_now",
      name: "Fatima Noor",
      email: "fatima@example.com",
      phone: "+974 5555 5558",
      packageId: 12,
      details: { destination: "Maldives", travelDate: "2026-10-01", travelers: "2" },
    };

    const result = await enquiriesRepository.create(input);

    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({ package_id: 12 }));
    expect(result.packageId).toBe(12);
  });

  it("passes name through as null for a hotel_search enquiry", async () => {
    singleMock.mockResolvedValue({
      data: makeRawRow({ type: "hotel_search", name: null, message: null, details: { destination: "Bangkok", checkInDate: "2026-09-01", checkOutDate: "2026-09-04", rooms: "1", adults: "2", children: "0" } }),
      error: null,
    });

    const input: EnquiryInput = {
      type: "hotel_search",
      email: "guest@example.com",
      phone: "+974 5555 5557",
      details: { destination: "Bangkok", checkInDate: "2026-09-01", checkOutDate: "2026-09-04", rooms: "1", adults: "2", children: "0" },
    };

    const result = await enquiriesRepository.create(input);

    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({ name: null }));
    expect(result.name).toBeNull();
  });

  it("throws when the insert fails", async () => {
    singleMock.mockResolvedValue({ data: null, error: { message: "db error" } });

    const input: EnquiryInput = {
      type: "contact",
      name: "Sarah Jenkins",
      email: "sarah@example.com",
      phone: "+974 5555 5555",
      message: "Hi",
      details: { service: "holiday" },
    };

    await expect(enquiriesRepository.create(input)).rejects.toThrow("Failed to create enquiry");
  });
});

describe("enquiriesRepository.listAll", () => {
  it("returns all enquiries ordered by newest first", async () => {
    orderMock.mockResolvedValue({ data: [makeRawRow(), makeRawRow({ id: 2 })], error: null });

    const result = await enquiriesRepository.listAll();

    expect(orderMock).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(1);
  });

  it("throws when the fetch fails", async () => {
    orderMock.mockResolvedValue({ data: null, error: { message: "db error" } });

    await expect(enquiriesRepository.listAll()).rejects.toThrow("Failed to fetch enquiries");
  });
});
