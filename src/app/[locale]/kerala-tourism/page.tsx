"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { PackageListingLayout } from "@/components/packages/PackageListingLayout";
import { allPackages } from "@/data/packages";

export default function KeralaTourismPage() {
    const t = useTranslations();

    const keralaPackages = allPackages.filter((pkg) => pkg.category === "kerala");

    return (
        <PackageListingLayout
            title="Kerala Tourism"
            subtitle="Experience God's Own Country with its serene backwaters and lush green hills"
            badgeText="God's Own Country"
            bgImage="https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=2400&auto=format&fit=crop"
            packages={keralaPackages}
        />
    );
}
