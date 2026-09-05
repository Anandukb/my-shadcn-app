"use client";

import React from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { LOGO_SECONDARY_URL, TRAVEL_PIC_URL } from "@/lib/brand-assets";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const SocialMedia = () => {
    return (
        <div className="flex gap-4">
            {/* Social placeholders */}
            {[
                { name: "facebook", icon: "/svg/icon-fb.svg" },
                { name: "instagram", icon: "/svg/icon-insta.svg" },
                { name: "twitter", icon: "/svg/icon-linkedin.svg" },
                { name: "linkedin", icon: "/svg/icon-yt.svg" },
            ].map(i => (
                <div key={i.name} className="h-10 w-10 rounded-full bg-white/5 hover:bg-white/20 transition-colors cursor-pointer"><img src={i.icon} alt={i.name} /></div>
            ))}
        </div>
    )
}

export function SiteFooter() {
    const t = useTranslations();
    return (
        <div className="flex flex-col w-full relative mt-16">
            <div className="w-full relative pointer-events-none -mb-1 z-10 overflow-hidden">
                <img
                    src={TRAVEL_PIC_URL}
                    alt="Travel Landscape"
                    className="w-full h-auto min-h-[80px] md:min-h-[150px] object-cover object-bottom"
                    onError={(e) => {
                        // Fallback if image isn't named correctly yet
                        e.currentTarget.style.display = 'none';
                    }}
                />
            </div>
            <footer id="contact" className="bg-[#1e262f] text-background pt-12 pb-10 relative z-20">
                <div className="container mx-auto px-4 grid md:grid-cols-4 gap-12 mb-16">
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="h-20 w-64 relative">
                            <Image src={LOGO_SECONDARY_URL} alt="Maram Holidays Logo" fill sizes="256px" className="bg-white object-contain object-left" />
                        </div>
                    </div>
                    <p className="text-white/60 leading-relaxed">
                        {t('footer.tagline')}
                    </p>
                        <SocialMedia />
                </div>

                <div>
                    <h4 className="font-bold text-lg mb-6">{t('footer.company')}</h4>
                    <ul className="space-y-4 text-white/60">
                        <li><Link href="/about" className="hover:text-white transition-colors">{t('footer.aboutUs')}</Link></li>
                        <li><Link href="#" className="hover:text-white transition-colors">{t('footer.careers')}</Link></li>
                        <li><Link href="#" className="hover:text-white transition-colors">{t('footer.blog')}</Link></li>
                        <li><Link href="#" className="hover:text-white transition-colors">{t('footer.press')}</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-lg mb-6">{t('footer.support')}</h4>
                    <ul className="space-y-4 text-white/60">
                        <li><Link href="/contact" className="hover:text-white transition-colors">{t('footer.contactUs')}</Link></li>
                        <li><Link href="#" className="hover:text-white transition-colors">{t('footer.termsOfService')}</Link></li>
                        <li><Link href="#" className="hover:text-white transition-colors">{t('footer.privacyPolicy')}</Link></li>
                        <li><Link href="#" className="hover:text-white transition-colors">{t('footer.faqs')}</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-lg mb-6">{t('footer.getInTouch')}</h4>
                    <div className="space-y-4 text-white/80">
                        <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-primary mt-1" />
                                <span>{t('footer.address')}<br /></span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Phone className="h-5 w-5 text-primary" />
                                <span>+91 9446678765</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-primary" />
                                <span>info@maramtoursandtravels.com</span>
                        </div>
                    </div>
                </div>
            </div>

            <Separator className="bg-white/10 mb-10" />

            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-white/40">
                    <p>{t('footer.copyright')}</p>
                    {/* <p>Developed by </p> */}
                <div className="flex items-center gap-6">
                    <LanguageSwitcher />
                </div>
            </div>
        </footer>
        </div>
    );
}
