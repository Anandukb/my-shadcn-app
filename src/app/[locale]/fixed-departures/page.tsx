import React from "react";
import CommonListingPage from "@/components/packages/CommonListingPage";
import { marketingImageUrl } from "@/lib/marketing-images";
import { getTranslations } from "next-intl/server";

export default async function FixedDeparturesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "listingPages.fixedDeparture" });

  return (
    <CommonListingPage
      category="fixed-departure"
      title={t("title")}
      subtitle={t("subtitle")}
      badgeText={t("badgeText")}
      bgImage={marketingImageUrl("1436491865332-7a61a109cc05")}
      locale={locale}
    />
  );
}
