"use client";

import { useEffect, useState } from "react";
import { PackageDetailView } from "@/app/[locale]/packages/[id]/PackageDetailClient";
import { BookNowProvider } from "@/components/layout/BookNowDialog";
import type { Package } from "@/types/package";

// Lightweight shell rendered inside an <iframe> by the admin package editor.
// It carries no server data of its own — the in-progress package the admin
// is editing is pushed in via postMessage from the parent admin page, so
// this route can sit outside /admin without needing auth. Loading it
// directly just shows a "waiting for preview data" placeholder.
//
// Rendering the real page inside an actual iframe (rather than a scaled-down
// <div> in the parent page) matters: Tailwind's responsive classes key off
// the browser viewport, and an iframe has its own — so a narrow iframe
// genuinely re-flows the layout like a phone would, instead of squashing a
// desktop layout into a small box and overlapping everything.
export default function PackagePreviewPage() {
  const [pkg, setPkg] = useState<Package | null>(null);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: string; pkg?: Package } | undefined;
      if (data?.type === "ADMIN_PACKAGE_PREVIEW" && data.pkg) {
        setPkg(data.pkg);
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  if (!pkg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 text-sm">
        Waiting for preview data…
      </div>
    );
  }

  return (
    <BookNowProvider>
      <PackageDetailView pkg={pkg} />
    </BookNowProvider>
  );
}
