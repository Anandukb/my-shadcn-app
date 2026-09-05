"use client";

import React from "react";
import { usePathname } from "@/i18n/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { Header } from "@/components/layout/Header";
import { SiteFooter } from "@/components/layout/Footer";
import TawkMessenger from "@/components/TawkMessenger";
import { WhatsAppAssistant } from "@/components/layout/WhatsAppAssistant";
import { TawkChatAssistant } from "@/components/layout/TawkChatAssistant";
import { BookNowProvider } from "@/components/layout/BookNowDialog";
import { QueryProvider } from "@/components/providers/QueryProvider";

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
          <TopBar />
          <Header />
          {children}
          <SiteFooter />
          <TawkMessenger />
          <WhatsAppAssistant />
          <TawkChatAssistant />
        </BookNowProvider>
      )}
    </QueryProvider>
  );
}
