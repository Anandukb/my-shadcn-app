"use client";

import React from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import DashboardShell from "@/components/admin/DashboardShell";
import CategoryPackagesTable from "@/components/admin/CategoryPackagesTable";

export default function AdminFixedDeparturesPage() {
  return (
    <AdminGuard>
      <DashboardShell title="Fixed Departures">
        <CategoryPackagesTable category="fixed-departure" pageTitle="Fixed Departures Group Tours" />
      </DashboardShell>
    </AdminGuard>
  );
}
