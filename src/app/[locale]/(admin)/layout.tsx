import type { Metadata } from "next";
import AdminThemeScript from "@/components/admin/AdminThemeScript";

// Covers every route under (admin) — the dashboard and its login screen.
// None of it is public-facing content, so it should never be indexed.
export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminThemeScript />
      <div className="admin-root min-h-screen bg-adm-page text-adm-fg">{children}</div>
    </>
  );
}
