import React from "react";
import { packagesRepository } from "@/lib/packages-repository";
import { MedicalTourismClient } from "./MedicalTourismClient";

export default async function MedicalTourismPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const resolvedLocale = locale === "ar" ? "ar" : "en";
  const packages = await packagesRepository.getByCategory("medical", resolvedLocale);

  return <MedicalTourismClient packages={packages} />;
}
