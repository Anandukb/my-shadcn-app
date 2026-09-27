"use client";

import { useEffect } from "react";

/**
 * Marks <html> as "inside the admin" while the admin is mounted, so the admin
 * theme also reaches portalled dialogs, and removes the mark when navigating
 * back to the public site. The pre-paint script covers full page loads; this
 * covers client-side navigation from the public site into the admin.
 */
export default function AdminAreaMarker() {
  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.adminTheme !== "light" && root.dataset.adminTheme !== "dark") {
      let stored: string | null = null;
      try {
        stored = localStorage.getItem("admin-theme");
      } catch {
        // Storage can be blocked; fall back to the OS setting.
      }
      root.dataset.adminTheme =
        stored === "light" || stored === "dark"
          ? stored
          : window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
    }
    root.dataset.adminArea = "";
    return () => {
      delete root.dataset.adminArea;
    };
  }, []);

  return null;
}
