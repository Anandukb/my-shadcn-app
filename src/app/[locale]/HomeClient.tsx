"use client";

// -----------------------------------------------------------------------------
// Homepage.
//
// Priorities, in order: read the content, understand the offer, act. Layout is
// light and calm — one soft teal accent, warm sand bands, generous whitespace —
// with motion used to guide attention rather than to perform.
//
// The one showpiece is <ServiceSequence>: a scroll-pinned panel where the
// services advance as you scroll, which explains six offerings in the space of
// one screen. It falls back to a plain stacked list below lg, where pinning
// fights the user's scroll.
// -----------------------------------------------------------------------------

import React, { useCallback, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight, ArrowUpRight, Clock, MapPin,
  Plane, Hotel, Ship, Stethoscope, Umbrella, FileCheck2, ShieldCheck,
  Star, Quote, MessageSquare, CalendarCheck, CalendarDays, Users, Minus, Plus, Search,
} from "lucide-react";


import { Reveal, RevealGroup, RevealItem, CountUp, Marquee } from "@/components/ui/scroll";
import { Tilt3D, PointerGlow, MeshGradient, ScrollStage, coverflowStyle, useSectionProgress } from "@/components/ui/depth";
import { PaymentBanner } from "@/components/sections/PaymentBanner";
import { VisaBanner } from "@/components/sections/VisaBanner";
import { useBookNow } from "@/components/layout/BookNowDialog";
import { marketingImageUrl } from "@/lib/marketing-images";
import { cn } from "@/lib/utils";
import type { Package } from "@/types/package";
import type { Testimonial } from "@/lib/testimonials/types";

const AVATAR_PHOTO_IDS = [
  "1438761681033-6461ffad8d80",
  "1500648767791-00dcc994a43e",
  "1494790108377-be9c29b29330",
];

export function HomeClient({
  packages,
  testimonials,
}: {
  packages: Package[];
  testimonials: Testimonial[];
}) {
  return (
    <main className="page-ground overflow-x-clip text-on-page">
      <Hero />
      <TrustStrip />
      <ServiceSequence />
      <Destinations />
      <FeaturedPackages packages={packages} />
      <VisaBanner />
      <HowItWorks />
      <ProofBand />
      <Testimonials testimonials={testimonials} />
      <CtaSection />
      <PaymentBanner />
    </main>
  );
}

// -----------------------------------------------------------------------------
// Shared furniture
// -----------------------------------------------------------------------------

const SHELL = "mx-auto w-full max-w-[82rem] px-5 sm:px-8 lg:px-12";

/**
 * Every section opens the same way — a short teal kicker, a sentence-case
 * heading, then one line of explanation. Predictable entry points are what let
 * someone skim the page and still understand it.
 */
function SectionHead({
  kicker,
  title,
  lede,
  align = "start",
  action,
  onBand = false,
}: {
  kicker: string;
  title: React.ReactNode;
  lede?: string;
  align?: "start" | "center";
  action?: React.ReactNode;
  onBand?: boolean;
}) {
  const centered = align === "center";

  return (
    <div
      className={cn(
        "mb-10 flex flex-col gap-5 md:mb-14",
        centered ? "items-center text-center" : "md:flex-row md:items-end md:justify-between",
      )}
    >
      <Reveal className={cn(centered && "flex flex-col items-center")}>
        <span className={cn("kicker mb-4 block", onBand ? "text-white/60" : "text-brand-ink")}>
          {kicker}
        </span>
        <h2
          className={cn(
            "display text-[2rem] sm:text-4xl lg:text-[2.75rem]",
            onBand ? "text-on-band" : "text-on-page",
          )}
        >
          {title}
        </h2>
        {lede && (
          <p
            className={cn(
              "measure mt-4 text-base leading-relaxed sm:text-lg",
              centered && "mx-auto",
              onBand ? "text-white/70" : "text-on-page-muted",
            )}
          >
            {lede}
          </p>
        )}
      </Reveal>

      {action && (
        <Reveal delay={0.12} className="shrink-0">
          {action}
        </Reveal>
      )}
    </div>
  );
}

/** Solid teal action. One per section at most. */
function PrimaryLink({
  href,
  onClick,
  children,
  className,
}: {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  const inner = (
    <>
      {children}
      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
    </>
  );
  const base = cn(
    "group inline-flex h-12 items-center justify-center gap-2.5 rounded-full bg-brand px-7 text-sm font-semibold text-on-brand shadow-sm transition-all duration-300 hover:brightness-110 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={base}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cn(base, "cursor-pointer")}>
      {inner}
    </button>
  );
}

/** Quiet outlined action. */
function GhostLink({
  href,
  children,
  onBand = false,
}: {
  href: string;
  children: React.ReactNode;
  onBand?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex h-12 items-center gap-2.5 rounded-full border px-6 text-sm font-semibold transition-colors duration-300",
        onBand
          ? "border-white/25 text-on-band hover:border-white/60 hover:bg-white/10"
          : "border-line-strong text-on-page hover:border-brand hover:bg-brand-soft hover:text-brand-ink",
      )}
    >
      {children}
      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
    </Link>
  );
}

// -----------------------------------------------------------------------------
// Hero
// -----------------------------------------------------------------------------

function Hero() {
  const t = useTranslations("hp.hero");
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const progress = useSectionProgress(ref);

  const stats = [
    { value: 4000, suffix: "+", label: t("statTravellers") },
    { value: 40, suffix: "+", label: t("statDestinations") },
    { value: 10, suffix: "+", label: t("statYears") },
  ];

  // Small cards that float at different depths around the main photo.
  const chips = [
    { photo: "1530053969600-caed2596d242", z: 60, cls: "-left-6 top-[14%] sm:-left-10" },
    { photo: "1505761671935-60b3a7427bad", z: 90, cls: "-right-4 bottom-[22%] sm:-right-8" },
  ];

  return (
    <section ref={ref} className="relative isolate overflow-hidden">
      {/* Five vivid blooms on independent drift paths, each answering the
          pointer with its own weight. Colour is concentrated here rather than
          spread across every section, which is what keeps the rest calm. */}
      <MeshGradient className="-z-10" />
      <PointerGlow size={620} color="var(--mesh-1)" strength={0.2} />

      {/* Reading scrim.
          The mesh is vivid enough that body copy and links fall below 4.5:1
          over the strongest blooms (measured 3.25-3.84). This lifts only the
          column the text sits in and fades out before the imagery, so the
          colour stays saturated where nothing has to be read. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 start-0 -z-10 w-full rtl:[transform:scaleX(-1)] lg:w-[62%]"
        style={{
          background:
            "linear-gradient(to right, color-mix(in oklab, var(--page) 88%, transparent) 0%, color-mix(in oklab, var(--page) 72%, transparent) 45%, transparent 100%)",
        }}
      />

      <div className={cn(SHELL, "relative z-10 grid items-center gap-14 py-16 lg:grid-cols-[1.02fr_1fr] lg:gap-14 lg:py-24")}>
        {/* ---- Copy ---- */}
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 px-3.5 py-1.5 text-xs font-semibold text-brand-ink shadow-sm backdrop-blur-sm">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand" />
              </span>
              {t("badge")}
            </span>
          </Reveal>

          <Reveal delay={0.08}>
            <h1 className="display mt-6 text-[2.6rem] text-on-page sm:text-[3.4rem] lg:text-[4rem]">
              {t("title")}{" "}
              <span className="relative inline-block whitespace-nowrap">
                <span className="relative z-10 bg-gradient-to-r from-brand-ink to-accent-ink bg-clip-text text-transparent">
                  {t("titleAccent")}
                </span>
                {/* Soft highlight sweep behind the accent words */}
                <span
                  aria-hidden
                  className="absolute inset-x-[-4%] bottom-[6%] -z-0 h-[38%] rounded-full opacity-70"
                  style={{ background: "linear-gradient(90deg, var(--brand-soft), var(--accent-soft))" }}
                />
              </span>
            </h1>
          </Reveal>

          <Reveal delay={0.14}>
            <p className="measure mt-6 text-lg leading-relaxed text-on-page-muted">{t("lede")}</p>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <PrimaryLink href="/holiday-packages">{t("ctaPrimary")}</PrimaryLink>
              <GhostLink href="/contact">{t("ctaSecondary")}</GhostLink>
            </div>
          </Reveal>

          {/* ---- Inline proof, one accent hue each ---- */}
          <RevealGroup delay={0.28} className="mt-12 grid grid-cols-3 gap-4 border-t border-line pt-8">
            {stats.map((s) => (
              <RevealItem key={s.label}>
                <div className="display text-2xl text-on-page sm:text-3xl">
                  <CountUp to={s.value} suffix={s.suffix} />
                </div>
                <div className="mt-1.5 text-xs leading-snug text-on-page-faint sm:text-sm">
                  {s.label}
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>

        {/* ---- 3D photo composition ---- */}
        <Reveal direction="left" delay={0.1} className="relative">
          <Tilt3D max={9} lift={26}>
            <div className="relative aspect-[4/5] w-full sm:aspect-[5/4] lg:aspect-[4/5]">
              {/* Main plate */}
              <div className="absolute inset-0 overflow-hidden rounded-hero shadow-2xl">
                <div
                  className="absolute inset-0 h-[112%] will-change-transform"
                  style={{ transform: `translate3d(0, ${reduced ? 0 : progress * 9}%, 0)` }}
                >
                  <Image
                    src={marketingImageUrl("1573843981267-be1999ff37cd")}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 45vw, 100vw"
                    className="object-cover"
                    priority
                  />
                </div>
              </div>

              {/* Floating plates, pushed further toward the viewer in Z so the
                  composition gains real depth as the group tilts. */}
              {chips.map((c) => (
                <div
                  key={c.photo}
                  aria-hidden
                  className={cn("absolute hidden w-28 overflow-hidden rounded-2xl border-4 border-surface shadow-xl sm:block lg:w-32", c.cls)}
                  style={{ transform: `translateZ(${c.z}px)` }}
                >
                  <div className="relative aspect-square">
                    <Image src={marketingImageUrl(c.photo)} alt="" fill sizes="128px" className="object-cover" />
                  </div>
                </div>
              ))}
            </div>
          </Tilt3D>

          {/* Rating card — outside the tilt so it stays flat and readable */}
          <div className="absolute -bottom-4 start-2 z-20 rounded-panel border border-line bg-surface p-4 shadow-lg sm:start-6">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2 rtl:space-x-reverse">
                {AVATAR_PHOTO_IDS.map((id) => (
                  <span key={id} className="relative h-8 w-8 overflow-hidden rounded-full ring-2 ring-surface">
                    <Image src={marketingImageUrl(id)} alt="" width={32} height={32} className="h-full w-full object-cover" />
                  </span>
                ))}
              </div>
              <div>
                <div className="flex gap-0.5 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <p className="mt-0.5 text-xs font-medium text-on-page-muted">{t("ratingNote")}</p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      <HeroPlanner />
    </section>
  );
}

/**
 * The floating "plan your journey" widget.
 *
 * Glassmorphism card that overlaps the hero/next-section boundary, so it
 * reads as part of the scene rather than a bolted-on form. Submitting opens
 * the existing Book Now dialog pre-filled with the destination and date —
 * this reuses the real enquiry pipeline instead of inventing a parallel one.
 */
function HeroPlanner() {
  const t = useTranslations("hp.planner");
  const { open: openBookNow } = useBookNow();
  const [destination, setDestination] = useState("");
  const [travelDate, setTravelDate] = useState("");
  const [travelers, setTravelers] = useState(2);

  const destinations = ["Maldives", "Istanbul", "Georgia", "Baku", "Phuket", "Dubai"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    openBookNow({ destination: destination || undefined, travelDate: travelDate || undefined });
  };

  return (
    <Reveal delay={0.32} className="relative z-20">
      <div className={cn(SHELL, "relative")}>
        <form
          onSubmit={handleSubmit}
          className="relative -mb-10 rounded-hero border border-line bg-surface/70 p-3 shadow-2xl backdrop-blur-xl sm:-mb-12 sm:p-4 lg:-mb-16"
        >
          <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr_auto] lg:items-end lg:gap-2">
            {/* Destination */}
            <label className="block rounded-panel px-4 py-3 transition-colors hover:bg-tint lg:border-e lg:border-line">
              <span className="kicker mb-1.5 flex items-center gap-1.5 text-on-page-faint">
                <MapPin className="h-3 w-3" />
                {t("destinationLabel")}
              </span>
              <input
                list="hero-planner-destinations"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder={t("destinationPlaceholder")}
                className="w-full bg-transparent text-[15px] font-semibold text-on-page outline-none placeholder:font-normal placeholder:text-on-page-faint"
              />
              <datalist id="hero-planner-destinations">
                {destinations.map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
            </label>

            {/* Dates */}
            <label className="block rounded-panel px-4 py-3 transition-colors hover:bg-tint lg:border-e lg:border-line">
              <span className="kicker mb-1.5 flex items-center gap-1.5 text-on-page-faint">
                <CalendarDays className="h-3 w-3" />
                {t("datesLabel")}
              </span>
              <input
                type="date"
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
                className="w-full bg-transparent text-[15px] font-semibold text-on-page outline-none [color-scheme:light]"
              />
            </label>

            {/* Travellers */}
            <div className="rounded-panel px-4 py-3">
              <span className="kicker mb-1.5 flex items-center gap-1.5 text-on-page-faint">
                <Users className="h-3 w-3" />
                {t("travelersLabel")}
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setTravelers((n) => Math.max(1, n - 1))}
                  aria-label="Decrease travellers"
                  className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full border border-line-strong text-on-page-muted transition-colors hover:border-brand hover:text-brand-ink"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="min-w-[6.5rem] text-[15px] font-semibold text-on-page">
                  {travelers === 1 ? t("travelersOne") : t("travelersMany", { count: travelers })}
                </span>
                <button
                  type="button"
                  onClick={() => setTravelers((n) => Math.min(20, n + 1))}
                  aria-label="Increase travellers"
                  className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full border border-line-strong text-on-page-muted transition-colors hover:border-brand hover:text-brand-ink"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="group inline-flex h-14 cursor-pointer items-center justify-center gap-2 rounded-full bg-brand px-7 text-sm font-bold text-on-brand shadow-md transition-all duration-300 hover:brightness-110 hover:shadow-lg lg:mb-0"
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">{t("submit")}</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
            </button>
          </div>
        </form>
      </div>
    </Reveal>
  );
}

// -----------------------------------------------------------------------------
// Trust strip
// -----------------------------------------------------------------------------

function TrustStrip() {
  const t = useTranslations("hp.trust");
  const items = [t("a"), t("b"), t("c"), t("d"), t("e"), t("f")];

  return (
    <section className="border-y border-line bg-surface-alt pb-4 pt-14 sm:pt-16 lg:pt-20">
      {/* Extra top padding clears the floating planner card, which overlaps
          down from the hero above via negative margin. */}
      <Marquee speed={48}>
        {items.map((label) => (
          <span key={label} className="flex items-center">
            <span className="whitespace-nowrap px-7 text-sm font-medium text-on-page-muted">
              {label}
            </span>
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand/40" />
          </span>
        ))}
      </Marquee>
    </section>
  );
}

// -----------------------------------------------------------------------------
// Services — scroll-pinned sequence
// -----------------------------------------------------------------------------

function useServices() {
  const t = useTranslations("services_home");
  const tp = useTranslations("hp.services.panels");
  // Order matches how a trip is actually planned — get there, stay somewhere,
  // shape the holiday, then the add-ons — rather than an alphabetical list.
  return useMemo(
    () => [
      { key: "flights", title: t("flights"), desc: t("flightsDesc"), icon: Plane, to: "", image: marketingImageUrl("1500530855697-b586d89ba3ee"),
        panelHeading: tp("flights.heading"), panelDesc: tp("flights.desc"), panelCta: tp("flights.cta") },
      { key: "hotel", title: t("hotel"), desc: t("hotelDesc"), icon: Hotel, to: "/hotels", image: marketingImageUrl("1566073771259-6a8506099945"),
        panelHeading: tp("hotel.heading"), panelDesc: tp("hotel.desc"), panelCta: tp("hotel.cta") },
      { key: "holidays", title: t("holidays"), desc: t("holidaysDesc"), icon: Umbrella, to: "/packages", image: marketingImageUrl("1436491865332-7a61a109cc05"),
        panelHeading: tp("holidays.heading"), panelDesc: tp("holidays.desc"), panelCta: tp("holidays.cta") },
      { key: "cruise", title: t("cruise"), desc: t("cruiseDesc"), icon: Ship, to: "", image: marketingImageUrl("1548574505-5e239809ee19"),
        panelHeading: tp("cruise.heading"), panelDesc: tp("cruise.desc"), panelCta: tp("cruise.cta") },
      { key: "visa", title: t("visa"), desc: t("visaDesc"), icon: FileCheck2, to: "/global-visa", image: marketingImageUrl("1569098644584-210bcd375b59"),
        panelHeading: tp("visa.heading"), panelDesc: tp("visa.desc"), panelCta: tp("visa.cta") },
      { key: "insurance", title: t("insurance"), desc: t("insuranceDesc"), icon: ShieldCheck, to: "", image: marketingImageUrl("1454165804606-c3d57bc86b40"),
        panelHeading: tp("insurance.heading"), panelDesc: tp("insurance.desc"), panelCta: tp("insurance.cta") },
    ],
    [t, tp],
  );
}

function ServiceSequence() {
  const t = useTranslations("hp.services");
  const services = useServices();

  return (
    <section className="py-[var(--bay)] lg:py-0">
      {/* Mobile / tablet: a plain stacked list. Pinning a section on a short
          screen hijacks the scroll and makes the content harder to reach, so
          the effect is desktop-only by design. */}
      <div className={cn(SHELL, "lg:hidden")}>
        <SectionHead kicker={t("kicker")} title={t("title")} lede={t("lede")} />
        <RevealGroup className="grid gap-4 sm:grid-cols-2">
          {services.map((s) => (
            <RevealItem key={s.key}>
              <ServiceCard service={s} />
            </RevealItem>
          ))}
        </RevealGroup>
      </div>

      <div className="hidden lg:block">
        <PinnedServices services={services} />
      </div>
    </section>
  );
}

type Service = ReturnType<typeof useServices>[number];

function ServiceCard({ service }: { service: Service }) {
  const t = useTranslations("hp.services");
  const { open: openBookNow } = useBookNow();
  const Icon = service.icon;
  const body = (
    <>
      <div className="relative mb-5 h-40 overflow-hidden rounded-card">
        <Image
          src={service.image}
          alt=""
          fill
          sizes="(min-width: 640px) 45vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
      </div>
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-ink">
          <Icon className="h-5 w-5" />
        </span>
        <h3 className="text-lg font-semibold text-on-page">{service.title}</h3>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-on-page-muted">{service.desc}</p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-ink">
        {service.to ? t("discover") : t("enquire")}
        <ArrowUpRight className="h-4 w-4" />
      </span>
    </>
  );

  const className =
    "group block h-full w-full rounded-panel border border-line bg-surface p-4 text-start transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lg";

  // Flights, cruise and insurance have no landing page yet, so they open the
  // shared enquiry dialog rather than linking nowhere.
  return service.to ? (
    <Link href={service.to} className={className}>
      {body}
    </Link>
  ) : (
    <button type="button" onClick={() => openBookNow()} className={cn(className, "cursor-pointer")}>
      {body}
    </button>
  );
}

/**
 * The showpiece: a tall spacer whose inner panel is sticky, so the section
 * holds the viewport while the service list advances. Scroll progress maps
 * straight to an index — no scroll hijacking, no libraries; the user's own
 * scrolling drives it and they can leave at any time.
 */
function PinnedServices({ services }: { services: Service[] }) {
  const t = useTranslations("hp.services");
  const { open: openBookNow } = useBookNow();
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [{ index, progress }, setState] = useState({ index: 0, progress: 0 });

  // Driven by a passive scroll listener rather than framer's useScroll.
  // useScroll publishes its updates inside a requestAnimationFrame loop, which
  // browsers suspend in background tabs — the panel would then sit frozen on
  // the first service. A scroll listener plus one getBoundingClientRect is
  // cheap, synchronous, and always reflects the real position.
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let queued = false;

    const measure = () => {
      queued = false;
      const rect = el.getBoundingClientRect();
      // Distance the section travels while its inner panel stays pinned.
      const travel = rect.height - window.innerHeight;
      if (travel <= 0) return;

      const raw = -rect.top / travel;
      const p = Math.min(1, Math.max(0, raw));
      // 0.999 keeps the final frame on the last item instead of overflowing.
      const i = Math.min(services.length - 1, Math.floor(p * services.length * 0.999));

      setState((prev) => (prev.index === i && Math.abs(prev.progress - p) < 0.005 ? prev : { index: i, progress: p }));
    };

    const onScroll = () => {
      if (queued) return;
      queued = true;
      // Coalesce bursts of scroll events without waiting on a frame.
      queueMicrotask(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [services.length]);

  /**
   * Jump straight to a service.
   *
   * Without this the only way to reach the sixth item is to scroll through the
   * five before it, which makes the list look interactive while behaving like
   * a progress readout. Landing mid-band (i + 0.5) keeps the target comfortably
   * inside its own range rather than on the boundary with its neighbour.
   */
  const goTo = React.useCallback(
    (i: number) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      if (travel <= 0) return;
      const top = window.scrollY + rect.top;
      const target = top + travel * ((i + 0.5) / services.length);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: target, behavior: reduce ? "auto" : "smooth" });
    },
    [services.length],
  );

  return (
    <div ref={ref} style={{ height: `${services.length * 60}vh` }} className="relative">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className={cn(SHELL, "grid w-full grid-cols-[1fr_1.05fr] items-center gap-16")}>
          {/* ---- Left: the list ---- */}
          <div>
            <span className="kicker mb-4 block text-brand-ink">{t("kicker")}</span>
            <h2 className="display text-4xl text-on-page xl:text-[2.75rem]">{t("title")}</h2>
            <p className="measure mt-4 text-lg leading-relaxed text-on-page-muted">{t("lede")}</p>

            <ul className="mt-10 space-y-1">
              {services.map((s, i) => {
                const isActive = i === index;
                const Icon = s.icon;
                return (
                  <li key={s.key}>
                    <button
                      type="button"
                      onClick={() => goTo(i)}
                      aria-current={isActive ? "true" : undefined}
                      className={cn(
                        "flex w-full cursor-pointer items-center gap-4 rounded-xl px-3 py-3 text-start transition-all duration-500",
                        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                        isActive
                          ? "bg-brand-soft"
                          : "opacity-55 hover:bg-tint hover:opacity-100",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-500",
                          isActive ? "bg-brand text-on-brand" : "bg-tint text-on-page-muted",
                        )}
                      >
                        <Icon className="h-[18px] w-[18px]" />
                      </span>
                      <span
                        className={cn(
                          "text-base font-semibold transition-colors duration-500",
                          isActive ? "text-brand-ink" : "text-on-page",
                        )}
                      >
                        {s.title}
                      </span>
                      <span className="ms-auto font-mono text-xs tabular-nums text-on-page-faint">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Progress rail, so the pin has a visible end point */}
            <div className="mt-8 h-0.5 w-full overflow-hidden rounded-full bg-line">
              <div
                className="h-full origin-left rounded-full bg-brand transition-transform duration-150 ease-out rtl:origin-right"
                style={{ transform: `scaleX(${reduced ? 1 : progress})` }}
              />
            </div>
          </div>

          {/* ---- Right: the panel ---- */}
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-hero border border-line bg-surface">
            {services.map((s, i) => {
              const isActive = i === index;
              return (
                <div
                  key={s.key}
                  aria-hidden={!isActive}
                  className={cn(
                    "absolute inset-0 transition-opacity duration-500",
                    isActive ? "opacity-100" : "pointer-events-none opacity-0",
                  )}
                >
                  <Image src={s.image} alt={s.title} fill sizes="50vw" className="object-cover" />
                  {/* Bottom scrim only — enough for the caption, image stays open */}
                  <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                  <div className="absolute inset-x-0 bottom-0 p-8">
                    {/* Panel copy is the cinematic headline for this service
                        (e.g. "Fly somewhere unforgettable"), distinct from the
                        short label used in the list on the left and in the
                        enquiry dialog. */}
                    <h3 className="display text-3xl text-white lg:text-4xl">{s.panelHeading}</h3>
                    <p className="measure mt-3 text-[15px] leading-relaxed text-white/85">{s.panelDesc}</p>
                    {s.to ? (
                      <Link
                        href={s.to}
                        tabIndex={isActive ? 0 : -1}
                        className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 transition-colors hover:bg-white/90"
                      >
                        {s.panelCta}
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openBookNow()}
                        tabIndex={isActive ? 0 : -1}
                        className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 transition-colors hover:bg-white/90"
                      >
                        {s.panelCta}
                        <ArrowUpRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Destinations
// -----------------------------------------------------------------------------

function Destinations() {
  const t = useTranslations("destinations");
  const tHp = useTranslations("hp");

  const items = [
    { title: "Maldives", tag: tHp("tags.beach"), image: marketingImageUrl("1500375592092-40eb2168fd21") },
    { title: "Istanbul", tag: tHp("tags.culture"), image: marketingImageUrl("1530053969600-caed2596d242") },
    { title: "Georgia", tag: tHp("tags.mountains"), image: marketingImageUrl("1512446816042-444d641267d4") },
    { title: "Baku", tag: tHp("tags.city"), image: marketingImageUrl("1588166524941-3bf61a9c41db") },
    { title: "Phuket", tag: tHp("tags.island"), image: marketingImageUrl("1505761671935-60b3a7427bad") },
  ];

  return (
    <section id="destinations" className="bg-surface-alt">
      {/* Mobile keeps a plain grid: a pinned 3D stage on a phone eats the
          scroll and the cards end up too small to read. */}
      <div className={cn(SHELL, "py-[var(--bay)] lg:hidden")}>
        <SectionHead
          kicker={tHp("destinations.kicker")}
          title={tHp("destinations.title")}
          lede={t("subtitle")}
          action={<GhostLink href="/packages">{t("viewAll")}</GhostLink>}
        />
        <RevealGroup className="grid grid-cols-2 gap-4">
          {items.map((item, i) => (
            <RevealItem key={item.title} className={cn(i === 0 && "col-span-2")}>
              <DestinationCard item={item} tall={i === 0} />
            </RevealItem>
          ))}
        </RevealGroup>
      </div>

      <div className="hidden lg:block">
        <DestinationCoverflow items={items} />
      </div>
    </section>
  );
}

type Destination = { title: string; tag: string; image: string };

function DestinationCard({ item, tall = false }: { item: Destination; tall?: boolean }) {
  return (
    <Link
      href="/packages"
      className={cn(
        "group relative block w-full overflow-hidden rounded-panel",
        tall ? "aspect-[16/10]" : "aspect-[4/5]",
      )}
    >
      <Image
        src={item.image}
        alt={item.title}
        fill
        sizes="(min-width: 640px) 50vw, 100vw"
        className="object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5">
        <span className="kicker mb-1.5 block text-white/75">{item.tag}</span>
        <h3 className="display text-xl text-white">{item.title}</h3>
      </div>
    </Link>
  );
}

/**
 * 3D coverflow: the page pins and scrolling rotates the deck through depth
 * rather than moving the document. Every card's position, rotation, scale and
 * fade derives from one number — its signed distance from the active index.
 */
function DestinationCoverflow({ items }: { items: Destination[] }) {
  const t = useTranslations("destinations");
  const tHp = useTranslations("hp");
  const reduced = useReducedMotion();
  const dir: 1 | -1 = useLocale() === "ar" ? -1 : 1;

  return (
    <ScrollStage pages={items.length * 0.85}>
      {(progress) => {
        // Continuous, so cards glide between slots instead of snapping.
        const active = progress * (items.length - 1);
        const nearest = Math.round(active);

        return (
          <div className="relative w-full">
            <div className={cn(SHELL, "pointer-events-none absolute inset-x-0 top-10 z-[200]")}>
              <span className="kicker mb-3 block text-brand-ink">{tHp("destinations.kicker")}</span>
              <h2 className="display max-w-xl text-4xl text-on-page">{tHp("destinations.title")}</h2>
            </div>

            {/* The stage. Perspective on the parent is what turns the child
                translateZ values into actual depth. */}
            <div
              className="relative flex h-[34rem] w-full items-center justify-center"
              style={{ perspective: "1600px" }}
            >
              <div className="relative h-full w-full" style={{ transformStyle: "preserve-3d" }}>
                {items.map((item, i) => {
                  const offset = reduced ? 0 : i - active;
                  const style = reduced
                    ? { opacity: i === 0 ? 1 : 0, zIndex: i === 0 ? 100 : 0 }
                    : coverflowStyle(offset, { spacing: 360, depth: 300, angle: 40, dir });
                  const isActive = Math.abs(offset) < 0.5;

                  return (
                    <div
                      key={item.title}
                      className="absolute left-1/2 top-1/2 h-[30rem] w-[22rem] -translate-x-1/2 -translate-y-1/2 will-change-transform"
                      style={{ ...style, transformStyle: "preserve-3d" }}
                    >
                      <Link
                        href="/packages"
                        tabIndex={isActive ? 0 : -1}
                        aria-hidden={!isActive}
                        className="group relative block h-full w-full overflow-hidden rounded-hero shadow-2xl"
                      >
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="22rem"
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                        <span className="absolute start-6 top-6 font-mono text-xs tabular-nums text-white/70">
                          {String(i + 1).padStart(2, "0")}
                        </span>

                        <div className="absolute inset-x-0 bottom-0 p-7">
                          <span className="kicker mb-2 block text-white/75">{item.tag}</span>
                          <h3 className="display text-3xl text-white">{item.title}</h3>
                          <span
                            className={cn(
                              "mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white transition-opacity duration-500",
                              isActive ? "opacity-100" : "opacity-0",
                            )}
                          >
                            {tHp("destinations.explore")}
                            <ArrowUpRight className="h-4 w-4" />
                          </span>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Position readout + progress */}
            <div className={cn(SHELL, "absolute inset-x-0 bottom-10 z-[200]")}>
              <div className="flex items-center gap-5">
                <span className="font-mono text-sm tabular-nums text-on-page">
                  {String(Math.min(items.length, nearest + 1)).padStart(2, "0")}
                  <span className="mx-1.5 text-on-page-faint">/</span>
                  <span className="text-on-page-faint">{String(items.length).padStart(2, "0")}</span>
                </span>
                <div className="h-0.5 flex-1 overflow-hidden rounded-full bg-line">
                  <div
                    className="h-full origin-left rounded-full bg-brand rtl:origin-right"
                    style={{ transform: `scaleX(${reduced ? 1 : progress})` }}
                  />
                </div>
                <GhostLink href="/packages">{t("viewAll")}</GhostLink>
              </div>
            </div>
          </div>
        );
      }}
    </ScrollStage>
  );
}

// -----------------------------------------------------------------------------
// Featured packages
// -----------------------------------------------------------------------------

const TABS = [
  { value: "holidays", icon: Plane },
  { value: "cruise", icon: Ship },
  { value: "medical", icon: Stethoscope },
] as const;

function FeaturedPackages({ packages }: { packages: Package[] }) {
  const tPkg = useTranslations("packages");
  const tHp = useTranslations("hp");
  const [tab, setTab] = useState<string>("holidays");

  const groups: Record<string, Package[]> = useMemo(() => {
    const pick = (c: string) => packages.filter((p) => p.category === c && p.featured).slice(0, 6);
    return { holidays: pick("holidays"), cruise: pick("cruise"), medical: pick("medical") };
  }, [packages]);

  const visible = groups[tab] ?? [];

  return (
    <section id="packages" className="py-[var(--bay)] lg:py-[var(--bay-lg)]">
      <div className={SHELL}>
        <SectionHead
          kicker={tHp("packages.kicker")}
          title={tPkg("title")}
          lede={tPkg("subtitle")}
          action={<GhostLink href="/packages">{tPkg("viewAll")}</GhostLink>}
        />

        <Reveal className="mb-9">
          <div className="inline-flex flex-wrap gap-1 rounded-full border border-line bg-surface p-1">
            {TABS.map(({ value, icon: Icon }) => {
              const isActive = tab === value;
              const count = groups[value]?.length ?? 0;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTab(value)}
                  aria-pressed={isActive}
                  className={cn(
                    "relative flex cursor-pointer items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors duration-300",
                    isActive ? "text-on-brand" : "text-on-page-muted hover:text-on-page",
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="pkg-tab"
                      className="absolute inset-0 rounded-full bg-brand"
                      transition={{ type: "spring", stiffness: 340, damping: 32 }}
                    />
                  )}
                  <Icon className="relative z-10 h-4 w-4" />
                  <span className="relative z-10">{tHp(`packages.tabs.${value}`)}</span>
                  <span className="relative z-10 text-[11px] tabular-nums opacity-70">{count}</span>
                </button>
              );
            })}
          </div>
        </Reveal>

        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          {visible.length > 0 ? (
            <RevealGroup
              stagger={0.09}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              style={{ perspective: "1400px" }}
            >
              {visible.map((pkg) => (
                <RevealItem key={pkg.id} depth>
                  <PackageCard pkg={pkg} />
                </RevealItem>
              ))}
            </RevealGroup>
          ) : (
            <div className="rounded-panel border border-dashed border-line-strong py-16 text-center">
              <p className="text-on-page-muted">{tHp("packages.empty")}</p>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

/**
 * Flex-column card: image, then a body that grows, then a footer pinned to the
 * bottom. The previous version used a fixed height with two absolutely
 * positioned halves, which clipped any title longer than two lines.
 */
function PackageCard({ pkg }: { pkg: Package }) {
  const tPkg = useTranslations("packages");

  return (
    <Tilt3D className="h-full" max={6} lift={10}>
      <Link
        href={`/packages/${pkg.id}`}
        className="group flex h-full flex-col overflow-hidden rounded-panel border border-line bg-surface shadow-sm transition-shadow duration-300 hover:border-brand/40 hover:shadow-2xl"
      >
      <div className="relative aspect-[3/2] w-full overflow-hidden">
        <Image
          src={pkg.image}
          alt={pkg.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {pkg.duration && (
          <span className="absolute end-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-neutral-900 shadow-sm">
            <Clock className="h-3 w-3" />
            {pkg.duration}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center gap-2">
          {pkg.location && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-on-page-faint">
              <MapPin className="h-3.5 w-3.5 text-brand" />
              {pkg.location}
            </span>
          )}
          <span className="ms-auto inline-flex items-center gap-1 text-xs font-medium text-on-page-faint">
            {/* Real rating from the record — the old card hardcoded 4.9 */}
            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            {pkg.rating.toFixed(1)}
            {pkg.reviews > 0 && <span className="opacity-70">({pkg.reviews})</span>}
          </span>
        </div>

        <div className="mb-5">
          <h3 className="text-lg font-semibold leading-snug text-on-page transition-colors duration-300 group-hover:text-brand-ink">
            {pkg.title}
          </h3>
          {pkg.description && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-on-page-muted">
              {pkg.description}
            </p>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-4">
          {/* packages.from is the whole price string, not a label — it carries
              the currency and its position, which differs in Arabic. */}
          <span className="text-base font-bold text-on-page">
            {tPkg("from", { price: pkg.price.toLocaleString() })}
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-ink">
            {tPkg("viewDetails")}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
          </span>
        </div>
        </div>
      </Link>
    </Tilt3D>
  );
}

// -----------------------------------------------------------------------------
// How it works — three steps, so the offer is understood without reading prose
// -----------------------------------------------------------------------------

function HowItWorks() {
  const t = useTranslations("hp.steps");
  const ref = useRef<HTMLDivElement>(null);
  const progress = useSectionProgress(ref);
  const reduced = useReducedMotion();

  const steps = [
    { icon: MessageSquare, title: t("s1t"), desc: t("s1d") },
    { icon: CalendarCheck, title: t("s2t"), desc: t("s2d") },
    { icon: Plane, title: t("s3t"), desc: t("s3d") },
  ];

  return (
    <section className="bg-surface-alt py-[var(--bay)] lg:py-[var(--bay-lg)]">
      <div className={SHELL}>
        <SectionHead kicker={t("kicker")} title={t("title")} lede={t("lede")} align="center" />

        {/* Mobile: a plain sequence. Stacking needs vertical room to read. */}
        <RevealGroup className="grid gap-4 lg:hidden">
          {steps.map((s, i) => (
            <RevealItem key={s.title}>
              <StepCard step={s} index={i} />
            </RevealItem>
          ))}
        </RevealGroup>

        {/* Desktop: the cards stack. Each one sticks a little lower than the
            last and the ones underneath scale back, so the sequence physically
            builds up as you scroll instead of just scrolling past. */}
        <div
          ref={ref}
          className="relative hidden lg:block"
          style={{ height: `${steps.length * 75}vh`, perspective: "1400px" }}
        >
          {steps.map((s, i) => {
            // How far past this card's own slot we've scrolled, 0..1.
            const past = Math.max(0, Math.min(1, progress * steps.length - i));
            const scale = reduced ? 1 : 1 - past * 0.06;
            const dim = reduced ? 0 : past * 0.35;
            // Cards tip away from the viewer as they are covered, so the stack
            // reads as depth rather than as boxes shrinking in place.
            const tilt = reduced ? 0 : past * 7;
            return (
              <div
                key={s.title}
                className="sticky mx-auto w-full max-w-4xl"
                style={{ top: `${8 + i * 2.25}rem`, zIndex: i + 1 }}
              >
                <div
                  className="will-change-transform"
                  style={{
                    transform: `translateZ(${-past * 120}px) rotateX(${tilt}deg) scale(${scale})`,
                    transformOrigin: "50% 0%",
                    transformStyle: "preserve-3d",
                  }}
                >
                  <StepCard step={s} index={i} large dim={dim} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function StepCard({
  step,
  index,
  large = false,
  dim = 0,
}: {
  step: { icon: React.ElementType; title: string; desc: string };
  index: number;
  large?: boolean;
  dim?: number;
}) {
  const Icon = step.icon;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-panel border border-line bg-surface shadow-sm",
        large ? "p-10 lg:p-12" : "p-6",
      )}
    >
      {/* Brand wash in the corner keeps the stack from reading as plain boxes */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-70 blur-[60px]"
        style={{ background: "radial-gradient(circle, var(--brand-soft) 0%, transparent 70%)" }}
      />
      {/* Cards further down the stack are gently dimmed by the ones above */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[var(--on-page)] transition-opacity"
        style={{ opacity: dim * 0.16 }}
      />

      <div className={cn("relative flex gap-6", large ? "items-start" : "items-center")}>
        <span
          className={cn(
            "relative flex shrink-0 items-center justify-center rounded-2xl bg-brand text-on-brand",
            large ? "h-16 w-16" : "h-12 w-12",
          )}
        >
          <Icon className={large ? "h-7 w-7" : "h-5 w-5"} />
        </span>

        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-3">
            <span className="font-mono text-xs tabular-nums text-brand-ink">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="h-px w-8 bg-line-strong" />
          </div>
          <h3 className={cn("display text-on-page", large ? "text-3xl" : "text-lg")}>{step.title}</h3>
          <p className={cn("mt-3 leading-relaxed text-on-page-muted", large ? "text-base" : "text-sm")}>
            {step.desc}
          </p>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Proof band — the page's one strong contrast block
// -----------------------------------------------------------------------------

function ProofBand() {
  const t = useTranslations();
  const tHp = useTranslations("hp.band");

  const stats = [
    { value: 4000, suffix: "+", label: tHp("statTravellers") },
    { value: 98, suffix: "%", label: tHp("statSatisfaction") },
    { value: 40, suffix: "+", label: tHp("statDestinations") },
    { value: 10, suffix: "+", label: tHp("statYears") },
  ];

  return (
    <section id="about" className="relative isolate overflow-hidden bg-band py-[var(--bay)] text-on-band lg:py-[var(--bay-lg)]">
      {/* Depth on the dark band: two wide blooms plus a cursor-tracked light,
          so it reads as a lit surface rather than a flat rectangle. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-[10%] -top-[40%] h-[36rem] w-[36rem] rounded-full opacity-45 blur-[110px]"
        style={{ background: "radial-gradient(circle, var(--brand) 0%, transparent 70%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-[45%] right-[-8%] h-[32rem] w-[32rem] rounded-full opacity-40 blur-[110px]"
        style={{ background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)" }}
      />
      <PointerGlow size={520} color="var(--brand)" strength={0.18} />

      <div className={cn(SHELL, "relative z-10")}>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-20">
          <div>
            <SectionHead
              kicker={t("about_home.badge")}
              title={tHp("title")}
              lede={t("about_home.description", { strong: (c: string) => c } as never)}
              onBand
            />
            <Reveal delay={0.15}>
              <GhostLink href="/about" onBand>
                {t("about_home.button")}
              </GhostLink>
            </Reveal>
          </div>

          <RevealGroup className="grid grid-cols-2 gap-x-6 gap-y-10">
            {stats.map((s) => (
              <RevealItem key={s.label}>
                <div className="display text-4xl text-on-band sm:text-5xl">
                  <CountUp to={s.value} suffix={s.suffix} />
                </div>
                <div className="mt-2 text-sm leading-snug text-white/60">{s.label}</div>
                <div className="mt-4 h-px w-10 bg-brand" />
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}

// -----------------------------------------------------------------------------
// Testimonials
// -----------------------------------------------------------------------------

function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  const t = useTranslations("hp.testimonials");

  if (testimonials.length === 0) return null;

  return (
    <section className="bg-elevate">
      {/* Mobile: a marquee, which needs no pinning and stays readable. */}
      <div className="py-[var(--bay)] lg:hidden">
        <div className={cn(SHELL, "mb-10")}>
          <SectionHead kicker={t("kicker")} title={t("title")} lede={t("lede")} align="center" />
        </div>
        <Marquee speed={70}>
          {testimonials.map((q) => (
            <TestimonialCard key={q.id} q={q} />
          ))}
        </Marquee>
      </div>

      <div className="hidden lg:block">
        <TestimonialStage testimonials={testimonials} />
      </div>
    </section>
  );
}

/** Same coverflow mechanic as the destinations, tuned for text cards. */
function TestimonialStage({ testimonials }: { testimonials: Testimonial[] }) {
  const t = useTranslations("hp.testimonials");
  const reduced = useReducedMotion();
  const dir: 1 | -1 = useLocale() === "ar" ? -1 : 1;

  return (
    <ScrollStage pages={Math.max(2, testimonials.length * 0.7)}>
      {(progress) => {
        const active = progress * (testimonials.length - 1);
        const nearest = Math.round(active);

        return (
          <div className="relative w-full">
            <div className={cn(SHELL, "pointer-events-none absolute inset-x-0 top-10 z-[200] text-center")}>
              <span className="kicker mb-3 block text-brand-ink">{t("kicker")}</span>
              <h2 className="display text-4xl text-on-page">{t("title")}</h2>
            </div>

            <div
              className="relative flex h-[30rem] w-full items-center justify-center"
              style={{ perspective: "1500px" }}
            >
              <div className="relative h-full w-full" style={{ transformStyle: "preserve-3d" }}>
                {testimonials.map((q, i) => {
                  const offset = reduced ? 0 : i - active;
                  const style = reduced
                    ? { opacity: i === 0 ? 1 : 0, zIndex: i === 0 ? 100 : 0 }
                    : coverflowStyle(offset, { spacing: 400, depth: 240, angle: 32, dir });
                  const isActive = Math.abs(offset) < 0.5;

                  return (
                    <div
                      key={q.id}
                      aria-hidden={!isActive}
                      className="absolute left-1/2 top-1/2 w-[26rem] -translate-x-1/2 -translate-y-1/2 will-change-transform"
                      style={{ ...style, transformStyle: "preserve-3d" }}
                    >
                      <TestimonialCard q={q} flush />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={cn(SHELL, "absolute inset-x-0 bottom-10 z-[200]")}>
              <div className="mx-auto flex max-w-lg items-center gap-5">
                <span className="font-mono text-sm tabular-nums text-on-page">
                  {String(Math.min(testimonials.length, nearest + 1)).padStart(2, "0")}
                  <span className="mx-1.5 text-on-page-faint">/</span>
                  <span className="text-on-page-faint">{String(testimonials.length).padStart(2, "0")}</span>
                </span>
                <div className="h-0.5 flex-1 overflow-hidden rounded-full bg-line">
                  <div
                    className="h-full origin-left rounded-full bg-brand rtl:origin-right"
                    style={{ transform: `scaleX(${reduced ? 1 : progress})` }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      }}
    </ScrollStage>
  );
}

function TestimonialCard({ q, flush = false }: { q: Testimonial; flush?: boolean }) {
  const initials = q.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  return (
    <div className={cn(flush ? "w-full" : "mx-2.5 w-[21rem] shrink-0 sm:w-[24rem]")}>
      <figure className="flex h-full flex-col rounded-panel border border-line bg-surface p-7 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex gap-0.5 text-amber-500">
            {Array.from({ length: q.rating }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-current" />
            ))}
          </div>
          <Quote className="h-6 w-6 text-brand/25" strokeWidth={2} />
        </div>

        <blockquote className="mb-6 line-clamp-6 whitespace-pre-line text-[15px] leading-relaxed text-on-page-muted">
          {q.text}
        </blockquote>

        <figcaption className="mt-auto flex items-center gap-3 border-t border-line pt-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-brand-ink">
            {initials}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-semibold text-on-page">{q.name}</span>
            <span className="block truncate text-xs text-on-page-faint">{q.place}</span>
          </span>
        </figcaption>
      </figure>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Closing CTA
// -----------------------------------------------------------------------------

function CtaSection() {
  const tCta = useTranslations("cta");
  const tHp = useTranslations("hp.cta");
  const { open: openBookNow } = useBookNow();
  const handleClick = useCallback(() => openBookNow(), [openBookNow]);

  return (
    <section id="book" className="pb-[var(--bay)] lg:pb-[var(--bay-lg)]">
      <div className={SHELL}>
        <div className="relative overflow-hidden rounded-hero border border-line">
          <Image
            src={marketingImageUrl("1501785888041-af3ef285b470")}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/25 rtl:bg-gradient-to-l" />

          <div className="relative z-10 flex flex-col items-start gap-8 p-8 sm:p-12 lg:flex-row lg:items-center lg:justify-between lg:p-16">
            <Reveal>
              <span className="kicker mb-4 block text-white/60">{tHp("kicker")}</span>
              <h2 className="display max-w-2xl text-[2rem] text-white sm:text-4xl lg:text-[2.75rem]">
                {tCta("title")}
              </h2>
              <p className="measure mt-4 text-lg leading-relaxed text-white/75">{tCta("subtitle")}</p>
            </Reveal>

            <Reveal delay={0.12} className="shrink-0">
              <button
                type="button"
                onClick={handleClick}
                className="group inline-flex h-14 cursor-pointer items-center gap-2.5 rounded-full bg-white px-8 text-sm font-bold text-neutral-900 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
              >
                {tCta("button")}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
              </button>
              <p className="mt-3 text-center text-xs text-white/60">{tHp("note")}</p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
