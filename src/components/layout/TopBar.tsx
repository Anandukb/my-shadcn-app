"use client";

import { Phone, Mail, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";

export function TopBar() {
    const t = useTranslations();
    return (
        <div className="hidden md:block bg-slate-950 text-slate-300 border-b border-slate-900">
            <div className="container mx-auto px-6 flex items-center justify-between py-2 text-xs font-medium tracking-wide">
                <div className="flex items-center gap-6">
                    <span className="inline-flex items-center gap-2 hover:text-white transition-colors cursor-pointer"><Phone className="h-3.5 w-3.5 text-primary" /> +91 9446678765</span>
                    <span className="inline-flex items-center gap-2 hover:text-white transition-colors cursor-pointer"><Mail className="h-3.5 w-3.5 text-primary" /> info@maramtoursandtravels.com</span>
                    <span className="inline-flex items-center gap-2 hover:text-white transition-colors cursor-pointer"><MapPin className="h-3.5 w-3.5 text-primary" />{t('topBar.location')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-white/70">{t('topBar.support')}</span>
                </div>
            </div>
        </div>
    );
}
