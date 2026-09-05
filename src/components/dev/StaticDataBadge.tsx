"use client";

import React from "react";
import { FlaskConical } from "lucide-react";

/**
 * Marks UI that renders hardcoded placeholder content instead of data coming
 * from the packages table. Useful while the remaining detail-page sections are
 * still being wired up to the backend.
 *
 * Shown outside production builds; set NEXT_PUBLIC_SHOW_STATIC_DATA_BADGES=true
 * to also surface it on a deployed staging build.
 */
export const showStaticDataBadges =
  process.env.NODE_ENV !== "production" ||
  process.env.NEXT_PUBLIC_SHOW_STATIC_DATA_BADGES === "true";

export function StaticDataBadge({ note, compact = false }: { note?: string; compact?: boolean }) {
  if (!showStaticDataBadges) return null;

  const title = note
    ? `Static/dummy content — ${note}`
    : "Static/dummy content — not loaded from the backend";

  if (compact) {
    return (
      <span
        title={title}
        className="inline-flex items-center justify-center h-5 w-5 rounded-full border border-amber-300 bg-amber-100 text-amber-800"
        aria-label={title}
      >
        <FlaskConical className="h-3 w-3" />
      </span>
    );
  }

  return (
    <span
      title={title}
      className="inline-flex items-center gap-1.5 shrink-0 rounded-full border border-amber-300 bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-800"
    >
      <FlaskConical className="h-3 w-3" />
      Static / Dummy
    </span>
  );
}
