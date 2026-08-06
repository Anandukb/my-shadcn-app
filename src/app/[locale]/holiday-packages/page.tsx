import React from "react";
import CommonListingPage from "@/components/packages/CommonListingPage";
import { marketingImageUrl } from "@/lib/marketing-images";

export default async function PackagesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <CommonListingPage
      category="holidays"
      title="Holiday Packages"
      subtitle="Find the perfect holiday package tailored to your sense of adventure"
      badgeText="Curated Experiences"
      bgImage={marketingImageUrl("1476514525535-07fb3b4ae5f1")}
      locale={locale}
    />
  );
}
