"use client";

import React, { useRef } from "react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import Image from "next/image";
import {
    HeartPulse, CheckCircle2, Star, ArrowRight, Activity, Leaf, ShieldCheck,
    Stethoscope, Quote, Building2, MapPin, Award, Tag, HeartHandshake,
    PlusSquare, Sparkles, Plane, BookOpen, Waves, Mountain, Compass, Sprout, Info
} from "lucide-react";
import { PackageCard } from "@/components/packages/PackageCard";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import type { Package } from "@/types/package";

export function MedicalTourismClient({ packages }: { packages: Package[] }) {
    // Get the 3 specific Kerala medical packages

    // Refs for scrolling
    const packagesSectionRef = useRef<HTMLDivElement>(null);
    const introSectionRef = useRef<HTMLDivElement>(null);

    const scrollToPackages = () => {
        packagesSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const scrollToIntro = () => {
        introSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-teal-500/20">
            {/* Hero Section - Identical Style to Kerala Tourism with Serene Medical Motif */}
            <section className="relative h-[85vh] min-h-[650px] w-full overflow-hidden flex items-center justify-center">
                {/* Background image with slow zoom (Ken Burns) */}
                <div className="absolute inset-0">
                    <motion.div
                        initial={{ scale: 1 }}
                        animate={{ scale: 1.1 }}
                        transition={{ duration: 15, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
                        className="w-full h-full"
                    >
                        <Image
                            src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2400&auto=format&fit=crop"
                            alt="Kerala Serene Wellness Healing"
                            fill
                            className="object-cover"
                            priority
                            quality={90}
                        />
                    </motion.div>

                    {/* Premium Teal & Dark Multi-layer Gradient Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-950/85 via-teal-900/60 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,rgba(20,184,166,0.2),transparent_60%)]" />

                    {/* Animated Floating Elements */}
                    <div className="absolute inset-0 opacity-25">
                        <motion.div
                            animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
                            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-1/4 left-1/4 w-3.5 h-3.5 bg-teal-400 rounded-full blur-sm"
                        />
                        <motion.div
                            animate={{ y: [0, 20, 0], x: [0, -15, 0] }}
                            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute top-1/3 right-1/3 w-2.5 h-2.5 bg-emerald-300 rounded-full blur-sm"
                        />
                        <motion.div
                            animate={{ y: [0, -15, 0], x: [0, 20, 0] }}
                            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                            className="absolute bottom-1/3 left-1/2 w-3 h-3 bg-cyan-400 rounded-full blur-sm"
                        />
                    </div>
                </div>

                <div className="relative z-10 container mx-auto px-4 sm:px-6 flex flex-col items-center justify-center h-full text-center">
                    {/* Pulsating Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        className="flex items-center gap-2 mb-6"
                    >
                        <Sparkles className="w-5 h-5 text-teal-400 animate-pulse" />
                        <Badge
                            variant="outline"
                            className="text-white border-white/50 bg-white/15 backdrop-blur-xl px-6 py-2.5 text-sm font-bold tracking-[0.3em] uppercase rounded-full shadow-2xl hover:bg-white/25 transition-all"
                        >
                            World-Class Healthcare
                        </Badge>
                    </motion.div>

                    {/* Main Title with Premium Gradient */}
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tight mb-6 max-w-6xl leading-[1.1]"
                    >
                        <span className="inline-block text-white drop-shadow-2xl">Healing</span>{' '}
                        <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 animate-gradient drop-shadow-2xl">
                            Paradise
                        </span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/95 max-w-4xl font-light mb-12 drop-shadow-xl leading-relaxed px-4"
                    >
                        Experience globally accredited healthcare, highly advanced medical treatments, and natural Ayurvedic recovery amidst the serene, tranquil backwaters of Kerala.
                    </motion.p>

                    {/* CTAs matching Kerala style */}
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="flex flex-col sm:flex-row gap-4"
                    >
                        <Button
                            size="lg"
                            onClick={scrollToPackages}
                            className="h-14 px-8 text-base font-bold rounded-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white shadow-2xl hover:shadow-teal-500/50 transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer"
                        >
                            <Stethoscope className="w-5 h-5 mr-2" />
                            View Medical Packages
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            onClick={scrollToIntro}
                            className="h-14 px-8 text-base font-bold rounded-full border-2 border-white/60 text-white hover:bg-white hover:text-slate-900 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:-translate-y-1 shadow-lg cursor-pointer"
                        >
                            <Info className="w-5 h-5 mr-2" />
                            Why Kerala?
                        </Button>
                    </motion.div>

                    {/* Quick Stats matching Kerala style */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                        className="mt-12 flex flex-wrap justify-center gap-6 md:gap-8"
                    >
                        {[
                            { icon: Award, label: "JCI Accredited", count: "Global Standard" },
                            { icon: ShieldCheck, label: "NABH Partners", count: "Top Quality" },
                            { icon: HeartPulse, label: "Super Specialties", count: "Multi-Disciplinary" }
                        ].map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.9 + idx * 0.1 }}
                                className="flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-6 py-3 hover:bg-white/20 transition-all group cursor-default"
                            >
                                <stat.icon className="w-5 h-5 text-teal-400 group-hover:scale-110 transition-transform" />
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

            {/* Storytelling Content Wrapper */}
            <main className="relative py-6 space-y-16 md:space-y-24 pb-20">

                {/* Section 1: Introduction (Tapestry of Healing & Science) */}
                <div ref={introSectionRef} className="scroll-mt-28">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                        <div className="grid md:grid-cols-12 gap-8 md:gap-16 items-center">
                            <div className="md:col-span-6 space-y-6">
                                <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-black uppercase tracking-widest text-sm">
                                    <HeartPulse className="h-4 w-4 text-teal-500 animate-pulse" />
                                    <span>Advanced Healing & Rejuvenation</span>
                                </div>
                                <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                                    A Synthesis of Modern Science & Vedic Wisdom
                                </h2>
                                <p className="text-muted-foreground text-lg leading-relaxed">
                                    Kerala has emerged as a premier global hub for medical tourism, where patients from all over the world travel to seek world-class surgical procedures, complex super-specialty diagnostics, and deep, restorative wellness therapies.
                                </p>
                                <p className="text-muted-foreground text-lg leading-relaxed">
                                    Here, state-of-the-art hospitals certified by JCI and NABH operate side-by-side with tranquil, centuries-old Ayurvedic spas. Our specialized recovery itineraries allow patients to undergo their treatment and recover in a peaceful, tropical climate, framed by beautiful coconut palms and relaxing mineral beaches.
                                </p>
                                <div className="pt-4 flex gap-4">
                                    <Button
                                        size="lg"
                                        className="rounded-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white shadow-lg font-bold group border-0 cursor-pointer"
                                        onClick={scrollToPackages}
                                    >
                                        Explore Wellness Packages
                                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            </div>
                            <div className="md:col-span-6 relative">
                                <div className="relative h-[350px] md:h-[500px] w-full rounded-3xl overflow-hidden shadow-2xl group">
                                    <Image
                                        src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1200&auto=format&fit=crop"
                                        alt="Serene recovery yoga backwaters"
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                                    <div className="absolute bottom-6 left-6 text-white">
                                        <p className="text-xs uppercase tracking-widest text-teal-300 font-bold mb-1">Holistic Sanctuary</p>
                                        <h3 className="text-xl font-bold">Ayurvedic Rejuvenation</h3>
                                    </div>
                                </div>
                                <div className="absolute -bottom-6 -left-6 bg-white dark:bg-card p-6 rounded-2xl shadow-xl hidden md:block border max-w-xs animate-bounce-slow">
                                    <p className="text-sm font-black text-teal-600 mb-1">Why Kerala?</p>
                                    <p className="text-xs text-muted-foreground">Healthcare in Kerala costs 60-80% less than in Western nations, offering immediate booking with premium private suites.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2: Why Choose Section (Grid layout matching Kerala Nature grid) */}
                <div className="bg-teal-950/5 dark:bg-teal-950/20 py-16 md:py-20">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                            <Badge className="bg-teal-500/15 hover:bg-teal-500/25 text-teal-600 dark:text-teal-400 border-0 px-4 py-1.5 text-xs tracking-wider uppercase font-bold rounded-full">
                                🛡️ Complete Wellness Partnership
                            </Badge>
                            <h2 className="text-3xl md:text-5xl font-black tracking-tight">
                                End-to-End Care & Quality Assurance
                            </h2>
                            <p className="text-muted-foreground text-lg">
                                We bridge the gap between global patients and internationally accredited healthcare, looking after every step of your medical journey with compassion.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                {
                                    title: "Cost-Effective Care",
                                    desc: "Access premier surgical operations and treatments at 60-80% lower cost compared to Western nations.",
                                    icon: Tag,
                                    color: "text-teal-500 bg-teal-500/10"
                                },
                                {
                                    title: "24/7 Personal Concierge",
                                    desc: "Private medical coordinators manage visa assistance, airport transfers, stays, and dynamic translators.",
                                    icon: HeartHandshake,
                                    color: "text-emerald-500 bg-emerald-500/10"
                                },
                                {
                                    title: "JCI & NABH Accreditation",
                                    desc: "We exclusively partner with top-tier private super-specialty hospitals certified for international safety standards.",
                                    icon: CheckCircle2,
                                    color: "text-cyan-500 bg-cyan-500/10"
                                },
                                {
                                    title: "Renowned Medical Experts",
                                    desc: "Consult and operate with internationally trained surgeons, oncologists, and master Ayurvedic practitioners.",
                                    icon: PlusSquare,
                                    color: "text-sky-500 bg-sky-500/10"
                                }
                            ].map((item, idx) => (
                                <Card key={idx} className="group overflow-hidden rounded-3xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/50 dark:bg-card/50 backdrop-blur-sm hover:-translate-y-1">
                                    <CardContent className="p-8 space-y-4">
                                        <div className={`p-3 rounded-2xl w-fit ${item.color} group-hover:scale-110 transition-transform`}>
                                            <item.icon className="h-6 w-6" />
                                        </div>
                                        <h3 className="text-xl font-bold tracking-tight">{item.title}</h3>
                                        <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Section 3: Sacred Reintegration (Ayurveda & Therapy setup matching Theyyam visual styling) */}
                <div className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-950 to-emerald-950" />
                    
                    {/* Glow bubbles */}
                    <div className="absolute inset-0 pointer-events-none opacity-20">
                        <motion.div
                            className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full"
                            style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.3) 0%, transparent 70%)' }}
                            animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.6, 0.4] }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                        />
                    </div>

                    <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-20 md:py-28">
                        <div className="grid md:grid-cols-12 gap-10 md:gap-16 items-center">
                            
                            {/* Left Copy */}
                            <div className="md:col-span-6 space-y-7">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    className="flex items-center gap-2"
                                >
                                    <Leaf className="h-5 w-5 text-teal-400 animate-pulse" />
                                    <span className="text-teal-300 font-black uppercase tracking-[0.25em] text-xs">
                                        5,000 Years of Vedic Wisdom
                                    </span>
                                </motion.div>

                                <motion.h2
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white"
                                >
                                    Reclaiming Complete
                                    <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-300">
                                        Spiritual Balance
                                    </span>
                                </motion.h2>

                                <motion.div
                                    initial={{ scaleX: 0 }}
                                    whileInView={{ scaleX: 1 }}
                                    viewport={{ once: true }}
                                    className="origin-left h-px w-32 bg-gradient-to-r from-teal-400 to-transparent shadow-[0_0_12px_rgba(20,184,166,0.8)]"
                                />

                                <div className="space-y-4 text-teal-100/90 leading-relaxed text-base">
                                    <p>
                                        Modern medicine treats the symptom; traditional <strong className="text-teal-300">Ayurveda</strong> rejuvenates the host. Known as the &quot;Science of Longevity,&quot; Ayurveda is practiced in its purest, most traditional form in Kerala, utilizing local forest herbs, specialized steam baths, and hot medicated oil infusions.
                                    </p>
                                    <p>
                                        Undergoing major surgery or oncology therapies in modern hospitals can create deep physical stress. By integrating your recovery with restorative Ayurvedic treatments (Panchakarma) and calm morning Yoga, we ensure your healing journey completes both physically and spiritually.
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2 pt-2">
                                    {["Panchakarma", "Detoxification", "Medicated Oils", "Vedic Yoga", "Naturopathy"].map((tag) => (
                                        <span
                                            key={tag}
                                            className="px-4 py-1.5 rounded-full text-xs font-bold bg-white/10 border border-teal-500/30 text-teal-200 backdrop-blur-sm hover:bg-teal-500/20 hover:border-teal-400/50 transition-all cursor-default"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Right Image with Emerald ring border glow */}
                            <div className="md:col-span-6">
                                <div className="relative">
                                    <div className="absolute -inset-3 rounded-[2.5rem] bg-gradient-to-br from-teal-500/40 via-emerald-600/30 to-cyan-500/20 blur-2xl animate-pulse" />
                                    
                                    <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border border-teal-500/30 group">
                                        <div className="relative h-[420px] md:h-[580px] w-full">
                                            <Image
                                                src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200&auto=format&fit=crop"
                                                alt="Traditional Ayurvedic massage therapy"
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-1000"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-teal-950/80 via-emerald-950/20 to-transparent" />
                                            
                                            {/* Floating badge */}
                                            <div className="absolute top-5 left-5">
                                                <div className="flex items-center gap-2 bg-black/50 backdrop-blur-xl border border-teal-500/40 rounded-full px-4 py-2">
                                                    <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping shadow-[0_0_8px_rgba(20,184,166,1)]" />
                                                    <span className="text-teal-300 text-xs font-bold uppercase tracking-wider">Holistic Living</span>
                                                </div>
                                            </div>

                                            {/* Info overlay card */}
                                            <div className="absolute bottom-0 inset-x-0 p-6">
                                                <div className="bg-black/50 backdrop-blur-xl border border-teal-500/20 rounded-2xl p-5">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div>
                                                            <p className="text-teal-400 text-xs font-bold uppercase tracking-widest mb-1">Traditional Panchakarma</p>
                                                            <h3 className="text-white text-2xl font-black leading-tight">Authentic Therapy</h3>
                                                            <p className="text-teal-200/70 text-xs mt-2 leading-relaxed">Personalized wellness programs directed by expert Ayurvedic doctors.</p>
                                                        </div>
                                                        <div className="shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg">
                                                            <Leaf className="w-6 h-6 text-white" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Section 4: Curated Packages Section */}
                <div ref={packagesSectionRef} className="py-12 md:py-16 scroll-mt-28">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                        
                        {/* Header */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12"
                        >
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-8 h-1 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500" />
                                    <span className="text-teal-600 dark:text-teal-400 text-sm font-bold uppercase tracking-widest">Medical Packages</span>
                                </div>
                                <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                                    Curated <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">Healing Packages</span>
                                </h2>
                            </div>
                        </motion.div>

                        {/* Equalized package grid */}
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {packages.map((pkg, idx) => (
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
                    </div>
                </div>

                {/* Section 5: Step Journey (Luxury styled Stepper) */}
                <div className="py-16 md:py-20 bg-slate-50/50 dark:bg-slate-900/10 border-y">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
                        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                            <Badge className="bg-teal-500/15 text-teal-600 border-0 px-4 py-1.5 text-xs tracking-wider uppercase font-bold rounded-full">
                                🗺️ Step By Step Support
                            </Badge>
                            <h2 className="text-3xl md:text-5xl font-black tracking-tight">
                                Your Healing Journey Made Simple
                            </h2>
                            <p className="text-muted-foreground text-lg">
                                We coordinate everything so you can concentrate entirely on what is important—your recover.
                            </p>
                        </div>

                        <div className="relative space-y-12 pb-4">
                            {/* Connecting Line */}
                            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-teal-200 via-teal-500 to-teal-200 -translate-x-1/2 z-0 opacity-70"></div>

                            {[
                                { title: "Online Consult", desc: "Share your health records securely. Connect with our expert medical team online to draft your recovery strategy.", icon: "01" },
                                { title: "Travel & Stay Setup", desc: "We handle your medical visa documentation, airport private transport, super-suite stay, and recovery check-ins.", icon: "02" },
                                { title: "Hospital Admission", desc: "Undergo diagnostic tests and procedures at our JCI accredited super-specialty partner clinics.", icon: "03" },
                                { title: "Restorative Wellness", desc: "Transition into post-procedural healing with calming spa, herbal treatments, and specialized Ayurvedic therapies.", icon: "04" },
                                { title: "Complete Aftercare", desc: "Receive digital follow-ups, prescriptions, and continued doctor reviews even after returning home safely.", icon: "05" }
                            ].map((step, i) => (
                                <div key={i} className={`relative flex items-center ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                                    <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-base shadow-lg border-4 border-background z-10">
                                        {step.icon}
                                    </div>
                                    <div className={`ml-16 md:ml-0 w-full md:w-1/2 ${i % 2 === 0 ? 'md:pl-16' : 'md:pr-16 text-left md:text-right'}`}>
                                        <Card className="border-0 shadow-md hover:shadow-xl transition-shadow bg-white dark:bg-card/50 rounded-2xl">
                                            <CardContent className="p-6 space-y-2">
                                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{step.title}</h3>
                                                <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Section 6: Partners Carousel */}
                <div className="py-16 md:py-20">
                    <div className="container mx-auto px-4 max-w-6xl">
                        <div className="text-center mb-16 space-y-3">
                            <div className="inline-flex items-center gap-2 text-teal-600 font-semibold tracking-wider uppercase text-sm">
                                <Building2 className="w-5 h-5" />
                                <span>Accredited Hospitals</span>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black tracking-tight">Partnered Medical Centers</h2>
                        </div>

                        <Carousel opts={{ align: "start", loop: true }} className="w-full">
                            <CarouselContent className="-ml-4">
                                {[
                                    { name: "Apollo Hospitals", loc: "Kochi, Kerala", img: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=800&auto=format&fit=crop" },
                                    { name: "Aster Medcity", loc: "Kochi, Kerala", img: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800&auto=format&fit=crop" },
                                    { name: "Amrita Hospital", loc: "Kochi, Kerala", img: "https://images.unsplash.com/photo-1538108149393-cebb47ac0925?q=80&w=800&auto=format&fit=crop" },
                                    { name: "KIMSHealth", loc: "Trivandrum, Kerala", img: "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=800&auto=format&fit=crop" },
                                    { name: "Rajagiri Hospital", loc: "Kochi, Kerala", img: "https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?q=80&w=800&auto=format&fit=crop" }
                                ].map((hospital, index) => (
                                    <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                                        <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group relative rounded-3xl">
                                            <div className="h-64 overflow-hidden relative">
                                                <Image
                                                    src={hospital.img}
                                                    alt={hospital.name}
                                                    fill
                                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/20 to-transparent"></div>
                                                <div className="absolute bottom-6 left-6 right-6">
                                                    <h3 className="text-white font-bold text-xl mb-1">{hospital.name}</h3>
                                                    <p className="text-teal-200 text-sm flex items-center gap-1.5 font-medium">
                                                        <MapPin className="w-4 h-4" />
                                                        {hospital.loc}
                                                    </p>
                                                </div>
                                            </div>
                                        </Card>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious className="-left-12 bg-background border text-foreground w-12 h-12 rounded-full shadow-md" />
                            <CarouselNext className="-right-12 bg-background border text-foreground w-12 h-12 rounded-full shadow-md" />
                        </Carousel>
                    </div>
                </div>

                {/* Section 7: Testimonials (Quotes grid) */}
                <div className="relative overflow-hidden py-20 bg-gradient-to-br from-teal-950 to-emerald-950 text-white rounded-[3rem] container mx-auto max-w-7xl">
                    <div className="absolute inset-0 pointer-events-none opacity-20">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-800 rounded-full blur-3xl" />
                    </div>

                    <div className="relative z-10 px-4 md:px-8">
                        <div className="text-center mb-16 space-y-3">
                            <h2 className="text-3xl md:text-5xl font-black tracking-tight">Patient Success Stories</h2>
                            <p className="text-teal-200 text-lg">Real recovery diaries from our international medical family.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                { name: "Sarah Jenkins", loc: "United Kingdom", text: "The Ayurvedic wellness retreat completely transformed my health. The medical team was incredibly caring and the tranquil rivers were perfect for recovering after surgery." },
                                { name: "Michael Chang", loc: "Singapore", text: "I underwent a complete laparoscopic procedure at the super-specialty hospital and recovered in a private spa room. Outstanding surgical precision and concierge care." },
                                { name: "Emma Robertson", loc: "Australia", text: "Maram organized all my visa and hospital paperwork. The combination of advanced clinical diagnostics and traditional Panchakarma oil massages was life-changing." }
                            ].map((review, i) => (
                                <Card key={i} className="bg-white/10 border border-white/10 backdrop-blur-md text-white rounded-3xl">
                                    <CardContent className="p-8 flex flex-col justify-between h-full space-y-6">
                                        <Quote className="w-10 h-10 text-teal-400 opacity-50 shrink-0" />
                                        <p className="text-base leading-relaxed font-light italic flex-grow">`"{review.text}"`</p>
                                        <div className="flex items-center gap-4 pt-4 border-t border-white/10 shrink-0">
                                            <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-full flex items-center justify-center font-bold text-lg text-slate-950">
                                                {review.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white leading-none">{review.name}</h4>
                                                <p className="text-teal-300 text-xs mt-1 leading-none">{review.loc}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Section 8: Call To Action Footer */}
                <section className="relative py-24 overflow-hidden rounded-[2.5rem] container mx-auto max-w-7xl">
                    <div className="absolute inset-0">
                        <Image
                            src="https://images.unsplash.com/photo-1498307833015-e7b400441eb8?q=80&w=2000&auto=format&fit=crop"
                            alt="Kerala serene backwater sunset recovery"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-teal-950/85 mix-blend-multiply"></div>
                    </div>
                    <div className="relative z-10 text-center max-w-3xl mx-auto px-4 space-y-8">
                        <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
                            Take Your First Step
                            <br />
                            Towards Recovery
                        </h2>
                        <p className="text-teal-200 text-lg leading-relaxed">
                            Request a secure medical file evaluation with our clinical experts and let us draft your custom healing and wellness journey in Kerala.
                        </p>
                        <Button
                            size="lg"
                            className="bg-white text-teal-950 hover:bg-slate-100 rounded-full px-10 py-6 text-lg font-bold border-0 shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer"
                        >
                            Schedule Free Consultation
                        </Button>
                    </div>
                </section>

            </main>
        </div>
    );
}
