"use client";

import React from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import DashboardShell from "@/components/admin/DashboardShell";
import CategoryPackagesTable from "@/components/admin/CategoryPackagesTable";

export default function AdminKeralaPage() {
  return (
    <AdminGuard>
      <DashboardShell title="Kerala Tourism Packages">
        <CategoryPackagesTable category="kerala" pageTitle="Kerala Destinations & Packages" />
      </DashboardShell>
    </AdminGuard>
  );
}
