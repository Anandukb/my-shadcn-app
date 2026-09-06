"use client";

import React, { useState } from "react";
import { Link, useRouter, usePathname } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/browser";
import {
  LayoutDashboard,
  Layers,
  Palmtree,
  Ship,
  Stethoscope,
  MapPin,
  CalendarDays,
  LogOut,
  Menu,
  X,
  Bell,
  ExternalLink,
  ChevronRight,
  User,
  Inbox,
  CalendarCheck,
  MessageSquareQuote,
  Globe2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import LanguageSwitcher from "@/components/LanguageSwitcher";

interface DashboardShellProps {
  children: React.ReactNode;
  title: string;
}

export default function DashboardShell({ children, title }: DashboardShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Sidebar Menu Items
  const menuItems = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      name: "All Packages",
      href: "/admin/packages",
      icon: Layers,
    },
    {
      name: "Enquiries",
      href: "/admin/enquiries",
      icon: Inbox,
    },
    {
      name: "Bookings",
      href: "/admin/bookings",
      icon: CalendarCheck,
    },
    {
      name: "Holidays",
      href: "/admin/holidays",
      icon: Palmtree,
    },
    {
      name: "Cruise",
      href: "/admin/cruise",
      icon: Ship,
    },
    {
      name: "Medical Tourism",
      href: "/admin/medical",
      icon: Stethoscope,
    },
    {
      name: "Kerala Tourism",
      href: "/admin/kerala",
      icon: MapPin,
    },
    {
      name: "Fixed Departures",
      href: "/admin/fixed-departures",
      icon: CalendarDays,
    },
    {
      name: "Testimonials",
      href: "/admin/testimonials",
      icon: MessageSquareQuote,
    },
    {
      name: "Global Visa",
      href: "/admin/global-visa",
      icon: Globe2,
    },
  ];

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const isRTL = locale === "ar";

  return (
    <div className={`min-h-screen flex bg-slate-950 font-sans text-slate-100 ${isRTL ? "rtl" : "ltr"}`}>
      {/* Decorative Blur Blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Sidebar: Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-slate-900 border-r border-slate-800/80 z-20 shrink-0 select-none">
        {/* Brand Header */}
        <div className="h-20 flex items-center px-6 border-b border-slate-800/50 bg-slate-900/50">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20 font-black text-white text-lg">
              M
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                MARAM HOLIDAYS
              </span>
              <span className="block text-[10px] font-bold text-blue-400 tracking-[0.2em] uppercase leading-none mt-0.5">
                Admin Panel
              </span>
            </div>
          </Link>
        </div>

        {/* Sidebar Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative group flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive 
                    ? "text-white" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
                }`}
              >
                {/* Active Highlight sliding pill */}
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-indigo-600/90 rounded-xl shadow-lg shadow-blue-500/10 -z-10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                
                <div className="flex items-center gap-3">
                  <item.icon className={`h-5 w-5 ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200 transition-colors"}`} />
                  <span>{item.name}</span>
                </div>
                
                {!isActive && (
                  <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-slate-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-800/50 bg-slate-900/40">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/40 border border-slate-800/30 mb-3">
            <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-blue-400 border border-slate-700/50 shadow-inner">
              <User className="h-5 w-5" />
            </div>
            <div className="overflow-hidden">
              <span className="block text-sm font-bold text-white truncate leading-none mb-1">
                Maram Admin
              </span>
              <span className="block text-xs font-medium text-slate-500 truncate leading-none">
                admin@maram.com
              </span>
            </div>
          </div>
          
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start gap-3 h-11 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl font-bold cursor-pointer transition-all"
          >
            <LogOut className="h-5 w-5" />
            Logout Account
          </Button>
        </div>
      </aside>

      {/* Sidebar: Mobile Overlay Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 z-30 lg:hidden"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: isRTL ? "100%" : "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? "100%" : "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`fixed top-0 bottom-0 ${isRTL ? "right-0" : "left-0"} w-80 bg-slate-900 border-r border-slate-800 z-40 lg:hidden flex flex-col`}
            >
              <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800/50 bg-slate-900/50">
                <Link href="/admin" className="flex items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center font-black text-white text-lg">
                    M
                  </div>
                  <div>
                    <span className="font-extrabold text-base tracking-tight text-white">
                      MARAM ADMIN
                    </span>
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-full text-slate-400 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>

              <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`relative flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all ${
                        isActive 
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white" 
                          : "text-slate-400 hover:text-white hover:bg-slate-800/30"
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-6 border-t border-slate-800/50 bg-slate-900/40">
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full gap-3 h-12 text-red-400 hover:text-red-300 border-slate-800 hover:bg-red-500/10 rounded-xl font-bold transition-all"
                >
                  <LogOut className="h-5 w-5" />
                  Logout Account
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Top Header */}
        <header className="h-20 flex items-center justify-between px-6 lg:px-8 border-b border-slate-800/50 bg-slate-950/40 backdrop-blur-md sticky top-0 z-10 select-none">
          {/* Mobile menu trigger */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden rounded-full hover:bg-slate-900 text-slate-400 hover:text-white"
            >
              <Menu className="h-6 w-6" />
            </Button>
            
            <h1 className="text-xl font-black tracking-tight text-white capitalize flex items-center gap-2">
              {title}
            </h1>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            {/* View live site button */}
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:flex gap-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg text-xs font-bold"
              asChild
            >
              <a href={`/${locale}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
                Live Website
              </a>
            </Button>

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Notifications Menu */}
            <div className="relative">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="rounded-full border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer h-9 w-9 relative"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              </Button>

              <AnimatePresence>
                {notificationsOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setNotificationsOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className={`absolute right-0 mt-3 w-80 rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-2xl z-20`}
                    >
                      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                        <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
                          Notifications
                        </span>
                        <span className="text-[10px] text-blue-400 font-bold hover:underline cursor-pointer">
                          Clear all
                        </span>
                      </div>
                      <div className="space-y-3">
                        <div className="flex gap-3 text-xs leading-relaxed hover:bg-slate-850 p-1.5 rounded-lg transition-colors cursor-pointer">
                          <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                          <div>
                            <p className="font-bold text-slate-200">System initialization complete</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">Just now</p>
                          </div>
                        </div>
                        <div className="flex gap-3 text-xs leading-relaxed hover:bg-slate-850 p-1.5 rounded-lg transition-colors cursor-pointer">
                          <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                          <div>
                            <p className="font-bold text-slate-200">24 dynamic tourist packages cached</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">5 mins ago</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Dynamic Inner Page Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto z-0">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
