"use client";

import React from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, MapPin, ArrowRight, CalendarDays, Award } from "lucide-react";
import { Package } from "@/types/package";
import { useTranslations } from "next-intl";

// Pure display component rendered in list/grid .map()s across several
// pages — memoized so re-filtering or re-sorting a list (e.g. typing in a
// search box) only re-renders cards whose own `pkg` prop actually changed.
export const PackageCard = React.memo(function PackageCard({ pkg }: { pkg: Package }) {
    const t = useTranslations();
    const href = `/packages/${pkg.slug}`;
    const visibleIncludes = pkg.includes.slice(0, 3);
    const extraIncludes = pkg.includes.length - visibleIncludes.length;

    return (
        <Card className="group h-full gap-0 overflow-hidden rounded-3xl border border-border/60 bg-card py-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">
            {/* Image */}
            <Link href={href} className="relative block aspect-[16/10] shrink-0 overflow-hidden" tabIndex={-1} aria-hidden>
                <Image
                    src={pkg.image}
                    alt={pkg.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/25" />

                <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
                    {pkg.featured ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white shadow-md">
                            <Award className="h-3.5 w-3.5" />
                            {t("packageCard.bestSeller")}
                        </span>
                    ) : (
                        <span />
                    )}
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-900 shadow-md">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        {pkg.rating}
                        <span className="font-normal text-slate-500">({pkg.reviews})</span>
                    </span>
                </div>

                <span className="absolute bottom-3 start-3 inline-flex max-w-[75%] items-center gap-1.5 rounded-full bg-black/35 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/25 backdrop-blur-md">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{pkg.location}</span>
                </span>
            </Link>

            {/* Content */}
            <div className="flex flex-1 flex-col px-6 pt-5 pb-6">
                {pkg.duration && (
                    <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {pkg.duration}
                    </p>
                )}
                <h3 className="mt-2 text-lg font-bold leading-snug line-clamp-1 transition-colors group-hover:text-primary">
                    <Link href={href}>{pkg.title}</Link>
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                    {pkg.description}
                </p>

                {visibleIncludes.length > 0 && (
                    <ul className="mt-4 flex flex-wrap gap-2">
                        {visibleIncludes.map((item, idx) => (
                            <li key={idx} className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground/75">
                                {item}
                            </li>
                        ))}
                        {extraIncludes > 0 && (
                            <li className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                                +{extraIncludes}
                            </li>
                        )}
                    </ul>
                )}

                {/* Price & action */}
                <div className="mt-auto pt-6">
                    <div className="flex items-end justify-between gap-3 border-t pt-5">
                        <div className="min-w-0">
                            <p className="text-xs text-muted-foreground">
                                {t("packageCard.startsFrom")}
                            </p>
                            <p className="mt-0.5 text-xl font-bold leading-tight text-foreground">
                                <span className="me-1 text-sm font-medium text-muted-foreground">QAR</span>
                                {pkg.price.toLocaleString()}
                            </p>
                        </div>
                        <Button className="h-10 shrink-0 rounded-full px-4 text-sm font-semibold shadow-sm group/btn" asChild>
                            <Link href={href}>
                                {t("packageCard.viewDetails")}
                                <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5 rtl:rotate-180" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
});
