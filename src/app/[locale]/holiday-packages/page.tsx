import React from "react";
import CommonListingPage from "@/components/packages/CommonListingPage";

export default async function PackagesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <CommonListingPage
      category="holidays"
      title="Holiday Packages"
      subtitle="Find the perfect holiday package tailored to your sense of adventure"
      badgeText="Curated Experiences"
      bgImage="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2400&auto=format&fit=crop"
      locale={locale}
    />
  );
}
