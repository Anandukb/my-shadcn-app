"use client";

import { Phone, Mail, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { CONTACT_PHONE, CONTACT_EMAIL, CONTACT_PHONE_DIGITS } from "@/lib/contact";

export function TopBar() {
    const t = useTranslations();

    return (
        <div className="hidden border-b border-line bg-surface-alt text-on-page-muted md:block">
            <div className="mx-auto flex w-full max-w-[82rem] items-center justify-between gap-6 px-5 py-2 text-xs sm:px-8 lg:px-12">
                <div className="flex items-center gap-6">
                    <a
                        href={`tel:${CONTACT_PHONE_DIGITS}`}
                        className="inline-flex items-center gap-2 transition-colors hover:text-brand-ink"
                    >
                        <Phone className="h-3.5 w-3.5 text-brand" />
                        {CONTACT_PHONE}
                    </a>
                    <a
                        href={`mailto:${CONTACT_EMAIL}`}
                        className="inline-flex items-center gap-2 transition-colors hover:text-brand-ink"
                    >
                        <Mail className="h-3.5 w-3.5 text-brand" />
                        {CONTACT_EMAIL}
                    </a>
                    <span className="inline-flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-brand" />
                        {t("topBar.location")}
                    </span>
                </div>

                <span className="inline-flex items-center gap-2 text-on-page-faint">
                    <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand" />
                    </span>
                    {t("topBar.support")}
                </span>
            </div>
        </div>
    );
}
