import type { Metadata } from "next";
import AdminAreaMarker from "@/components/admin/AdminAreaMarker";

// Covers every route under (admin) — the dashboard and its login screen.
// None of it is public-facing content, so it should never be indexed.
export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminAreaMarker />
      <div className="admin-root min-h-screen bg-adm-page text-adm-fg">{children}</div>
    </>
  );
}
