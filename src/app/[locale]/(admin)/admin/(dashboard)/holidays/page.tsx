"use client";

import React from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import DashboardShell from "@/components/admin/DashboardShell";
import CategoryPackagesTable from "@/components/admin/CategoryPackagesTable";

export default function AdminHolidaysPage() {
  return (
    <AdminGuard>
      <DashboardShell title="Holidays Packages">
        <CategoryPackagesTable category="holidays" pageTitle="Holidays Travel Packages" />
      </DashboardShell>
    </AdminGuard>
  );
}
