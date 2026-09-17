import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";
import { AboutClient } from "./AboutClient";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  const description =
    locale === "ar"
      ? "تعرف على مرام للسياحة والسفر — شريكك الموثوق لتجارب سفر فاخرة وشخصية وسياحة علاجية عبر أفضل الوجهات حول العالم."
      : "Learn about Maram Tours and Travels — your trusted partner for premium, personalized travel and medical recovery experiences across the world's finest destinations.";
  return buildMetadata({ locale, path: "/about", title: t("about"), description });
}

export default function AboutPage() {
  return <AboutClient />;
}
