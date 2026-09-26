"use client";

import React, { useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Layers, Palmtree, Ship, Stethoscope, MapPin, CalendarDays,
  ChevronRight, Inbox, CalendarCheck, MessageSquareQuote, Globe2, Newspaper,
  MessagesSquare, ShieldCheck, Users,
} from "lucide-react";
import { hasAnyPermission } from "@/lib/access/permissions";
import type { AdminMe } from "@/lib/access/types";

interface NavItem {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
  /** Any one of these permissions makes the item visible. */
  anyOf?: string[];
  badge?: "chat";
  children?: NavItem[];
}

const NAV_ITEMS: NavItem[] = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  {
    name: "All Packages",
    href: "/admin/packages",
    icon: Layers,
    anyOf: ["packages:view"],
    children: [
      { name: "Holidays", href: "/admin/holidays", icon: Palmtree, anyOf: ["holidays:view", "packages:view"] },
      { name: "Cruise", href: "/admin/cruise", icon: Ship, anyOf: ["cruise:view", "packages:view"] },
      { name: "Medical Tourism", href: "/admin/medical", icon: Stethoscope, anyOf: ["medical:view", "packages:view"] },
      { name: "Kerala Tourism", href: "/admin/kerala", icon: MapPin, anyOf: ["kerala:view", "packages:view"] },
      { name: "Fixed Departures", href: "/admin/fixed-departures", icon: CalendarDays, anyOf: ["fixed_departures:view", "packages:view"] },
    ],
  },
  { name: "Live Chat", href: "/admin/live-chat", icon: MessagesSquare, anyOf: ["live_chat:view"], badge: "chat" },
  { name: "Enquiries", href: "/admin/enquiries", icon: Inbox, anyOf: ["enquiries:view"] },
  { name: "Bookings", href: "/admin/bookings", icon: CalendarCheck, anyOf: ["bookings:view"] },
  { name: "Testimonials", href: "/admin/testimonials", icon: MessageSquareQuote, anyOf: ["testimonials:view"] },
  { name: "Global Visa", href: "/admin/global-visa", icon: Globe2, anyOf: ["visa:view"] },
  { name: "Blog", href: "/admin/blog", icon: Newspaper, anyOf: ["blog:view"] },
  { name: "Users", href: "/admin/users", icon: Users, anyOf: ["users:view"] },
  { name: "Roles", href: "/admin/roles", icon: ShieldCheck, anyOf: ["roles:view"] },
];

// Until the role is known (loading, or the lookup failed) show everything:
// this is cosmetic, the API enforces access.
const canSee = (me: AdminMe | undefined, item: NavItem) =>
  !item.anyOf || !me || hasAnyPermission(me, item.anyOf);

const isWithin = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

interface Props {
  me: AdminMe | undefined;
  waitingChats: number;
  onNavigate?: () => void;
  /** Keeps the sliding highlight of the desktop and mobile menus independent. */
  variant: "desktop" | "mobile";
}

function Badge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span className="min-w-5 rounded-full bg-amber-500 px-1.5 text-center text-[10px] font-black leading-5 text-slate-950 animate-pulse">
      {count}
    </span>
  );
}

export default function AdminSidebarNav({ me, waitingChats, onNavigate, variant }: Props) {
  const pathname = usePathname();
  // null = follow the current page (open while inside the group); boolean = the user's choice.
  const [manual, setManual] = useState<Record<string, boolean | null>>({});

  const rowBase = "relative group flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all";
  const idle = "text-adm-muted hover:text-adm-fg hover:bg-adm-raised/40";

  const pill = (
    <motion.div
      layoutId={`active-pill-${variant}`}
      className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-indigo-600/90 rounded-xl shadow-lg shadow-blue-500/10 -z-10"
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
    />
  );

  return (
    <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
      {NAV_ITEMS.map((item) => {
        const visibleChildren = item.children?.filter((c) => canSee(me, c)) ?? [];
        const showSelf = canSee(me, item);
        if (!showSelf && visibleChildren.length === 0) return null;

        const isActive = showSelf && pathname === item.href;
        const badgeCount = item.badge === "chat" ? waitingChats : 0;

        if (visibleChildren.length === 0) {
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              className={`${rowBase} ${isActive ? "text-white" : idle}`}
            >
              {isActive && pill}
              <div className="flex items-center gap-3">
                <item.icon className={`h-5 w-5 ${isActive ? "text-white" : "text-adm-muted group-hover:text-adm-fg transition-colors"}`} />
                <span>{item.name}</span>
              </div>
              {badgeCount ? (
                <Badge count={badgeCount} />
              ) : (
                !isActive && <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-adm-subtle" />
              )}
            </Link>
          );
        }

        // Expandable group: the parent page plus its sub-pages.
        const inGroup = (showSelf && isWithin(pathname, item.href)) || visibleChildren.some((c) => isWithin(pathname, c.href));
        const open = manual[item.name] ?? inGroup;
        const toggle = () => setManual((m) => ({ ...m, [item.name]: !open }));
        const childActive = visibleChildren.some((c) => isWithin(pathname, c.href));

        const rowInner = (
          <>
            {isActive && pill}
            <div className="flex items-center gap-3">
              <item.icon className={`h-5 w-5 ${isActive ? "text-white" : childActive ? "text-adm-accent" : "text-adm-muted group-hover:text-adm-fg transition-colors"}`} />
              <span className={childActive ? "text-adm-fg" : ""}>{item.name}</span>
            </div>
            <ChevronRight className={`h-4 w-4 transition-transform ${open ? "rotate-90" : ""} ${isActive ? "text-white" : "text-adm-subtle"}`} />
          </>
        );

        return (
          <div key={item.name}>
            {showSelf ? (
              <Link
                href={item.href}
                aria-expanded={open}
                onClick={(e) => {
                  if (pathname === item.href) {
                    // Already on the page: the click just folds or unfolds the sub-pages.
                    e.preventDefault();
                    toggle();
                  } else {
                    setManual((m) => ({ ...m, [item.name]: true }));
                    onNavigate?.();
                  }
                }}
                className={`${rowBase} ${isActive ? "text-white" : idle}`}
              >
                {rowInner}
              </Link>
            ) : (
              // No access to the parent page itself, only some sub-pages: the row just expands.
              <button type="button" aria-expanded={open} onClick={toggle} className={`${rowBase} w-full cursor-pointer ${idle}`}>
                {rowInner}
              </button>
            )}

            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="ms-6 mt-1 mb-1 space-y-0.5 border-s border-adm-line ps-3">
                    {visibleChildren.map((child) => {
                      const active = isWithin(pathname, child.href);
                      return (
                        <Link
                          key={child.name}
                          href={child.href}
                          onClick={onNavigate}
                          className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors ${
                            active
                              ? "bg-blue-500/10 text-adm-accent"
                              : "text-adm-muted hover:text-adm-fg hover:bg-adm-raised/40"
                          }`}
                        >
                          <child.icon className="h-4 w-4 shrink-0" />
                          <span className="truncate">{child.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </nav>
  );
}
