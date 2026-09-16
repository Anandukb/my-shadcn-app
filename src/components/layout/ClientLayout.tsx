"use client";

import React from "react";
import dynamic from "next/dynamic";
import { usePathname } from "@/i18n/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { Header } from "@/components/layout/Header";
import { SiteFooter } from "@/components/layout/Footer";
import { PageTransitionOverlay } from "@/components/layout/PageTransitionOverlay";
import TawkMessenger from "@/components/TawkMessenger";
import { BookNowProvider } from "@/components/layout/BookNowDialog";
import { QueryProvider } from "@/components/providers/QueryProvider";

// Never renders anything server-side (it stays null until mounted, then
// shows a floating video widget) — defer it out of the initial client
// bundle instead of loading it eagerly with everything else.
const WhatsAppAssistant = dynamic(
  () => import("@/components/layout/WhatsAppAssistant").then((mod) => mod.WhatsAppAssistant),
  { ssr: false }
);

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Since usePathname() from @/i18n/navigation strips the locale prefix (e.g., '/en/admin' -> '/admin'),
  // checking startsWith('/admin') works perfectly!
  const isAdmin = pathname.startsWith("/admin");
  // The admin package editor's live-preview iframe loads this route directly.
  // It needs the bare page only — no header/footer/chat widgets, and no
  // dark admin shell — so its own BookNowProvider wrapper is the only thing
  // it renders inside.
  const isBarePreview = pathname.startsWith("/package-preview");

  if (isBarePreview) {
    return <QueryProvider>{children}</QueryProvider>;
  }

  return (
    <QueryProvider>
      {isAdmin ? (
        <div className="admin-shell-wrapper min-h-screen bg-slate-900 text-slate-100">{children}</div>
      ) : (
        <BookNowProvider>
          <PageTransitionOverlay />
          <TopBar />
          <Header />
          {children}
          <SiteFooter />
          <TawkMessenger />
          <WhatsAppAssistant />
        </BookNowProvider>
      )}
    </QueryProvider>
  );
}
