"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package } from "@/types/package";
import { PackageFilterBar } from "./PackageFilterBar";
import { PackageCard } from "./PackageCard";

interface PackageListingLayoutProps {
    title: string;
    subtitle: string;
    badgeText: string;
    bgImage: string;
    packages: Package[];
}

export function PackageListingLayout({
    title,
    subtitle,
    badgeText,
    bgImage,
    packages,
}: PackageListingLayoutProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedContinent, setSelectedContinent] = useState("all");

    const filteredPackages = packages.filter((pkg) => {
        const matchesSearch =
            pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            pkg.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            pkg.description.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesContinent =
            selectedContinent === "all" || pkg.continent === selectedContinent;

        return matchesSearch && matchesContinent;
    });

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative h-[65vh] min-h-[500px] w-full overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0">
                    <Image
                        src={bgImage}
                        alt={title}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-black/50" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/40" />
                </div>

                <div className="relative z-10 container mx-auto px-4 flex flex-col items-center justify-center h-full text-center mt-10">
                    <Badge
                        variant="outline"
                        className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-md px-4 py-1.5 text-sm font-medium tracking-[0.2em] uppercase rounded-full"
                    >
                        {badgeText}
                    </Badge>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight mb-6 drop-shadow-xl max-w-4xl">
                        {title}
                    </h1>
                    <p className="text-lg md:text-2xl text-white/90 max-w-2xl font-light mb-12 drop-shadow-md">
                        {subtitle}
                    </p>

                    <PackageFilterBar
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        selectedContinent={selectedContinent}
                        setSelectedContinent={setSelectedContinent}
                        showFilterButton={true}
                    />
                </div>
            </section>

            {/* Packages Grid */}
            <section className="container mx-auto px-4 py-12">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold">{title}</h2>
                        <p className="text-muted-foreground">
                            {filteredPackages.length}{" "}
                            {filteredPackages.length === 1 ? "package" : "packages"} found
                        </p>
                    </div>
                </div>

                {filteredPackages.length === 0 ? (
                    <Card className="p-12 text-center">
                        <p className="text-muted-foreground text-lg">
                            No packages found matching your criteria.
                        </p>
                        <Button onClick={() => { setSearchQuery(""); setSelectedContinent("all"); }} className="mt-4">
                            Clear Filters
                        </Button>
                    </Card>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPackages.map((pkg) => (
                            <PackageCard key={pkg.id} pkg={pkg} />
                        ))}
                    </div>
                )}
            </section>

            {/* CTA Section */}
            <section className="bg-muted/30 py-16">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">
                        Can&apos;t Find What You&apos;re Looking For?
                    </h2>
                    <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                        Our travel experts can create a custom package tailored to your
                        preferences and budget.
                    </p>
                    <Button size="lg" asChild>
                        <Link href="/#contact">Contact Us</Link>
                    </Button>
                </div>
            </section>
        </div>
    );
}
