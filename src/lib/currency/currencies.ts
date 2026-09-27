// Every price in the database is stored in INR. Visitors can view the site in
// any of these currencies; amounts are converted for display only.

export const BASE_CURRENCY = "INR";

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "AED", name: "UAE Dirham", symbol: "AED" },
  { code: "QAR", name: "Qatari Riyal", symbol: "QAR" },
  { code: "SAR", name: "Saudi Riyal", symbol: "SAR" },
  { code: "KWD", name: "Kuwaiti Dinar", symbol: "KWD" },
  { code: "OMR", name: "Omani Rial", symbol: "OMR" },
  { code: "BHD", name: "Bahraini Dinar", symbol: "BHD" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
];

const CODES = new Set(CURRENCIES.map((c) => c.code));

export function isCurrencyCode(value: unknown): value is string {
  return typeof value === "string" && CODES.has(value);
}

/** Units of each currency per 1 INR. Used until live rates load, or if the feed is down. */
export const FALLBACK_RATES: Record<string, number> = {
  INR: 1,
  USD: 0.01043,
  EUR: 0.00916,
  GBP: 0.00788,
  AED: 0.0383,
  QAR: 0.03796,
  SAR: 0.03911,
  KWD: 0.00322,
  OMR: 0.00401,
  BHD: 0.00392,
  SGD: 0.01334,
  MYR: 0.04256,
  AUD: 0.01485,
  CAD: 0.01476,
};
