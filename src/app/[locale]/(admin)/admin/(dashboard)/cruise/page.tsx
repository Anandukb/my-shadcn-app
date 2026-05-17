"use client";

import React from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import DashboardShell from "@/components/admin/DashboardShell";
import CategoryPackagesTable from "@/components/admin/CategoryPackagesTable";

export default function AdminCruisePage() {
  return (
    <AdminGuard>
      <DashboardShell title="Cruise Packages">
        <CategoryPackagesTable category="cruise" pageTitle="Cruise Voyages & Packages" />
      </DashboardShell>
    </AdminGuard>
  );
}
