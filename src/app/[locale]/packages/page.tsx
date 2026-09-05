import React from "react";
import CommonListingPage from "@/components/packages/CommonListingPage";
import { marketingImageUrl } from "@/lib/marketing-images";
import { getTranslations } from "next-intl/server";

export default async function PackagesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "listingPages.all" });

  return (
    <CommonListingPage
      category="all"
      title={t("title")}
      subtitle={t("subtitle")}
      badgeText={t("badgeText")}
      bgImage={marketingImageUrl("1476514525535-07fb3b4ae5f1")}
      locale={locale}
    />
  );
}
