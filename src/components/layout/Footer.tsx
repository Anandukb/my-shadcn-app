"use client";

import React from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Phone, Mail, MapPin, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export function SiteFooter() {
    return (
        <div className="flex flex-col w-full relative mt-16">
            <div className="w-full relative pointer-events-none -mb-1 z-10 overflow-hidden">
                {/* Note: This pulls the silhouette image placed in public/images/ */}
                <img
                    src="/images/travel-pic.png"
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
                            <Image src="/images/Logo2.png" alt="Maram Holidays Logo" fill className="bg-white object-contain object-left" />
                        </div>
                    </div>
                    <p className="text-white/60 leading-relaxed">
                        Your trusted partner for memorable journeys. We craft personalized travel experiences that inspire and delight.
                    </p>
                    <div className="flex gap-4">
                        {/* Social placeholders */}
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-10 w-10 rounded-full bg-white/5 hover:bg-white/20 transition-colors cursor-pointer" />
                        ))}
                    </div>
                </div>

                <div>
                    <h4 className="font-bold text-lg mb-6">Company</h4>
                    <ul className="space-y-4 text-white/60">
                        <li><Link href="#" className="hover:text-white transition-colors">About Us</Link></li>
                        <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
                        <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                        <li><Link href="#" className="hover:text-white transition-colors">Press</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-lg mb-6">Support</h4>
                    <ul className="space-y-4 text-white/60">
                        <li><Link href="#" className="hover:text-white transition-colors">Contact Us</Link></li>
                        <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
                        <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                        <li><Link href="#" className="hover:text-white transition-colors">FAQs</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-lg mb-6">Get in Touch</h4>
                    <div className="space-y-4 text-white/80">
                        <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-primary mt-1" />
                            <span>West Bay, Doha, Qatar<br />PO Box 12345</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Phone className="h-5 w-5 text-primary" />
                            <span>+974 5555 5555</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-primary" />
                            <span>hello@maramholidays.com</span>
                        </div>
                    </div>
                </div>
            </div>

            <Separator className="bg-white/10 mb-10" />

            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-white/40">
                <p>© 2024 Maram Holidays. All rights reserved.</p>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                        <Globe className="h-4 w-4" />
                        <span>English (US)</span>
                    </div>
                </div>
            </div>
        </footer>
        </div>
    );
}
