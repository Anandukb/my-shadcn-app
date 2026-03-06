"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { PackageListingLayout } from "@/components/packages/PackageListingLayout";
import { allPackages } from "@/data/packages";

export default function MedicalTourismPage() {
    const t = useTranslations();

    const medicalPackages = allPackages.filter((pkg) => pkg.category === "medical");

    return (
        <PackageListingLayout
            title="Medical Tourism"
            subtitle="World-class healthcare paired with exceptional travel experiences"
            badgeText="Health & Wellness"
            bgImage="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2400&auto=format&fit=crop"
            packages={medicalPackages}
        />
    );
}
