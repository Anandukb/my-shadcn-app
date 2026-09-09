"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import {
    Menu, X, Phone, Mail, Home, Package, MapPin, Globe2, Stethoscope, Info, TreePalm, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader, SheetClose } from "@/components/ui/sheet";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import LanguageSwitcher from "../LanguageSwitcher";
import { motion, useScroll, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";
import { LOGO_SECONDARY_URL } from "@/lib/brand-assets";
import { useBookNow } from "./BookNowDialog";
import { CONTACT_PHONE, CONTACT_EMAIL, CONTACT_PHONE_DIGITS } from "@/lib/contact";

export function Header() {
    const t = useTranslations();
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);
    const { open: openBookNow } = useBookNow();

    const { scrollYProgress } = useScroll();
    const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, restDelta: 0.001 });

    useEffect(() => {
        const onScroll = () => setIsScrolled(window.scrollY > 16);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const nav = useMemo(() => [
        { href: "/", label: t("nav.home"), icon: Home },
        { href: "/holiday-packages", label: t("nav.packages"), icon: Package },
        { href: "/fixed-departures", label: t("nav.fixed_departure"), icon: MapPin },
        { href: "/global-visa", label: t("nav.global_visa"), icon: Globe2 },
        { href: "/kerala-tourism", label: t("nav.kerala"), icon: TreePalm },
        { href: "/medical-tourism", label: t("nav.medical"), icon: Stethoscope },
        { href: "/about", label: t("nav.about"), icon: Info },
        { href: "/contact", label: t("nav.contact"), icon: Phone },
    ], [t]);

    const handleOpenBookNow = useCallback(() => openBookNow(), [openBookNow]);

    const isCurrent = (href: string) =>
        href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

    return (
        <header
            className={cn(
                "sticky top-0 z-50 border-b bg-page/90 backdrop-blur-md transition-shadow duration-300 supports-[backdrop-filter]:bg-page/75",
                isScrolled ? "border-line shadow-sm" : "border-transparent",
            )}
        >
            {/* The rail is tightened below 2xl: at 1280px the logo, eight links
                and the actions do not fit at wide padding and push the page
                into horizontal scroll. */}
            <div className="mx-auto flex h-[4.5rem] w-full max-w-[82rem] items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
                <Link href="/" className="relative h-10 w-[8.5rem] shrink-0 transition-opacity hover:opacity-80 2xl:w-[9.5rem]">
                    <Image
                        src={LOGO_SECONDARY_URL}
                        alt={t("title")}
                        fill
                        sizes="152px"
                        className="object-contain object-left rtl:object-right"
                        priority
                    />
                </Link>

                <nav className="hidden items-center gap-0.5 xl:flex">
                    {nav.map((n) => {
                        const active = isCurrent(n.href);
                        return (
                            <Link
                                key={n.href}
                                href={n.href}
                                aria-current={active ? "page" : undefined}
                                className={cn(
                                    "relative whitespace-nowrap rounded-full px-3 py-2 text-[13px] font-medium transition-colors duration-200",
                                    active
                                        ? "text-brand-ink"
                                        : "text-on-page-muted hover:bg-tint hover:text-on-page",
                                )}
                            >
                                {n.label}
                                {active && (
                                    <motion.span
                                        layoutId="nav-active"
                                        className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-brand"
                                        transition={{ type: "spring", stiffness: 340, damping: 30 }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="flex shrink-0 items-center gap-2.5">
                    <div className="hidden sm:block">
                        <LanguageSwitcher />
                    </div>

                    <Button
                        type="button"
                        onClick={handleOpenBookNow}
                        className="hidden h-10 cursor-pointer rounded-full border-0 bg-brand px-5 text-[13px] font-semibold text-on-brand shadow-sm transition-all hover:brightness-110 hover:shadow md:inline-flex"
                    >
                        {t("nav.bookNow")}
                    </Button>

                    <div className="xl:hidden">
                        <MobileMenu nav={nav} onBookNow={handleOpenBookNow} isCurrent={isCurrent} />
                    </div>
                </div>
            </div>

            {/* Reading progress — a quiet cue that the page is long */}
            <motion.div
                aria-hidden
                style={{ scaleX: progress }}
                className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-brand rtl:origin-right"
            />
        </header>
    );
}

function MobileMenu({
    nav,
    onBookNow,
    isCurrent,
}: {
    nav: { href: string; label: string; icon: React.ElementType }[];
    onBookNow: () => void;
    isCurrent: (href: string) => boolean;
}) {
    const t = useTranslations();
    const [open, setOpen] = useState(false);

    const handleBookNowClick = useCallback(() => {
        setOpen(false);
        onBookNow();
    }, [onBookNow]);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t("nav.home")}
                    className="size-10 shrink-0 cursor-pointer rounded-full text-on-page hover:bg-tint"
                >
                    <Menu className="size-5" />
                </Button>
            </SheetTrigger>

            <SheetContent side="right" className="flex w-[320px] flex-col border-0 bg-page p-0">
                <SheetHeader className="flex-row items-center justify-between border-b border-line px-5 py-4 text-start">
                    <SheetTitle asChild>
                        <span className="relative block h-9 w-32">
                            <Image
                                src={LOGO_SECONDARY_URL}
                                alt={t("title")}
                                fill
                                sizes="128px"
                                className="object-contain object-left rtl:object-right"
                            />
                        </span>
                    </SheetTitle>
                    <SheetClose asChild>
                        <button
                            type="button"
                            aria-label={t("services_home.close")}
                            className="rounded-full p-2 text-on-page-muted transition-colors hover:bg-tint hover:text-on-page"
                        >
                            <X className="size-5" />
                        </button>
                    </SheetClose>
                </SheetHeader>

                <nav className="flex-1 overflow-y-auto p-3">
                    {nav.map((n, i) => {
                        const Icon = n.icon;
                        const active = isCurrent(n.href);
                        return (
                            <motion.div
                                key={n.href}
                                initial={{ opacity: 0, x: 16 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.03 * i, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <Link
                                    href={n.href}
                                    onClick={() => setOpen(false)}
                                    aria-current={active ? "page" : undefined}
                                    className={cn(
                                        "group flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-[15px] font-medium transition-colors",
                                        active
                                            ? "bg-brand-soft text-brand-ink"
                                            : "text-on-page hover:bg-tint",
                                    )}
                                >
                                    <Icon className={cn("size-[18px] shrink-0", active ? "text-brand" : "text-on-page-faint")} />
                                    <span className="flex-1">{n.label}</span>
                                    <ArrowRight className="size-4 opacity-0 transition-opacity group-hover:opacity-40 rtl:rotate-180" />
                                </Link>
                            </motion.div>
                        );
                    })}
                </nav>

                <div className="border-t border-line p-5">
                    <div className="mb-4">
                        <LanguageSwitcher />
                    </div>

                    <Button
                        type="button"
                        onClick={handleBookNowClick}
                        className="mb-5 h-12 w-full cursor-pointer rounded-full border-0 bg-brand text-sm font-semibold text-on-brand hover:brightness-110"
                    >
                        {t("nav.bookNow")}
                    </Button>

                    <div className="space-y-2.5 text-sm text-on-page-muted">
                        <a href={`tel:${CONTACT_PHONE_DIGITS}`} className="flex items-center gap-3 transition-colors hover:text-brand-ink">
                            <Phone className="size-4 shrink-0 text-brand" />
                            {CONTACT_PHONE}
                        </a>
                        <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-3 break-all transition-colors hover:text-brand-ink">
                            <Mail className="size-4 shrink-0 text-brand" />
                            {CONTACT_EMAIL}
                        </a>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
