"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Phone, Mail, MapPin, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export function SiteFooter() {
    return (
        <footer id="contact" className="bg-foreground text-background pt-20 pb-10">
            <div className="container mx-auto px-4 grid md:grid-cols-4 gap-12 mb-16">
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 relative rounded-full overflow-hidden bg-white/10">
                            <Image src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=200&auto=format&fit=crop" alt="TravelCo Logo" fill className="object-cover" />
                        </div>
                        <span className="font-bold text-2xl tracking-tight">TravelCo</span>
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
                            <span>hello@travelco.com</span>
                        </div>
                    </div>
                </div>
            </div>

            <Separator className="bg-white/10 mb-10" />

            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-white/40">
                <p>© 2024 TravelCo. All rights reserved.</p>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                        <Globe className="h-4 w-4" />
                        <span>English (US)</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
