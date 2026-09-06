"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import {
    Menu, Phone, Mail, Home, Package, MapPin, Globe2, Stethoscope, Info, TreePalm
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import LanguageSwitcher from "../LanguageSwitcher";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LOGO_URL, LOGO_SECONDARY_URL } from "@/lib/brand-assets";
import { useBookNow } from "./BookNowDialog";

export function Header() {
    const t = useTranslations();
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);
    const { open: openBookNow } = useBookNow();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Memoize nav items so they don't reallocate on every scroll-driven render
    const nav = useMemo(() => [
        { href: "/", label: t('nav.home'), icon: Home },
        { href: "/holiday-packages", label: t('nav.packages'), icon: Package },
        { href: "/fixed-departures", label: t('nav.fixed_departure'), icon: MapPin },
        { href: "/global-visa", label: t('nav.global_visa'), icon: Globe2 },
        { href: "/kerala-tourism", label: t('nav.kerala'), icon: TreePalm },
        { href: "/medical-tourism", label: t('nav.medical'), icon: Stethoscope },
        { href: "/about", label: t('nav.about'), icon: Info },
        { href: "/contact", label: t('nav.contact'), icon: Phone },
    ], [t]);

    const handleOpenBookNow = useCallback(() => openBookNow(), [openBookNow]);

    return (
        <header className="sticky top-0 z-50 pt-4 px-4 pb-2">
            <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className={cn(
                    "container mx-auto flex h-16 items-center justify-between px-6 rounded-full transition-all duration-500",
                    isScrolled
                        ? "bg-background/80 backdrop-blur-xl shadow-lg border border-border/50"
                        : "bg-background/30 backdrop-blur-md shadow-sm border border-border/20"
                )}
            >
                <Link href="/" className="flex items-center gap-3 shrink-0">
                    <div className="relative h-10 w-40">
                        <Image
                            src={LOGO_SECONDARY_URL}
                            alt={t('title')}
                            fill
                            sizes="160px"
                            className="object-contain object-left"
                            priority
                        />
                    </div>
                </Link>

                <nav className="hidden xl:flex items-center justify-center gap-1">
                    {nav.map((n) => {
                        // Very simple active state check
                        const isActive = pathname === n.href || (n.href !== "/" && pathname.startsWith(n.href));
                        return (
                            <Link key={n.href} href={n.href} className={cn(
                                "relative group px-2 py-2 text-[13px] whitespace-nowrap font-semibold transition-colors rounded-full hover:text-primary",
                                isActive ? "text-primary" : "text-foreground/70"
                            )}>
                                {n.label}
                                <span className={cn(
                                    "absolute inset-x-2 -bottom-0 h-0.5 bg-primary rounded-full transition-all duration-300",
                                    isActive ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100"
                                )} />
                            </Link>
                        )
                    })}
                </nav>

                <div className="flex items-center gap-4 shrink-0">
                    <div className="hidden sm:block">
                        <LanguageSwitcher />
                    </div>
                    <Button
                        type="button"
                        onClick={handleOpenBookNow}
                        className="cursor-pointer hidden md:inline-flex rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold px-6 h-10 text-xs uppercase tracking-widest hover:shadow-emerald-500/25 shadow-md hover:scale-105 active:scale-95 transition-all duration-300 border-0"
                    >
                        {t('nav.bookNow')}
                    </Button>
                    <div className="cursor-pointer xl:hidden flex items-center">
                        <MobileMenu nav={nav} onBookNow={handleOpenBookNow} />
                    </div>
                </div>
            </motion.div>
        </header>
    );
}

function MobileMenu({ nav, onBookNow }: { nav: { href: string; label: string; icon: React.ElementType }[]; onBookNow: () => void }) {
    const t = useTranslations();
    const [open, setOpen] = useState(false);

    const handleBookNowClick = useCallback(() => {
        setOpen(false);
        onBookNow();
    }, [onBookNow]);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="cursor-pointer shrink-0 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
                    <Menu className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[320px] px-6 border-l-0 shadow-2xl flex flex-col h-full">
                <SheetHeader className="text-left mt-2">
                    <SheetTitle>
                        <div className="flex items-center gap-3">
                            <div className="relative w-32 h-10">
                                <Image
                                    src={LOGO_URL}
                                    alt={t('title')}
                                    fill
                                    sizes="128px"
                                    className="object-contain object-left"
                                />
                            </div>
                        </div>
                    </SheetTitle>
                </SheetHeader>

                <div className="my-6">
                    <LanguageSwitcher />
                </div>

                <nav className="grid gap-2 flex-grow overflow-y-auto pr-2 pb-6">
                    {nav.map((n) => {
                        const Icon = n.icon;
                        return (
                            <Link
                                key={n.href}
                                href={n.href}
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-4 py-3 px-4 rounded-xl text-base font-medium hover:bg-primary/10 hover:text-primary transition-all"
                            >
                                <Icon className="w-5 h-5 text-muted-foreground" />
                                {n.label}
                            </Link>
                        )
                    })}
                </nav>

                <div className="mt-auto pt-6 pb-2">
                    <Button
                        type="button"
                        onClick={handleBookNowClick}
                        className="cursor-pointer w-full rounded-full h-12 text-base font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20 mb-6 border-0"
                    >
                        {t('nav.bookNow')}
                    </Button>
                    <Separator className="my-4" />
                    <div className="space-y-3 text-sm text-muted-foreground bg-muted/30 p-4 rounded-2xl">
                        <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-primary" /> +91 9446678765</div>
                        <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-primary" /> info@maramtoursandtravels.com</div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
