"use client";

import React from "react";
import DashboardShell from "@/components/admin/DashboardShell";
import CategoryPackagesTable from "@/components/admin/CategoryPackagesTable";

export default function AdminMedicalPage() {
  return (
    <DashboardShell title="Medical Tourism Packages">
      <CategoryPackagesTable category="medical" pageTitle="Medical Tourism Packages" />
    </DashboardShell>
  );
}
