"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package } from "@/types/package";
import { PackageFilterBar } from "./PackageFilterBar";
import { PackageCard } from "./PackageCard";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

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
    const t = useTranslations();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedContinent, setSelectedContinent] = useState("all");

    // Recomputed only when its actual inputs change — searchQuery updates on
    // every keystroke, and without this the full package list would be
    // re-filtered (and re-rendered) on each one.
    const filteredPackages = useMemo(() => {
        const query = searchQuery.toLowerCase();
        return packages.filter((pkg) => {
            const matchesSearch =
                pkg.title.toLowerCase().includes(query) ||
                pkg.location.toLowerCase().includes(query) ||
                pkg.description.toLowerCase().includes(query);

            const matchesContinent =
                selectedContinent === "all" || pkg.continent === selectedContinent;

            return matchesSearch && matchesContinent;
        });
    }, [packages, searchQuery, selectedContinent]);

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section — compact; content is bottom-anchored so the search bar overlaps into the grid section below */}
            <section className="relative h-[38vh] min-h-[340px] md:min-h-[380px] w-full overflow-hidden flex items-end justify-center">
                {/* Background image with Ken Burns zoom effect */}
                <div className="absolute inset-0 z-0">
                    <motion.div
                        initial={{ scale: 1 }}
                        animate={{ scale: 1.08 }}
                        transition={{ duration: 20, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
                        className="w-full h-full relative"
                    >
                        <Image
                            src={bgImage}
                            alt={title}
                            fill
                            sizes="100vw"
                            className="object-cover"
                            priority
                            quality={90}
                        />
                    </motion.div>

                    {/* Modern Multi-layer Gradient Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/30 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-black/30 to-black/25" />
                    {/* Extra top darkening so the floating header stays legible */}
                    <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/70 to-transparent" />
                </div>

                <div className="relative z-10 container mx-auto px-4 flex flex-col items-center text-center pt-20 md:pt-24 pb-10 md:pb-12">
                    {/* Premium Sparkles Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className="flex items-center gap-2 mb-3"
                    >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                        <Badge
                            variant="outline"
                            className="text-white border-white/20 bg-white/10 backdrop-blur-md px-4 py-1.5 text-[11px] md:text-xs font-bold tracking-[0.25em] uppercase rounded-full shadow-xl hover:bg-white/20 transition-all cursor-default"
                        >
                            {badgeText}
                        </Badge>
                    </motion.div>

                    {/* Gradient title with drop shadow */}
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.15 }}
                        className="text-3xl md:text-5xl font-black text-white tracking-tight mb-2 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] max-w-4xl leading-[1.15]"
                    >
                        {title.includes(" ") ? (
                            <>
                                {title.split(" ")[0]}{" "}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 drop-shadow-2xl">
                                    {title.split(" ").slice(1).join(" ")}
                                </span>
                            </>
                        ) : (
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 drop-shadow-2xl">
                                {title}
                            </span>
                        )}
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="text-sm sm:text-base text-slate-200/90 max-w-xl font-light drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] leading-relaxed"
                    >
                        {subtitle}
                    </motion.p>
                </div>
            </section>

            {/* Search bar floats over the hero/grid boundary, like a booking widget */}
            <div className="relative z-20 -mt-8 md:-mt-7 px-4">
                <PackageFilterBar
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    selectedContinent={selectedContinent}
                    setSelectedContinent={setSelectedContinent}
                    showFilterButton={true}
                />
            </div>

            {/* Packages Grid */}
            <section className="container mx-auto px-4 pt-8 md:pt-10 pb-10">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
                        <p className="text-sm text-muted-foreground">
                            {t('packageListing.resultsCount', { count: filteredPackages.length })}
                        </p>
                    </div>
                </div>

                {filteredPackages.length === 0 ? (
                    <Card className="p-12 text-center">
                        <p className="text-muted-foreground text-lg">
                            {t('packageListing.noPackagesFound')}
                        </p>
                        <Button onClick={() => { setSearchQuery(""); setSelectedContinent("all"); }} className="mt-4">
                            {t('packageListing.clearFilters')}
                        </Button>
                    </Card>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredPackages.map((pkg) => (
                            <PackageCard key={pkg.id} pkg={pkg} />
                        ))}
                    </div>
                )}
            </section>

            {/* CTA Section */}
            <section className="bg-muted/30 py-12">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold mb-3">
                        {t('packageListing.cantFindTitle')}
                    </h2>
                    <p className="text-muted-foreground mb-5 max-w-2xl mx-auto">
                        {t('packageListing.cantFindSubtitle')}
                    </p>
                    <Button size="lg" asChild>
                        <Link href="/contact">{t('packageListing.contactUs')}</Link>
                    </Button>
                </div>
            </section>
        </div>
    );
}
