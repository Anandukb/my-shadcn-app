import type { Metadata } from "next";

// Covers every route under (admin) — the dashboard and its login screen.
// None of it is public-facing content, so it should never be indexed.
export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminGroupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
