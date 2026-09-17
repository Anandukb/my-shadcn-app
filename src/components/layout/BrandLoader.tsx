"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { LOGO_URL } from "@/lib/brand-assets";

// Shared visual for the two full-screen brand overlays: the first-visit
// IntroSplash (src/app/[locale]/HomeClient.tsx) and the PageTransitionOverlay
// shown on every subsequent internal navigation. `label` is the destination
// page's title (e.g. "Holiday Packages") shown under the wordmark; omit it
// for the plain intro splash.
//
// The mark "flies in" toward the viewer — starts small, distant, and
// motion-blurred off to one side, then swoops to center at full size before
// settling into a gentle hover/bob, like a bird landing. Timings here are
// tuned to land well before PageTransitionOverlay's MIN_HOLD_MS elapses.
export function BrandLoaderContent({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center px-6 text-center">
      {/* Soft light bloom that blooms in behind the mark as it arrives */}
      <div className="relative h-28 w-32 md:h-36 md:w-40 mb-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: 0.55, scale: 1.4 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.35 }}
          className="absolute inset-0 rounded-full bg-gradient-to-br from-teal-400/40 via-amber-300/30 to-blue-500/40 blur-2xl"
        />

        {/* One-shot flight path: distant + blurred + off-center → centered + sharp */}
        <motion.div
          initial={{ opacity: 0, scale: 0.25, x: -140, y: 70, rotate: -22, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, x: 0, y: 0, rotate: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          {/* Idle hover loop, kicks in once the flight settles */}
          <motion.div
            animate={{ y: [0, -7, 0], rotate: [0, 1.5, 0, -1.5, 0] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: 1.05 }}
            className="relative h-full w-full drop-shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
          >
            <Image src={LOGO_URL} alt="Maram Tours And Travels" fill sizes="160px" className="object-contain" priority />
          </motion.div>
        </motion.div>
      </div>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.85 }}
        className="text-white font-black text-2xl md:text-3xl tracking-[0.25em] uppercase"
      >
        Maram
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 1 }}
        className={label ? "text-white/70 text-xs md:text-sm font-semibold tracking-[0.35em] uppercase mt-3" : "text-white/60 text-xs md:text-sm font-semibold tracking-[0.4em] uppercase mt-3"}
      >
        {label ?? "Tours And Travels"}
      </motion.p>
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, ease: "easeInOut", delay: 1.1 }}
        className="h-[2px] w-24 md:w-32 bg-gradient-to-r from-transparent via-amber-400 to-transparent mt-6 origin-left"
      />
    </div>
  );
}
