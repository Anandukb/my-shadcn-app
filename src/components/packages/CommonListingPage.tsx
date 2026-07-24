import React from "react";
import { PackageListingLayout } from "@/components/packages/PackageListingLayout";
import { packagesRepository } from "@/lib/packages-repository";

interface CommonListingPageProps {
  category: string;
  title: string;
  subtitle: string;
  badgeText: string;
  bgImage: string;
  locale: string;
}

export default async function CommonListingPage({
  category,
  title,
  subtitle,
  badgeText,
  bgImage,
  locale,
}: CommonListingPageProps) {
  const resolvedLocale = locale === "ar" ? "ar" : "en";
  const packages = await packagesRepository.getByCategory(category, resolvedLocale);

  return (
    <PackageListingLayout
      title={title}
      subtitle={subtitle}
      badgeText={badgeText}
      bgImage={bgImage}
      packages={packages}
    />
  );
}
