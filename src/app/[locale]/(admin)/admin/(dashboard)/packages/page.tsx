"use client";

import React from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import DashboardShell from "@/components/admin/DashboardShell";
import CategoryPackagesTable from "@/components/admin/CategoryPackagesTable";

export default function AdminAllPackagesPage() {
  return (
    <AdminGuard>
      <DashboardShell title="All Tourist Packages">
        <CategoryPackagesTable category="all" pageTitle="All Packages Master Console" />
      </DashboardShell>
    </AdminGuard>
  );
}
