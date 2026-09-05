"use client";

import React from "react";
import DashboardShell from "@/components/admin/DashboardShell";
import TestimonialsTable from "@/components/admin/TestimonialsTable";

export default function AdminTestimonialsPage() {
  return (
    <DashboardShell title="Testimonials">
      <TestimonialsTable />
    </DashboardShell>
  );
}
