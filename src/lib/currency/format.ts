import { BASE_CURRENCY, FALLBACK_RATES } from "./currencies";

export type Rates = Record<string, number>;

/** Whole rupees with Indian grouping, e.g. ₹1,05,000. Used in the admin, which works in INR only. */
export function formatInr(amount: number): string {
  return formatMoney(amount, BASE_CURRENCY, {});
}

export function convertFromInr(amountInr: number, currency: string, rates: Rates): number {
  if (currency === BASE_CURRENCY) return amountInr;
  const rate = rates[currency] ?? FALLBACK_RATES[currency];
  return rate ? amountInr * rate : amountInr;
}

interface FormatOptions {
  /** Short form for tight spaces, e.g. "₹1.1L" or "$1.2K". */
  compact?: boolean;
  /** "en" or "ar"; digits stay Latin in both. */
  locale?: string;
}

/**
 * Formats an amount that is stored in INR as money in `currency`.
 * INR uses Indian digit grouping (₹1,05,000); everything else is rounded to whole units.
 */
export function formatMoney(amountInr: number, currency: string, rates: Rates, options: FormatOptions = {}): string {
  const value = convertFromInr(amountInr, currency, rates);
  const lang = options.locale === "ar" ? "ar" : currency === BASE_CURRENCY ? "en-IN" : "en-US";
  try {
    return new Intl.NumberFormat(`${lang}-u-nu-latn`, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
      ...(options.compact ? { notation: "compact", maximumFractionDigits: 1 } : {}),
    }).format(value);
  } catch {
    return `${currency} ${Math.round(value).toLocaleString("en-US")}`;
  }
}
