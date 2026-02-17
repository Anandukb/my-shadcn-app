"use client";

import Image from "next/image";
import { Menu, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import LanguageSwitcher from "../LanguageSwitcher";

export function Header() {
    const t = useTranslations()
    const nav = [
        { href: "/", label: t('nav.home') },
        { href: "/#destinations", label: t('nav.destinations') },
        { href: "/#cruise", label: t('nav.cruise') },
        { href: "/#medical", label: t('nav.medical') },
        { href: "/visa", label: t('nav.visa_services') },
        { href: "/#about", label: t('nav.about') },
        { href: "/#contact", label: t('nav.contact') },
    ];

    return (
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
            <div className="container mx-auto px-4 flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center gap-3">
                    <Image src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=400&auto=format&fit=crop" alt="TravelCo Logo" width={36} height={36} className="rounded-full" />
                    <span className="font-bold text-xl tracking-tight">TravelCo</span>
                </Link>

                <nav className="hidden lg:flex items-center gap-6">
                    {nav.map((n) => (
                        <Link key={n.href} href={n.href} className="text-sm hover:text-primary transition-colors">
                            {n.label}
                        </Link>
                    ))}
                    <LanguageSwitcher />
                    <Button asChild>
                        <Link href="/#book">{t('nav.bookNow')}</Link>
                    </Button>
                </nav>

                <div className="lg:hidden flex items-center gap-2">
                    <LanguageSwitcher />
                    <MobileMenu nav={nav} />
                </div>
            </div>
        </header>
    );
}

function MobileMenu({ nav }: { nav: { href: string; label: string }[] }) {
    const t = useTranslations();
    
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0"><Menu className="h-5 w-5" /></Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[320px] px-4">
                <div className="flex items-center gap-3 mb-6">
                    <Image src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=200&auto=format&fit=crop" alt="TravelCo Logo" width={32} height={32} className="rounded-full" />
                    <span className="font-semibold">TravelCo</span>
                </div>
                <nav className="grid gap-3">
                    {nav.map((n) => (
                        <Link key={n.href} href={n.href} className="py-2 text-base hover:text-primary">
                            {n.label}
                        </Link>
                    ))}
                    <Button asChild className="mt-2">
                        <Link href="#book">{t('nav.bookNow')}</Link>
                    </Button>
                </nav>
                <Separator className="my-6" />
                <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="inline-flex items-center gap-2"><Phone className="h-4 w-4" /> +974 5555 5555</div>
                    <div className="inline-flex items-center gap-2"><Mail className="h-4 w-4" /> hello@travelco.com</div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
