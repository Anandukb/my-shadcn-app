"use client";

import React from "react";
import DashboardShell from "@/components/admin/DashboardShell";
import LiveChatConsole from "@/components/admin/LiveChatConsole";

export default function AdminLiveChatPage() {
  return (
    <DashboardShell title="Live Chat">
      <LiveChatConsole />
    </DashboardShell>
  );
}
