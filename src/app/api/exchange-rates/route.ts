import { NextResponse } from "next/server";
import { CURRENCIES, FALLBACK_RATES } from "@/lib/currency/currencies";

// Live rates (units of each currency per 1 INR), refreshed at most twice a day.
// If the feed is unreachable the built-in table is returned so prices never break.
const FEED = "https://open.er-api.com/v6/latest/INR";
const HALF_DAY = 60 * 60 * 12;

export async function GET() {
  try {
    const res = await fetch(FEED, { next: { revalidate: HALF_DAY } });
    if (!res.ok) throw new Error(`Rates feed responded ${res.status}`);
    const json = (await res.json()) as { result?: string; rates?: Record<string, number>; time_last_update_utc?: string };
    if (json.result !== "success" || !json.rates) throw new Error("Rates feed returned no data");

    const rates: Record<string, number> = { INR: 1 };
    for (const { code } of CURRENCIES) {
      const value = json.rates[code];
      if (typeof value === "number" && value > 0) rates[code] = value;
    }
    return NextResponse.json(
      { rates: { ...FALLBACK_RATES, ...rates }, updatedAt: json.time_last_update_utc ?? null, source: "live" },
      { headers: { "Cache-Control": `public, s-maxage=${HALF_DAY}, stale-while-revalidate=${HALF_DAY * 2}` } },
    );
  } catch {
    return NextResponse.json(
      { rates: FALLBACK_RATES, updatedAt: null, source: "fallback" },
      { headers: { "Cache-Control": "public, s-maxage=600" } },
    );
  }
}
