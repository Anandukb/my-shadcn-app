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
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

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
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-black/20 to-black/30" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(16,185,129,0.1),transparent_60%)]" />
                </div>

                {/* Floating Animated Ambient Orbs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40 z-0">
                    <motion.div
                        animate={{ y: [0, -25, 0], x: [0, 15, 0] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-1/4 left-[15%] w-64 h-64 rounded-full bg-emerald-500/10 blur-[90px]"
                    />
                    <motion.div
                        animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute bottom-1/4 right-[15%] w-80 h-80 rounded-full bg-teal-500/10 blur-[100px]"
                    />
                </div>

                <div className="relative z-10 container mx-auto px-4 flex flex-col items-center justify-center h-full text-center mt-10">
                    {/* Premium Sparkles Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className="flex items-center gap-2 mb-6"
                    >
                        <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse animate-bounce-slow" />
                        <Badge
                            variant="outline"
                            className="text-white border-white/20 bg-white/10 backdrop-blur-md px-5 py-2 text-xs md:text-sm font-bold tracking-[0.25em] uppercase rounded-full shadow-2xl hover:bg-white/20 transition-all cursor-default"
                        >
                            {badgeText}
                        </Badge>
                    </motion.div>

                    {/* Gradient title with drop shadow */}
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.15 }}
                        className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tight mb-6 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] max-w-5xl leading-[1.15]"
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
                        className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-200/90 max-w-3xl font-light mb-12 drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] leading-relaxed"
                    >
                        {subtitle}
                    </motion.p>

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
                        <Link href="/contact">Contact Us</Link>
                    </Button>
                </div>
            </section>
        </div>
    );
}
