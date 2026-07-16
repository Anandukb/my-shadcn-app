"use client";

import React from "react";
import DashboardShell from "@/components/admin/DashboardShell";
import CategoryPackagesTable from "@/components/admin/CategoryPackagesTable";

export default function AdminCruisePage() {
  return (
    <DashboardShell title="Cruise Packages">
      <CategoryPackagesTable category="cruise" pageTitle="Cruise Voyages & Packages" />
    </DashboardShell>
  );
}
