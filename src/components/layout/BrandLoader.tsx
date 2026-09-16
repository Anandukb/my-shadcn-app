"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { LOGO_URL } from "@/lib/brand-assets";

// Shared visual for the two full-screen brand overlays: the first-visit
// IntroSplash (src/app/[locale]/HomeClient.tsx) and the PageTransitionOverlay
// shown on every subsequent internal navigation. `label` is the destination
// page's title (e.g. "Holiday Packages") shown under the wordmark; omit it
// for the plain intro splash.
export function BrandLoaderContent({ label }: { label?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center px-6 text-center"
    >
      <div className="relative h-14 w-14 md:h-16 md:w-16 rounded-full overflow-hidden bg-white shadow-xl mb-5">
        <Image src={LOGO_URL} alt="Maram Tours And Travels" fill sizes="64px" className="object-contain p-2" priority />
      </div>
      <h1 className="text-white font-black text-2xl md:text-3xl tracking-[0.25em] uppercase">
        Maram
      </h1>
      {label ? (
        <p className="text-white/70 text-xs md:text-sm font-semibold tracking-[0.35em] uppercase mt-3">
          {label}
        </p>
      ) : (
        <p className="text-white/60 text-xs md:text-sm font-semibold tracking-[0.4em] uppercase mt-3">
          Tours And Travels
        </p>
      )}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, ease: "easeInOut", delay: 0.2 }}
        className="h-[2px] w-24 md:w-32 bg-gradient-to-r from-transparent via-amber-400 to-transparent mt-6 origin-left"
      />
    </motion.div>
  );
}
