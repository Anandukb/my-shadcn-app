"use client";

import React from "react";
import DashboardShell from "@/components/admin/DashboardShell";
import BookingsTable from "@/components/admin/BookingsTable";

export default function AdminBookingsPage() {
  return (
    <DashboardShell title="Bookings">
      <BookingsTable />
    </DashboardShell>
  );
}
