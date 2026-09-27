"use client";

import React, { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { BASE_CURRENCY, FALLBACK_RATES, isCurrencyCode } from "@/lib/currency/currencies";
import { formatMoney, type Rates } from "@/lib/currency/format";

const STORAGE_KEY = "currency";
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function readStored(): string {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return isCurrencyCode(value) ? value : BASE_CURRENCY;
  } catch {
    return BASE_CURRENCY;
  }
}

function writeStored(code: string) {
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    // Storage can be blocked; the choice then only lasts until the tab reloads.
  }
  listeners.forEach((l) => l());
}

interface CurrencyContextValue {
  currency: string;
  setCurrency: (code: string) => void;
  /** Formats an amount stored in INR in the visitor's chosen currency. */
  format: (amountInr: number, options?: { compact?: boolean }) => string;
  /** True when the shown amounts are converted estimates rather than the INR price. */
  isConverted: boolean;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

async function fetchRates(): Promise<Rates> {
  const res = await fetch("/api/exchange-rates");
  if (!res.ok) throw new Error("Failed to load exchange rates");
  const json = (await res.json()) as { rates: Rates };
  return json.rates;
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  // The server always renders INR; the visitor's saved choice applies right after hydration.
  const currency = useSyncExternalStore(subscribe, readStored, () => BASE_CURRENCY);

  const { data: liveRates } = useQuery({
    queryKey: ["exchange-rates"],
    queryFn: fetchRates,
    enabled: currency !== BASE_CURRENCY,
    staleTime: 6 * 60 * 60 * 1000,
  });
  const rates = liveRates ?? FALLBACK_RATES;

  const setCurrency = useCallback((code: string) => {
    if (isCurrencyCode(code)) writeStored(code);
  }, []);

  const format = useCallback(
    (amountInr: number, options?: { compact?: boolean }) => formatMoney(amountInr, currency, rates, { locale, compact: options?.compact }),
    [currency, rates, locale],
  );

  const value = useMemo(
    () => ({ currency, setCurrency, format, isConverted: currency !== BASE_CURRENCY }),
    [currency, setCurrency, format],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used inside CurrencyProvider");
  return ctx;
}
