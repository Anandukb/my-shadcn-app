"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { PackageListingLayout } from "@/components/packages/PackageListingLayout";
import { allPackages } from "@/data/packages";

export default function PackagesPage() {
  const t = useTranslations();

  const holidayPackages = allPackages.filter((pkg) => pkg.category === "holidays");

  return (
    <PackageListingLayout
      title="Holiday Packages"
      subtitle="Find the perfect holiday package tailored to your sense of adventure"
      badgeText="Curated Experiences"
      bgImage="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2400&auto=format&fit=crop"
      packages={holidayPackages}
    />
  );
}
