import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { packagesRepository } from "@/lib/packages-repository";
import { testimonialsRepository } from "@/lib/testimonials-repository";
import { buildMetadata } from "@/lib/seo";
import { HomeClient } from "./HomeClient";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about_home" });
  return buildMetadata({
    locale,
    path: "",
    title: "Maram Holidays - Your Gateway to the World",
    description: `${t("titlePrefix")} ${t("titleHighlight")} ${t("titleSuffix")}. Discover curated holiday packages, fixed departures, cruises, global visa assistance, and medical tourism with Maram Tours and Travels.`,
  });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const resolvedLocale = locale === "ar" ? "ar" : "en";
  const packages = await packagesRepository.getAll(resolvedLocale);
  const testimonials = await testimonialsRepository.listActive();

  return <HomeClient packages={packages} testimonials={testimonials} />;
}
