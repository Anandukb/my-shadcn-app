"use client";

import React from "react";
import DashboardShell from "@/components/admin/DashboardShell";
import CategoryPackagesTable from "@/components/admin/CategoryPackagesTable";

export default function AdminAllPackagesPage() {
  return (
    <DashboardShell title="All Tourist Packages">
      <CategoryPackagesTable category="all" pageTitle="All Packages Master Console" />
    </DashboardShell>
  );
}
