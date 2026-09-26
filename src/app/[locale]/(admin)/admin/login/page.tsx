"use client";

import React, { useState } from "react";
import { useLocale } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { resetAdminClientState } from "@/lib/admin-session";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ShieldAlert, ArrowRight, Loader2, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AdminThemeToggle from "@/components/admin/AdminThemeToggle";
import { createClient } from "@/lib/supabase/browser";

export default function AdminLoginPage() {
  const queryClient = useQueryClient();
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    setIsLoading(false);

    if (signInError) {
      setError("Invalid email or password. Please verify your credentials and try again.");
      return;
    }

    // Drop anything cached for a previous account, then do a full load so the
    // dashboard starts from a clean slate with this account's permissions.
    resetAdminClientState(queryClient);
    window.location.assign(`/${locale}/admin`);
  };

  return (
    <div className="min-h-screen w-full bg-adm-page flex items-center justify-center relative overflow-hidden px-4 select-none">
      {/* Visual background accents */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--adm-line)_1px,transparent_1px),linear-gradient(to_bottom,var(--adm-line)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-60" />

      <AdminThemeToggle className="absolute top-4 right-4 z-20" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="backdrop-blur-xl bg-adm-surface/90 border-adm-line shadow-2xl relative overflow-hidden rounded-[2rem]">
          {/* Top glowing gradient border accent */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
          
          <CardHeader className="text-center pt-8 pb-4">
            <div className="mx-auto mb-4 h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-extrabold text-xl">
              M
            </div>
            <Badge variant="outline" className="mx-auto mb-2 text-adm-accent border-blue-500/20 bg-blue-500/5 uppercase tracking-[0.25em] text-[9px] px-3.5 py-0.5 rounded-full font-bold">
              Protected Portal
            </Badge>
            <CardTitle className="text-2xl md:text-3xl font-black tracking-tight text-adm-fg mt-1">
              Administrator Login
            </CardTitle>
            <CardDescription className="text-adm-muted text-xs md:text-sm max-w-xs mx-auto leading-relaxed mt-2">
              Enter your privileged credentials below to access the Maram Holidays administration cockpit.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 md:px-8 pb-8 pt-2">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-adm-fg-2 flex items-center gap-1.5 px-1">
                  <Mail className="h-3.5 w-3.5 text-adm-accent" />
                  Email Address
                </label>
                <div className="relative">
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@maram.com"
                    disabled={isLoading}
                    className="h-12 border-adm-line bg-adm-page/50 text-adm-fg placeholder:text-adm-faint focus-visible:ring-blue-500 focus-visible:border-blue-500 hover:border-adm-line-strong/60 rounded-xl pl-4 pr-4 transition-colors"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-bold text-adm-fg-2 flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-adm-violet" />
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isLoading}
                    className="h-12 border-adm-line bg-adm-page/50 text-adm-fg placeholder:text-adm-faint focus-visible:ring-blue-500 focus-visible:border-blue-500 hover:border-adm-line-strong/60 rounded-xl pl-4 pr-12 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-adm-muted hover:text-adm-fg transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Error Alert Display */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3.5 rounded-xl border border-red-500/20 bg-red-500/10 flex items-start gap-3 text-adm-danger text-xs leading-relaxed">
                      <ShieldAlert className="h-5 w-5 text-adm-danger shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block mb-0.5">Authentication Failed</span>
                        {error}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 font-bold rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    Establishing Connection...
                  </>
                ) : (
                  <>
                    Sign In to Console
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

      </motion.div>
    </div>
  );
}
