import React from "react";
import CommonListingPage from "@/components/packages/CommonListingPage";
import { marketingImageUrl } from "@/lib/marketing-images";

export default async function FixedDeparturesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <CommonListingPage
      category="fixed-departure"
      title="Fixed Departures"
      subtitle="Explore our curated group tours with guaranteed departure dates."
      badgeText="Group Tours"
      bgImage={marketingImageUrl("1436491865332-7a61a109cc05")}
      locale={locale}
    />
  );
}
