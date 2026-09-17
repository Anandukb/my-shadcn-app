// Maps a pathname to the next-intl translation key for its display title —
// used by PageTransitionOverlay to label "what we selected" on the loader
// shown during navigation. Keys are exact matches only (no dynamic-route
// guessing for things like /packages/[slug] or /global-visa/[country]) — a
// wrong or half-fitting label is worse than no label, so unknown routes
// just navigate without the overlay.
const PAGE_TITLE_KEYS: Record<string, string> = {
  "/": "nav.home",
  "/holiday-packages": "listingPages.holidays.title",
  "/fixed-departures": "listingPages.fixedDeparture.title",
  "/cruise-packages": "listingPages.cruise.title",
  "/packages": "listingPages.all.title",
  "/global-visa": "nav.global_visa",
  "/kerala-tourism": "nav.kerala",
  "/medical-tourism": "nav.medical",
  "/hotels": "services_home.hotel",
  "/hotel-booking": "services_home.hotel",
  "/about": "nav.about",
  "/contact": "nav.contact",
};

// Strips a leading /en or /ar locale segment, if present, so this works
// whether the caller already has a locale-stripped pathname (from
// usePathname()) or a raw href/URL pathname (which always has the prefix,
// since this project's routing uses localePrefix: "always").
function stripLocale(pathname: string): string {
  const match = pathname.match(/^\/(en|ar)(\/.*|$)/);
  if (!match) return pathname;
  return match[2] || "/";
}

export function getPageTitleKey(pathname: string): string | null {
  const clean = stripLocale(pathname);
  return PAGE_TITLE_KEYS[clean] ?? null;
}
