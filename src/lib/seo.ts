import type { Metadata } from "next";

export const SITE_URL = "https://maramtoursandtravels.com";
export const SITE_NAME = "Maram Tours and Travels";

// Builds a consistent Metadata object (title, description, canonical +
// hreflang alternates, Open Graph, Twitter card) for one route across both
// locales. `path` is locale-free and starts with "/" (e.g. "/holiday-packages",
// "" for the homepage) — matches next-intl's localePrefix: "always" routing,
// where every real URL is prefixed with /en or /ar.
export function buildMetadata({
  locale,
  path,
  title,
  description,
  noIndex = false,
}: {
  locale: string;
  path: string;
  title: string;
  description: string;
  noIndex?: boolean;
}): Metadata {
  const url = `${SITE_URL}/${locale}${path}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        en: `${SITE_URL}/en${path}`,
        ar: `${SITE_URL}/ar${path}`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: locale === "ar" ? "ar_AE" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}
