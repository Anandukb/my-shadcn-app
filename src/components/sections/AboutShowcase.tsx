"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, Compass, FileCheck2, MapPin, Ship, Users, type LucideIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/ui/motion";
import { marketingImageUrl } from "@/lib/marketing-images";
import { cn } from "@/lib/utils";

// How long each strength stays selected before the next one takes over.
const AUTOPLAY_MS = 4500;

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

  const next = () => setActive((i) => (i + 1) % FEATURES.length);

  return (
    <section id="about" className="relative overflow-hidden bg-gradient-to-b from-white via-primary/[0.04] to-white dark:from-background dark:via-primary/[0.06] dark:to-background border-y border-border/5">
      <div className="pointer-events-none absolute -top-16 -end-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -start-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

      <div className="container relative mx-auto px-4 py-10 lg:py-14">
        <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-10">

          {/* Interactive photo stage */}
          <FadeIn direction="right" className="lg:col-span-5">
            <div className="relative h-[280px] overflow-hidden rounded-[1.75rem] shadow-xl ring-1 ring-black/5 sm:h-[340px] lg:h-[400px]">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.key}
                  initial={false}
                  animate={{ opacity: i === active ? 1 : 0, scale: i === active ? 1 : 1.1 }}
                  transition={{ duration: reduce ? 0 : 0.8, ease: "easeOut" }}
                  className="absolute inset-0"
                  aria-hidden={i !== active}
                >
                  <Image src={marketingImageUrl(f.image)} alt={t(f.key)} fill sizes="(min-width: 1024px) 38vw, 100vw" className="object-cover" />
                </motion.div>
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-black/15" />

              <div className="absolute start-3 top-3 flex items-center gap-2 rounded-xl bg-white/90 py-1.5 pe-3 ps-1.5 shadow-md backdrop-blur-md sm:start-4 sm:top-4 dark:bg-slate-900/85">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MapPin className="h-3.5 w-3.5" />
                </span>
                <span className="text-[11px] font-bold text-slate-900 sm:text-xs dark:text-white">{t("basedInKerala")}</span>
              </div>

              <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2 sm:inset-x-4 sm:bottom-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-2 rounded-xl bg-white/90 py-2 pe-4 ps-2 shadow-md backdrop-blur-md dark:bg-slate-900/85"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
                      <current.icon className="h-4 w-4" />
                    </span>
                    <span className="text-xs font-bold text-slate-900 sm:text-sm dark:text-white">{t(current.key)}</span>
                  </motion.div>
                </AnimatePresence>

                <div className="flex gap-1.5 pb-1.5">
                  {FEATURES.map((f, i) => (
                    <button
                      key={f.key}
                      type="button"
                      aria-label={t(f.key)}
                      onClick={() => setActive(i)}
                      className={cn("h-1.5 rounded-full transition-all duration-300 cursor-pointer", i === active ? "w-5 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80")}
                    />
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Story, strengths and calls to action */}
          <FadeIn direction="left" className="space-y-4 lg:col-span-7">
            <div>
              <Badge variant="outline" className="mb-2.5 rounded-full border-primary/20 bg-primary/5 px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest text-primary">
                {t("badge")}
              </Badge>
              <h2 className="mb-2 text-2xl font-black leading-tight tracking-tight sm:text-3xl lg:text-[2.25rem]">
                {t("titlePrefix")} <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">{t("titleHighlight")}</span> {t("titleSuffix")}
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                {t.rich("description", { strong: (chunks) => <strong className="text-foreground">{chunks}</strong> })}
              </p>
            </div>

            <div
              role="list"
              className={cn("grid grid-cols-2 gap-2", paused && "about-paused")}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              onFocusCapture={() => setPaused(true)}
              onBlurCapture={() => setPaused(false)}
            >
              {FEATURES.map((f, i) => {
                const isActive = i === active;
                return (
                  <button
                    role="listitem"
                    type="button"
                    key={f.key}
                    onClick={() => setActive(i)}
                    className={cn(
                      "relative flex cursor-pointer items-center gap-2.5 overflow-hidden rounded-xl border p-2.5 text-start transition-colors duration-300",
                      isActive ? "border-primary/30 bg-white shadow-sm dark:bg-slate-900/60" : "border-border/10 bg-white/60 hover:border-primary/20 hover:bg-white dark:bg-slate-900/30",
                    )}
                  >
                    <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-300", isActive ? "bg-primary text-white" : "bg-primary/10 text-primary")}>
                      <f.icon className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-semibold leading-tight">{t(f.key)}</span>

                    {isActive && (
                      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-primary/10">
                        <div
                          key={active}
                          className="about-progress h-full origin-left bg-primary rtl:origin-right"
                          style={{ animationDuration: `${AUTOPLAY_MS}ms` }}
                          onAnimationEnd={next}
                        />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <Button asChild className="group h-10 rounded-full px-5 text-sm shadow-md shadow-primary/20">
                <Link href="/about">
                  {t("button")}
                  <ArrowRight className="ms-1.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-10 rounded-full px-5 text-sm">
                <Link href="/contact">{tNav("contact")}</Link>
              </Button>
            </div>
          </FadeIn>

        </div>
      </div>
    </section>
  );
}
