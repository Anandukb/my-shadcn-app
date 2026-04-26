import React from "react";
import { PackageListingLayout } from "@/components/packages/PackageListingLayout";
import { getPackagesByCategory } from "@/lib/api";

interface CommonListingPageProps {
  category: string;
  title: string;
  subtitle: string;
  badgeText: string;
  bgImage: string;
}

export default async function CommonListingPage({
  category,
  title,
  subtitle,
  badgeText,
  bgImage,
}: CommonListingPageProps) {
  const packages = await getPackagesByCategory(category);

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
