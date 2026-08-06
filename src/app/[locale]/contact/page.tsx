"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Phone, Mail, MapPin, Clock, Send, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { extractErrorMessage } from "@/lib/extract-error-message";
import { marketingImageUrl } from "@/lib/marketing-images";

export default function ContactPage() {
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        service: "holiday",
        message: ""
    });

    const submitMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/enquiries", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "contact",
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    message: formData.message,
                    details: { service: formData.service },
                }),
            });
            if (!res.ok) throw new Error(await extractErrorMessage(res, "Failed to submit enquiry"));
            return res.json();
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);
        try {
            await submitMutation.mutateAsync();
            setFormSubmitted(true);
            setFormData({ name: "", email: "", phone: "", service: "holiday", message: "" });
        } catch (error) {
            console.error(error);
            setSubmitError(error instanceof Error ? error.message : "Something went wrong. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-emerald-500/20">
            {/* Hero Section */}
            <section className="relative h-[50vh] min-h-[400px] w-full overflow-hidden flex items-center justify-center">
                {/* Background image with slow zoom */}
                <div className="absolute inset-0">
                    <motion.div
                        initial={{ scale: 1 }}
                        animate={{ scale: 1.08 }}
                        transition={{ duration: 20, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
                        className="w-full h-full"
                    >
                        <Image
                            src={marketingImageUrl("1476514525535-07fb3b4ae5f1")}
                            alt="Maram Holidays Contact Us"
                            fill
                            sizes="100vw"
                            className="object-cover"
                            priority
                            quality={90}
                        />
                    </motion.div>

                    {/* Gradient Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/80 via-teal-900/60 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-black/20 to-black/30" />
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
                            Get In Touch
                        </Badge>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.15 }}
                        className="text-5xl md:text-7xl font-black text-white tracking-tight mb-6 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
                    >
                        Contact <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">Our Team</span>
                    </motion.h1>
                </div>
            </section>

            {/* Contact Panel Grid */}
            <main className="relative py-16 pb-24">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                    <div className="grid lg:grid-cols-12 gap-12 items-stretch">
                        
                        {/* Column 1: Info Card */}
                        <div className="lg:col-span-5 space-y-8 flex flex-col justify-between">
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest text-sm">
                                    <Phone className="h-4 w-4 text-emerald-500 animate-bounce-slow" />
                                    <span>Direct Connections</span>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
                                    We are Here to Sculpt Your Journey
                                </h2>
                                <p className="text-muted-foreground text-base leading-relaxed">
                                    Have a dynamic itinerary design in mind? Or need clarification regarding Ayurvedic consultation bookings or medical visa transfers? Send us a message and our specialists will connect with you within 24 hours.
                                </p>
                            </div>

                            {/* Contact Details Stack */}
                            <div className="space-y-4">
                                {[
                                    { icon: Phone, label: "Call Us 24/7", val: "+974 5555 5555", sub: "Toll-free customer care" },
                                    { icon: Mail, label: "Email Reservations", val: "hello@maramholidays.com", sub: "Evaluated daily by reservation experts" },
                                    { icon: MapPin, label: "Headquarters Office", val: "Maram Building, West Bay, Doha, Qatar", sub: "Walk-ins open Sunday to Thursday" },
                                    { icon: Clock, label: "Opening Hours", val: "9:00 AM - 6:00 PM (GMT+3)", sub: "Online support open 24x7" }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-border/10">
                                        <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
                                            <item.icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{item.label}</p>
                                            <p className="text-base font-bold text-foreground mt-0.5">{item.val}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">{item.sub}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Column 2: Premium Glassmorphic Form Card */}
                        <div className="lg:col-span-7">
                            <Card className="border border-white/10 dark:border-white/5 bg-white/5 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl p-6 md:p-10 h-full relative overflow-hidden">
                                <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
                                
                                <CardContent className="p-0 space-y-8 relative z-10">
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-black text-foreground">Submit An Enquiry</h3>
                                        <p className="text-muted-foreground text-sm">Please fill out the details below and we will contact you immediately.</p>
                                    </div>

                                    {formSubmitted ? (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="p-10 text-center bg-emerald-500/10 border border-emerald-500/30 rounded-3xl space-y-4"
                                        >
                                            <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center mx-auto text-white shadow-lg">
                                                <CheckCircle2 className="h-8 w-8" />
                                            </div>
                                            <h4 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">Enquiry Received!</h4>
                                            <p className="text-muted-foreground text-sm max-w-md mx-auto">
                                                Thank you for contacting Maram Holidays. One of our destination planners or medical coordinators is reviewing your details and will call you shortly.
                                            </p>
                                            <Button
                                                onClick={() => setFormSubmitted(false)}
                                                className="rounded-full px-6 font-bold cursor-pointer"
                                            >
                                                Submit Another Enquiry
                                            </Button>
                                        </motion.div>
                                    ) : (
                                        <form onSubmit={handleSubmit} className="space-y-5">
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-black text-foreground uppercase tracking-widest">Full Name</label>
                                                    <Input
                                                        type="text"
                                                        required
                                                        placeholder="Sarah Jenkins"
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                        className="h-12 bg-white/5 border border-white/10 text-white rounded-xl focus:border-emerald-500/50"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-black text-foreground uppercase tracking-widest">Phone Number</label>
                                                    <Input
                                                        type="tel"
                                                        required
                                                        placeholder="+974 5555 5555"
                                                        value={formData.phone}
                                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                        className="h-12 bg-white/5 border border-white/10 text-white rounded-xl focus:border-emerald-500/50"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-xs font-black text-foreground uppercase tracking-widest">Email Address</label>
                                                <Input
                                                    type="email"
                                                    required
                                                    placeholder="sarah@example.com"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    className="h-12 bg-white/5 border border-white/10 text-white rounded-xl focus:border-emerald-500/50"
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-xs font-black text-foreground uppercase tracking-widest">Selected Service</label>
                                                <select
                                                    value={formData.service}
                                                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                                                    className="w-full h-12 px-4 bg-slate-900 border border-white/10 text-white rounded-xl focus:border-emerald-500/50 outline-none select-none"
                                                >
                                                    <option value="holiday">Holiday Package Booking</option>
                                                    <option value="fixed-departure">Fixed Departures Group Tour</option>
                                                    <option value="visa">Visa Assist Service</option>
                                                    <option value="medical">Kerala Medical Tourism</option>
                                                    <option value="custom">Custom Experience Design</option>
                                                </select>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-xs font-black text-foreground uppercase tracking-widest">Your Message</label>
                                                <Textarea
                                                    required
                                                    rows={4}
                                                    placeholder="Please specify any dynamic dates, passenger details, or medical recovery needs..."
                                                    value={formData.message}
                                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                    className="bg-white/5 border border-white/10 text-white rounded-xl focus:border-emerald-500/50"
                                                />
                                            </div>

                                            {submitError && (
                                                <div className="px-4 py-3 rounded-xl border border-red-400/40 bg-red-500/10 text-red-200 text-xs font-medium">
                                                    {submitError}
                                                </div>
                                            )}

                                            <Button
                                                type="submit"
                                                disabled={submitMutation.isPending}
                                                className="w-full h-14 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-full font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-95 transition-all duration-300 border-0 flex items-center justify-center gap-2 cursor-pointer"
                                            >
                                                {submitMutation.isPending ? (
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <>
                                                        <Send className="h-4 w-4" />
                                                        <span>Send Enquiry Message</span>
                                                    </>
                                                )}
                                            </Button>
                                        </form>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
