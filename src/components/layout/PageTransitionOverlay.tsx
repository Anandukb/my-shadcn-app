"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { getPageTitleKey } from "@/lib/page-titles";
import { BrandLoaderContent } from "./BrandLoader";

// Must comfortably exceed both the panel's own slide-in transition below
// and the brand mark's ~1.05s flight-in animation (BrandLoader) — otherwise
// a fast client-side navigation can trigger the hide before either finishes
// and it reverses mid-flight.
const MIN_HOLD_MS = 1400;
// Safety net: if pathname never changes the way we expect (navigation
// cancelled, same-page anchor we didn't catch, etc.) force-hide instead of
// leaving the user stuck behind a full-screen overlay.
const SAFETY_TIMEOUT_MS = 4000;

// Shows a full-screen "Maram / <destination page>" loader on every internal
// navigation — clicking a nav link, a card, a footer link, anywhere — not
// just the very first visit (that's IntroSplash, homepage-only, once per
// session). Purely presentational: it never blocks or delays the actual
// navigation, it just gives the transition a branded beat instead of a
// blank flash.
export function PageTransitionOverlay() {
  const t = useTranslations();
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const [titleKey, setTitleKey] = useState<string | null>(null);

  const showRef = useRef(false);
  useEffect(() => {
    showRef.current = show;
  }, [show]);

  const startedAtRef = useRef(0);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // let the browser open a new tab

      const anchor = (e.target as HTMLElement | null)?.closest?.("a");
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return; // same page (query/hash only)

      const key = getPageTitleKey(url.pathname);
      if (!key) return; // unknown/dynamic route — navigate normally, no overlay

      clearTimers();
      startedAtRef.current = Date.now();
      setTitleKey(key);
      setShow(true);

      safetyTimerRef.current = setTimeout(() => setShow(false), SAFETY_TIMEOUT_MS);
    }

    // Capture phase, and before Next.js's <Link> gets to handle the click —
    // Link calls preventDefault() itself to do client-side routing, and that
    // happens during the bubble phase before a document-level bubble
    // listener would ever see the event, which made `defaultPrevented`
    // always true and silently skipped every internal link.
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [clearTimers]);

  // Fires only when the route actually changes — i.e. navigation completed —
  // and hides the overlay after respecting the minimum hold time.
  useEffect(() => {
    if (!showRef.current) return;
    const elapsed = Date.now() - startedAtRef.current;
    const remaining = Math.max(0, MIN_HOLD_MS - elapsed);
    hideTimerRef.current = setTimeout(() => setShow(false), remaining);
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [pathname]);

  return (
    // Always mounted (never conditionally rendered) and slid off/on-screen
    // via a plain inline-style CSS transition (not AnimatePresence's
    // exit-on-unmount, and not a Tailwind translate-y utility toggle) —
    // the most direct, least ambiguous way to drive this one transform.
    <div
      aria-hidden={!show}
      className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-gradient-to-br from-slate-950/70 via-slate-900/55 to-slate-950/70 backdrop-blur-2xl"
      style={{
        transform: show ? "translateY(0)" : "translateY(-100%)",
        transition: "transform 0.7s cubic-bezier(0.65,0,0.35,1)",
        pointerEvents: show ? "auto" : "none",
      }}
    >
      {/* Keyed on the label so the entrance fade replays on every distinct destination, not just the first time */}
      <BrandLoaderContent key={titleKey ?? "none"} label={titleKey ? t(titleKey) : undefined} />
    </div>
  );
}
