"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, ArrowRight, Compass, ShieldCheck, Heart, Award, Users, Globe, Landmark } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { marketingImageUrl } from "@/lib/marketing-images";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-emerald-500/20">
            {/* Hero Section */}
            <section className="relative h-[65vh] min-h-[500px] w-full overflow-hidden flex items-center justify-center">
                {/* Background image with slow zoom (Ken Burns) */}
                <div className="absolute inset-0">
                    <motion.div
                        initial={{ scale: 1 }}
                        animate={{ scale: 1.08 }}
                        transition={{ duration: 20, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
                        className="w-full h-full"
                    >
                        <Image
                            src={marketingImageUrl("1501785888041-af3ef285b470")}
                            alt="Maram Holidays Premium Landscapes"
                            fill
                            className="object-cover"
                            priority
                            quality={90}
                        />
                    </motion.div>

                    {/* Gradient Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/80 via-teal-900/60 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-black/30 to-black/40" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(16,185,129,0.1),transparent_60%)]" />
                </div>

                {/* Floating Glow Orbs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
                    <motion.div
                        animate={{ y: [0, -20, 0], x: [0, 15, 0] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-1/4 left-10 w-64 h-64 rounded-full bg-emerald-500/10 blur-[80px]"
                    />
                    <motion.div
                        animate={{ y: [0, 30, 0], x: [0, -15, 0] }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute bottom-1/4 right-10 w-80 h-80 rounded-full bg-teal-500/10 blur-[90px]"
                    />
                </div>

                <div className="relative z-10 container mx-auto px-4 text-center max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className="flex items-center justify-center gap-2 mb-6"
                    >
                        <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
                        <Badge
                            variant="outline"
                            className="text-white border-white/30 bg-white/10 backdrop-blur-md px-5 py-2 text-xs md:text-sm font-bold tracking-[0.25em] uppercase rounded-full shadow-2xl"
                        >
                            Our Journey & Purpose
                        </Badge>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.15 }}
                        className="text-5xl md:text-7xl font-black text-white tracking-tight mb-6 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
                    >
                        About <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">Maram Holidays</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-200/90 font-light mb-12 drop-shadow-md leading-relaxed"
                    >
                        We design exceptionally high-end, immersive travel and medical recovery experiences across the world’s most serene and sacred destinations.
                    </motion.p>
                </div>
            </section>

            {/* Core Narrative */}
            <main className="relative py-16 space-y-20 md:space-y-28 pb-24">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                    <div className="grid md:grid-cols-12 gap-8 md:gap-16 items-center">
                        <div className="md:col-span-6 space-y-6">
                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest text-sm">
                                <Compass className="h-4 w-4 text-emerald-500" />
                                <span>Designing Memories</span>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                                Our Mission: Premium Experiences & Personal Touch
                            </h2>
                            <p className="text-muted-foreground text-lg leading-relaxed">
                                At Maram Holidays, we believe that travel should be more than just visiting a place—it should be a gateway to physical rejuvenation, personal enlightenment, and unforgettable connections. 
                            </p>
                            <p className="text-muted-foreground text-lg leading-relaxed">
                                Initially launched to connect worldwide tourists to the misty peaks, lush backwaters, and deep traditional Ayurveda of Kerala, we have grown into a multi-disciplinary travel provider. Today, we specialize in high-end global holiday packages, fully managed group tours, streamlined global visa assist services, and accredited medical tourism.
                            </p>
                            <div className="pt-4 flex gap-4">
                                <Button
                                    size="lg"
                                    className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg font-bold group border-0 cursor-pointer"
                                    asChild
                                >
                                    <Link href="/contact">
                                        Plan A Custom Trip
                                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                        <div className="md:col-span-6 relative">
                            <div className="relative h-[350px] md:h-[500px] w-full rounded-3xl overflow-hidden shadow-2xl group">
                                <Image
                                    src={marketingImageUrl("1539635278303-d4002c07eae3")}
                                    alt="Global group travels"
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                                <div className="absolute bottom-6 left-6 text-white">
                                    <p className="text-xs uppercase tracking-widest text-emerald-300 font-bold mb-1">Global Exploration</p>
                                    <h3 className="text-xl font-bold">Connecting Global Hearts</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Core Pillars Section */}
                <div className="bg-emerald-950/5 dark:bg-emerald-950/20 py-16 md:py-20 border-y border-border/5">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                            <Badge className="bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 border-0 px-4 py-1.5 text-xs tracking-wider uppercase font-bold rounded-full">
                                🌟 The Maram Standard
                            </Badge>
                            <h2 className="text-3xl md:text-5xl font-black tracking-tight">
                                Our Four Core Pillars
                            </h2>
                            <p className="text-muted-foreground text-lg">
                                We design each itinerary based on these foundations of luxury, reliability, and security.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                {
                                    title: "Hyper-Personalized",
                                    desc: "Custom layouts tailored to your exact budget, schedule, dietary preferences, and travel speed.",
                                    icon: Heart,
                                    color: "text-emerald-500 bg-emerald-500/10"
                                },
                                {
                                    title: "Uncompromising Quality",
                                    desc: "From 5-star private resorts to top JCI super-specialty hospitals, we only partner with the best.",
                                    icon: ShieldCheck,
                                    color: "text-teal-500 bg-teal-500/10"
                                },
                                {
                                    title: "Guaranteed Security",
                                    desc: "24/7 dedicated local concierges look after you in case of any schedules, flight, or travel shifts.",
                                    icon: Award,
                                    color: "text-cyan-500 bg-cyan-500/10"
                                },
                                {
                                    title: "Accredited Partners",
                                    desc: "Globally recognized visas, certified group tours, and NABH-level medical partners.",
                                    icon: Globe,
                                    color: "text-sky-500 bg-sky-500/10"
                                }
                            ].map((pillar, idx) => (
                                <Card key={idx} className="group overflow-hidden rounded-3xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/50 dark:bg-card/50 backdrop-blur-sm hover:-translate-y-1">
                                    <CardContent className="p-8 space-y-4">
                                        <div className={`p-3 rounded-2xl w-fit ${pillar.color} group-hover:scale-110 transition-transform`}>
                                            <pillar.icon className="h-6 w-6" />
                                        </div>
                                        <h3 className="text-xl font-bold tracking-tight">{pillar.title}</h3>
                                        <p className="text-muted-foreground text-sm leading-relaxed">{pillar.desc}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Scale & Figures Section */}
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-[2.5rem] p-12 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 pointer-events-none opacity-10">
                            <div className="absolute -top-12 -left-12 w-64 h-64 rounded-full bg-white blur-3xl animate-pulse" />
                        </div>
                        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/20">
                            {[
                                { number: "10,000+", label: "Happy Travelers" },
                                { number: "50+", label: "Global Destinations" },
                                { number: "100%", label: "Satisfaction Rate" },
                                { number: "4.9 ★", label: "Average Reviews" }
                            ].map((stat, idx) => (
                                <div key={idx} className={`pt-6 md:pt-0 ${idx > 0 ? "pt-6 md:pt-0" : ""}`}>
                                    <p className="text-4xl md:text-5xl font-black mb-2">{stat.number}</p>
                                    <p className="text-emerald-100 text-sm font-semibold tracking-wider uppercase leading-none">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
