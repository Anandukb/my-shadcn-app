"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardShell from "@/components/admin/DashboardShell";
import { Package } from "@/types/package";
import { Link } from "@/i18n/navigation";
import {
  Layers,
  Star,
  DollarSign,
  Award,
  Palmtree,
  Ship,
  Stethoscope,
  MapPin,
  CalendarDays,
  Plus,
  ArrowRight,
  TrendingUp,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboardPage() {
  const { data: packages = [], isLoading: loading } = useQuery({
    queryKey: ["packages"],
    queryFn: async () => {
      const res = await fetch("/api/packages");
      if (!res.ok) throw new Error("Failed to load packages");
      const json = await res.json();
      return json.packages as Package[];
    },
  });

  // Compute Statistics
  const totalPackages = packages.length;
  const totalFeatured = packages.filter(p => p.featured).length;
  
  // Calculate category breakdowns
  const holidaysCount = packages.filter(p => p.category === "holidays").length;
  const cruiseCount = packages.filter(p => p.category === "cruise").length;
  const medicalCount = packages.filter(p => p.category === "medical").length;
  const keralaCount = packages.filter(p => p.category === "kerala").length;
  const fixedCount = packages.filter(p => p.category === "fixed-departure").length;

  // Calculate average price and ratings
  const averagePrice = totalPackages > 0 
    ? Math.round(packages.reduce((sum, p) => sum + p.price, 0) / totalPackages) 
    : 0;

  const averageRating = totalPackages > 0
    ? (packages.reduce((sum, p) => sum + p.rating, 0) / totalPackages).toFixed(1)
    : "0.0";

  // Category percentage calculation for progress meters
  const getPercentage = (count: number) => {
    if (totalPackages === 0) return 0;
    return Math.round((count / totalPackages) * 100);
  };

  return (
    <DashboardShell title="Overview & Statistics">
      {loading ? (
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-800 border-t-blue-500" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Top Banner Alert */}
          <div className="relative rounded-[2rem] bg-gradient-to-r from-blue-600/90 to-violet-600/90 p-8 shadow-xl overflow-hidden">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/5 rounded-full blur-[80px] pointer-events-none" />
            <div className="relative z-10 max-w-xl">
              <Badge className="bg-white/20 text-white hover:bg-white/30 border border-white/20 uppercase tracking-widest text-[9px] mb-3">
                System Running Smoothly
              </Badge>
              <h2 className="text-3xl font-extrabold text-white leading-tight">
                Welcome Back, Administrator!
              </h2>
              <p className="text-blue-100 text-sm mt-2 leading-relaxed">
                Here is the latest operating data for Maram Holidays. You have complete control to add, edit, or toggle featured status for all packages.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button size="sm" className="bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-xl h-10 px-5 shadow-lg shadow-white/5 cursor-pointer" asChild>
                  <Link href="/admin/packages">
                    <Plus className="h-4 w-4 mr-1.5" />
                    Manage Packages
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Metric Card: Total Packages */}
            <Card className="bg-slate-900/60 border-slate-800/80 shadow-lg rounded-2xl relative overflow-hidden group hover:border-slate-700/60 transition-all">
              <div className="absolute top-0 left-0 w-[3px] h-full bg-blue-500" />
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Total Packages
                </CardTitle>
                <div className="h-9 w-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <Layers className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-white">{totalPackages}</div>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-400" />
                  <span>Dynamic packages active</span>
                </p>
              </CardContent>
            </Card>

            {/* Metric Card: Featured / Favorites */}
            <Card className="bg-slate-900/60 border-slate-800/80 shadow-lg rounded-2xl relative overflow-hidden group hover:border-slate-700/60 transition-all">
              <div className="absolute top-0 left-0 w-[3px] h-full bg-amber-500" />
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Featured Favorites
                </CardTitle>
                <div className="h-9 w-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <Star className="h-5 w-5 fill-amber-500/20 text-amber-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-white">{totalFeatured}</div>
                <p className="text-xs text-slate-500 mt-1">
                  Showing on homepage carousel
                </p>
              </CardContent>
            </Card>

            {/* Metric Card: Average Package Price */}
            <Card className="bg-slate-900/60 border-slate-800/80 shadow-lg rounded-2xl relative overflow-hidden group hover:border-slate-700/60 transition-all">
              <div className="absolute top-0 left-0 w-[3px] h-full bg-emerald-500" />
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Average Pricing
                </CardTitle>
                <div className="h-9 w-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <DollarSign className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-white">${averagePrice}</div>
                <p className="text-xs text-slate-500 mt-1">
                  Mean booking list price
                </p>
              </CardContent>
            </Card>

            {/* Metric Card: Average User Rating */}
            <Card className="bg-slate-900/60 border-slate-800/80 shadow-lg rounded-2xl relative overflow-hidden group hover:border-slate-700/60 transition-all">
              <div className="absolute top-0 left-0 w-[3px] h-full bg-violet-500" />
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Average Rating
                </CardTitle>
                <div className="h-9 w-9 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
                  <Award className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-white">{averageRating} <span className="text-sm font-semibold text-slate-500">/ 5.0</span></div>
                <p className="text-xs text-slate-500 mt-1">
                  Based on mock feedback scores
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Layout: Breakdown vs Recent Activities */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Category Distribution progress list */}
            <Card className="lg:col-span-7 bg-slate-900/40 border-slate-800/80 shadow-lg rounded-3xl">
              <CardHeader>
                <CardTitle className="text-lg font-extrabold text-white flex items-center gap-2">
                  <Layers className="h-5 w-5 text-blue-400" />
                  Package Inventory Distribution
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Proportion of active tourism offerings sorted by primary travel categories.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Holidays */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-1.5 text-slate-350">
                      <Palmtree className="h-4 w-4 text-blue-400" />
                      Holidays
                    </span>
                    <span>{holidaysCount} packages ({getPercentage(holidaysCount)}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${getPercentage(holidaysCount)}%` }} />
                  </div>
                </div>

                {/* Cruise */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-1.5 text-slate-350">
                      <Ship className="h-4 w-4 text-violet-400" />
                      Cruises
                    </span>
                    <span>{cruiseCount} packages ({getPercentage(cruiseCount)}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-500 rounded-full" style={{ width: `${getPercentage(cruiseCount)}%` }} />
                  </div>
                </div>

                {/* Medical Tourism */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-1.5 text-slate-350">
                      <Stethoscope className="h-4 w-4 text-emerald-400" />
                      Medical Tourism
                    </span>
                    <span>{medicalCount} packages ({getPercentage(medicalCount)}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${getPercentage(medicalCount)}%` }} />
                  </div>
                </div>

                {/* Kerala Tourism */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-1.5 text-slate-350">
                      <MapPin className="h-4 w-4 text-amber-400" />
                      Kerala Tourism
                    </span>
                    <span>{keralaCount} packages ({getPercentage(keralaCount)}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${getPercentage(keralaCount)}%` }} />
                  </div>
                </div>

                {/* Fixed Departures */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-1.5 text-slate-350">
                      <CalendarDays className="h-4 w-4 text-rose-400" />
                      Fixed Departures
                    </span>
                    <span>{fixedCount} packages ({getPercentage(fixedCount)}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: `${getPercentage(fixedCount)}%` }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity Log Feed */}
            <Card className="lg:col-span-5 bg-slate-900/40 border-slate-800/80 shadow-lg rounded-3xl">
              <CardHeader>
                <CardTitle className="text-lg font-extrabold text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-indigo-400" />
                  Activity Logs
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Live system and CRUD auditing events in the browser context.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-3 text-xs leading-relaxed border-l-2 border-slate-800 pl-4 py-0.5 relative">
                    <div className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-blue-500" />
                    <div>
                      <p className="font-bold text-slate-200">Loaded package data from Supabase</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Live packages table, fetched via the packages API</p>
                    </div>
                  </div>

                  <div className="flex gap-3 text-xs leading-relaxed border-l-2 border-slate-800 pl-4 py-0.5 relative">
                    <div className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-amber-500" />
                    <div>
                      <p className="font-bold text-slate-200">{totalFeatured} Favorite packages active</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Ready to feed homepage featured carousel</p>
                    </div>
                  </div>

                  <div className="flex gap-3 text-xs leading-relaxed border-l-2 border-slate-800 pl-4 py-0.5 relative">
                    <div className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-emerald-500" />
                    <div>
                      <p className="font-bold text-slate-200">Auth Gate Secured</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Supabase Auth session verified server-side</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Link Category Shortcuts Grid */}
          <div className="space-y-4">
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-blue-400" />
              Category Specific Admin Desks
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { name: "Holidays Desk", count: holidaysCount, href: "/admin/holidays", color: "from-blue-500/20 to-blue-600/5 hover:border-blue-500/40", icon: Palmtree, iconCol: "text-blue-400" },
                { name: "Cruise Desk", count: cruiseCount, href: "/admin/cruise", color: "from-violet-500/20 to-violet-600/5 hover:border-violet-500/40", icon: Ship, iconCol: "text-violet-400" },
                { name: "Medical Desk", count: medicalCount, href: "/admin/medical", color: "from-emerald-500/20 to-emerald-600/5 hover:border-emerald-500/40", icon: Stethoscope, iconCol: "text-emerald-400" },
                { name: "Kerala Desk", count: keralaCount, href: "/admin/kerala", color: "from-amber-500/20 to-amber-600/5 hover:border-amber-500/40", icon: MapPin, iconCol: "text-amber-400" },
                { name: "Fixed Departures", count: fixedCount, href: "/admin/fixed-departures", color: "from-rose-500/20 to-rose-600/5 hover:border-rose-500/40", icon: CalendarDays, iconCol: "text-rose-400" },
              ].map((shortcut) => (
                <Link key={shortcut.name} href={shortcut.href} className="block group">
                  <div className={`p-5 rounded-2xl border border-slate-800/80 bg-slate-900/20 bg-gradient-to-b ${shortcut.color} transition-all duration-300 flex flex-col justify-between h-36`}>
                    <div className="flex justify-between items-start">
                      <div className={`h-9 w-9 rounded-xl bg-slate-950 flex items-center justify-center border border-slate-800 ${shortcut.iconCol}`}>
                        <shortcut.icon className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-950 px-2.5 py-0.5 rounded-full border border-slate-850">
                        {shortcut.count} Items
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">
                        {shortcut.name}
                      </span>
                      <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
