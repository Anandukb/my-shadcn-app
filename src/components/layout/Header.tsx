"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
    Menu, Phone, Mail, Home, Package, MapPin, Globe2, Ship, Stethoscope, Info, TreePalm
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import LanguageSwitcher from "../LanguageSwitcher";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Header() {
    const t = useTranslations();
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const nav = [
        { href: "/", label: t('nav.home'), icon: Home },
        { href: "/holiday-packages", label: t('nav.packages'), icon: Package },
        { href: "/#destinations", label: t('nav.fixed_departure'), icon: MapPin },
        { href: "/global-visa", label: t('nav.global_visa'), icon: Globe2 },
        { href: "/kerala-tourism", label: t('nav.kerala'), icon: TreePalm },
        { href: "/medical-tourism", label: t('nav.medical'), icon: Stethoscope },
        { href: "/#about", label: t('nav.about'), icon: Info },
        { href: "/#contact", label: t('nav.contact'), icon: Phone },
    ];

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
                            src="/images/Logo2.png"
                            alt={t('title')}
                            fill
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
                    <Button className="hidden md:inline-flex rounded-full shadow-md hover:shadow-lg transition-all" asChild>
                        <Link href="/#book">{t('nav.bookNow')}</Link>
                    </Button>
                    <div className="xl:hidden flex items-center">
                        <MobileMenu nav={nav} />
                    </div>
                </div>
            </motion.div>
        </header>
    );
}

function MobileMenu({ nav }: { nav: { href: string; label: string; icon: React.ElementType }[] }) {
    const t = useTranslations();

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
                    <Menu className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[320px] px-6 border-l-0 shadow-2xl flex flex-col h-full">
                <SheetHeader className="text-left mt-2">
                    <SheetTitle>
                        <div className="flex items-center gap-3">
                            <div className="relative w-32 h-10">
                                <Image
                                    src="/images/Logo.png"
                                    alt={t('title')}
                                    fill
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
                            <Link key={n.href} href={n.href} className="flex items-center gap-4 py-3 px-4 rounded-xl text-base font-medium hover:bg-primary/10 hover:text-primary transition-all">
                                <Icon className="w-5 h-5 text-muted-foreground" />
                                {n.label}
                            </Link>
                        )
                    })}
                </nav>

                <div className="mt-auto pt-6 pb-2">
                    <Button className="w-full rounded-full h-12 text-base shadow-lg mb-6" asChild>
                        <Link href="#book">{t('nav.bookNow')}</Link>
                    </Button>
                    <Separator className="my-4" />
                    <div className="space-y-3 text-sm text-muted-foreground bg-muted/30 p-4 rounded-2xl">
                        <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-primary" /> +974 5555 5555</div>
                        <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-primary" /> hello@maramholidays.com</div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
