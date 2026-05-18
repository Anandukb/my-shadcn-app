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
        // Smooth scroll to packages grid after a tiny delay to let transition start
        setTimeout(() => {
            packagesGridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
    };

    const exploreTheme = (themeId: string) => {
        setSelectedTheme(themeId);
        setViewMode("listing");
        setTimeout(() => {
            packagesGridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
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

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
            {/* Hero Section */}
            <section className="relative h-[70vh] min-h-[550px] w-full overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0">
                    <Image
                        src="https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=2400&auto=format&fit=crop"
                        alt="Kerala Backwaters Houseboat"
                        fill
                        className="object-cover scale-105 animate-[subtle-zoom_20s_ease-out_infinite]"
                        priority
                    />
                    <div className="absolute inset-0 bg-black/45" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/35" />
                </div>

                <div className="relative z-10 container mx-auto px-4 flex flex-col items-center justify-center h-full text-center mt-8">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <Badge
                            variant="outline"
                            className="mb-5 text-white border-white/35 bg-white/10 backdrop-blur-md px-5 py-2 text-xs md:text-sm font-semibold tracking-[0.25em] uppercase rounded-full shadow-lg"
                        >
                            ✨ God&apos;s Own Country
                        </Badge>
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.9, delay: 0.1 }}
                        className="text-4xl md:text-6xl lg:text-8xl font-black text-white tracking-tight mb-5 drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] max-w-5xl"
                    >
                        Kerala Tourism
                    </motion.h1>

                    <motion.p 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-base md:text-xl lg:text-2xl text-white/95 max-w-3xl font-light mb-10 drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)] leading-relaxed"
                    >
                        Journey through misty hills, pristine palm-fringed backwaters, vibrant ritual arts, and age-old Ayurvedic healing sanctuaries.
                    </motion.p>

                    {/* Filter & Search Panel */}
                    <div className="w-full max-w-6xl bg-black/40 dark:bg-black/60 backdrop-blur-2xl border border-white/20 dark:border-white/10 p-4 md:p-6 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.4)] space-y-4 mx-auto">
                        <div className="flex flex-col md:flex-row gap-4 items-center w-full">
                            {/* Search */}
                            <div className="w-full flex-1 relative group">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-white/80 group-focus-within:text-white transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search destinations, packages, houseboats..."
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    className="w-full h-14 pl-14 pr-6 bg-white/10 border border-white/15 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-white/30 text-lg rounded-2xl md:rounded-full transition-all"
                                />
                            </div>

                            {/* View Toggle */}
                            <div className="flex gap-2 shrink-0 w-full md:w-auto">
                                <Button
                                    onClick={() => setViewMode(viewMode === "webpage" ? "listing" : "webpage")}
                                    variant="ghost"
                                    className={`h-14 px-8 rounded-2xl md:rounded-full border font-bold transition-all duration-300 w-full md:w-auto shrink-0 shadow-sm ${
                                        viewMode === "listing"
                                            ? "bg-white text-black hover:bg-white/90 border-white"
                                            : "bg-black/40 text-white hover:bg-black/60 border-white/10"
                                    }`}
                                >
                                    {viewMode === "webpage" ? (
                                        <>
                                            <Plane className="h-5 w-5 mr-3 animate-pulse" />
                                            View Packages ({packages.length})
                                        </>
                                    ) : (
                                        <>
                                            <BookOpen className="h-5 w-5 mr-3" />
                                            Explore Travel Guide
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Row 2: custom Kerala Theme Filters */}
                        <div className="pt-2 border-t border-white/10 mt-4">
                            <div className="flex gap-2 overflow-x-auto py-1 px-0.5 no-scrollbar items-center justify-start xl:justify-center">
                                <span className="text-[10px] uppercase tracking-widest text-white/50 font-black mr-4 hidden md:block drop-shadow-md">Theme:</span>
                                {themes.map((theme) => {
                                    const isSelected = selectedTheme === theme.id && viewMode === "listing";
                                    const Icon = theme.icon;
                                    return (
                                        <Button
                                            key={theme.id}
                                            variant="ghost"
                                            onClick={() => handleThemeSelect(theme.id)}
                                            className={`h-11 px-5 rounded-full whitespace-nowrap transition-all duration-300 shadow-sm ${
                                                isSelected
                                                    ? "bg-primary text-white hover:bg-primary/95 shadow-lg font-bold scale-105 border border-primary/20"
                                                    : "bg-black/30 text-white hover:bg-black/55 border border-white/10 font-medium"
                                            }`}
                                            title={theme.description}
                                        >
                                            <Icon className="h-4 w-4 mr-2" />
                                            <span className="text-sm">{theme.label}</span>
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Sticky Storytelling Scroll Menu - Rendered only in Webpage View */}
            {viewMode === "webpage" && (
                <div className="sticky top-20 z-40 w-full bg-background/80 backdrop-blur-md border-y py-3 shadow-sm transition-all animate-in fade-in duration-300">
                    <div className="container mx-auto px-4 flex gap-2 md:gap-3 overflow-x-auto no-scrollbar justify-start md:justify-center">
                        {(Object.keys(sectionRefs) as Array<keyof typeof sectionRefs>).map((key) => {
                            const labels: Record<string, string> = {
                                intro: "Introduction",
                                nature: "Nature & Wilderness",
                                backwaters: "Serene Backwaters",
                                attractions: "Top Attractions",
                                temples: "Sacred Architecture",
                                hillstations: "Misty Hills",
                                culture: "Ritual Culture"
                            };
                            return (
                                <button
                                    key={key}
                                    onClick={() => scrollToSection(key)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 whitespace-nowrap ${
                                        activeSection === key
                                            ? "bg-primary text-white scale-105 shadow-md"
                                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                                    }`}
                                >
                                    {labels[key]}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Main Interactive Container with Crossfade Animations */}
            <main className="relative py-8">
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
                            className="space-y-24 md:space-y-36 pb-24"
                        >
                            {/* Section 1: Introduction */}
                            <div ref={sectionRefs.intro} className="container mx-auto px-4 scroll-mt-36">
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
   {/* Categories Section (Soft Green Background) */}
                            <div className="bg-[#F3F7F2] dark:bg-[#121a11] py-16 border-b border-emerald-500/10 w-full mb-12">
                                <div className="container mx-auto px-4 text-center space-y-6">
                                    <h2 className="text-4xl md:text-5xl font-black tracking-tight">
                                        Kerala Tour Packages
                                    </h2>
                                    <div className="w-16 h-1 bg-emerald-500 mx-auto rounded-full" />
                                    <p className="text-muted-foreground text-sm md:text-base max-w-4xl mx-auto leading-relaxed">
                                        Reconnect with your inner self in the enchanting beauty of Kerala, one of India&apos;s most captivating destinations. The natural freshness and vibrant cultural heritage will mesmerise travellers.
                                    </p>

                                    {/* 4 Interactive Category Cards */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-8 max-w-6xl mx-auto">
                                        {[
                                            {
                                                title: "Holiday",
                                                label: "Holiday Packages",
                                                target: "all",
                                                img: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=600&auto=format&fit=crop"
                                            },
                                            {
                                                title: "Honeymoon",
                                                label: "Honeymoon Packages",
                                                target: "honeymoon",
                                                img: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=600&auto=format&fit=crop"
                                            },
                                            {
                                                title: "Trip",
                                                label: "Trip Packages",
                                                target: "hillstations",
                                                img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=600&auto=format&fit=crop"
                                            },
                                            {
                                                title: "Luxury",
                                                label: "Luxury Packages",
                                                target: "cultural",
                                                img: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=600&auto=format&fit=crop"
                                            }
                                        ].map((card, idx) => (
                                            <div 
                                                key={idx} 
                                                onClick={() => exploreTheme(card.target)}
                                                className="group relative rounded-[2rem] overflow-hidden aspect-[4/3] w-full shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer"
                                            >
                                                {/* Card Image */}
                                                <Image
                                                    src={card.img}
                                                    alt={card.label}
                                                    fill
                                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                                {/* Gradual Overlay: static dimming, darkens on hover */}
                                                <div className="absolute inset-0 bg-black/35 group-hover:bg-black/60 transition-colors duration-300" />
                                                
                                                {/* Hover details (button + title) */}
                                                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    <h3 className="text-white text-lg font-black tracking-tight mb-3">
                                                        Kerala <span className="text-[#a3e635]">{card.title}</span> Packages
                                                    </h3>
                                                    <Button className="bg-[#84cc16] hover:bg-[#65a30d] text-black hover:text-black font-extrabold rounded-full px-6 h-10 text-xs shadow-md border-0 transition-transform scale-95 group-hover:scale-100 duration-300">
                                                        View Details
                                                    </Button>
                                                </div>

                                                {/* Static/Inactive bottom title - fades out on hover */}
                                                <div className="absolute inset-x-0 bottom-6 text-center text-white font-bold text-sm tracking-wide group-hover:opacity-0 transition-opacity duration-300 drop-shadow-md">
                                                    Kerala <span className="text-[#84cc16] font-black">{card.title}</span> Packages
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            {/* Section 2: Kerala Nature */}
                            <div 
                                ref={sectionRefs.nature} 
                                className="bg-emerald-950/5 dark:bg-emerald-950/20 py-20 scroll-mt-36"
                            >
                                <div className="container mx-auto px-4">
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
                            <div ref={sectionRefs.backwaters} className="container mx-auto px-4 scroll-mt-36">
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
                                            At the center of this world is the **Kettuvallam**—a traditional houseboat. Originally built to transport rice, these majestic vessels are crafted from jackwood planks joined with coir rope and cashew nut oil—without utilizing a single nail. Today, they are floating boutique hotel suites gliding through villages where life has remained unchanged for generations.
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

                            {/* Section 4: Attractions */}
                            <div ref={sectionRefs.attractions} className="container mx-auto px-4 scroll-mt-36">
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

                            {/* Section 5: Temples & Architectural Wonders */}
                            <div 
                                ref={sectionRefs.temples} 
                                className="bg-amber-950/90 text-amber-50 dark:bg-black/95 dark:text-amber-100 py-24 scroll-mt-36 relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(180,140,50,0.1)_0%,transparent_100%)]" />
                                <div className="container mx-auto px-4 relative z-10">
                                    <div className="grid md:grid-cols-12 gap-8 md:gap-16 items-center">
                                        <div className="md:col-span-6 space-y-6">
                                            <div className="flex items-center gap-2 text-amber-400 font-black uppercase tracking-widest text-sm">
                                                <Flame className="h-4 w-4 text-amber-400 animate-pulse" />
                                                <span>Sacred Sanctuary</span>
                                            </div>
                                            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                                                Spiritual Stone & Golden Spires
                                            </h2>
                                            <p className="text-amber-100/80 text-lg leading-relaxed">
                                                Unlike the monumental stone towers of neighboring states, Kerala temple architecture is defined by wood craftsmanship, elegant low-slung tiled roofs, and octagonal shapes following rigid **Vastu Shastra** principles. 
                                            </p>
                                            <p className="text-amber-100/80 text-lg leading-relaxed">
                                                At the apex of this spiritual heritage stands the legendary **Sree Padmanabhaswamy Temple** in Thiruvananthapuram. The temple is built in a fusion of Kerala and Dravidian style, holding infinite treasure in its mysterious vaults, guarded by stone deities. 
                                            </p>
                                            <p className="text-amber-100/80 text-lg leading-relaxed">
                                                The sacred chants at Guruvayur and the ancient wooden carvings in Vadakkunnathan tell stories of thousands of years of uninterrupted devotion.
                                            </p>
                                            <div className="pt-4">
                                                <Button 
                                                    onClick={() => exploreTheme("cultural")}
                                                    className="bg-amber-500 hover:bg-amber-600 text-black rounded-full font-bold px-8 py-6 text-base shadow-xl"
                                                >
                                                    Explore Spiritual & Heritage Tours
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="md:col-span-6">
                                            <div className="relative h-[350px] md:h-[500px] w-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-amber-500/20">
                                                <Image
                                                    src="https://images.unsplash.com/photo-1627894142165-446a57209b53?q=80&w=1200&auto=format&fit=crop"
                                                    alt="Traditional Kerala temple architecture"
                                                    fill
                                                    className="object-cover"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                                <div className="absolute bottom-6 left-6 text-white">
                                                    <h3 className="text-lg font-bold">Traditional Temple Gables</h3>
                                                    <p className="text-xs text-white/80">Carved wooden artistry & slate roofs</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 6: Hill Stations */}
                            <div ref={sectionRefs.hillstations} className="container mx-auto px-4 scroll-mt-36">
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

                            {/* Section 7: Culture & Rich Art Forms */}
                            <div 
                                ref={sectionRefs.culture} 
                                className="bg-red-950/10 dark:bg-red-950/20 py-24 scroll-mt-36 border-y border-red-500/10"
                            >
                                <div className="container mx-auto px-4">
                                    <div className="grid md:grid-cols-12 gap-8 md:gap-16 items-center">
                                        <div className="md:col-span-6 space-y-6">
                                            <div className="flex items-center gap-2 text-red-500 font-black uppercase tracking-widest text-sm">
                                                <Palette className="h-4 w-4 text-red-500 animate-pulse" />
                                                <span>Vibrant Rhythms & Ancient Arts</span>
                                            </div>
                                            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                                                Where Humans Become Gods: Theyyam & Kathakali
                                            </h2>
                                            <p className="text-muted-foreground text-lg leading-relaxed">
                                                Kerala&apos;s cultural heritage is ancient and theatrical. Most mesmerizing is **Theyyam**—a spectacular ritual dance drama of North Malabar. Featuring massive red headgears, intricate face paint, and roaring fire, the dancer transitions into a trance, embodying the ancient forest deity.
                                            </p>
                                            <p className="text-muted-foreground text-lg leading-relaxed">
                                                Alongside Theyyam lies **Kathakali**, a highly stylized classical dance-drama utilizing elaborate facial makeup, complex hand mudras, and expressive eye movements to convey timeless epics of the Mahabharata.
                                            </p>
                                            <p className="text-muted-foreground text-lg leading-relaxed">
                                                Underpinning this expression is **Kalaripayattu**, considered the mother of all martial arts, and **Ayurveda**, the 5,000-year-old Vedic medical science of complete physical and spiritual rejuvenation.
                                            </p>
                                            <div className="pt-4">
                                                <Button 
                                                    size="lg" 
                                                    className="bg-red-700 hover:bg-red-800 text-white rounded-full shadow-lg font-bold group"
                                                    onClick={() => exploreTheme("cultural")}
                                                >
                                                    Explore Cultural & Wellness Packages
                                                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="md:col-span-6">
                                            <div className="relative h-[400px] md:h-[600px] w-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-red-500/20 group">
                                                <Image
                                                    src="https://images.unsplash.com/photo-1582236173004-9844f2fb9f6c?q=80&w=1200&auto=format&fit=crop"
                                                    alt="Theyyam performance artist in heavy red makeup"
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                                                <div className="absolute bottom-6 left-6 right-6 text-white">
                                                    <Badge className="bg-red-600 text-white border-0 font-bold tracking-widest text-[10px] mb-2 uppercase">Ritual Possession</Badge>
                                                    <h3 className="text-3xl font-black">The Theyyam of Malabar</h3>
                                                    <p className="text-sm text-white/80 mt-1">Ancient ritual art drama where humans invoke forest deities.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
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
            <div className="fixed bottom-8 right-8 z-50 transition-all duration-500 animate-in fade-in slide-in-from-bottom-5">
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
            </div>
        </div>
    );
}
