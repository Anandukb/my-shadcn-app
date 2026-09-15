"use client";

import React from "react";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Phone, Mail, MapPin, Globe, Ship, Stethoscope, Plane, Hotel, Star, Users, Check, ArrowRight, X, ChevronLeft, ChevronRight, Play, Pause, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { ShieldCheck, Umbrella, FileCheck2 } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion";
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
import { LOGO_URL } from "@/lib/brand-assets";
import type { Package } from "@/types/package";
import type { Testimonial } from "@/lib/testimonials/types";

export function HomeClient({ packages, testimonials }: { packages: Package[]; testimonials: Testimonial[] }) {
  return (
    <main>
      <IntroSplash />
      <Hero />
      <Services />
      <FeaturedDestinations />
      <VisaBanner />
      <FeaturedPackages packages={packages} />
      <WhyChooseUs />
      <Testimonials testimonials={testimonials} />
      <CtaBanner />
      <PaymentBanner />
    </main>
  );
}

// -----------------------------------------------------------------------------
// Intro Splash — shows the company name over a dark screen, then reveals the
// hero banner underneath with a curtain-up motion. Runs once per browser
// session (sessionStorage) so repeat visits within the same session skip it.
// -----------------------------------------------------------------------------
const INTRO_SESSION_KEY = "maram_intro_seen";
const INTRO_HOLD_MS = 2000;

// SSR-safe "should the intro run" check: false on the server and on the
// client's first (pre-hydration) paint, then re-read from sessionStorage
// once hydrated — avoids a manual isMounted effect (and its extra render).
function subscribeNever() {
  return () => {};
}
function getShouldIntroSnapshot() {
  return !sessionStorage.getItem(INTRO_SESSION_KEY);
}
function getShouldIntroServerSnapshot() {
  return false;
}
function useShouldShowIntro() {
  return useSyncExternalStore(subscribeNever, getShouldIntroSnapshot, getShouldIntroServerSnapshot);
}

function IntroSplash() {
  const shouldShow = useShouldShowIntro();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!shouldShow) return;
    document.body.style.overflow = "hidden";
    const timer = setTimeout(() => {
      setDismissed(true);
      document.body.style.overflow = "";
      sessionStorage.setItem(INTRO_SESSION_KEY, "1");
    }, INTRO_HOLD_MS);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, [shouldShow]);

  const show = shouldShow && !dismissed;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          exit={{ y: "-100%" }}
          transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
          className="fixed inset-0 z-[200] bg-slate-950 flex flex-col items-center justify-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center px-6 text-center"
          >
            <div className="relative h-16 w-16 md:h-20 md:w-20 rounded-full overflow-hidden bg-white shadow-xl mb-6">
              <Image src={LOGO_URL} alt="Maram Tours And Travels" fill sizes="80px" className="object-contain p-2" priority />
            </div>
            <h1 className="text-white font-black text-3xl md:text-5xl tracking-[0.25em] uppercase">
              Maram
            </h1>
            <p className="text-white/60 text-xs md:text-sm font-semibold tracking-[0.4em] uppercase mt-3">
              Tours And Travels
            </p>
            <div className="flex items-center gap-2.5 mt-4 text-white/50 text-[11px] md:text-xs font-medium tracking-[0.3em] uppercase">
              <span>India</span>
              <span className="h-1 w-1 rounded-full bg-amber-400" />
              <span>UAE</span>
            </div>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.3, ease: "easeInOut", delay: 0.3 }}
              className="h-[2px] w-32 md:w-40 bg-gradient-to-r from-transparent via-amber-400 to-transparent mt-8 origin-left"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// -----------------------------------------------------------------------------
// Hero Section (Premium Modern Animated Slider)
// -----------------------------------------------------------------------------
import { useState, useEffect, useCallback, useMemo, useSyncExternalStore } from "react";
import { marketingImageUrl } from "@/lib/marketing-images";

const AVATAR_LOOP_PHOTO_IDS = ["1438761681033-6461ffad8d80", "1500648767791-00dcc994a43e", "1494790108377-be9c29b29330"];

// Hero slides. Local `image` field is a direct, verified Unsplash URL rather
// than marketingImageUrl() since these destinations aren't uploaded to the
// site-assets bucket yet.
const HERO_SLIDES = [
  {
    id: "kerala",
    name: "Kerala",
    location: "Kerala, India",
    title: "Backwaters of Kerala",
    subtitle: "Houseboats, palm-lined canals, and misty tea hills",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1920&q=80",
  },
  {
    id: "azerbaijan",
    name: "Azerbaijan",
    location: "Baku, Azerbaijan",
    title: "Discover Azerbaijan",
    subtitle: "Baku's flame towers, ancient bazaars, and Caspian shores",
    image: "https://images.unsplash.com/photo-1596306499398-8d88944a5ec4?auto=format&fit=crop&w=1920&q=80",
  },
  {
    id: "lakshadweep",
    name: "Lakshadweep",
    location: "Lakshadweep, India",
    title: "Islands of Lakshadweep",
    subtitle: "Turquoise lagoons, coral atolls, and untouched beaches",
    image: "https://images.unsplash.com/photo-1572431447238-425af66a273b?auto=format&fit=crop&w=1920&q=80",
  },
  {
    id: "dubai",
    name: "Dubai",
    location: "Dubai, UAE",
    title: "Explore Dubai",
    subtitle: "Sky-high skylines, desert dunes, and luxury unlike anywhere else",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1920&q=80",
  },
  {
    id: "india",
    name: "India",
    location: "Agra, India",
    title: "Incredible India",
    subtitle: "Timeless monuments, vibrant culture, and journeys that stay with you",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1920&q=80",
  },
];

const HERO_SLIDE_MAP: Record<string, (typeof HERO_SLIDES)[number]> = Object.fromEntries(
  HERO_SLIDES.map((s) => [s.id, s])
);
const HERO_AUTOPLAY_MS = 5500;
const HERO_CARD_TRANSITION = { type: "spring" as const, stiffness: 260, damping: 30, mass: 0.9 };

function Hero() {
  const t = useTranslations();
  // `order` is a rotating queue of slide ids: order[0] is the open card (the
  // banner background) and order.slice(1) is the thumbnail strip, nearest
  // first. Advancing rotates the front id to the back, so the very next
  // queued thumbnail is always what expands next — a continuous conveyor,
  // matching the "cards opening" reference instead of a plain crossfade.
  const [order, setOrder] = useState<string[]>(() => HERO_SLIDES.map((s) => s.id));
  const [isPlaying, setIsPlaying] = useState(true);
  const activeId = order[0];
  const active = HERO_SLIDE_MAP[activeId];
  const activeOriginalIndex = HERO_SLIDES.findIndex((s) => s.id === activeId);

  const advance = useCallback(() => {
    setOrder((prev) => [...prev.slice(1), prev[0]]);
  }, []);

  const retreat = useCallback(() => {
    setOrder((prev) => [prev[prev.length - 1], ...prev.slice(0, -1)]);
  }, []);

  const rotateTo = useCallback((id: string) => {
    setOrder((prev) => {
      const idx = prev.indexOf(id);
      if (idx <= 0) return prev;
      return [...prev.slice(idx), ...prev.slice(0, idx)];
    });
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(advance, HERO_AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [order, advance, isPlaying]);

  return (
    <section className="relative h-screen min-h-[560px] w-full overflow-hidden bg-black">
      {/* Open card: fills the banner, shares a layoutId with its thumbnail on the right */}
      <motion.div
        key={active.id}
        layoutId={`hero-card-${active.id}`}
        transition={HERO_CARD_TRANSITION}
        className="absolute inset-0 overflow-hidden"
      >
        <motion.div
          initial={{ scale: 1.15 }}
          animate={{ scale: 1 }}
          transition={{ duration: 7, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <Image src={active.image} alt={active.title} fill sizes="100vw" className="object-cover" priority />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/25 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/70 to-transparent" />
      </motion.div>

      {/* Split content: text on the left, destination card queue on the right */}
      <div className="relative z-10 h-full max-w-[1600px] mx-auto flex flex-col justify-center lg:flex-row lg:items-end gap-4 lg:gap-6 px-6 md:px-16 lg:px-24 pt-20 sm:pt-24 md:pt-32 pb-6 lg:pb-20">
        {/* Text column */}
        <div className="lg:w-[40%] lg:max-w-lg min-w-0 shrink-0">
          <AnimatePresence mode="wait">
            <motion.div key={active.id} initial="hidden" animate="visible" exit="hidden">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
                className="flex items-center gap-3 mb-3"
              >
                <span className="h-px w-8 bg-white/50" />
                <span className="text-white/80 text-sm font-medium tracking-wide">
                  {active.location}
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25, ease: "easeOut" }}
              >
                <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-6xl font-black text-white uppercase tracking-tight leading-[0.95] mb-3 drop-shadow-xl break-words">
                  {active.title}
                </h1>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35, ease: "easeOut" }}
              >
                <p className="text-sm md:text-base text-white/70 max-w-sm leading-relaxed mb-5 line-clamp-2 lg:line-clamp-none drop-shadow-lg">
                  {active.subtitle}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45, ease: "easeOut" }}
                className="flex items-center gap-4"
              >
                <button
                  type="button"
                  onClick={() => setIsPlaying((p) => !p)}
                  aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
                  aria-pressed={isPlaying}
                  className="h-12 w-12 shrink-0 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                </button>
                <Button
                  variant="outline"
                  className="h-12 px-7 rounded-full border-white/50 bg-transparent text-white hover:bg-white hover:text-black text-xs uppercase tracking-[0.2em] font-semibold transition-all"
                  asChild
                >
                  <Link href="/holiday-packages">{t('hero_home.explore')}</Link>
                </Button>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Card queue column */}
        <div className="flex flex-col gap-3 w-full min-w-0 lg:flex-1 lg:items-end">
          <div className="flex gap-3 md:gap-4 w-full overflow-x-auto pb-1 lg:justify-end [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {order.slice(1).map((id, i) => {
              const s = HERO_SLIDE_MAP[id];
              return (
                <motion.button
                  key={s.id}
                  layoutId={`hero-card-${s.id}`}
                  transition={HERO_CARD_TRANSITION}
                  onClick={() => rotateTo(s.id)}
                  className="group relative shrink-0 w-20 h-32 sm:w-28 sm:h-48 md:w-36 md:h-60 lg:w-40 lg:h-72 rounded-2xl overflow-hidden ring-1 ring-white/20 shadow-2xl cursor-pointer"
                  aria-label={`Show ${s.name}`}
                >
                  <Image
                    src={s.image}
                    alt={s.name}
                    fill
                    sizes="200px"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  {i === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="h-11 w-11 md:h-14 md:w-14 rounded-full bg-white/15 backdrop-blur-sm border border-white/40 flex items-center justify-center text-white">
                        <Play className="h-4 w-4 md:h-5 md:w-5 ml-0.5" fill="currentColor" />
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-0 inset-x-0 p-3 text-left">
                    <span className="block text-white/70 text-[9px] uppercase tracking-widest mb-0.5 truncate">
                      {s.location}
                    </span>
                    <span className="block text-white font-bold text-xs md:text-sm uppercase leading-tight break-words">
                      {s.name}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <button
              type="button"
              onClick={retreat}
              aria-label="Previous destination"
              className="h-10 w-10 shrink-0 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={advance}
              aria-label="Next destination"
              className="h-10 w-10 shrink-0 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <span className="h-px flex-1 lg:w-20 lg:flex-none bg-white/30" />
            <span className="text-white font-bold text-base tracking-[0.15em] tabular-nums shrink-0">
              {String(activeOriginalIndex + 1).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>
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
        <FadeIn className="flex flex-col md:flex-row items-end justify-between gap-4 mb-10 md:mb-14">
          <div className="max-w-xl">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              Top <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Destinations</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">{t('subtitle')}</p>
          </div>
          <Button variant="outline" size="lg" className="hidden md:inline-flex rounded-full px-8 shadow-sm hover:shadow-md transition-all border-slate-300 dark:border-slate-700" asChild>
            <Link href="/packages">{t('viewAll')} <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </FadeIn>

        {/* CSS-based expanding flex-grid layout instead of a bento grid */}
        <div className="flex flex-col lg:flex-row gap-4 h-[600px] w-full">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 28, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
              className={cn(
                "group relative overflow-hidden rounded-3xl cursor-pointer transition-[flex,box-shadow] duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] flex-1 hover:flex-[3] min-h-[100px] lg:min-h-full",
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
            </motion.div>
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
  const holidays = useMemo(() => packages.filter(pkg => pkg.category === "holidays" && pkg.featured).slice(0, 6), [packages]);
  const cruises = useMemo(() => packages.filter(pkg => pkg.category === "cruise" && pkg.featured).slice(0, 6), [packages]);
  const medical = useMemo(() => packages.filter(pkg => pkg.category === "medical" && pkg.featured).slice(0, 6), [packages]);

  return (
    <section id="packages" className="bg-slate-50 dark:bg-slate-900/10 py-6 lg:py-10 border-t border-border/10">
      <div className="container mx-auto px-4">
        <FadeIn className="flex items-end justify-between gap-4 mb-3 md:mb-5">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">{tPkg('title')}</h2>
            <p className="text-base text-muted-foreground">{tPkg('subtitle')}</p>
          </div>
        </FadeIn>

        <Tabs defaultValue="holidays" className="w-full">
          <FadeIn delay={0.1} className="flex justify-center mb-5 md:mb-6 w-full overflow-hidden">
            <TabsList className="bg-muted/90 p-0.5 rounded-full h-auto flex flex-wrap max-w-full justify-center">
              <TabsTrigger value="holidays" className="cursor-pointer rounded-full px-4 md:px-6 py-1.5 min-h-[36px] md:h-10 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"><Plane className="mr-2 h-4 w-4" /> Holidays</TabsTrigger>
              <TabsTrigger value="cruise" className="cursor-pointer rounded-full px-4 md:px-6 py-1.5 min-h-[36px] md:h-10 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"><Ship className="mr-2 h-4 w-4" /> Cruise</TabsTrigger>
              <TabsTrigger value="medical" className="cursor-pointer rounded-full px-4 md:px-6 py-1.5 min-h-[36px] md:h-10 text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"><Stethoscope className="mr-2 h-4 w-4" /> Medical</TabsTrigger>
            </TabsList>
          </FadeIn>
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
    <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {items.map((pkg) => (
        <StaggerItem key={pkg.title}>
        <Card className="group relative border-0 rounded-[1.5rem] bg-background shadow-md hover:shadow-xl transition-all duration-500 overflow-hidden isolate h-[360px]">
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
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}

// -----------------------------------------------------------------------------
// Services strip
// -----------------------------------------------------------------------------
type ServiceItem = {
  title: string;
  icon: LucideIcon;
  image: string;
  description: string;
  to: string;
};

// Memoized: Services() below owns the enquiry modal's form state, which
// changes on every keystroke — without this, that would re-render all 6
// image cards on every keystroke even though the cards themselves never
// change. Requires `services` and `onServiceClick` to stay referentially
// stable (see the useMemo/useCallback in Services()) or the memo is moot.
const ServiceCardGrid = React.memo(function ServiceCardGrid({
  services,
  onServiceClick,
}: {
  services: ServiceItem[];
  onServiceClick: (title: string, to: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
      {services.map((s, index) => (
        <FadeIn key={s.title} delay={index * 0.08}>
          <div
            className="group/card relative h-48 md:h-60 rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-500 outline-none"
            onClick={() => onServiceClick(s.title, s.to)}
            tabIndex={0}
          >
            <Image
              src={s.image}
              alt={s.title}
              fill
              sizes="(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover/card:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10 group-hover/card:from-black/90 transition-colors duration-500" />

            <div className="absolute inset-0 flex flex-col items-center justify-end p-4 md:p-5 text-center">
              <div className="h-11 w-11 md:h-12 md:w-12 rounded-full bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center mb-3 text-white group-hover/card:bg-primary group-hover/card:border-primary transition-all duration-300">
                <s.icon className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <span className="text-white font-bold text-sm md:text-base leading-tight drop-shadow">
                {s.title}
              </span>
            </div>
          </div>
        </FadeIn>
      ))}
    </div>
  );
});

function Services() {
  const t = useTranslations();
  const router = useRouter();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [contactData, setContactData] = useState({ name: "", email: "", phone: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Stable reference so the memoized card grid below doesn't re-render
  // whenever the enquiry modal's form state (typed below) changes.
  const handleServiceClick = useCallback((title: string, to: string) => {
    if (["Flights", "Cruise", "Travel Insurance"].includes(title)) {
      setSelectedService(title);
      setIsSubmitted(false);
    } else if (to) {
      router.push(to);
    }
  }, [router]);

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

  // Memoized so the array/object references stay stable across re-renders —
  // required for React.memo on ServiceCardGrid below to actually skip work.
  const services = useMemo<ServiceItem[]>(() => [
    {
      title: t('services_home.holidays'),
      icon: Umbrella,
      image: marketingImageUrl("1436491865332-7a61a109cc05"),
      description: t('services_home.holidaysDesc'),
      to: "/packages",
    },
    {
      title: t('services_home.hotel'),
      icon: Hotel,
      image: marketingImageUrl("1566073771259-6a8506099945"),
      description: t('services_home.hotelDesc'),
      to: "/hotels",
    },
    {
      title: t('services_home.visa'),
      icon: FileCheck2,
      image: marketingImageUrl("1569098644584-210bcd375b59"),
      description: t('services_home.visaDesc'),
      to: "/global-visa",
    },
    {
      title: t('services_home.flights'),
      icon: Plane,
      image: marketingImageUrl("1436491865332-7a61a109cc05"),
      description: t('services_home.flightsDesc'),
      to: "/packages",
    },
    {
      title: t('services_home.cruise'),
      icon: Ship,
      image: marketingImageUrl("1548574505-5e239809ee19"),
      description: t('services_home.cruiseDesc'),
      to: "/packages",
    },
    {
      title: t('services_home.insurance'),
      icon: ShieldCheck,
      image: marketingImageUrl("1454165804606-c3d57bc86b40"),
      description: t('services_home.insuranceDesc'),
      to: "/packages",
    },
  ], [t]);

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

      <ServiceCardGrid services={services} onServiceClick={handleServiceClick} />

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
function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  // Reviewers are managed from the admin panel (Admin > Testimonials) and
  // don't have a photo on file, so we show their initials in the avatar
  // badge instead of a stock/stand-in photo.
  const getInitials = (name: string) =>
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");

  if (testimonials.length === 0) return null;

  return (
    <section className="bg-slate-50 dark:bg-slate-900/30 py-16 lg:py-24 overflow-hidden">
      <div className="container mx-auto px-4">
        <FadeIn className="text-center max-w-2xl mx-auto mb-10 md:mb-16">
          <Badge variant="outline" className="mb-4 text-primary border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold tracking-widest uppercase rounded-full">
            Testimonials
          </Badge>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
            Loved by <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Thousands</span>
          </h2>
          <p className="text-lg text-muted-foreground">Hear what our travelers have to say about their unforgettable journeys with us.</p>
        </FadeIn>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
        <Carousel
          opts={{
            align: "center",
            loop: true,
          }}
          plugins={[Autoplay({ delay: 5000 })]}
          className="w-full max-w-6xl mx-auto"
        >
          <CarouselContent className="-ml-4 md:-ml-8">
            {testimonials.map((q) => (
              <CarouselItem key={q.id} className="pl-4 md:pl-8 sm:basis-1/2 lg:basis-1/3">
                <Card className="h-full border-none shadow-xl bg-white dark:bg-background rounded-[2rem] relative overflow-visible mt-8 mx-2 transition-transform duration-300 hover:-translate-y-2">
                  <div className="absolute -top-8 left-8 h-16 w-16 rounded-full border-4 border-slate-50 dark:border-slate-900 overflow-hidden shadow-lg z-10 bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">{getInitials(q.name)}</span>
                  </div>
                  <CardContent className="pt-12 pb-8 px-8 flex flex-col h-full">
                    <div className="flex gap-1 text-amber-500 mb-6">
                      {[...Array(q.rating)].map((_, idx) => <Star key={idx} className="h-4 w-4 fill-current" />)}
                    </div>
                    <p className="text-base text-muted-foreground leading-relaxed mb-8 whitespace-pre-line h-48 overflow-y-auto pr-2">&quot;{q.text}&quot;</p>
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
        </motion.div>
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
    <section id="book" className="container mx-auto px-4 py-8 lg:py-16 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative rounded-[2rem] md:rounded-[3rem] overflow-hidden"
      >
        <div className="absolute inset-0">
          <Image src={marketingImageUrl("1500530855697-b586d89ba3ee")} alt="Sunset wing view" fill sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-primary/90 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
        </div>

        <div className="relative z-10 p-6 md:p-12 lg:p-16 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
          <FadeIn className="max-w-2xl">
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 md:mb-4 leading-tight">{tCta('title')}</h3>
            <p className="text-lg md:text-xl text-white/90">{tCta('subtitle')}</p>
          </FadeIn>
          <FadeIn delay={0.2} className="flex-shrink-0 w-full md:w-auto mt-4 md:mt-0">
            <Button
              size="lg"
              onClick={handleClick}
              className="cursor-pointer w-full md:w-auto h-14 md:h-16 px-8 md:px-10 rounded-full text-base md:text-lg bg-white text-primary hover:bg-white/90 font-bold shadow-2xl"
            >
              {tCta('button')}
            </Button>
          </FadeIn>
        </div>
      </motion.div>
    </section>
  );
}


