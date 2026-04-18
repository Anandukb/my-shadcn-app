"use client";

import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { CreditCard, ShieldCheck, Zap, ArrowRight, Wallet, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion";

export function PaymentBanner() {
    const t = useTranslations();

    const paymentMethods = [
        { name: "Visa", icon: "/icons/visa.svg" },
        { name: "Mastercard", icon: "/icons/mastercard.svg" },
        { name: "American Express", icon: "/icons/amex.svg" },
        { name: "Apple Pay", icon: "/icons/apple-pay.svg" },
        { name: "Google Pay", icon: "/icons/google-pay.svg" },
    ];

    const features = [
        {
            icon: CreditCard,
            title: "Secure Payment Gateways",
            description: "Multiple global gateways for safe transactions.",
        },
        {
            icon: Banknote,
            title: "Flexible EMI Options",
            description: "Travel now, pay later with easy monthly installments.",
        },
    ];

    const handleRazorpayRedirect = () => {
        // Placeholder Razorpay URL - Replace with actual link from user if available
        window.location.href = "https://razorpay.me/@travelco";
    };

    return (
        <section className="container mx-auto px-4 py-10 lg:py-16">
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white shadow-2xl">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]" />

                <div className="relative z-10 px-6 py-8 md:p-10 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
                    <div className="flex-1 space-y-8">
                        <div>
                            <FadeIn>
                                <Badge variant="outline" className="mb-4 border-white/20 bg-white/5 text-indigo-300 backdrop-blur-sm px-4 py-1">
                                    Flexible Payments
                                </Badge>
                                <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight mb-6">
                                    Secure Payments & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Easy EMI</span> Options
                                </h2>
                                <p className="text-slate-300 text-lg md:text-xl max-w-2xl leading-relaxed">
                                    We offer a wide range of payment methods to make your booking experience seamless. Choose your preferred gateway or opt for flexible EMI plans.
                                </p>
                            </FadeIn>
                        </div>

                        <StaggerContainer className="grid sm:grid-cols-2 gap-6">
                            {features.map((feature, i) => (
                                <StaggerItem key={i}>
                                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
                                        <div className="mt-1 h-10 w-10 flex items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300 shrink-0">
                                            <feature.icon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg mb-1">{feature.title}</h4>
                                            <p className="text-sm text-slate-400 leading-snug">{feature.description}</p>
                                        </div>
                                    </div>
                                </StaggerItem>
                            ))}
                        </StaggerContainer>

                        <FadeIn delay={0.4} className="flex flex-wrap items-center gap-6 pt-2">
                            <span className="text-sm font-semibold text-slate-400 uppercase tracking-widest">We Accept</span>
                            <div className="flex flex-wrap items-center gap-4">
                                {/* 
                    Placeholder icons - In a real app we'd use actual SVGs or optimized images.
                    Since I don't have them, I'll use stylized text badges or generic icons.
                 */}
                                {["Visa", "Mastercard", "Amex", "Apple Pay", "GPay"].map((method) => (
                                    <div key={method} className="px-3 py-1.5 rounded-md bg-white/10 border border-white/10 text-xs font-bold tracking-tight text-slate-200">
                                        {method}
                                    </div>
                                ))}
                            </div>
                        </FadeIn>
                    </div>

                    <div className="flex-shrink-0 w-full lg:w-auto">
                        <FadeIn direction="left" delay={0.3} className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative bg-slate-900 border border-white/10 p-6 md:p-8 rounded-[2rem] text-center space-y-6">
                                <div className="space-y-2">
                                    <p className="text-sm uppercase tracking-[0.2em] text-indigo-400 font-bold">Start Booking Now</p>
                                    <h3 className="text-2xl font-bold">Pay via Razorpay</h3>
                                </div>

                                <div className="flex justify-center py-4">
                                    <div className="relative h-16 w-16 bg-white/5 rounded-full flex items-center justify-center border border-white/10 shadow-inner">
                                        <Zap className="h-8 w-8 text-indigo-400" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Button
                                        onClick={handleRazorpayRedirect}
                                        size="lg"
                                        className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg shadow-xl shadow-indigo-900/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        Proceed to Payment
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                    <p className="text-xs text-slate-500">100% Secure Transaction via Razorpay</p>
                                </div>

                                <div className="bg-white/5 rounded-xl p-4 flex items-center justify-center gap-3">
                                    <ShieldCheck className="h-5 w-5 text-green-400" />
                                    <span className="text-sm font-medium text-slate-300">PCI-DSS Compliant</span>
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                </div>
            </div>
        </section>
    );
}
