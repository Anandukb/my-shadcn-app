import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Enquiry } from "@/lib/enquiries/types";

const sendMock = vi.fn();

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(function Resend() {
    return { emails: { send: sendMock } };
  }),
}));

import { sendEnquiryNotification } from "./notify-enquiry";

const baseEnquiry: Enquiry = {
  id: 1,
  type: "contact",
  name: "Sarah Jenkins",
  email: "sarah@example.com",
  phone: "+974 5555 5555",
  message: "Interested in a Maldives package",
  status: "new",
  packageId: null,
  details: { service: "holiday" },
  createdAt: "2026-07-30T10:00:00.000Z",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("sendEnquiryNotification", () => {
  it("no-ops when ENQUIRY_NOTIFY_EMAIL is unset", async () => {
    vi.stubEnv("ENQUIRY_NOTIFY_EMAIL", "");
    vi.stubEnv("RESEND_API_KEY", "re_test_key");

    await sendEnquiryNotification(baseEnquiry);

    expect(sendMock).not.toHaveBeenCalled();
    vi.unstubAllEnvs();
  });

  it("no-ops when RESEND_API_KEY is unset", async () => {
    vi.stubEnv("ENQUIRY_NOTIFY_EMAIL", "hello@maramholidays.com");
    vi.stubEnv("RESEND_API_KEY", "");

    await sendEnquiryNotification(baseEnquiry);

    expect(sendMock).not.toHaveBeenCalled();
    vi.unstubAllEnvs();
  });

  it("sends a notification email with the enquiry details when both env vars are set", async () => {
    vi.stubEnv("ENQUIRY_NOTIFY_EMAIL", "hello@maramholidays.com");
    vi.stubEnv("RESEND_API_KEY", "re_test_key");
    sendMock.mockResolvedValue({ data: { id: "email_1" }, error: null });

    await sendEnquiryNotification(baseEnquiry);

    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "hello@maramholidays.com",
        subject: expect.stringContaining("contact"),
      })
    );
    vi.unstubAllEnvs();
  });

  it("swallows an error thrown by Resend rather than propagating it", async () => {
    vi.stubEnv("ENQUIRY_NOTIFY_EMAIL", "hello@maramholidays.com");
    vi.stubEnv("RESEND_API_KEY", "re_test_key");
    sendMock.mockRejectedValue(new Error("Resend API error"));

    await expect(sendEnquiryNotification(baseEnquiry)).resolves.toBeUndefined();
    vi.unstubAllEnvs();
  });
});
