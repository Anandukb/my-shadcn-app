import React from "react";
import type { Metadata } from "next";
import CommonListingPage from "@/components/packages/CommonListingPage";
import { marketingImageUrl } from "@/lib/marketing-images";
import { getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "listingPages.cruise" });
  return buildMetadata({ locale, path: "/cruise-packages", title: t("title"), description: t("subtitle") });
}

export default async function CruisePackagesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "listingPages.cruise" });

  return (
    <CommonListingPage
      category="cruise"
      title={t("title")}
      subtitle={t("subtitle")}
      badgeText={t("badgeText")}
      bgImage={marketingImageUrl("1602174423520-daa2d87175a0")}
      locale={locale}
    />
  );
}
