"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { CreditCard, ShieldCheck, Banknote, ArrowRight, Lock } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/scroll";

// TODO: placeholder merchant link — swap for the real Razorpay page before launch.
const RAZORPAY_URL = "https://razorpay.me/@travelco";

export function PaymentBanner() {
    const t = useTranslations("paymentBanner");

    const features = [
        { icon: CreditCard, title: t("gatewaysTitle"), description: t("gatewaysDesc") },
        { icon: Banknote, title: t("emiTitle"), description: t("emiDesc") },
    ];

    const methods = ["Visa", "Mastercard", "Amex", "Apple Pay", "GPay"];

    return (
        <section className="bg-surface-alt py-[var(--bay)] lg:py-[var(--bay-lg)]">
            <div className="mx-auto w-full max-w-[82rem] px-5 sm:px-8 lg:px-12">
                <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
                    <div>
                        <Reveal>
                            <span className="kicker mb-4 block text-brand-ink">{t("badge")}</span>
                            <h2 className="display text-[2rem] text-on-page sm:text-4xl">
                                {t("titlePrefix")} <span className="text-brand-ink">{t("titleHighlight")}</span>{" "}
                                {t("titleSuffix")}
                            </h2>
                            <p className="measure mt-4 text-base leading-relaxed text-on-page-muted sm:text-lg">
                                {t("description")}
                            </p>
                        </Reveal>

                        <RevealGroup className="mt-8 grid gap-4 sm:grid-cols-2">
                            {features.map(({ icon: Icon, title, description }) => (
                                <RevealItem
                                    key={title}
                                    className="rounded-panel border border-line bg-surface p-5"
                                >
                                    <span className="mb-3.5 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand-ink">
                                        <Icon className="h-5 w-5" />
                                    </span>
                                    <h3 className="mb-1.5 text-base font-semibold text-on-page">{title}</h3>
                                    <p className="text-sm leading-relaxed text-on-page-muted">{description}</p>
                                </RevealItem>
                            ))}
                        </RevealGroup>

                        <Reveal delay={0.2} className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
                            <span className="kicker text-on-page-faint">{t("weAccept")}</span>
                            <div className="flex flex-wrap items-center gap-2">
                                {methods.map((m) => (
                                    <span
                                        key={m}
                                        className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-on-page-muted"
                                    >
                                        {m}
                                    </span>
                                ))}
                            </div>
                        </Reveal>
                    </div>

                    <Reveal direction="left" delay={0.15} className="lg:self-center">
                        <div className="rounded-panel border border-line bg-surface p-7 text-center shadow-sm">
                            <span className="kicker mb-3 block text-brand-ink">{t("ctaBadge")}</span>
                            <h3 className="display text-2xl text-on-page">{t("ctaTitle")}</h3>

                            <button
                                type="button"
                                onClick={() => { window.location.href = RAZORPAY_URL; }}
                                className="group mt-7 inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2.5 rounded-full bg-brand px-7 text-sm font-semibold text-on-brand shadow-sm transition-all duration-300 hover:brightness-110 hover:shadow-md"
                            >
                                {t("ctaButton")}
                                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
                            </button>

                            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-on-page-faint">
                                <Lock className="h-3 w-3" />
                                {t("ctaSecure")}
                            </p>

                            <div className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-brand-soft py-3">
                                <ShieldCheck className="h-4 w-4 text-brand-ink" />
                                <span className="text-sm font-medium text-brand-ink">{t("pciCompliant")}</span>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}
