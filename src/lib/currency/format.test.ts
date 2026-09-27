import { describe, it, expect } from "vitest";
import { convertFromInr, formatMoney } from "./format";
import { CURRENCIES, FALLBACK_RATES, isCurrencyCode } from "./currencies";

const rates = { INR: 1, USD: 0.0125, QAR: 0.04 };

describe("convertFromInr", () => {
  it("returns INR unchanged and multiplies by the rate otherwise", () => {
    expect(convertFromInr(80000, "INR", rates)).toBe(80000);
    expect(convertFromInr(80000, "USD", rates)).toBe(1000);
  });

  it("falls back to the built-in rate when the live table lacks a currency", () => {
    expect(convertFromInr(1000, "EUR", { INR: 1 })).toBeCloseTo(1000 * FALLBACK_RATES.EUR);
  });
});

describe("formatMoney", () => {
  it("uses Indian digit grouping for INR", () => {
    expect(formatMoney(105000, "INR", rates)).toBe("₹1,05,000");
  });

  it("converts and formats other currencies to whole units", () => {
    expect(formatMoney(80000, "USD", rates)).toBe("$1,000");
    expect(formatMoney(80000, "QAR", rates)).toContain("3,200");
  });

  it("keeps Latin digits in Arabic", () => {
    expect(formatMoney(80000, "USD", rates, { locale: "ar" })).toMatch(/1,000/);
  });

  it("supports a compact form", () => {
    expect(formatMoney(120000, "USD", rates, { compact: true })).toMatch(/1\.5K/);
  });
});

describe("currency list", () => {
  it("has INR first, unique codes, and a fallback rate for each", () => {
    expect(CURRENCIES[0].code).toBe("INR");
    expect(new Set(CURRENCIES.map((c) => c.code)).size).toBe(CURRENCIES.length);
    for (const c of CURRENCIES) expect(FALLBACK_RATES[c.code]).toBeGreaterThan(0);
    expect(isCurrencyCode("USD")).toBe(true);
    expect(isCurrencyCode("XYZ")).toBe(false);
  });
});
