// Pages that render a full-bleed hero/banner as their first section. The
// Header and TopBar float transparently over these (checked synchronously
// from the pathname, so there's no post-hydration flash) and fall back to
// their solid, in-flow styling everywhere else.
//
// Most listing/content pages have no sub-routes, so an exact match is
// enough. A couple do: "/global-visa/[country]" also opens with the same
// PageHeader banner, so that one allows prefix matches — but
// "/packages/[slug]" is a detail page whose "hero" is an inline card partway
// down the page, not a full-bleed banner, so "/packages" stays exact-only.
const HERO_BANNER_EXACT_PATHS = [
  "/holiday-packages",
  "/fixed-departures",
  "/packages",
  "/cruise-packages",
  "/about",
  "/contact",
  "/kerala-tourism",
  "/medical-tourism",
  "/hotels",
];

const HERO_BANNER_PREFIX_PATHS = ["/global-visa"];

export function pathHasHeroBanner(pathname: string): boolean {
  if (pathname === "/") return true;
  if (HERO_BANNER_EXACT_PATHS.includes(pathname)) return true;
  return HERO_BANNER_PREFIX_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}
