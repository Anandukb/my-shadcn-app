import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { visaCountriesRepository } from "@/lib/visa-countries-repository";
import { buildMetadata } from "@/lib/seo";
import { CountryVisaClient } from "./CountryVisaClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string; locale: string }>;
}): Promise<Metadata> {
  const { country, locale } = await params;
  const countries = await visaCountriesRepository.listActive();
  const data = countries.find((c) => c.slug === country);

  if (!data) {
    const t = await getTranslations({ locale, namespace: "nav" });
    return buildMetadata({ locale, path: `/global-visa/${country}`, title: t("global_visa"), description: t("global_visa") });
  }

  const title = `${data.name} Visa`;
  const description =
    data.description ??
    (locale === "ar"
      ? `تعرف على متطلبات ورسوم ومدة معالجة تأشيرة ${data.name} مع مرام للسياحة والسفر.`
      : `Everything you need for your ${data.name} visa — requirements, processing time, fees, and full application support from Maram Tours and Travels.`);

  const meta = buildMetadata({ locale, path: `/global-visa/${country}`, title, description });

  return data.image
    ? { ...meta, openGraph: { ...meta.openGraph, images: [data.image] }, twitter: { ...meta.twitter, images: [data.image] } }
    : meta;
}

export default function CountryVisaPage() {
  return <CountryVisaClient />;
}
