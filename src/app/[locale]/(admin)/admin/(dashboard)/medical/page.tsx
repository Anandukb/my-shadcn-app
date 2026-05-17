"use client";

import React from "react";
import AdminGuard from "@/components/admin/AdminGuard";
import DashboardShell from "@/components/admin/DashboardShell";
import CategoryPackagesTable from "@/components/admin/CategoryPackagesTable";

export default function AdminMedicalPage() {
  return (
    <AdminGuard>
      <DashboardShell title="Medical Tourism Packages">
        <CategoryPackagesTable category="medical" pageTitle="Medical Tourism Packages" />
      </DashboardShell>
    </AdminGuard>
  );
}
