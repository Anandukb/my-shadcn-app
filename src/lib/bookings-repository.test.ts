import { describe, it, expect, vi, beforeEach } from "vitest";

const selectMock = vi.fn();
const insertMock = vi.fn();
const updateMock = vi.fn();
const eqMock = vi.fn();
const singleMock = vi.fn();
const orderMock = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: () => ({
      select: selectMock,
      insert: insertMock,
      update: updateMock,
    }),
  }),
}));

import { bookingsRepository, BookingNotFoundError } from "./bookings-repository";
import type { BookingInput } from "@/lib/bookings/schema";

function makeRawRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    name: "Sarah Jenkins",
    email: "sarah@example.com",
    phone: "+974 5555 5555",
    destination: "Maldives",
    start_date: "2026-10-01",
    end_date: "2026-10-05",
    travelers: 2,
    package_id: null,
    price: 3499,
    payment_status: "unpaid",
    status: "confirmed",
    enquiry_id: null,
    notes: null,
    created_at: "2026-08-09T10:00:00.000Z",
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  selectMock.mockReturnValue({ order: orderMock, single: singleMock });
  insertMock.mockReturnValue({ select: selectMock });
});

describe("bookingsRepository.create", () => {
  it("creates a booking and maps the row to camelCase", async () => {
    singleMock.mockResolvedValue({ data: makeRawRow(), error: null });

    const input: BookingInput = {
      name: "Sarah Jenkins",
      email: "sarah@example.com",
      phone: "+974 5555 5555",
      destination: "Maldives",
      startDate: "2026-10-01",
      endDate: "2026-10-05",
      travelers: 2,
      price: 3499,
    };

    const result = await bookingsRepository.create(input);

    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Sarah Jenkins",
        email: "sarah@example.com",
        phone: "+974 5555 5555",
        destination: "Maldives",
        start_date: "2026-10-01",
        end_date: "2026-10-05",
        travelers: 2,
        price: 3499,
      })
    );
    expect(result.id).toBe(1);
    expect(result.startDate).toBe("2026-10-01");
    expect(result.paymentStatus).toBe("unpaid");
  });

  it("throws when the insert fails", async () => {
    singleMock.mockResolvedValue({ data: null, error: { message: "db error" } });

    const input: BookingInput = {
      name: "Sarah Jenkins",
      email: "sarah@example.com",
      phone: "+974 5555 5555",
    };

    await expect(bookingsRepository.create(input)).rejects.toThrow("Failed to create booking");
  });
});

describe("bookingsRepository.listAll", () => {
  it("returns all bookings ordered by newest first", async () => {
    orderMock.mockResolvedValue({ data: [makeRawRow(), makeRawRow({ id: 2 })], error: null });

    const result = await bookingsRepository.listAll();

    expect(orderMock).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(1);
  });

  it("throws when the fetch fails", async () => {
    orderMock.mockResolvedValue({ data: null, error: { message: "db error" } });

    await expect(bookingsRepository.listAll()).rejects.toThrow("Failed to fetch bookings");
  });
});

describe("bookingsRepository.update", () => {
  it("throws BookingNotFoundError when the booking does not exist", async () => {
    singleMock.mockResolvedValue({ data: null, error: { code: "PGRST116" } });
    eqMock.mockReturnValue({ single: singleMock });
    selectMock.mockReturnValue({ eq: eqMock });

    await expect(bookingsRepository.update(999, { status: "cancelled" })).rejects.toThrow(
      "Booking with ID 999 not found."
    );
  });

  it("updates status and payment status together", async () => {
    const existingRow = makeRawRow();
    singleMock
      .mockResolvedValueOnce({ data: existingRow, error: null })
      .mockResolvedValueOnce({ data: { ...existingRow, status: "completed", payment_status: "paid" }, error: null });
    eqMock.mockReturnValue({ single: singleMock });
    selectMock
      .mockReturnValueOnce({ eq: eqMock })
      .mockReturnValueOnce({ single: singleMock });
    updateMock.mockReturnValue({ eq: () => ({ select: selectMock }) });

    const result = await bookingsRepository.update(1, { status: "completed", paymentStatus: "paid" });

    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({ status: "completed", payment_status: "paid" })
    );
    expect(result.status).toBe("completed");
    expect(result.paymentStatus).toBe("paid");
  });

  it("preserves the existing payment status when only status is updated", async () => {
    const existingRow = makeRawRow({ status: "confirmed", payment_status: "partial" });
    singleMock
      .mockResolvedValueOnce({ data: existingRow, error: null })
      .mockResolvedValueOnce({ data: { ...existingRow, status: "completed" }, error: null });
    eqMock.mockReturnValue({ single: singleMock });
    selectMock
      .mockReturnValueOnce({ eq: eqMock })
      .mockReturnValueOnce({ single: singleMock });
    updateMock.mockReturnValue({ eq: () => ({ select: selectMock }) });

    await bookingsRepository.update(1, { status: "completed" });

    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({ status: "completed", payment_status: "partial" })
    );
  });
});
