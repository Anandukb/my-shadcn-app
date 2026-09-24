import type { ImageLoaderProps } from "next/image";

// next/image loader that asks Unsplash's own image CDN for the requested
// width instead of routing through the Next.js optimizer. The optimizer has
// to download the full-size original and re-encode it on a cold cache, which
// is what made the hero banner sit on a black background for a moment on
// first load; Unsplash serves pre-sized, edge-cached variants directly.
export function unsplashLoader({ src, width, quality }: ImageLoaderProps): string {
  const url = new URL(src);
  url.searchParams.set("auto", "format");
  url.searchParams.set("fit", "crop");
  url.searchParams.set("w", String(width));
  url.searchParams.set("q", String(quality ?? 75));
  return url.toString();
}
