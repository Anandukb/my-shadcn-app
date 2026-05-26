"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PackageCard } from "@/components/packages/PackageCard";
import { Package } from "@/types/package";
import {
    Heart,
    Waves,
    Mountain,
    Compass,
    Sprout,
    Globe,
    Plane,
    BookOpen,
    Search,
    ArrowRight,
    Sparkles,
    Flame,
    Palette,
    Info,
    Leaf
} from "lucide-react";

interface KeralaTourismClientProps {
    packages: Package[];
}

const themes = [
    { id: "all", label: "All Experiences", icon: Globe, description: "Explore the full wonder of Kerala" },
    { id: "honeymoon", label: "Honeymoon Specials", icon: Heart, description: "Romantic getaways in private havens" },
    { id: "backwaters", label: "Serene Backwaters", icon: Waves, description: "Houseboat cruises & winding canal stays" },
    { id: "hillstations", label: "Misty Hill Stations", icon: Mountain, description: "Cool breezes & rolling tea estates" },
    { id: "adventure", label: "Wildlife & Trekking", icon: Compass, description: "Western Ghats jungle trails & safaris" },
    { id: "cultural", label: "Heritage & Wellness", icon: Sprout, description: "Ancient Theyyam, Ayurveda & Yoga" }
];

export function KeralaTourismClient({ packages }: KeralaTourismClientProps) {
    const [viewMode, setViewMode] = useState<"webpage" | "listing">("webpage");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTheme, setSelectedTheme] = useState("all");
    const [activeSection, setActiveSection] = useState("intro");

    // Ref for scrolling to the packages grid
    const packagesGridRef = useRef<HTMLDivElement>(null);
    const webpageContainerRef = useRef<HTMLDivElement>(null);

    // Section Refs for storytelling navigation
    const sectionRefs = {
        intro: useRef<HTMLDivElement>(null),
        nature: useRef<HTMLDivElement>(null),
        backwaters: useRef<HTMLDivElement>(null),
        attractions: useRef<HTMLDivElement>(null),
        temples: useRef<HTMLDivElement>(null),
        hillstations: useRef<HTMLDivElement>(null),
        culture: useRef<HTMLDivElement>(null),
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearchQuery(val);
        if (val.trim() !== "") {
            setViewMode("listing");
        }
    };

    const handleThemeSelect = (themeId: string) => {
        setSelectedTheme(themeId);
        setViewMode("listing");
        // Smooth scroll to packages grid after transition completes
        setTimeout(() => {
            packagesGridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 600);
    };

    const exploreTheme = (themeId: string) => {
        setSelectedTheme(themeId);
        setViewMode("listing");
        // Smooth scroll to packages grid after transition completes
        setTimeout(() => {
            packagesGridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 600);
    };

    const scrollToSection = (sectionKey: keyof typeof sectionRefs) => {
        setActiveSection(sectionKey);
        setViewMode("webpage");
        setTimeout(() => {
            sectionRefs[sectionKey].current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
    };

    // Filter packages based on selected theme and search query
    const filteredPackages = packages.filter((pkg) => {
        // Search filter
        const matchesSearch =
            pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            pkg.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            pkg.description.toLowerCase().includes(searchQuery.toLowerCase());

        // Theme filter
        let matchesTheme = true;
        if (selectedTheme !== "all") {
            const title = pkg.title.toLowerCase();
            const desc = pkg.description.toLowerCase();
            const loc = pkg.location.toLowerCase();

            if (selectedTheme === "honeymoon") {
                // Munnar, Alleppey, Wayanad are top honeymoon spots
                matchesTheme = pkg.id === 16 || pkg.id === 17 || pkg.id === 18 ||
                    title.includes("escape") || title.includes("romance") ||
                    desc.includes("honeymoon") || desc.includes("romantic") || desc.includes("retreat");
            } else if (selectedTheme === "backwaters") {
                matchesTheme = pkg.id === 17 || title.includes("houseboat") || title.includes("backwater") || desc.includes("backwater") || desc.includes("houseboat");
            } else if (selectedTheme === "hillstations") {
                matchesTheme = pkg.id === 16 || pkg.id === 18 || loc.includes("munnar") || loc.includes("wayanad") || title.includes("hill") || desc.includes("hill") || desc.includes("mist");
            } else if (selectedTheme === "adventure") {
                matchesTheme = pkg.id === 18 || title.includes("trek") || title.includes("nature") || desc.includes("safari") || desc.includes("trekking") || desc.includes("wildlife");
            } else if (selectedTheme === "cultural") {
                matchesTheme = pkg.id === 21 || pkg.id === 22 || pkg.id === 23 ||
                    title.includes("wellness") || title.includes("ayurveda") || title.includes("yoga") ||
                    desc.includes("healing") || desc.includes("culture") || desc.includes("traditional") || desc.includes("retreat");
            }
        }

        return matchesSearch && matchesTheme;
    });

    // Detect active section on scroll
    useEffect(() => {
        if (viewMode !== "webpage") return;

        const handleScroll = () => {
            const scrollPosition = window.scrollY + window.innerHeight / 2;

            for (const [key, ref] of Object.entries(sectionRefs)) {
                if (ref.current) {
                    const top = ref.current.offsetTop;
                    const height = ref.current.offsetHeight;

                    if (scrollPosition >= top && scrollPosition < top + height) {
                        setActiveSection(key);
                        break;
                    }
                }
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [viewMode]);

    // Scroll to listing grid when entering listing mode
    useEffect(() => {
        if (viewMode === "listing") {
            const timer = setTimeout(() => {
                packagesGridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 600);
            return () => clearTimeout(timer);
        }
    }, [viewMode]);

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
            {/* Hero Section - Modern & Attractive */}
            <section className="relative h-[85vh] min-h-[650px] w-full overflow-hidden flex items-center justify-center">
                {/* Background with Ken Burns Effect */}
                <div className="absolute inset-0">
                    <motion.div
                        initial={{ scale: 1 }}
                        animate={{ scale: 1.1 }}
                        transition={{ duration: 15, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
                        className="w-full h-full"
                    >
                        <Image
                            src="https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=2400&auto=format&fit=crop"
                            alt="Kerala Backwaters Houseboat"
                            fill
                            className="object-cover"
                            priority
                            quality={90}
                        />
                    </motion.div>

                    {/* Modern Multi-layer Gradient Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/80 via-teal-900/60 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,rgba(16,185,129,0.2),transparent_60%)]" />

                    {/* Animated Floating Elements */}
                    <div className="absolute inset-0 opacity-20">
                        <motion.div
                            animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
                            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-1/4 left-1/4 w-3 h-3 bg-emerald-400 rounded-full blur-sm"
                        />
                        <motion.div
                            animate={{ y: [0, 20, 0], x: [0, -15, 0] }}
                            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute top-1/3 right-1/3 w-2 h-2 bg-teal-300 rounded-full blur-sm"
                        />
                        <motion.div
                            animate={{ y: [0, -15, 0], x: [0, 20, 0] }}
                            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                            className="absolute bottom-1/3 left-1/2 w-2.5 h-2.5 bg-cyan-400 rounded-full blur-sm"
                        />
                    </div>
                </div>

                <div className="relative z-10 container mx-auto px-4 sm:px-6 flex flex-col items-center justify-center h-full text-center">
                    {/* Badge with Icon */}
                    <motion.div
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        className="flex items-center gap-2 mb-6"
                    >
                        <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
                        <Badge
                            variant="outline"
                            className="text-white border-white/50 bg-white/15 backdrop-blur-xl px-6 py-2.5 text-sm font-bold tracking-[0.3em] uppercase rounded-full shadow-2xl hover:bg-white/25 transition-all"
                        >
                            God&apos;s Own Country
                        </Badge>
                    </motion.div>

                    {/* Main Title with Gradient */}
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tight mb-6 max-w-6xl leading-[1.1]"
                    >
                        <span className="inline-block text-white drop-shadow-2xl">Kerala</span>{' '}
                        <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 animate-gradient drop-shadow-2xl">
                            Tourism
                        </span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/95 max-w-4xl font-light mb-12 drop-shadow-xl leading-relaxed px-4"
                    >
                        Journey through misty hills, pristine palm-fringed backwaters, vibrant ritual arts, and age-old Ayurvedic healing sanctuaries.
                    </motion.p>

                    {/* Modern Search & Filter Panel — replaced with clean CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="flex flex-col sm:flex-row gap-4"
                    >
                        <Button
                            size="lg"
                            onClick={() => exploreTheme("all")}
                            className="h-14 px-8 text-base font-bold rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                        >
                            <Plane className="w-5 h-5 mr-2" />
                            View All Packages
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            onClick={() => setViewMode("webpage")}
                            className="h-14 px-8 text-base font-bold rounded-full border-2 border-white/60 text-white hover:bg-white hover:text-slate-900 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:-translate-y-1 shadow-lg"
                        >
                            <BookOpen className="w-5 h-5 mr-2" />
                            Explore Travel Guide
                        </Button>
                    </motion.div>

                    {/* Quick Stats or Features */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                        className="mt-12 flex flex-wrap justify-center gap-6 md:gap-8"
                    >
                        {[
                            { icon: Waves, label: "Backwaters", count: "44 Rivers" },
                            { icon: Mountain, label: "Hill Stations", count: "5+ Peaks" },
                            { icon: Leaf, label: "Wildlife", count: "15+ Sanctuaries" }
                        ].map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.9 + idx * 0.1 }}
                                className="flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-6 py-3 hover:bg-white/20 transition-all group cursor-default"
                            >
                                <stat.icon className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                                <div className="text-left">
                                    <p className="text-white/70 text-xs font-medium">{stat.label}</p>
                                    <p className="text-white font-bold text-sm">{stat.count}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 1.2, repeat: Infinity, repeatType: "reverse" }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-2 text-white/60"
                >
                    <span className="text-xs font-medium tracking-wider uppercase">Scroll to Explore</span>
                    <div className="w-6 h-10 rounded-full border-2 border-white/40 flex items-start justify-center p-2">
                        <motion.div
                            className="w-1.5 h-1.5 bg-white rounded-full"
                            animate={{ y: [0, 12, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        />
                    </div>
                </motion.div>
            </section>

            {/* Main Interactive Container with Crossfade Animations */}
            <main className="relative py-6">
                <AnimatePresence mode="wait">
                    {viewMode === "webpage" ? (
                        /* Webpage Mode: Storytelling Experience Guide */
                        <motion.div
                            key="webpage-experience"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.5 }}
                            ref={webpageContainerRef}
                            className="space-y-12 md:space-y-16 pb-16"
                        >
                            {/* Section 1: Introduction */}
                            <div ref={sectionRefs.intro} className="scroll-mt-24">
                                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                                    <div className="grid md:grid-cols-12 gap-8 md:gap-12 items-center">
                                        <div className="md:col-span-6 space-y-6">
                                            <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-sm">
                                                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                                                <span>God&apos;s Own Country</span>
                                            </div>
                                            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                                                A Tapestry of Emerald, Gold, & Serenity
                                            </h2>
                                            <p className="text-muted-foreground text-lg leading-relaxed">
                                                Nestled on the southwestern tip of the Indian peninsula, Kerala is a tropical paradise that has enchanted travelers for centuries. Framed by the majestic peaks of the Western Ghats to the east and the shimmering Arabian Sea to the west, this fertile coastal strip boasts 44 rushing rivers, pristine beaches, and ancient rainforests.
                                            </p>
                                            <p className="text-muted-foreground text-lg leading-relaxed">
                                                Beyond its geographical marvels, Kerala is a state of mind—a place where the pace slows down, where traditions run deep, and where life is celebrated in harmonious balance with nature.
                                            </p>
                                            <div className="pt-4 flex gap-4">
                                                <Button
                                                    size="lg"
                                                    className="rounded-full shadow-lg font-bold group"
                                                    onClick={() => exploreTheme("all")}
                                                >
                                                    Explore All Packages
                                                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="md:col-span-6 relative">
                                            <div className="relative h-[350px] md:h-[500px] w-full rounded-3xl overflow-hidden shadow-2xl group">
                                                <Image
                                                    src="https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=1200&auto=format&fit=crop"
                                                    alt="Misty tea gardens of Munnar"
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                                                <div className="absolute bottom-6 left-6 text-white">
                                                    <p className="text-xs uppercase tracking-widest text-white/80 font-bold mb-1">Misty Highlands</p>
                                                    <h3 className="text-xl font-bold">Munnar Tea Estates</h3>
                                                </div>
                                            </div>
                                            <div className="absolute -bottom-6 -left-6 bg-white dark:bg-card p-6 rounded-2xl shadow-xl hidden md:block border max-w-xs animate-bounce-slow">
                                                <p className="text-sm font-black text-primary mb-1">Did you know?</p>
                                                <p className="text-xs text-muted-foreground">National Geographic Traveler named Kerala one of the &quot;50 Greatest Destinations of a Lifetime.&quot;</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Categories Section - Modern Design */}
                            <div className="relative overflow-hidden py-12 md:py-16">
                                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-emerald-50/40 dark:from-slate-900/50 dark:to-emerald-950/20" />

                                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
                                    {/* Header */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.6 }}
                                        className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10"
                                    >
                                        <div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="w-8 h-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
                                                <span className="text-emerald-600 dark:text-emerald-400 text-sm font-bold uppercase tracking-widest">Curated Experiences</span>
                                            </div>
                                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
                                                Kerala <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Tour Packages</span>
                                            </h2>
                                        </div>
                                        <p className="text-muted-foreground text-base max-w-sm leading-relaxed">
                                            Handpicked experiences across Kerala&apos;s most breathtaking landscapes and cultural gems.
                                        </p>
                                    </motion.div>

                                    {/* Bento Grid Layout */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 auto-rows-[220px]">
                                        {[
                                            {
                                                title: "Holiday Packages",
                                                subtitle: "Sun, sand & serenity",
                                                target: "all",
                                                img: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=800&auto=format&fit=crop",
                                                accent: "from-blue-600 to-cyan-500",
                                                accentBg: "bg-blue-500/20",
                                                accentText: "text-blue-300",
                                                icon: Globe,
                                                span: "lg:col-span-5 lg:row-span-2",
                                                tall: true
                                            },
                                            {
                                                title: "Honeymoon",
                                                subtitle: "Romantic escapes",
                                                target: "honeymoon",
                                                img: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=800&auto=format&fit=crop",
                                                accent: "from-pink-500 to-rose-500",
                                                accentBg: "bg-pink-500/20",
                                                accentText: "text-pink-300",
                                                icon: Heart,
                                                span: "lg:col-span-4",
                                                tall: false
                                            },
                                            {
                                                title: "Hill Stations",
                                                subtitle: "Misty peaks & tea estates",
                                                target: "hillstations",
                                                img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=800&auto=format&fit=crop",
                                                accent: "from-emerald-500 to-teal-500",
                                                accentBg: "bg-emerald-500/20",
                                                accentText: "text-emerald-300",
                                                icon: Mountain,
                                                span: "lg:col-span-3",
                                                tall: false
                                            },
                                            {
                                                title: "Luxury Retreats",
                                                subtitle: "Premium stays & wellness",
                                                target: "cultural",
                                                img: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800&auto=format&fit=crop",
                                                accent: "from-amber-500 to-orange-500",
                                                accentBg: "bg-amber-500/20",
                                                accentText: "text-amber-300",
                                                icon: Sparkles,
                                                span: "lg:col-span-7",
                                                tall: false
                                            },
                                        ].map((card, idx) => {
                                            const Icon = card.icon;
                                            return (
                                                <motion.div
                                                    key={idx}
                                                    initial={{ opacity: 0, y: 24 }}
                                                    whileInView={{ opacity: 1, y: 0 }}
                                                    viewport={{ once: true }}
                                                    transition={{ duration: 0.5, delay: idx * 0.08 }}
                                                    onClick={() => exploreTheme(card.target)}
                                                    className={`group relative rounded-2xl overflow-hidden cursor-pointer ${card.span}`}
                                                >
                                                    {/* Image */}
                                                    <Image
                                                        src={card.img}
                                                        alt={card.title}
                                                        fill
                                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                                    />

                                                    {/* Base overlay — always visible */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

                                                    {/* Hover color wash */}
                                                    <div className={`absolute inset-0 bg-gradient-to-br ${card.accent} opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />

                                                    {/* Content */}
                                                    <div className="absolute inset-0 p-5 flex flex-col justify-between">
                                                        {/* Top: icon pill */}
                                                        <div className="flex justify-between items-start">
                                                            <div className={`flex items-center gap-2 ${card.accentBg} backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/10`}>
                                                                <Icon className={`w-4 h-4 ${card.accentText}`} />
                                                                <span className={`text-xs font-bold ${card.accentText} uppercase tracking-wider`}>{card.title}</span>
                                                            </div>
                                                            <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:rotate-45">
                                                                <ArrowRight className="w-4 h-4 text-white" />
                                                            </div>
                                                        </div>

                                                        {/* Bottom: title + subtitle + CTA */}
                                                        <div>
                                                            <p className="text-white/70 text-xs font-medium mb-1 tracking-wide">{card.subtitle}</p>
                                                            <h3 className="text-white font-black text-xl md:text-2xl leading-tight mb-3">
                                                                {card.title}
                                                            </h3>
                                                            <div className="overflow-hidden h-0 group-hover:h-9 transition-all duration-500">
                                                                <button className={`text-xs font-bold text-white bg-gradient-to-r ${card.accent} rounded-full px-4 py-2 flex items-center gap-1.5 shadow-lg`}>
                                                                    Explore Now <ArrowRight className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Featured Packages Section */}
                            <div className="py-12 md:py-16">
                                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                                    {/* Header */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.6 }}
                                        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10"
                                    >
                                        <div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="w-8 h-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
                                                <span className="text-emerald-600 dark:text-emerald-400 text-sm font-bold uppercase tracking-widest">Kerala Packages</span>
                                            </div>
                                            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                                                Popular <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Packages</span>
                                            </h2>
                                        </div>
                                        <Button
                                            onClick={() => exploreTheme("all")}
                                            variant="outline"
                                            className="rounded-full px-6 h-11 font-bold border-emerald-500/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500 transition-all group shrink-0"
                                        >
                                            View All Packages
                                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </motion.div>

                                    {/* Package Cards Grid */}
                                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                                        {packages.slice(0, 3).map((pkg, idx) => (
                                            <motion.div
                                                key={pkg.id}
                                                initial={{ opacity: 0, y: 24 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                                className="h-full flex flex-col"
                                            >
                                                <PackageCard pkg={pkg} />
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Bottom CTA */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 16 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: 0.3 }}
                                        className="mt-10 text-center"
                                    >
                                        <Button
                                            size="lg"
                                            onClick={() => exploreTheme("all")}
                                            className="h-14 px-10 rounded-full font-bold text-base bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-xl hover:shadow-emerald-500/40 hover:scale-105 hover:-translate-y-0.5 transition-all duration-300 group"
                                        >
                                            <Plane className="w-5 h-5 mr-2" />
                                            View All {packages.length} Packages
                                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </motion.div>
                                </div>
                            </div>

                            {/* Section 2: Kerala Nature */}
                            <div
                                ref={sectionRefs.nature}
                                className="bg-emerald-950/5 dark:bg-emerald-950/20 py-12 md:py-16 scroll-mt-24"
                            >
                                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                                    <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                                        <Badge className="bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 border-0 px-4 py-1.5 text-xs tracking-wider uppercase font-bold rounded-full">
                                            🌴 Untamed Greenery
                                        </Badge>
                                        <h2 className="text-3xl md:text-5xl font-black tracking-tight">
                                            The Breath of the Western Ghats
                                        </h2>
                                        <p className="text-muted-foreground text-lg">
                                            Kerala&apos;s ecosystem is exceptionally rich, designated as one of the world&apos;s eight &quot;hottest hotspots&quot; of biological diversity. Discover dense forests, rushing rivers, and wild creatures.
                                        </p>
                                    </div>

                                    <div className="grid md:grid-cols-3 gap-8">
                                        {[
                                            {
                                                title: "Monsoon Magic (Edavappathy)",
                                                desc: "Kerala receives two cycles of monsoon, transforming the entire landscape into a dramatic, hyper-vibrant canopy of endless emerald shades.",
                                                icon: Leaf,
                                                img: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=600&auto=format&fit=crop"
                                            },
                                            {
                                                title: "Flora & Spice Gardens",
                                                desc: "The ancient scent of cardamom, cinnamon, clove, and black gold (pepper) floats through misty spice hills, attracting explorers since Roman times.",
                                                icon: Sprout,
                                                img: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=600&auto=format&fit=crop"
                                            },
                                            {
                                                title: "Jungle Sanctuary Wildlife",
                                                desc: "Deep within Periyar and Wayanad lie protected corridors where Asian elephants, Bengal tigers, and Nilgiri tahrs roam in pristine sanctuary.",
                                                icon: Compass,
                                                img: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=600&auto=format&fit=crop"
                                            }
                                        ].map((item, idx) => (
                                            <Card key={idx} className="group overflow-hidden rounded-3xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/50 dark:bg-card/50 backdrop-blur-sm">
                                                <div className="relative h-48 w-full overflow-hidden">
                                                    <Image
                                                        src={item.img}
                                                        alt={item.title}
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                    <div className="absolute inset-0 bg-black/20" />
                                                </div>
                                                <CardContent className="p-6 space-y-3">
                                                    <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl w-fit">
                                                        <item.icon className="h-5 w-5" />
                                                    </div>
                                                    <h3 className="text-xl font-bold tracking-tight">{item.title}</h3>
                                                    <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>

                                    <div className="text-center mt-12">
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            className="rounded-full border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 font-bold px-8"
                                            onClick={() => exploreTheme("adventure")}
                                        >
                                            Explore Nature & Adventure Packages
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Serene Backwaters */}
                            <div ref={sectionRefs.backwaters} className="scroll-mt-24">
                                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                                    <div className="grid md:grid-cols-12 gap-8 md:gap-16 items-center">
                                        <div className="md:col-span-6 relative order-last md:order-first">
                                            <div className="relative h-[400px] md:h-[550px] w-full rounded-[2.5rem] overflow-hidden shadow-2xl group">
                                                <Image
                                                    src="https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=1200&auto=format&fit=crop"
                                                    alt="Houseboat gliding on water"
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                                                <div className="absolute bottom-6 left-6 text-white">
                                                    <p className="text-xs uppercase tracking-widest text-white/80 font-bold mb-1">Aquatic Solitude</p>
                                                    <h3 className="text-2xl font-black">Serene Alleppey</h3>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="md:col-span-6 space-y-6">
                                            <div className="flex items-center gap-2 text-sky-500 font-black uppercase tracking-widest text-sm">
                                                <Waves className="h-4 w-4" />
                                                <span>The Blue Lifeline</span>
                                            </div>
                                            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                                                Vembanad: A Labyrinth of Whispering Waters
                                            </h2>
                                            <p className="text-muted-foreground text-lg leading-relaxed">
                                                Perhaps Kerala&apos;s most iconic and unique offering is its 900-kilometer network of backwaters. This aquatic wonderland comprises five massive lakes linked by canals, fed by 38 rivers, and bordered by rows of swaying coconut palms.
                                            </p>
                                            <p className="text-muted-foreground text-lg leading-relaxed">
                                                At the center of this world is the <strong>Kettuvallam</strong>—a traditional houseboat. Originally built to transport rice, these majestic vessels are crafted from jackwood planks joined with coir rope and cashew nut oil—without utilizing a single nail. Today, they are floating boutique hotel suites gliding through villages where life has remained unchanged for generations.
                                            </p>
                                            <div className="pt-4">
                                                <Button
                                                    size="lg"
                                                    className="bg-sky-600 hover:bg-sky-700 text-white rounded-full shadow-lg font-bold group"
                                                    onClick={() => exploreTheme("backwaters")}
                                                >
                                                    Explore Houseboat Packages
                                                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 4: Attractions */}
                            <div ref={sectionRefs.attractions} className="scroll-mt-24">
                                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                                    <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                                        <Badge className="bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-400 border-0 px-4 py-1.5 text-xs tracking-wider uppercase font-bold rounded-full">
                                            📍 Landmark Destinations
                                        </Badge>
                                        <h2 className="text-3xl md:text-5xl font-black tracking-tight">
                                            From Dramatic Cliffs to Historic Ports
                                        </h2>
                                        <p className="text-muted-foreground text-lg">
                                            Every corner of Kerala tells a legendary tale. Here are the premier attractions that encapsulate the spirit of this legendary land.
                                        </p>
                                    </div>

                                    <div className="grid md:grid-cols-3 gap-8">
                                        {[
                                            {
                                                name: "Fort Kochi",
                                                detail: "A historic seaport where Portuguese churches, Dutch palaces, Jewish synagogues, and Chinese fishing nets stand as symbols of a rich cosmopolitan history.",
                                                img: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?q=80&w=800&auto=format&fit=crop"
                                            },
                                            {
                                                name: "Athirappilly Waterfalls",
                                                detail: "Famous as the &quot;Niagara of India,&quot; this spectacular 80-foot drop is surrounded by lush rain forests, home to rare hornbills and roaring wildlife.",
                                                img: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=800&auto=format&fit=crop"
                                            },
                                            {
                                                name: "Varkala Beach Cliffs",
                                                detail: "Stunning geological red clay cliffs that border the Arabian Sea, featuring natural mineral springs and spectacular golden sunset views.",
                                                img: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=800&auto=format&fit=crop"
                                            }
                                        ].map((place, index) => (
                                            <div key={index} className="group relative rounded-3xl overflow-hidden h-[400px] shadow-xl">
                                                <Image
                                                    src={place.img}
                                                    alt={place.name}
                                                    fill
                                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                                                <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                                                    <h3 className="text-2xl font-black">{place.name}</h3>
                                                    <p className="text-white/80 text-xs leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all duration-300">
                                                        {place.detail}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="text-center mt-12">
                                        <Button
                                            onClick={() => exploreTheme("all")}
                                            className="rounded-full font-bold px-8 shadow-md"
                                        >
                                            Explore Landmarks Package
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Section 6: Hill Stations */}
                            <div ref={sectionRefs.hillstations} className="scroll-mt-24">
                                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                                    <div className="grid md:grid-cols-12 gap-8 md:gap-16 items-center">
                                        <div className="md:col-span-6 relative order-last md:order-first">
                                            <div className="relative h-[400px] md:h-[550px] w-full rounded-[2.5rem] overflow-hidden shadow-2xl group">
                                                <Image
                                                    src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200&auto=format&fit=crop"
                                                    alt="Munnar Tea Fields Fog"
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                                                <div className="absolute bottom-6 left-6 text-white">
                                                    <p className="text-xs uppercase tracking-widest text-white/80 font-bold mb-1">Misty Valleys</p>
                                                    <h3 className="text-2xl font-black">Wayanad Treehouses</h3>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="md:col-span-6 space-y-6">
                                            <div className="flex items-center gap-2 text-emerald-500 font-black uppercase tracking-widest text-sm">
                                                <Mountain className="h-4 w-4" />
                                                <span>Misty Mountain Tops</span>
                                            </div>
                                            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                                                Above the Clouds: The Highlands of Munnar & Wayanad
                                            </h2>
                                            <p className="text-muted-foreground text-lg leading-relaxed">
                                                Rising high above the heat of the plains are the misty hills of the Western Ghats. In places like Munnar, the landscape is sculpted into emerald-green carpet tea estates, shrouded in heavy mist and cool mountain breezes.
                                            </p>
                                            <p className="text-muted-foreground text-lg leading-relaxed">
                                                Further north lies Wayanad, a rugged highland where cardamom, pepper, and coffee plantations merge with dense tropical forests. Stay in boutique treehouses suspended high in the canopy, listen to the wilderness waking up, and explore deep Neolithic caves holding ancient carvings.
                                            </p>
                                            <div className="pt-4">
                                                <Button
                                                    size="lg"
                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg font-bold group"
                                                    onClick={() => exploreTheme("hillstations")}
                                                >
                                                    Explore Hill Station Escapes
                                                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 7: Culture & Rich Art Forms — Divine Theyyam */}
                            <div
                                ref={sectionRefs.culture}
                                className="relative scroll-mt-24 overflow-hidden"
                            >
                                {/* Full-bleed background image */}
                                <div className="absolute inset-0">
                                    <Image
                                        src="https://images.unsplash.com/photo-1582236173004-9844f2fb9f6c?q=80&w=2400&auto=format&fit=crop"
                                        alt="Theyyam ritual fire performance"
                                        fill
                                        className="object-cover object-center scale-105"
                                    />
                                    {/* Deep dark base */}
                                    <div className="absolute inset-0 bg-black/70" />
                                    {/* Fire-toned gradient from bottom */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-orange-950/90 via-red-950/60 to-black/50" />
                                    {/* Radial fire glow from center-bottom */}
                                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_100%,rgba(251,146,60,0.35),transparent)]" />
                                    {/* Left vignette */}
                                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_0%_50%,rgba(0,0,0,0.6),transparent)]" />
                                </div>

                                {/* Animated fire particles */}
                                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                    {[...Array(12)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            className="absolute rounded-full"
                                            style={{
                                                left: `${8 + i * 8}%`,
                                                bottom: `${5 + (i % 4) * 8}%`,
                                                width: `${4 + (i % 3) * 4}px`,
                                                height: `${4 + (i % 3) * 4}px`,
                                                background: i % 3 === 0
                                                    ? 'rgba(251,146,60,0.8)'
                                                    : i % 3 === 1
                                                        ? 'rgba(239,68,68,0.7)'
                                                        : 'rgba(253,224,71,0.6)',
                                                filter: 'blur(2px)',
                                            }}
                                            animate={{
                                                y: [0, -(60 + i * 15), -(120 + i * 20)],
                                                x: [0, (i % 2 === 0 ? 10 : -10), (i % 2 === 0 ? -5 : 5)],
                                                opacity: [0.8, 0.5, 0],
                                                scale: [1, 0.8, 0.3],
                                            }}
                                            transition={{
                                                duration: 2 + (i % 4) * 0.5,
                                                repeat: Infinity,
                                                delay: i * 0.2,
                                                ease: 'easeOut',
                                            }}
                                        />
                                    ))}
                                </div>

                                {/* Ember glow orbs */}
                                <div className="absolute inset-0 pointer-events-none">
                                    <motion.div
                                        className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full"
                                        style={{ background: 'radial-gradient(circle, rgba(251,146,60,0.2) 0%, transparent 70%)' }}
                                        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                    />
                                    <motion.div
                                        className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full"
                                        style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.2) 0%, transparent 70%)' }}
                                        animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.6, 0.3] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                                    />
                                </div>

                                {/* Content */}
                                <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-20 md:py-28">
                                    <div className="grid md:grid-cols-12 gap-10 md:gap-16 items-center">

                                        {/* Left: Text content */}
                                        <div className="md:col-span-6 space-y-7">
                                            {/* Label */}
                                            <motion.div
                                                initial={{ opacity: 0, x: -20 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.6 }}
                                                className="flex items-center gap-3"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <motion.div
                                                        animate={{ scale: [1, 1.3, 1] }}
                                                        transition={{ duration: 1.5, repeat: Infinity }}
                                                    >
                                                        <Flame className="h-5 w-5 text-orange-400" />
                                                    </motion.div>
                                                    <motion.div
                                                        animate={{ scale: [1.3, 1, 1.3] }}
                                                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                                                    >
                                                        <Flame className="h-4 w-4 text-red-400" />
                                                    </motion.div>
                                                </div>
                                                <span className="text-orange-300 font-black uppercase tracking-[0.25em] text-xs">
                                                    Sacred Ritual Arts of Kerala
                                                </span>
                                            </motion.div>

                                            {/* Title */}
                                            <motion.h2
                                                initial={{ opacity: 0, y: 20 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.7, delay: 0.1 }}
                                                className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]"
                                            >
                                                <span className="text-white">Where Humans</span>
                                                <br />
                                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-400 to-amber-300 animate-gradient">
                                                    Become Gods
                                                </span>
                                            </motion.h2>

                                            {/* Divider with fire glow */}
                                            <motion.div
                                                initial={{ scaleX: 0 }}
                                                whileInView={{ scaleX: 1 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.8, delay: 0.2 }}
                                                className="origin-left h-px w-32 bg-gradient-to-r from-orange-500 via-red-500 to-transparent shadow-[0_0_12px_rgba(251,146,60,0.8)]"
                                            />

                                            {/* Description */}
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.7, delay: 0.3 }}
                                                className="space-y-4"
                                            >
                                                <p className="text-orange-100/90 text-base md:text-lg leading-relaxed">
                                                    Kerala&apos;s cultural heritage is ancient and theatrical. Most mesmerizing is <strong className="text-orange-300">Theyyam</strong>—a spectacular ritual dance drama of North Malabar. Featuring massive red headgears, intricate face paint, and roaring fire, the dancer transitions into a trance, embodying the ancient forest deity.
                                                </p>
                                                <p className="text-orange-100/80 text-base leading-relaxed">
                                                    Alongside Theyyam lies <strong className="text-amber-300">Kathakali</strong>, a highly stylized classical dance-drama utilizing elaborate facial makeup, complex hand mudras, and expressive eye movements to convey timeless epics of the Mahabharata.
                                                </p>
                                                <p className="text-orange-100/80 text-base leading-relaxed">
                                                    Underpinning this expression is <strong className="text-red-300">Kalaripayattu</strong>, considered the mother of all martial arts, and <strong className="text-amber-300">Ayurveda</strong>, the 5,000-year-old Vedic medical science of complete physical and spiritual rejuvenation.
                                                </p>
                                            </motion.div>

                                            {/* Art form pills */}
                                            <motion.div
                                                initial={{ opacity: 0, y: 16 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.6, delay: 0.4 }}
                                                className="flex flex-wrap gap-2"
                                            >
                                                {["Theyyam", "Kathakali", "Kalaripayattu", "Ayurveda", "Mohiniyattam"].map((art) => (
                                                    <span
                                                        key={art}
                                                        className="px-4 py-1.5 rounded-full text-xs font-bold bg-white/10 border border-orange-500/30 text-orange-200 backdrop-blur-sm hover:bg-orange-500/20 hover:border-orange-400/50 transition-all cursor-default"
                                                    >
                                                        {art}
                                                    </span>
                                                ))}
                                            </motion.div>

                                            {/* CTA */}
                                            <motion.div
                                                initial={{ opacity: 0, y: 16 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.6, delay: 0.5 }}
                                            >
                                                <Button
                                                    size="lg"
                                                    className="h-14 px-8 rounded-full font-bold text-base bg-gradient-to-r from-orange-500 via-red-500 to-amber-500 hover:from-orange-600 hover:via-red-600 hover:to-amber-600 text-white border-0 shadow-2xl shadow-orange-900/60 hover:shadow-orange-800/80 hover:scale-105 hover:-translate-y-0.5 transition-all duration-300 group"
                                                    onClick={() => exploreTheme("cultural")}
                                                >
                                                    <Flame className="h-5 w-5 mr-2 group-hover:animate-pulse" />
                                                    Explore Cultural & Wellness Packages
                                                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                                </Button>
                                            </motion.div>
                                        </div>

                                        {/* Right: Image card with fire frame */}
                                        <motion.div
                                            initial={{ opacity: 0, x: 30 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.8, delay: 0.2 }}
                                            className="md:col-span-6"
                                        >
                                            <div className="relative">
                                                {/* Outer fire glow ring */}
                                                <div className="absolute -inset-3 rounded-[2.5rem] bg-gradient-to-br from-orange-500/40 via-red-600/30 to-amber-500/20 blur-2xl animate-pulse" />

                                                {/* Card */}
                                                <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border border-orange-500/30 group">
                                                    <div className="relative h-[420px] md:h-[580px] w-full">
                                                        <Image
                                                            src="/images/theyyam-image.webp"
                                                            alt="Theyyam ritual fire performance"
                                                            fill
                                                            className="object-cover group-hover:scale-105 transition-transform duration-1000"
                                                        />
                                                        {/* Inner fire gradient overlay */}
                                                        <div className="absolute inset-0 bg-gradient-to-t from-orange-950/80 via-red-950/20 to-transparent" />
                                                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_40%_at_50%_100%,rgba(251,146,60,0.3),transparent)]" />

                                                        {/* Floating badge */}
                                                        <div className="absolute top-5 left-5">
                                                            <motion.div
                                                                animate={{ y: [0, -4, 0] }}
                                                                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                                                className="flex items-center gap-2 bg-black/50 backdrop-blur-xl border border-orange-500/40 rounded-full px-4 py-2"
                                                            >
                                                                <motion.div
                                                                    animate={{ scale: [1, 1.4, 1] }}
                                                                    transition={{ duration: 1, repeat: Infinity }}
                                                                    className="w-2 h-2 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,1)]"
                                                                />
                                                                <span className="text-orange-300 text-xs font-bold uppercase tracking-wider">Live Ritual</span>
                                                            </motion.div>
                                                        </div>

                                                        {/* Bottom info */}
                                                        <div className="absolute bottom-0 inset-x-0 p-6">
                                                            <div className="bg-black/40 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-5">
                                                                <div className="flex items-start justify-between gap-4">
                                                                    <div>
                                                                        <p className="text-orange-400 text-xs font-bold uppercase tracking-widest mb-1">North Malabar · Kerala</p>
                                                                        <h3 className="text-white text-2xl font-black leading-tight">The Theyyam<br />of Malabar</h3>
                                                                        <p className="text-orange-200/70 text-xs mt-2 leading-relaxed">Ancient ritual where humans invoke forest deities through fire & trance</p>
                                                                    </div>
                                                                    <div className="shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-900/50">
                                                                        <Flame className="w-6 h-6 text-white" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>

                                    </div>
                                </div>

                                {/* Bottom fire fade */}
                                <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-background to-transparent" />
                            </div>

                        </motion.div>
                    ) : (
                        /* Listing Mode: Packages Grid View */
                        <motion.div
                            key="listing-grid"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.5 }}
                            ref={packagesGridRef}
                            className="scroll-mt-24 min-h-[400px] w-full"
                        >


                            {/* Inner results block */}
                            <div className="container mx-auto px-4 py-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b">
                                    <div>
                                        <h2 className="text-3xl font-black tracking-tight flex items-center gap-2 text-primary">
                                            <span>Kerala Holiday Packages</span>
                                            {selectedTheme !== "all" && (
                                                <Badge variant="secondary" className="rounded-full capitalize text-xs px-3 py-1 font-bold">
                                                    {selectedTheme}
                                                </Badge>
                                            )}
                                        </h2>
                                        <p className="text-muted-foreground mt-1">
                                            {filteredPackages.length}{" "}
                                            {filteredPackages.length === 1 ? "premium experience" : "premium experiences"} matching your filters
                                        </p>
                                    </div>
                                    <div className="mt-4 md:mt-0 flex gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setSelectedTheme("all");
                                                setSearchQuery("");
                                            }}
                                            className="rounded-full text-xs font-bold"
                                        >
                                            Reset Filters
                                        </Button>
                                        <Button
                                            onClick={() => setViewMode("webpage")}
                                            className="rounded-full text-xs font-bold"
                                            variant="secondary"
                                        >
                                            📖 Read Experience Guide
                                        </Button>
                                    </div>
                                </div>

                                {filteredPackages.length === 0 ? (
                                    <Card className="p-16 text-center border-dashed rounded-3xl">
                                        <div className="p-4 bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Info className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-2">No Packages Found</h3>
                                        <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
                                            We couldn&apos;t find any matches. Clear your keywords or click reset to view all standard Kerala packages.
                                        </p>
                                        <Button
                                            onClick={() => {
                                                setSelectedTheme("all");
                                                setSearchQuery("");
                                            }}
                                            className="rounded-full font-bold px-6"
                                        >
                                            Reset All Filters
                                        </Button>
                                    </Card>
                                ) : (
                                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {filteredPackages.map((pkg) => (
                                            <PackageCard key={pkg.id} pkg={pkg} />
                                        ))}
                                    </div>
                                )}

                                {/* Custom CTA Section */}
                                <section className="bg-muted/30 dark:bg-muted/10 p-12 rounded-[2rem] border mt-20 text-center space-y-4 max-w-4xl mx-auto">
                                    <h3 className="text-2xl font-black">Tailor-Made Kerala Experiences</h3>
                                    <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed text-sm">
                                        Our travel specialists can customize houseboats, add traditional Ayurvedic therapists, and organize private Theyyam viewings for an unforgettable experience.
                                    </p>
                                    <Button size="lg" className="rounded-full font-bold shadow-lg" asChild>
                                        <Link href="/#contact">Design Your Custom Trip</Link>
                                    </Button>
                                </section>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Persistent Floating Navigation Button - Fades in on scroll */}
            {/* <div className="fixed bottom-8 right-8 z-50 transition-all duration-500 animate-in fade-in slide-in-from-bottom-5">
                <Button
                    onClick={() => {
                        setViewMode(viewMode === "webpage" ? "listing" : "webpage");
                        if (viewMode === "webpage") {
                            setTimeout(() => {
                                packagesGridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                            }, 150);
                        } else {
                            setTimeout(() => {
                                webpageContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                            }, 150);
                        }
                    }}
                    className="h-14 px-6 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.25)] border font-black bg-primary hover:bg-primary/95 text-white hover:scale-105 transition-all flex items-center gap-3"
                >
                    {viewMode === "webpage" ? (
                        <>
                            <Plane className="h-5 w-5" />
                            <span>View Packages</span>
                        </>
                    ) : (
                        <>
                            <BookOpen className="h-5 w-5" />
                            <span>Travel Guide</span>
                        </>
                    )}
                </Button>
            </div> */}
        </div>
    );
}
