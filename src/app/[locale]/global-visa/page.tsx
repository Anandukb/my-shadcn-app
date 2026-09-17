import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";
import { GlobalVisaClient } from "./GlobalVisaClient";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  const description =
    locale === "ar"
      ? "خدمات تأشيرات عالمية سريعة وموثوقة مع مرام للسياحة والسفر — تقديم مبسط ومتابعة كاملة لوجهتك القادمة."
      : "Fast, reliable global visa assistance from Maram Tours and Travels — simplified applications and end-to-end support for your next destination.";
  return buildMetadata({ locale, path: "/global-visa", title: t("global_visa"), description });
}

export default function GlobalVisaPage() {
  return <GlobalVisaClient />;
}
