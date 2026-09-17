import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";
import HotelsLandingClient from "./HotelsLandingClient";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "hotelBooking.landing" });
  return buildMetadata({ locale, path: "/hotels", title: t("title"), description: t("subtitle") });
}

export default function HotelsPage() {
  return <HotelsLandingClient />;
}
