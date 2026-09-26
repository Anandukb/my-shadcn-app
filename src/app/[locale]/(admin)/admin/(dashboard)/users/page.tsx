"use client";

import React from "react";
import DashboardShell from "@/components/admin/DashboardShell";
import UsersRolesManager from "@/components/admin/UsersRolesManager";

export default function AdminUsersPage() {
  return (
    <DashboardShell title="Users">
      <UsersRolesManager view="users" />
    </DashboardShell>
  );
}
