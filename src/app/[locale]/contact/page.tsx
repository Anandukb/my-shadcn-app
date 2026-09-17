import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";
import { ContactClient } from "./ContactClient";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  const description =
    locale === "ar"
      ? "تواصل مع فريق مرام للسياحة والسفر لتخطيط رحلتك القادمة — باقات العطلات، السفر الجماعي، التأشيرات، والسياحة العلاجية."
      : "Get in touch with Maram Tours and Travels to plan your next trip — holiday packages, group tours, visa assistance, and medical tourism.";
  return buildMetadata({ locale, path: "/contact", title: t("contact"), description });
}

export default function ContactPage() {
  return <ContactClient />;
}
