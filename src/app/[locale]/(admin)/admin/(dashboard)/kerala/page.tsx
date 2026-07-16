"use client";

import React from "react";
import DashboardShell from "@/components/admin/DashboardShell";
import CategoryPackagesTable from "@/components/admin/CategoryPackagesTable";

export default function AdminKeralaPage() {
  return (
    <DashboardShell title="Kerala Tourism Packages">
      <CategoryPackagesTable category="kerala" pageTitle="Kerala Destinations & Packages" />
    </DashboardShell>
  );
}
