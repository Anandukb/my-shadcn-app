"use client";

import React from "react";
import DashboardShell from "@/components/admin/DashboardShell";
import EnquiriesTable from "@/components/admin/EnquiriesTable";

export default function AdminEnquiriesPage() {
  return (
    <DashboardShell title="Enquiries">
      <EnquiriesTable />
    </DashboardShell>
  );
}
