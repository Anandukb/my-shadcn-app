"use client";

import React from "react";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Phone, Mail, MapPin, Globe, Ship, Stethoscope, Plane, Hotel, Star, Users, Check, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { ShieldCheck, Umbrella, FileCheck2 } from "lucide-react";
import { FadeIn } from "@/components/ui/motion";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// -----------------------------------------------------------------------------
// Landing page for a Travel Agency using shadcn/ui + Tailwind (responsive)
// - Mobile-first header with Sheet menu
// - Hero with search bar
// - Featured Destinations & Packages
// - Services (Cruise Packages & Medical Tourism highlighted)
// - Why Choose Us
// - Testimonials
// - CTA Banner
// - Footer
// -----------------------------------------------------------------------------

import { PaymentBanner } from "@/components/sections/PaymentBanner";
import { VisaBanner } from "@/components/sections/VisaBanner";
import { useBookNow } from "@/components/layout/BookNowDialog";
import type { Package } from "@/types/package";

export function HomeClient({ packages }: { packages: Package[] }) {
  return (
    <main>
      <Hero />
      <Services />
      <FeaturedDestinations />
      <VisaBanner />
      <FeaturedPackages packages={packages} />
      <WhyChooseUs />
      <Testimonials />
      <CtaBanner />
      <PaymentBanner />
    </main>
  );
}

// -----------------------------------------------------------------------------
// Hero Section (Premium Modern Animated Slider)
// -----------------------------------------------------------------------------
import { useState, useEffect, useCallback } from "react";
import { type CarouselApi } from "@/components/ui/carousel";
import { marketingImageUrl } from "@/lib/marketing-images";

const AVATAR_LOOP_PHOTO_IDS = ["1438761681033-6461ffad8d80", "1500648767791-00dcc994a43e", "1494790108377-be9c29b29330"];

function Hero() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const t = useTranslations();
  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const slides = [
    {
      title: "Discover Maldives",
      subtitle: "Overwater villas, coral reefs, and crystal lagoons",
      image: marketingImageUrl("1573843981267-be1999ff37cd")
    },
    {
      title: "Explore Istanbul",
      subtitle: "Where East meets West—bazaars, mosques, and skyline sunsets",
      image: marketingImageUrl("1541432901042-2d8bd64b4a9b")
    },
    {
      title: "Georgia Getaways",
      subtitle: "Mountains, vineyards, and storybook towns",
      image: marketingImageUrl("1565008576549-57569a49371d")
    },
  ];

  return (
    <section className="relative h-[80vh] w-full overflow-hidden bg-black">
      <Carousel
        opts={{ loop: true, duration: 40 }}
        plugins={[Autoplay({ delay: 6000, stopOnInteraction: false })]}
        className="h-full w-full"
        setApi={setApi}
      >
        <CarouselContent className="h-full -ml-0">
          {slides.map((s, i) => {
            const isActive = current === i;

            return (
              <CarouselItem key={i} className="pl-0 h-full w-full relative overflow-hidden">
                <div className="relative h-full w-full bg-black">
                  {/* Background Image with slow Ken Burns effect when active */}
                  <motion.div
                    initial={{ scale: 1 }}
                    animate={{ scale: isActive ? 1.08 : 1 }}
                    transition={{ duration: 10, ease: "linear" }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={s.image}
                      alt={s.title}
                      fill
                      sizes="100vw"
                      className="object-cover opacity-80"
                      priority={i === 0}
                    />
                  </motion.div>

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                  {/* Hero Content Area */}
                  <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-16 lg:px-24">
                    <div className="max-w-4xl pt-10">
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        >
                          <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10 backdrop-blur-md px-4 py-1.5 text-sm font-medium tracking-[0.2em] uppercase rounded-full">
                            {t('hero_home.badge')}
                          </Badge>
                        </motion.div>
                      )}

                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, y: 40 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                        >
                          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-[6rem] font-bold text-white tracking-tight leading-[1.05] mb-6 drop-shadow-xl">
                            {s.title}
                          </h1>
                        </motion.div>
                      )}

                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                        >
                          <p className="text-lg md:text-2xl text-white/80 max-w-2xl font-light leading-relaxed mb-10 drop-shadow-lg">
                            {s.subtitle}
                          </p>
                        </motion.div>
                      )}

                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
                          className="flex flex-col sm:flex-row gap-5"
                        >
                          <Button size="lg" className="h-14 px-8 text-base font-semibold rounded-full bg-white text-black hover:bg-white/90 shadow-2xl transition-all" asChild>
                            <Link href="/holiday-packages">{t('hero_home.explore')}</Link>
                          </Button>
                          {/* <Button size="lg" variant="outline" className="h-14 px-8 text-base font-semibold rounded-full border-white/50 text-black hover:text-white hover:bg-white/10 hover:border-white hover:text-white backdrop-blur-sm transition-all" asChild>
                            <Link href="/">{t('hero_home.view')}</Link>
                          </Button> */}
                        </motion.div>
                      )}
                    </div>
                  </div>

                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>

        {/* Custom Navigation Interface */}
        <div className="absolute bottom-10 inset-x-0 z-20 container mx-auto px-6 md:px-16 lg:px-24 flex justify-between items-end pointer-events-none">
          {/* Progress Indicators */}
          <div className="flex gap-3 pointer-events-auto items-center">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => api?.scrollTo(i)}
                className={cn(
                  "h-1.5 transition-all duration-500 rounded-full cursor-pointer",
                  current === i ? "w-10 bg-white" : "w-4 bg-white/40 hover:bg-white/60"
                )}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          <div className="hidden md:flex gap-3 pointer-events-auto">
            <CarouselPrevious className="static translate-y-0 h-14 w-14 rounded-full border border-white/20 bg-black/20 text-white hover:bg-white hover:text-black hover:border-white transition-all backdrop-blur-md" />
            <CarouselNext className="static translate-y-0 h-14 w-14 rounded-full border border-white/20 bg-black/20 text-white hover:bg-white hover:text-black hover:border-white transition-all backdrop-blur-md" />
          </div>
        </div>
      </Carousel>
    </section>
  );
}

// -----------------------------------------------------------------------------
// Quick Search removed
// -----------------------------------------------------------------------------
// Featured Destinations
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// Featured Destinations (Bento Grid)
// -----------------------------------------------------------------------------
function FeaturedDestinations() {
  const t = useTranslations('destinations');
  const items = [
    { title: "Maldives", image: marketingImageUrl("1500375592092-40eb2168fd21"), tag: "Beach", size: "col-span-12 md:col-span-8 row-span-2" },
    { title: "Istanbul", image: marketingImageUrl("1530053969600-caed2596d242"), tag: "Culture", size: "col-span-12 md:col-span-4 row-span-1" },
    { title: "Georgia", image: marketingImageUrl("1512446816042-444d641267d4"), tag: "Mountains", size: "col-span-6 md:col-span-4 row-span-1" },
    { title: "Baku", image: marketingImageUrl("1588166524941-3bf61a9c41db"), tag: "City", size: "col-span-6 md:col-span-4 row-span-1" },
    { title: "Phuket", image: marketingImageUrl("1505761671935-60b3a7427bad"), tag: "Island", size: "col-span-12 md:col-span-8 row-span-1" },
  ];

  return (
    <section id="destinations" className="bg-gradient-to-b from-slate-50/70 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/20 py-16 md:py-24 relative overflow-hidden">
      {/* Decorative Blob */}
      <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-end justify-between gap-4 mb-10 md:mb-14">
          <div className="max-w-xl">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              Top <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Destinations</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">{t('subtitle')}</p>
          </div>
          <Button variant="outline" size="lg" className="hidden md:inline-flex rounded-full px-8 shadow-sm hover:shadow-md transition-all border-slate-300 dark:border-slate-700" asChild>
            <Link href="/packages">{t('viewAll')} <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>

        {/* CSS-based expanding flex-grid layout instead of a bento grid */}
        <div className="flex flex-col lg:flex-row gap-4 h-[600px] w-full">
          {items.map((item, i) => (
            <div
              key={i}
              className={cn(
                "group relative overflow-hidden rounded-3xl cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] flex-1 hover:flex-[3] min-h-[100px] lg:min-h-full",
                i === 0 ? "lg:flex-[2]" : "" // Make the first one slightly larger by default on desktop
              )}
            >
              {/* Background Masked Image */}
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(min-width: 1024px) 20vw, 100vw"
                className="object-cover transition-transform duration-[2000ms] group-hover:scale-110"
              />
              {/* Darkening Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-700" />

              {/* Content placed at the bottom */}
              <div className="absolute bottom-0 left-0 p-6 w-full flex flex-col justify-end h-full">
                <div className="transform translate-y-8 group-hover:translate-y-0 transition-transform duration-700">
                  <Badge variant="secondary" className="mb-3 bg-white/20 text-white border border-white/30 hover:bg-white/30 backdrop-blur-md uppercase tracking-wider text-xs">
                    {item.tag}
                  </Badge>
                  <h3 className="text-white font-black text-2xl md:text-4xl tracking-tight mb-2 drop-shadow-xl whitespace-nowrap">
                    {item.title}
                  </h3>

                  {/* Revealing text on hover */}
                  <div className="overflow-hidden h-0 group-hover:h-12 transition-all duration-700 opacity-0 group-hover:opacity-100 flex items-center">
                    <span className="text-white/80 font-medium flex items-center">
                      Explore tours <ArrowRight className="ml-2 w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Button size="lg" variant="outline" className="rounded-full w-full border-slate-300" asChild>
            <Link href="/packages">{t('viewAll')}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

// -----------------------------------------------------------------------------
// Featured Packages (tabs)
// -----------------------------------------------------------------------------
function FeaturedPackages({ packages }: { packages: Package[] }) {
  const tPkg = useTranslations('packages');
  const holidays = packages.filter(pkg => pkg.category === "holidays" && pkg.featured).slice(0, 6);
  const cruises = packages.filter(pkg => pkg.category === "cruise" && pkg.featured).slice(0, 6);
  const medical = packages.filter(pkg => pkg.category === "medical" && pkg.featured).slice(0, 6);

  return (
    <section id="packages" className="bg-slate-50 dark:bg-slate-900/10 py-6 lg:py-10 border-t border-border/10">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between gap-4 mb-3 md:mb-5">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">{tPkg('title')}</h2>
            <p className="text-base text-muted-foreground">{tPkg('subtitle')}</p>
          </div>
        </div>

        <Tabs defaultValue="holidays" className="w-full">
          <div className="flex justify-center mb-5 md:mb-6 w-full overflow-hidden">
            <TabsList className="bg-muted/90 p-0.5 rounded-full h-auto flex flex-wrap max-w-full justify-center">
              <TabsTrigger value="holidays" className="cursor-pointer rounded-full px-4 md:px-6 py-1.5 min-h-[36px] md:h-10 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"><Plane className="mr-2 h-4 w-4" /> Holidays</TabsTrigger>
              <TabsTrigger value="cruise" className="cursor-pointer rounded-full px-4 md:px-6 py-1.5 min-h-[36px] md:h-10 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"><Ship className="mr-2 h-4 w-4" /> Cruise</TabsTrigger>
              <TabsTrigger value="medical" className="cursor-pointer rounded-full px-4 md:px-6 py-1.5 min-h-[36px] md:h-10 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"><Stethoscope className="mr-2 h-4 w-4" /> Medical</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="holidays" className="animate-in fade-in zoom-in-95 duration-500">
            <PackageGrid items={holidays} />
          </TabsContent>
          <TabsContent value="cruise" id="cruise" className="animate-in fade-in zoom-in-95 duration-500">
            <PackageGrid items={cruises} />
          </TabsContent>
          <TabsContent value="medical" id="medical" className="animate-in fade-in zoom-in-95 duration-500">
            <PackageGrid items={medical} />
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-center">
          <Button size="lg" variant="outline" className="cursor-pointer rounded-full px-8 h-12" asChild>
            <Link href="/packages">{tPkg('viewAll')}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function PackageGrid({ items }: { items: any[] }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {items.map((pkg) => (
        <Card key={pkg.title} className="group relative border-0 rounded-[1.5rem] bg-background shadow-md hover:shadow-xl transition-all duration-500 overflow-hidden isolate h-[360px]">
          {/* Top Image area */}
          <div className="absolute top-0 inset-x-0 h-2/3 overflow-hidden rounded-t-[2rem] z-0">
            <Image
              src={pkg.image}
              alt={pkg.title}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transform group-hover:scale-110 group-hover:rotate-1 transition-all duration-[1.5s] ease-out origin-center"
            />
            {/* Elegant overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />

            {/* Top badges */}
            <div className="absolute top-5 left-5 right-5 flex justify-between items-start">
              <Badge className="bg-white text-black hover:bg-white font-bold tracking-wider uppercase text-[10px] px-3 py-1 shadow-md">
                Featured
              </Badge>
              <Link href={`/packages/1`} className="h-10 w-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 hover:bg-primary hover:border-primary transition-colors z-20">
                <ArrowRight className="h-4 w-4 -rotate-45" />
              </Link>
            </div>
          </div>

          {/* Bottom Content Area - slides up slightly on hover */}
          <div className="absolute bottom-0 inset-x-0 h-[45%] bg-white dark:bg-slate-900 rounded-[2rem] p-6 z-10 flex flex-col justify-between transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 will-change-transform shadow-[0_-10px_40px_-5px_rgba(0,0,0,0.1)]">

            {/* Content header slightly overlapping the image */}
            <div className="absolute -top-6 right-6 md:right-8">
              <div className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-primary flex items-center justify-center text-white font-bold shadow-lg shadow-primary/30 transform group-hover:-translate-y-2 transition-transform duration-500">
                <span className="text-xs flex flex-col items-center leading-none">
                  <span className="text-[10px] opacity-80">From</span>
                  {pkg.price}
                </span>
              </div>
            </div>

            <div className="mt-2">
              <div className="flex items-center gap-1 text-amber-500 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-current" />
                ))}
                <span className="text-muted-foreground text-xs font-medium ml-1">(4.9)</span>
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-1 group-hover:text-primary transition-colors line-clamp-2 leading-tight pr-10 md:pr-0">
                {pkg.title}
              </h3>
            </div>

            <div className="flex items-center justify-between mt-auto">
              <div className="flex -space-x-2">
                {AVATAR_LOOP_PHOTO_IDS.map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <Image src={marketingImageUrl(AVATAR_LOOP_PHOTO_IDS[i])} alt="User" width={32} height={32} className="object-cover w-full h-full" />
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                  +4k
                </div>
              </div>
              <Button variant="ghost" className="rounded-full px-4 hover:bg-primary/5 hover:text-primary group/btn font-semibold" asChild>
                <Link href={`/packages/${pkg.id}`}>
                  View Details
                  <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Services strip
// -----------------------------------------------------------------------------
function Services() {
  const t = useTranslations();
  const router = useRouter();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [contactData, setContactData] = useState({ name: "", email: "", phone: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleServiceClick = (title: string, to: string) => {
    if (["Flights", "Cruise", "Travel Insurance"].includes(title)) {
      setSelectedService(title);
      setIsSubmitted(false);
    } else if (to) {
      router.push(to);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const closeModal = () => {
    setSelectedService(null);
    setContactData({ name: "", email: "", phone: "" });
  };

  const services = [
    {
      title: t('services_home.holidays'),
      icon: Umbrella,
      image: marketingImageUrl("1436491865332-7a61a109cc05"),
      description: t('services_home.holidaysDesc'),
      to: "/packages",
      animateClass: "group-hover/card:animate-pulse group-hover/card:scale-110"
    },
    {
      title: t('services_home.hotel'),
      icon: Hotel,
      image: marketingImageUrl("1566073771259-6a8506099945"),
      description: t('services_home.hotelDesc'),
      to: "/hotels",
      animateClass: "group-hover/card:animate-pulse group-hover/card:scale-110"
    },
    {
      title: t('services_home.visa'),
      icon: FileCheck2,
      image: marketingImageUrl("1569098644584-210bcd375b59"),
      description: t('services_home.visaDesc'),
      to: "/global-visa",
      animateClass: "group-hover/card:animate-pulse group-hover/card:scale-110"
    },
    {
      title: t('services_home.flights'),
      icon: Plane,
      image: marketingImageUrl("1436491865332-7a61a109cc05"),
      description: t('services_home.flightsDesc'),
      to: "/packages",
      animateClass: "group-hover/card:animate-pulse group-hover/card:scale-110"
    },
    {
      title: t('services_home.cruise'),
      icon: Ship,
      image: marketingImageUrl("1548574505-5e239809ee19"),
      description: t('services_home.cruiseDesc'),
      to: "/packages",
      animateClass: "group-hover/card:animate-pulse group-hover/card:scale-110"
    },
    {
      title: t('services_home.insurance'),
      icon: ShieldCheck,
      image: marketingImageUrl("1454165804606-c3d57bc86b40"),
      description: t('services_home.insuranceDesc'),
      to: "/packages",
      animateClass: "group-hover/card:animate-pulse group-hover/card:scale-110"
    },
  ];

  return (
    <section className="container mx-auto px-4 py-12 md:py-16 -mt-4 md:-mt-8 relative z-30">
      <FadeIn>
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
            {t.rich('services_home.title', {
              span: (chunks) => <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">{chunks}</span>
            })}
          </h2>
          <p className="text-muted-foreground text-sm">
            {t('services_home.subtitle')}
          </p>
        </div>
      </FadeIn>

      <div className="flex flex-wrap justify-center gap-4 md:gap-8 lg:gap-12">
        {services.map((s, index) => (
          <FadeIn key={s.title} delay={index * 0.1}>
            <div
              className="group/card flex flex-col items-center cursor-pointer outline-none"
              onClick={() => handleServiceClick(s.title, s.to)}
              tabIndex={0}
            >
              {/* Neon border wrapper */}
              <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-[2rem] p-[3px] overflow-hidden shadow-xl shadow-blue-500/10 hover:shadow-blue-500/30 transition-all duration-300">
                {/* Moving multi-color gradient behind the content */}
                <div className="absolute inset-[-100%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#ec4899,#8b5cf6,#3b82f6,#14b8a6,#ec4899)] opacity-70 group-hover/card:opacity-100 transition-opacity duration-300" />

                {/* Inner card surface */}
                <div className="relative w-full h-full rounded-[calc(2rem-3px)] bg-white dark:bg-slate-900 flex items-center justify-center z-10 transition-transform duration-300 ease-out group-hover/card:scale-[0.98]">
                  {/* Inner subtle gradient hover state */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 rounded-[calc(2rem-3px)]" />

                  <div className="w-full flex justify-center z-20">
                    <s.icon className={cn("w-10 h-10 md:w-12 md:h-12 text-blue-600 dark:text-blue-400 transition-all duration-300", s.animateClass || "group-hover/card:scale-110")} />
                  </div>
                </div>
              </div>
              <span className="mt-5 text-sm md:text-base font-bold text-slate-700 dark:text-slate-300 group-hover/card:text-primary transition-colors">
                {s.title}
              </span>
            </div>
          </FadeIn>
        ))}
      </div>

      {/* Service Enquiry Modal */}
      <AnimatePresence>
        {selectedService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-lg"
            >
              {isSubmitted ? (
                // Success State
                <Card className="shadow-2xl border-2">
                  <CardContent className="p-8 md:p-10 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.2 }}
                      className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
                    >
                      <Check className="w-12 h-12 text-white" />
                    </motion.div>
                    <h2 className="text-3xl font-black mb-4">{t('services_home.successTitle')}</h2>
                    <p className="text-muted-foreground mb-8 leading-relaxed">
                      {t('services_home.successDesc', { service: selectedService })}
                    </p>
                    <Button
                      onClick={closeModal}
                      className="w-full h-12 bg-primary hover:bg-primary/90 font-bold"
                    >
                      {t('services_home.close')}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                // Form State
                <Card className="shadow-2xl border-2">
                  <CardContent className="p-6 md:p-8">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h2 className="text-2xl md:text-3xl font-black mb-2">{t('services_home.enquiryTitle', { service: selectedService })}</h2>
                        <p className="text-sm text-muted-foreground">{t('services_home.enquirySubtitle')}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={closeModal}
                        className="rounded-full hover:bg-slate-100 -mt-2 -mr-2"
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>

                    {/* Contact Form */}
                    <form onSubmit={handleSubmit} className="space-y-5 text-left">
                      <div>
                        <label className="block text-sm font-bold mb-2 flex items-center gap-2">
                          <Users className="w-4 h-4 text-primary" />
                          {t('services_home.fullName')}
                        </label>
                        <Input
                          type="text"
                          value={contactData.name}
                          onChange={(e) => setContactData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="John Doe"
                          required
                          className="h-12 border-2 focus:border-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold mb-2 flex items-center gap-2">
                          <Phone className="w-4 h-4 text-primary" />
                          {t('services_home.phone')}
                        </label>
                        <Input
                          type="tel"
                          value={contactData.phone}
                          onChange={(e) => setContactData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="+974 5555 5555"
                          required
                          className="h-12 border-2 focus:border-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold mb-2 flex items-center gap-2">
                          <Mail className="w-4 h-4 text-primary" />
                          {t('services_home.email')} <span className="text-xs font-normal text-muted-foreground">{t('services_home.optional')}</span>
                        </label>
                        <Input
                          type="email"
                          value={contactData.email}
                          onChange={(e) => setContactData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="your.email@example.com"
                          className="h-12 border-2 focus:border-primary"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-14 bg-primary hover:bg-primary/90 font-bold text-lg shadow-lg cursor-pointer"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            {t('services_home.submitting')}
                          </>
                        ) : (
                          <>
                            {t('services_home.submit')}
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// About Maram Tours
// -----------------------------------------------------------------------------
function WhyChooseUs() {
  const t = useTranslations();
  return (
    <section id="about" className="bg-white dark:bg-background border-y border-border/5">
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 items-center">

          <FadeIn direction="right" className="relative hidden lg:block h-[600px] w-full isolate">
            {/* Background Blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-primary/10 rounded-full blur-3xl -z-10" />

            {/* Image Composition */}
            <div className="absolute top-0 left-0 w-2/3 h-2/3 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white dark:border-background z-10 transform -rotate-3 hover:rotate-0 transition-transform duration-700">
              <Image src={marketingImageUrl("1539635278303-d4002c07eae3")} alt="People traveling" fill sizes="33vw" className="object-cover" />
            </div>
            <div className="absolute bottom-0 right-0 w-2/3 h-2/3 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white dark:border-background z-20 transform rotate-3 hover:rotate-0 transition-transform duration-700">
              <Image src={marketingImageUrl("1501785888041-af3ef285b470")} alt="Beautiful landscape" fill sizes="33vw" className="object-cover" />
            </div>

            {/* Floating Experience Badge */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-white dark:bg-slate-900 rounded-full p-6 shadow-2xl border border-border/10 flex flex-col items-center justify-center w-36 h-36 animate-pulse-slow">
              <span className="text-4xl font-black text-primary">10+</span>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-center mt-1">
                {t.rich('about_home.yearsExcellence', {
                  br: () => <br />
                })}
              </span>
            </div>
          </FadeIn>

          <FadeIn direction="left" className="space-y-6">
            <div>
              <Badge variant="outline" className="mb-3 text-primary border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold tracking-widest uppercase rounded-full">
                {t('about_home.badge')}
              </Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-4">
                {t.rich('about_home.titlePrefix')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">{t('about_home.titleHighlight')}</span> {t('about_home.titleSuffix')}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t.rich('about_home.description', {
                  strong: (chunks) => <strong className="text-foreground">{chunks}</strong>
                })}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-border/10">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  <Users className="h-6 w-6" />
                </div>
                <h4 className="text-xl font-bold mb-2">{t('about_home.happyTravelers')}</h4>
                <p className="text-sm text-muted-foreground">{t('about_home.happyTravelersDesc')}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-border/10">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  <Globe className="h-6 w-6" />
                </div>
                <h4 className="text-xl font-bold mb-2">{t('about_home.partnerships')}</h4>
                <p className="text-sm text-muted-foreground">{t('about_home.partnershipsDesc')}</p>
              </div>
            </div>

            <Button size="lg" className="rounded-full shadow-lg shadow-primary/20 h-14 px-8 text-base">
              {t('about_home.button')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </FadeIn>

        </div>
      </div>
    </section>
  );
}

// -----------------------------------------------------------------------------
// Testimonials (Modern)
// -----------------------------------------------------------------------------
function Testimonials() {
  const tTestim = useTranslations('testimonials');
  const quotes = [
    { name: "Aisha M.", text: "Seamless experience from visa to hotel. The Maldives package was perfect!", place: "Maldives Holiday", avatar: marketingImageUrl("1438761681033-6461ffad8d80") },
    { name: "Omar K.", text: "Cruise team handled everything. Great value and great memories.", place: "Gulf Cruise", avatar: marketingImageUrl("1500648767791-00dcc994a43e") },
    { name: "Sara L.", text: "Medical trip to Turkey was smooth, hospital coordination was excellent.", place: "Medical Tourism", avatar: marketingImageUrl("1494790108377-be9c29b29330") },
  ];

  return (
    <section className="bg-slate-50 dark:bg-slate-900/30 py-16 lg:py-24 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-16">
          <Badge variant="outline" className="mb-4 text-primary border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold tracking-widest uppercase rounded-full">
            Testimonials
          </Badge>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
            Loved by <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Thousands</span>
          </h2>
          <p className="text-lg text-muted-foreground">Hear what our travelers have to say about their unforgettable journeys with us.</p>
        </div>

        <Carousel
          opts={{
            align: "center",
            loop: true,
          }}
          plugins={[Autoplay({ delay: 5000 })]}
          className="w-full max-w-6xl mx-auto"
        >
          <CarouselContent className="-ml-4 md:-ml-8">
            {quotes.map((q, i) => (
              <CarouselItem key={i} className="pl-4 md:pl-8 sm:basis-1/2 lg:basis-1/3">
                <Card className="h-full border-none shadow-xl bg-white dark:bg-background rounded-[2rem] relative overflow-visible mt-8 mx-2 transition-transform duration-300 hover:-translate-y-2">
                  <div className="absolute -top-8 left-8 h-16 w-16 rounded-full border-4 border-slate-50 dark:border-slate-900 overflow-hidden shadow-lg z-10">
                    <Image src={q.avatar} alt={q.name} fill sizes="64px" className="object-cover" />
                  </div>
                  <CardContent className="pt-12 pb-8 px-8 flex flex-col h-full">
                    <div className="flex gap-1 text-amber-500 mb-6">
                      {[...Array(5)].map((_, idx) => <Star key={idx} className="h-4 w-4 fill-current" />)}
                    </div>
                    <p className="text-lg text-muted-foreground leading-relaxed mb-8 flex-grow">" {q.text} "</p>
                    <div className="mt-auto border-t border-border/40 pt-4 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-foreground text-lg">{q.name}</h4>
                        <p className="text-xs font-semibold uppercase tracking-wider text-primary">{q.place}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                        <MapPin className="h-4 w-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center mt-12 gap-4">
            <CarouselPrevious className="static translate-y-0 translate-x-0 h-12 w-12 rounded-full border-2 border-border/50 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 shadow-md" />
            <CarouselNext className="static translate-y-0 translate-x-0 h-12 w-12 rounded-full border-2 border-border/50 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 shadow-md" />
          </div>
        </Carousel>
      </div>
    </section>
  );
}

// -----------------------------------------------------------------------------
// CTA Banner
// -----------------------------------------------------------------------------
function CtaBanner() {
  const tCta = useTranslations('cta');
  const { open: openBookNow } = useBookNow();
  const handleClick = useCallback(() => openBookNow(), [openBookNow]);
  return (
    <section id="book" className="container mx-auto px-4 py-8 lg:py-16">
      <div className="relative rounded-[2rem] md:rounded-[3rem] overflow-hidden">
        <div className="absolute inset-0">
          <Image src={marketingImageUrl("1500530855697-b586d89ba3ee")} alt="Sunset wing view" fill sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-primary/90 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
        </div>

        <div className="relative z-10 p-6 md:p-12 lg:p-16 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
          <div className="max-w-2xl">
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 md:mb-4 leading-tight">{tCta('title')}</h3>
            <p className="text-lg md:text-xl text-white/90">{tCta('subtitle')}</p>
          </div>
          <div className="flex-shrink-0 w-full md:w-auto mt-4 md:mt-0">
            <Button
              size="lg"
              onClick={handleClick}
              className="cursor-pointer w-full md:w-auto h-14 md:h-16 px-8 md:px-10 rounded-full text-base md:text-lg bg-white text-primary hover:bg-white/90 font-bold shadow-2xl"
            >
              {tCta('button')}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}


