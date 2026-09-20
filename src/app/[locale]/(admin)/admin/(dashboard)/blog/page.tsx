"use client";

import React from "react";
import DashboardShell from "@/components/admin/DashboardShell";
import BlogPostsTable from "@/components/admin/BlogPostsTable";

export default function AdminBlogPage() {
  return (
    <DashboardShell title="Blog">
      <BlogPostsTable />
    </DashboardShell>
  );
}
