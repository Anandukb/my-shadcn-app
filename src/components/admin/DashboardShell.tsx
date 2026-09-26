"use client";

import React, { useEffect, useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/browser";
import { SITE_URL } from "@/lib/seo";
import { resetAdminClientState } from "@/lib/admin-session";
import {
  LogOut,
  Menu,
  X,
  Bell,
  ExternalLink,
  User,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminThemeToggle from "@/components/admin/AdminThemeToggle";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import AdminSidebarNav from "@/components/admin/AdminSidebarNav";
import { useAdminMe } from "@/components/admin/useAdminMe";
import { hasAnyPermission, permissionsForPath } from "@/lib/access/permissions";
import { useChatSessions, useLiveChatRealtime } from "@/components/admin/useLiveChatRealtime";

interface DashboardShellProps {
  children: React.ReactNode;
  title: string;
}

export default function DashboardShell({ children, title }: DashboardShellProps) {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const locale = useLocale();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useLiveChatRealtime();
  const { data: chatSessions = [] } = useChatSessions();
  const waitingChats = chatSessions.filter((s) => s.status === "waiting").length;

  const { me } = useAdminMe();

  const requiredPermissions = permissionsForPath(pathname);
  const blocked = !!me && !!requiredPermissions && !hasAnyPermission(me, requiredPermissions);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    resetAdminClientState(queryClient);
    // Full page load (not client-side navigation) so no in-memory state survives.
    window.location.assign(`/${locale}/admin/login`);
  };

  // On the admin subdomain "/en" would bounce back into the admin, so link to the real public site.
  const [liveSiteOrigin, setLiveSiteOrigin] = useState("");
  useEffect(() => {
    if (window.location.hostname.startsWith("admin.")) setLiveSiteOrigin(SITE_URL);
  }, []);

  const isRTL = locale === "ar";

  return (
    <div className={`min-h-screen flex bg-adm-page font-sans text-adm-fg ${isRTL ? "rtl" : "ltr"}`}>
      {/* Decorative Blur Blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Sidebar: Desktop */}
      <aside className="hidden lg:flex flex-col w-72 h-screen sticky top-0 self-start bg-adm-surface border-r border-adm-line/80 z-20 shrink-0 select-none">
        {/* Brand Header */}
        <div className="h-20 flex items-center px-6 border-b border-adm-line/50 bg-adm-surface/50">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20 font-black text-white text-lg">
              M
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-adm-fg">
                MARAM HOLIDAYS
              </span>
              <span className="block text-[10px] font-bold text-adm-accent tracking-[0.2em] uppercase leading-none mt-0.5">
                Admin Panel
              </span>
            </div>
          </Link>
        </div>

        {/* Sidebar Links */}
        <AdminSidebarNav variant="desktop" me={me} waitingChats={waitingChats} />

        {/* User Card & Logout */}
        <div className="p-4 border-t border-adm-line/50 bg-adm-surface/40">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-adm-page/40 border border-adm-line/30 mb-3">
            <div className="h-10 w-10 rounded-full bg-adm-raised flex items-center justify-center text-adm-accent border border-adm-line-strong/50 shadow-inner">
              <User className="h-5 w-5" />
            </div>
            <div className="overflow-hidden">
              <span className="block text-sm font-bold text-adm-fg truncate leading-none mb-1">
                {me?.fullName || "Maram Admin"}
              </span>
              <span className="block text-xs font-medium text-adm-subtle truncate leading-none">
                {me?.roleName ?? me?.email ?? " "}
              </span>
            </div>
          </div>
          
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start gap-3 h-11 text-adm-danger hover:text-adm-danger hover:bg-red-500/10 rounded-xl font-bold cursor-pointer transition-all"
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
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-[2px] z-30 lg:hidden"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: isRTL ? "100%" : "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? "100%" : "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`fixed top-0 bottom-0 ${isRTL ? "right-0" : "left-0"} w-80 bg-adm-surface border-r border-adm-line z-40 lg:hidden flex flex-col`}
            >
              <div className="h-20 flex items-center justify-between px-6 border-b border-adm-line/50 bg-adm-surface/50">
                <Link href="/admin" className="flex items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center font-black text-white text-lg">
                    M
                  </div>
                  <div>
                    <span className="font-extrabold text-base tracking-tight text-adm-fg">
                      MARAM ADMIN
                    </span>
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-full text-adm-muted hover:text-adm-fg"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>

              <AdminSidebarNav variant="mobile" me={me} waitingChats={waitingChats} onNavigate={() => setMobileMenuOpen(false)} />

              <div className="p-6 border-t border-adm-line/50 bg-adm-surface/40">
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full gap-3 h-12 text-adm-danger hover:text-adm-danger border-adm-line hover:bg-red-500/10 rounded-xl font-bold transition-all"
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
        <header className="h-20 flex items-center justify-between px-6 lg:px-8 border-b border-adm-line/50 bg-adm-page/40 backdrop-blur-md sticky top-0 z-10 select-none">
          {/* Mobile menu trigger */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden rounded-full hover:bg-adm-surface text-adm-muted hover:text-adm-fg"
            >
              <Menu className="h-6 w-6" />
            </Button>
            
            <h1 className="text-xl font-black tracking-tight text-adm-fg capitalize flex items-center gap-2">
              {title}
            </h1>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            {/* View live site button */}
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:flex gap-2 text-adm-muted hover:text-adm-fg hover:bg-adm-surface rounded-lg text-xs font-bold"
              asChild
            >
              <a href={`${liveSiteOrigin}/${locale}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
                Live Website
              </a>
            </Button>

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Light / dark theme */}
            <AdminThemeToggle />

            {/* Notifications Menu */}
            <div className="relative">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="rounded-full border-adm-line bg-adm-surface text-adm-muted hover:text-adm-fg hover:bg-adm-raised cursor-pointer h-9 w-9 relative"
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
                      className={`absolute right-0 mt-3 w-80 rounded-2xl border border-adm-line bg-adm-surface p-4 shadow-2xl z-20`}
                    >
                      <div className="flex items-center justify-between mb-3 border-b border-adm-line pb-2">
                        <span className="text-xs font-extrabold uppercase text-adm-muted tracking-wider">
                          Notifications
                        </span>
                        <span className="text-[10px] text-adm-accent font-bold hover:underline cursor-pointer">
                          Clear all
                        </span>
                      </div>
                      <div className="space-y-3">
                        <div className="flex gap-3 text-xs leading-relaxed hover:bg-adm-hover p-1.5 rounded-lg transition-colors cursor-pointer">
                          <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                          <div>
                            <p className="font-bold text-adm-fg">System initialization complete</p>
                            <p className="text-[10px] text-adm-subtle mt-0.5">Just now</p>
                          </div>
                        </div>
                        <div className="flex gap-3 text-xs leading-relaxed hover:bg-adm-hover p-1.5 rounded-lg transition-colors cursor-pointer">
                          <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                          <div>
                            <p className="font-bold text-adm-fg">24 dynamic tourist packages cached</p>
                            <p className="text-[10px] text-adm-subtle mt-0.5">5 mins ago</p>
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
            {blocked ? (
              <div className="mx-auto mt-16 max-w-md rounded-3xl border border-adm-line bg-adm-surface p-10 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-adm-raised text-adm-muted">
                  <Lock className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-extrabold text-adm-fg">You don&apos;t have access to this page</h2>
                <p className="mt-2 text-sm text-adm-muted">
                  Your role ({me?.roleName ?? "no role"}) doesn&apos;t include permission to open this section. Ask a Super Admin if you need it.
                </p>
              </div>
            ) : (
              children
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
