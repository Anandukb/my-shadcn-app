"use client";

import React from "react";
import { useCurrency } from "./CurrencyProvider";

/** A price stored in INR, shown in whichever currency the visitor picked in the header. */
export function Price({ amount, compact, className }: { amount: number; compact?: boolean; className?: string }) {
  const { format } = useCurrency();
  return <span className={className}>{format(amount, { compact })}</span>;
}
