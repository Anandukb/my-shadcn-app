import { describe, it, expect } from "vitest";
import { extractErrorMessage } from "./extract-error-message";

function makeResponse(body: unknown): Response {
  return { json: async () => body } as unknown as Response;
}

function makeUnparsableResponse(): Response {
  return {
    json: async () => {
      throw new Error("not json");
    },
  } as unknown as Response;
}

describe("extractErrorMessage", () => {
  it("returns the error field when present with no details", async () => {
    const res = makeResponse({ error: "Unauthorized" });
    const message = await extractErrorMessage(res, "fallback");
    expect(message).toBe("Unauthorized");
  });

  it("combines field errors into the message", async () => {
    const res = makeResponse({
      error: "Invalid enquiry data",
      details: { fieldErrors: { email: ["Invalid email"] }, formErrors: [] },
    });
    const message = await extractErrorMessage(res, "fallback");
    expect(message).toBe("Invalid enquiry data — email: Invalid email");
  });

  it("combines form errors into the message", async () => {
    const res = makeResponse({
      error: "Invalid enquiry data",
      details: { formErrors: ["Body is required"], fieldErrors: {} },
    });
    const message = await extractErrorMessage(res, "fallback");
    expect(message).toBe("Invalid enquiry data — Body is required");
  });

  it("falls back to the fallback message when the body has no error field", async () => {
    const res = makeResponse({});
    const message = await extractErrorMessage(res, "fallback");
    expect(message).toBe("fallback");
  });

  it("falls back to the fallback message when the response body is not JSON", async () => {
    const res = makeUnparsableResponse();
    const message = await extractErrorMessage(res, "fallback");
    expect(message).toBe("fallback");
  });
});
