"use client";

import React from "react";
import DashboardShell from "@/components/admin/DashboardShell";
import UsersRolesManager from "@/components/admin/UsersRolesManager";

export default function AdminRolesPage() {
  return (
    <DashboardShell title="Roles & Permissions">
      <UsersRolesManager view="roles" />
    </DashboardShell>
  );
}
