"use client";

import React from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ArrowRight, ArrowUpRight, FileCheck, Globe2, Clock, Tag } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Reveal } from "@/components/ui/scroll";
import type { VisaCountry } from "@/lib/visa/types";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { extractErrorMessage } from "@/lib/extract-error-message";

async function fetchVisaCountries(): Promise<VisaCountry[]> {
    const res = await fetch("/api/visa-countries");
    if (!res.ok) throw new Error(await extractErrorMessage(res, "Failed to load countries"));
    const json = await res.json();
    return json.countries as VisaCountry[];
}

export function VisaBanner() {
    const t = useTranslations("visaBanner");

    const { data: countries = [] } = useQuery({
        queryKey: ["visa-countries"],
        queryFn: fetchVisaCountries,
    });

    // Countries the admin marked "Featured on homepage"; falls back to the
    // first few active ones so the section is never empty.
    const featured = countries.filter((c) => c.isFeatured);
    const suggested = featured.length > 0 ? featured : countries.slice(0, 6);

    if (suggested.length === 0) return null;

    return (
        <section className="bg-elevate py-[var(--bay)] lg:py-[var(--bay-lg)]">
            <div className="mx-auto w-full max-w-[82rem] px-5 sm:px-8 lg:px-12">
                <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
                    <div className="lg:col-span-4">
                        <Reveal>
                            <span className="kicker mb-4 block text-brand-ink">{t("badge")}</span>
                            <h2 className="display text-[2rem] text-on-page sm:text-4xl">
                                {t("titlePrefix")} <span className="text-brand-ink">{t("titleHighlight")}</span>
                            </h2>
                            <p className="measure mt-4 text-base leading-relaxed text-on-page-muted sm:text-lg">
                                {t("description")}
                            </p>

                            <Link
                                href="/global-visa"
                                className="group mt-7 inline-flex h-12 items-center gap-2.5 rounded-full bg-brand px-7 text-sm font-semibold text-on-brand shadow-sm transition-all duration-300 hover:brightness-110 hover:shadow-md"
                            >
                                {t("explore")}
                                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
                            </Link>

                            <div className="mt-9 flex items-center gap-7 border-t border-line pt-6">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand-ink">
                                        <FileCheck className="h-5 w-5" />
                                    </span>
                                    <span>
                                        <span className="block text-lg font-bold text-on-page">100+</span>
                                        <span className="block text-xs text-on-page-faint">{t("countries")}</span>
                                    </span>
                                </div>
                                <span className="h-9 w-px bg-line" />
                                <div className="flex items-center gap-3">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand-ink">
                                        <Globe2 className="h-5 w-5" />
                                    </span>
                                    <span>
                                        <span className="block text-lg font-bold text-on-page">99%</span>
                                        <span className="block text-xs text-on-page-faint">{t("successRate")}</span>
                                    </span>
                                </div>
                            </div>
                        </Reveal>
                    </div>

                    <div className="min-w-0 lg:col-span-8">
                        <Reveal direction="left" delay={0.12} className="w-full min-w-0">
                            <Carousel
                                opts={{ align: "start", loop: true }}
                                plugins={[Autoplay({ delay: 3800, stopOnInteraction: false })]}
                                className="w-full"
                            >
                                <CarouselContent className="-ml-4">
                                    {suggested.map((country) => (
                                        <CarouselItem
                                            key={country.slug}
                                            className="basis-[80%] pl-4 sm:basis-[55%] md:basis-[42%]"
                                        >
                                            {/* Route is /global-visa/[country]; this previously pointed at
                                                /visa/[slug], which has no page and 404'd. */}
                                            <Link
                                                href={`/global-visa/${country.slug}`}
                                                className="group flex h-full flex-col overflow-hidden rounded-panel border border-line bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl"
                                            >
                                                <div className="relative aspect-[3/2] w-full overflow-hidden">
                                                    <Image
                                                        src={country.image || ""}
                                                        alt={country.name}
                                                        fill
                                                        sizes="(min-width: 768px) 42vw, (min-width: 640px) 55vw, 80vw"
                                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                                    />
                                                    <span className="absolute start-4 top-4 text-3xl drop-shadow">{country.flag}</span>
                                                    {country.region && (
                                                        <span className="absolute end-4 top-4 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-900">
                                                            {country.region}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex flex-1 flex-col p-5">
                                                    <h3 className="text-lg font-semibold text-on-page transition-colors group-hover:text-brand-ink">
                                                        {country.name}
                                                    </h3>

                                                    <div className="mt-3 space-y-1.5">
                                                        {country.processingTime && (
                                                            <span className="flex items-center gap-2 text-[13px] text-on-page-muted">
                                                                <Clock className="h-3.5 w-3.5 shrink-0 text-brand" />
                                                                {t("processing")}:
                                                                <span className="font-semibold text-on-page">{country.processingTime}</span>
                                                            </span>
                                                        )}
                                                        {country.price && (
                                                            <span className="flex items-center gap-2 text-[13px] text-on-page-muted">
                                                                <Tag className="h-3.5 w-3.5 shrink-0 text-brand" />
                                                                {t("from")}:
                                                                <span className="font-semibold text-on-page">{country.price}</span>
                                                            </span>
                                                        )}
                                                    </div>

                                                    <span className="mt-5 inline-flex items-center gap-1.5 border-t border-line pt-4 text-sm font-semibold text-brand-ink">
                                                        {t("viewRequirements")}
                                                        <ArrowUpRight className="h-4 w-4" />
                                                    </span>
                                                </div>
                                            </Link>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>

                                <div className="mt-6 flex justify-center gap-3 md:justify-end">
                                    <CarouselPrevious className="static h-10 w-10 translate-x-0 translate-y-0 border-line-strong bg-surface text-on-page transition-colors hover:border-brand hover:bg-brand hover:text-on-brand" />
                                    <CarouselNext className="static h-10 w-10 translate-x-0 translate-y-0 border-line-strong bg-surface text-on-page transition-colors hover:border-brand hover:bg-brand hover:text-on-brand" />
                                </div>
                            </Carousel>
                        </Reveal>
                    </div>
                </div>
            </div>
        </section>
    );
}
