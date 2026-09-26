"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

const listeners = new Set<() => void>();

function getTheme(): Theme {
  return document.documentElement.dataset.adminTheme === "dark" ? "dark" : "light";
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function setTheme(next: Theme) {
  document.documentElement.dataset.adminTheme = next;
  try {
    localStorage.setItem("admin-theme", next);
  } catch {
    // Storage can be blocked; the theme still applies for this visit.
  }
  listeners.forEach((l) => l());
}

export default function AdminThemeToggle({ className = "" }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, getTheme, () => "light" as Theme);
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-adm-line bg-adm-surface text-adm-muted transition-colors hover:bg-adm-raised hover:text-adm-fg cursor-pointer ${className}`}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
