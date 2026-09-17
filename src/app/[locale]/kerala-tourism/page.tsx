import React from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { packagesRepository } from "@/lib/packages-repository";
import { buildMetadata } from "@/lib/seo";
import { KeralaTourismClient } from "@/components/packages/KeralaTourismClient";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  const description =
    locale === "ar"
      ? "استكشف أفضل باقات السياحة في كيرالا مع مرام للسياحة والسفر — منتجعات باكواتر، مزارع الشاي في مونار، وتجارب أيورفيدا أصيلة."
      : "Explore Kerala's backwaters, hill stations, and Ayurveda retreats with Maram Tours and Travels' curated Kerala holiday packages.";
  return buildMetadata({ locale, path: "/kerala-tourism", title: t("kerala"), description });
}

export default async function KeralaTourismPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const resolvedLocale = locale === "ar" ? "ar" : "en";

  const [keralaCategoryPackages, medicalPackages] = await Promise.all([
    packagesRepository.getByCategory("kerala", resolvedLocale),
    packagesRepository.getByCategory("medical", resolvedLocale),
  ]);

  const keralaPackages = [
    ...keralaCategoryPackages,
    ...medicalPackages.filter((pkg) => pkg.location.toLowerCase().includes("kerala")),
  ];

  return <KeralaTourismClient packages={keralaPackages} />;
}
