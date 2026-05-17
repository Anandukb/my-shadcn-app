"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check local storage for auth token
    const auth = localStorage.getItem("admin_auth");
    
    if (auth === "true") {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      // Wait a tiny bit for UX and then redirect
      const timer = setTimeout(() => {
        router.push("/admin/login");
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [router]);

  // Loading/Redirecting State
  if (isAuthenticated === null || isAuthenticated === false) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-slate-100 font-sans p-6">
        {/* Animated Background blobs for aesthetic depth */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
        
        <div className="relative z-10 flex flex-col items-center max-w-sm text-center">
          {/* Futuristic glowing spinner */}
          <div className="relative mb-6 flex items-center justify-center">
            <div className="h-16 w-16 rounded-full border-4 border-slate-800 border-t-blue-500 animate-spin" />
            <div className="absolute h-10 w-10 rounded-full border-4 border-slate-900 border-b-violet-500 animate-spin-reverse" />
          </div>
          
          <h2 className="text-xl font-bold tracking-tight mb-2 bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
            Checking Authentication...
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Please wait while we verify your administrator credentials and establish a secure connection.
          </p>
        </div>
      </div>
    );
  }

  // Render children once validated
  return <>{children}</>;
}
