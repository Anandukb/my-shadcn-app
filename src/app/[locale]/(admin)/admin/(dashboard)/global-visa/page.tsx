"use client";

import React from "react";
import DashboardShell from "@/components/admin/DashboardShell";
import VisaCountriesTable from "@/components/admin/VisaCountriesTable";

export default function AdminGlobalVisaPage() {
  return (
    <DashboardShell title="Global Visa">
      <VisaCountriesTable />
    </DashboardShell>
  );
}
