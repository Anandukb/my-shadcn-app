import React from "react";
import CommonListingPage from "@/components/packages/CommonListingPage";

export default async function CruisePackagesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <CommonListingPage
      category="cruise"
      title="Cruise Packages"
      subtitle="Sail through crystal clear waters and discover amazing ports of call"
      badgeText="Luxury Cruises"
      bgImage="https://images.unsplash.com/photo-1569931728440-1488c2cfd34b?q=80&w=2400&auto=format&fit=crop"
      locale={locale}
    />
  );
}
