"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { ArrowRight, ChevronDown, Compass, FileCheck2, MapPin, Ship, Users, type LucideIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/ui/motion";
import { marketingImageUrl } from "@/lib/marketing-images";
import { cn } from "@/lib/utils";

// How long each strength stays selected before the next one takes over.
const AUTOPLAY_MS = 6000;

const FEATURES: Array<{ key: "feature1" | "feature2" | "feature3" | "feature4"; icon: LucideIcon; image: string }> = [
  { key: "feature1", icon: Compass, image: "1501785888041-af3ef285b470" },
  { key: "feature2", icon: Ship, image: "1548574505-5e239809ee19" },
  { key: "feature3", icon: FileCheck2, image: "1569098644584-210bcd375b59" },
  { key: "feature4", icon: Users, image: "1539635278303-d4002c07eae3" },
];

export default function AboutShowcase() {
  const t = useTranslations("about_home");
  const tNav = useTranslations("nav");
  const reduce = useReducedMotion() ?? false;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const current = FEATURES[active];

  // Tilt the photo stage towards the pointer (fine pointers only; nothing happens on touch).
  const rotateXRaw = useMotionValue(0);
  const rotateYRaw = useMotionValue(0);
  const rotateX = useSpring(rotateXRaw, { stiffness: 140, damping: 18 });
  const rotateY = useSpring(rotateYRaw, { stiffness: 140, damping: 18 });
  const onStageMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    rotateYRaw.set(((e.clientX - r.left) / r.width - 0.5) * 12);
    rotateXRaw.set(-((e.clientY - r.top) / r.height - 0.5) * 12);
  };
  const resetTilt = () => {
    rotateXRaw.set(0);
    rotateYRaw.set(0);
  };

  const next = () => setActive((i) => (i + 1) % FEATURES.length);

  return (
    <section id="about" className="relative overflow-hidden bg-gradient-to-b from-white via-primary/[0.04] to-white dark:from-background dark:via-primary/[0.06] dark:to-background border-y border-border/5">
      <div className="pointer-events-none absolute -top-24 -end-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -start-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />

      <div className="container relative mx-auto px-4 py-14 lg:py-24">
        <div className="grid gap-x-16 gap-y-8 lg:grid-cols-12 lg:gap-y-8">

          {/* Heading */}
          <FadeIn direction="left" className="lg:col-span-6 lg:col-start-7 lg:row-start-1 lg:self-end">
            <Badge variant="outline" className="mb-4 rounded-full border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
              {t("badge")}
            </Badge>
            <h2 className="mb-4 text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              {t("titlePrefix")} <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">{t("titleHighlight")}</span> {t("titleSuffix")}
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t.rich("description", { strong: (chunks) => <strong className="text-foreground">{chunks}</strong> })}
            </p>
          </FadeIn>

          {/* Interactive photo stage */}
          <FadeIn direction="right" className="lg:col-span-6 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:h-full">
            <div className="relative h-full" style={{ perspective: 1200 }} onPointerMove={onStageMove} onPointerLeave={resetTilt}>
              <motion.div
                style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                className="relative h-[400px] overflow-hidden rounded-[2rem] shadow-2xl ring-1 ring-black/5 sm:h-[520px] lg:h-full lg:min-h-[560px]"
              >
                {FEATURES.map((f, i) => (
                  <motion.div
                    key={f.key}
                    initial={false}
                    animate={{ opacity: i === active ? 1 : 0, scale: i === active ? 1 : 1.12 }}
                    transition={{ duration: reduce ? 0 : 0.9, ease: "easeOut" }}
                    className="absolute inset-0"
                    aria-hidden={i !== active}
                  >
                    <Image
                      src={marketingImageUrl(f.image)}
                      alt={t(f.key)}
                      fill
                      sizes="(min-width: 1024px) 45vw, 100vw"
                      className="object-cover"
                    />
                  </motion.div>
                ))}
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-black/20" />

                {/* Location chip */}
                <div className="absolute start-4 top-4 flex items-center gap-2.5 rounded-2xl bg-white/90 py-2 pe-4 ps-2 shadow-lg backdrop-blur-md sm:start-6 sm:top-6 dark:bg-slate-900/85">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <span className="text-xs font-bold text-slate-900 sm:text-sm dark:text-white">{t("basedInQatar")}</span>
                </div>

                {/* What's showing */}
                <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 sm:inset-x-6 sm:bottom-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={current.key}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center gap-3 rounded-2xl bg-white/90 py-2.5 pe-5 ps-2.5 shadow-lg backdrop-blur-md dark:bg-slate-900/85"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
                        <current.icon className="h-5 w-5" />
                      </span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white sm:text-base">{t(current.key)}</span>
                    </motion.div>
                  </AnimatePresence>

                  {/* Dots: click to jump */}
                  <div className="flex gap-1.5 pb-2">
                    {FEATURES.map((f, i) => (
                      <button
                        key={f.key}
                        type="button"
                        aria-label={t(f.key)}
                        onClick={() => setActive(i)}
                        className={cn("h-2 rounded-full transition-all duration-300 cursor-pointer", i === active ? "w-7 bg-white" : "w-2 bg-white/50 hover:bg-white/80")}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>

            </div>
          </FadeIn>

          {/* Strengths, proof and calls to action */}
          <FadeIn direction="left" className="space-y-7 lg:col-span-6 lg:col-start-7 lg:row-start-2 lg:self-start">
            <div
              role="list"
              className={cn("space-y-2.5", paused && "about-paused")}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              onFocusCapture={() => setPaused(true)}
              onBlurCapture={() => setPaused(false)}
            >
              {FEATURES.map((f, i) => {
                const isActive = i === active;
                return (
                  <div
                    role="listitem"
                    key={f.key}
                    className={cn(
                      "relative overflow-hidden rounded-2xl border transition-all duration-300",
                      isActive ? "border-primary/30 bg-white shadow-lg shadow-primary/10 dark:bg-slate-900/60" : "border-border/10 bg-white/60 hover:border-primary/20 hover:bg-white dark:bg-slate-900/30",
                    )}
                  >
                    <button
                      type="button"
                      aria-expanded={isActive}
                      onClick={() => setActive(i)}
                      className="flex w-full cursor-pointer items-center gap-4 p-4 text-start"
                    >
                      <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors duration-300", isActive ? "bg-primary text-white" : "bg-primary/10 text-primary")}>
                        <f.icon className="h-5 w-5" />
                      </span>
                      <span className="flex-1 text-base font-bold sm:text-lg">{t(f.key)}</span>
                      <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform duration-300", isActive && "rotate-180 text-primary")} />
                    </button>

                    <AnimatePresence initial={false}>
                      {isActive && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className="overflow-hidden"
                        >
                          <p className="px-4 pb-5 ps-[4.75rem] text-sm leading-relaxed text-muted-foreground sm:text-base">{t(`${f.key}Desc`)}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Autoplay timer; restarts on every selection and pauses on hover */}
                    {isActive && (
                      <div className="absolute inset-x-0 bottom-0 h-[3px] bg-primary/10">
                        <div
                          key={active}
                          className="about-progress h-full origin-left bg-primary rtl:origin-right"
                          style={{ animationDuration: `${AUTOPLAY_MS}ms` }}
                          onAnimationEnd={next}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="group h-14 rounded-full px-8 text-base shadow-lg shadow-primary/20 transition-shadow hover:shadow-xl hover:shadow-primary/30">
                <Link href="/about">
                  {t("button")}
                  <ArrowRight className="ms-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5 rtl:rotate-180 rtl:group-hover:-translate-x-1.5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 rounded-full px-8 text-base">
                <Link href="/contact">{tNav("contact")}</Link>
              </Button>
            </div>
          </FadeIn>

        </div>
      </div>
    </section>
  );
}
