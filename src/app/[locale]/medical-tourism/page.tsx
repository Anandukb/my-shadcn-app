import React from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { packagesRepository } from "@/lib/packages-repository";
import { buildMetadata } from "@/lib/seo";
import { MedicalTourismClient } from "./MedicalTourismClient";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  const description =
    locale === "ar"
      ? "رعاية طبية عالمية المستوى بأسعار معقولة في الهند — تنسيق كامل للعلاج والسفر والإقامة مع مرام للسياحة والسفر."
      : "World-class, affordable medical treatment in India with full travel, stay, and recovery coordination from Maram Tours and Travels.";
  return buildMetadata({ locale, path: "/medical-tourism", title: t("medical"), description });
}

export default async function MedicalTourismPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const resolvedLocale = locale === "ar" ? "ar" : "en";
  const packages = await packagesRepository.getByCategory("medical", resolvedLocale);

  return <MedicalTourismClient packages={packages} />;
}
