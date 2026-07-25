import React from "react";
import { packagesRepository } from "@/lib/packages-repository";
import { KeralaTourismClient } from "@/components/packages/KeralaTourismClient";

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
