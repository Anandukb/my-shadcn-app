import type { Metadata } from "next";
import { PackagePreviewClient } from "./PackagePreviewClient";

// Internal-only preview shell embedded in an <iframe> by the admin package
// editor (see PackagePreviewClient) — never a real destination, so keep it
// out of search results entirely.
export const metadata: Metadata = {
  title: "Package Preview",
  robots: { index: false, follow: false },
};

export default function PackagePreviewPage() {
  return <PackagePreviewClient />;
}
