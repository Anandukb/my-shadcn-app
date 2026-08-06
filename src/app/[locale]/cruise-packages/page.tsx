import React from "react";
import CommonListingPage from "@/components/packages/CommonListingPage";
import { marketingImageUrl } from "@/lib/marketing-images";

export default async function CruisePackagesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <CommonListingPage
      category="cruise"
      title="Cruise Packages"
      subtitle="Sail through crystal clear waters and discover amazing ports of call"
      badgeText="Luxury Cruises"
      bgImage={marketingImageUrl("1602174423520-daa2d87175a0")}
      locale={locale}
    />
  );
}
