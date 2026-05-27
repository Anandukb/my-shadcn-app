"use client";

import React from "react";
import { usePathname } from "@/i18n/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { Header } from "@/components/layout/Header";
import { SiteFooter } from "@/components/layout/Footer";
import TawkMessenger from "@/components/TawkMessenger";
import { WhatsAppAssistant } from "@/components/layout/WhatsAppAssistant";
import { BookNowProvider } from "@/components/layout/BookNowDialog";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Since usePathname() from @/i18n/navigation strips the locale prefix (e.g., '/en/admin' -> '/admin'),
  // checking startsWith('/admin') works perfectly!
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <div className="admin-shell-wrapper min-h-screen bg-slate-900 text-slate-100">{children}</div>;
  }

  return (
    <BookNowProvider>
      <TopBar />
      <Header />
      {children}
      <SiteFooter />
      <TawkMessenger />
      <WhatsAppAssistant />
    </BookNowProvider>
  );
}
