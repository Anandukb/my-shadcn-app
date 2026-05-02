"use client";

import React from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ArrowRight, FileCheck, Globe2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Autoplay from "embla-carousel-autoplay";
import { FadeIn } from "@/components/ui/motion";
import { COUNTRIES } from "@/lib/data/visa";
import { useTranslations } from "next-intl";

export function VisaBanner() {
    const t = useTranslations('visaBanner');
    // Select a few attractive countries for the slider
    const suggestedVisas = COUNTRIES.filter((c) =>
        ["United Arab Emirates", "Turkey", "Georgia", "Japan", "United Kingdom", "United States"].includes(c.name)
    );

    return (
        <section className="relative w-full overflow-hidden bg-white dark:bg-background border-y border-border/5">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 z-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 z-0 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="container mx-auto px-4 py-8 lg:py-16 relative z-10 w-full">
                <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">
                    {/* Left Column: Text & CTA */}
                    <div className="lg:col-span-4 space-y-6 min-w-0">
                        <FadeIn direction="left">
                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 backdrop-blur-sm mb-4 px-3 py-1">
                                <Globe2 className="w-4 h-4 mr-2" /> {t('badge')}
                            </Badge>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4 leading-tight">
                                {t('titlePrefix')} <span className="text-primary">{t('titleHighlight')}</span>
                            </h2>
                            <p className="text-lg text-muted-foreground mb-8">
                                {t('description')}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button size="lg" className="rounded-full shadow-lg h-14 px-8 text-base group" asChild>
                                    <Link href="/global-visa">
                                        {t('explore')}
                                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </Button>
                            </div>

                            <div className="mt-8 flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <FileCheck className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="text-sm">
                                        <p className="font-bold">100+</p>
                                        <p className="text-muted-foreground text-xs">{t('countries')}</p>
                                    </div>
                                </div>
                                <div className="w-px h-8 bg-border" />
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                        <Globe2 className="w-5 h-5 text-emerald-500" />
                                    </div>
                                    <div className="text-sm">
                                        <p className="font-bold">99%</p>
                                        <p className="text-muted-foreground text-xs">{t('successRate')}</p>
                                    </div>
                                </div>
                            </div>
                        </FadeIn>
                    </div>

                    {/* Right Column: Animated Slider */}
                    <div className="lg:col-span-8 relative min-w-0 max-w-full overflow-hidden">
                        <FadeIn direction="right" delay={0.2} className="min-w-0 w-full">
                            <Carousel
                                opts={{
                                    align: "start",
                                    loop: true,
                                }}
                                plugins={[
                                    Autoplay({
                                        delay: 3500,
                                        stopOnInteraction: false,
                                    }),
                                ]}
                                className="w-full"
                            >
                                <CarouselContent className="-ml-4 md:-ml-6 py-4">
                                    {suggestedVisas.map((country) => (
                                        <CarouselItem key={country.slug} className="pl-4 md:pl-6 basis-[85%] sm:basis-[60%] md:basis-[45%]">
                                            <Card className="group relative overflow-hidden rounded-3xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 h-[400px]">
                                                {/* Card Image Background */}
                                                <div className="absolute inset-0">
                                                    <Image
                                                        src={country.image || ""}
                                                        alt={country.name}
                                                        fill
                                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10 transition-opacity duration-300" />
                                                </div>

                                                {/* Card Content */}
                                                <CardContent className="relative flex flex-col justify-between h-full p-6 text-white z-10">
                                                    <div className="flex justify-between items-start">
                                                        <span className="text-5xl filter drop-shadow-md transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                                                            {country.flag}
                                                        </span>
                                                        <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md">
                                                            {country.region}
                                                        </Badge>
                                                    </div>

                                                    <div className="mt-auto transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                                        <h3 className="text-2xl font-bold mb-2 tracking-tight">
                                                            {country.name}
                                                        </h3>

                                                        <div className="space-y-2 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                                                            {country.processingTime && (
                                                                <div className="flex items-center text-sm text-white/90">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2" />
                                                                    {t('processing')}: <span className="font-semibold ml-1">{country.processingTime}</span>
                                                                </div>
                                                            )}
                                                            {country.price && (
                                                                <div className="flex items-center text-sm text-white/90">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-2" />
                                                                    {t('from')}: <span className="font-semibold ml-1">{country.price}</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <Button className="w-full rounded-2xl bg-white/20 hover:bg-white text-white hover:text-black backdrop-blur-sm transition-all duration-300 opacity-100 lg:opacity-0 lg:group-hover:opacity-100" asChild>
                                                            <Link href={`/visa/${country.slug}`}>
                                                                {t('viewRequirements')}
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                <div className="flex justify-center md:justify-end gap-3 mt-4 md:mt-6">
                                    <CarouselPrevious className="static translate-y-0 translate-x-0 bg-background hover:bg-primary hover:text-white border-2 transition-colors duration-300 h-10 w-10 md:h-12 md:w-12" />
                                    <CarouselNext className="static translate-y-0 translate-x-0 bg-background hover:bg-primary hover:text-white border-2 transition-colors duration-300 h-10 w-10 md:h-12 md:w-12" />
                                </div>
                            </Carousel>
                        </FadeIn>
                    </div>
                </div>
            </div>
        </section>
    );
}
