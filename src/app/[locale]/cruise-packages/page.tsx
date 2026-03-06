"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { PackageListingLayout } from "@/components/packages/PackageListingLayout";
import { allPackages } from "@/data/packages";

export default function CruisePackagesPage() {
    const t = useTranslations();

    const cruisePackages = allPackages.filter((pkg) => pkg.category === "cruise");

    return (
        <PackageListingLayout
            title="Cruise Packages"
            subtitle="Sail through crystal clear waters and discover amazing ports of call"
            badgeText="Luxury Cruises"
            bgImage="https://images.unsplash.com/photo-1569931728440-1488c2cfd34b?q=80&w=2400&auto=format&fit=crop"
            packages={cruisePackages}
        />
    );
}
