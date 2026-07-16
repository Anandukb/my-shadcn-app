"use client";

import React from "react";
import DashboardShell from "@/components/admin/DashboardShell";
import CategoryPackagesTable from "@/components/admin/CategoryPackagesTable";

export default function AdminHolidaysPage() {
  return (
    <DashboardShell title="Holidays Packages">
      <CategoryPackagesTable category="holidays" pageTitle="Holidays Travel Packages" />
    </DashboardShell>
  );
}
