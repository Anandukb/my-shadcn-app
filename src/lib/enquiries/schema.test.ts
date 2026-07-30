import { describe, it, expect } from "vitest";
import { enquiryInputSchema } from "./schema";

describe("enquiryInputSchema", () => {
  it("validates a contact enquiry", () => {
    const result = enquiryInputSchema.safeParse({
      type: "contact",
      name: "Sarah Jenkins",
      email: "sarah@example.com",
      phone: "+974 5555 5555",
      message: "Interested in a Maldives package",
      details: { service: "holiday" },
    });
    expect(result.success).toBe(true);
  });

  it("rejects a contact enquiry missing the required message", () => {
    const result = enquiryInputSchema.safeParse({
      type: "contact",
      name: "Sarah Jenkins",
      email: "sarah@example.com",
      phone: "+974 5555 5555",
      message: "",
      details: { service: "holiday" },
    });
    expect(result.success).toBe(false);
  });

  it("validates a hotel_booking enquiry", () => {
    const result = enquiryInputSchema.safeParse({
      type: "hotel_booking",
      name: "Ahmed Al-Farsi",
      email: "ahmed@example.com",
      phone: "+974 5555 5556",
      details: {
        destination: "Dubai",
        checkInDate: "2026-08-01T00:00:00.000Z",
        checkOutDate: "2026-08-05T00:00:00.000Z",
        rooms: "1",
        adults: "2",
        children: "0",
        nationality: "Qatari",
        specialRequests: "High floor please",
      },
    });
    expect(result.success).toBe(true);
  });

  it("rejects a hotel_booking enquiry with hotel_search-shaped details (missing nationality/specialRequests)", () => {
    const result = enquiryInputSchema.safeParse({
      type: "hotel_booking",
      name: "Ahmed Al-Farsi",
      email: "ahmed@example.com",
      phone: "+974 5555 5556",
      details: {
        destination: "Dubai",
        checkInDate: "2026-08-01T00:00:00.000Z",
        checkOutDate: "2026-08-05T00:00:00.000Z",
        rooms: "1",
        adults: "2",
        children: "0",
      },
    });
    expect(result.success).toBe(false);
  });

  it("validates a hotel_search enquiry with no name", () => {
    const result = enquiryInputSchema.safeParse({
      type: "hotel_search",
      email: "guest@example.com",
      phone: "+974 5555 5557",
      details: {
        destination: "Bangkok",
        checkInDate: "2026-09-01T00:00:00.000Z",
        checkOutDate: "2026-09-04T00:00:00.000Z",
        rooms: "1",
        adults: "2",
        children: "0",
      },
    });
    expect(result.success).toBe(true);
  });

  it("validates a book_now enquiry with an optional packageId", () => {
    const result = enquiryInputSchema.safeParse({
      type: "book_now",
      name: "Fatima Noor",
      email: "fatima@example.com",
      phone: "+974 5555 5558",
      packageId: 12,
      details: {
        destination: "Maldives Escape",
        travelDate: "2026-10-01",
        travelers: "2",
      },
    });
    expect(result.success).toBe(true);
  });

  it("validates a book_now enquiry without a packageId", () => {
    const result = enquiryInputSchema.safeParse({
      type: "book_now",
      name: "Fatima Noor",
      email: "fatima@example.com",
      phone: "+974 5555 5558",
      details: {
        destination: "Maldives Escape",
        travelDate: "2026-10-01",
        travelers: "2",
      },
    });
    expect(result.success).toBe(true);
  });

  it("rejects an unknown type", () => {
    const result = enquiryInputSchema.safeParse({
      type: "carnival_cruise",
      email: "x@example.com",
      phone: "123",
      details: {},
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = enquiryInputSchema.safeParse({
      type: "contact",
      name: "Sarah Jenkins",
      email: "not-an-email",
      phone: "+974 5555 5555",
      message: "Hi",
      details: { service: "holiday" },
    });
    expect(result.success).toBe(false);
  });
});
