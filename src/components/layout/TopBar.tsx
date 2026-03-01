"use client";

import { usePathname } from "next/navigation";
import { Phone, Mail, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function TopBar() {
    return (
        <div className="hidden md:block bg-slate-950 text-slate-300 border-b border-slate-900">
            <div className="container mx-auto px-6 flex items-center justify-between py-2 text-xs font-medium tracking-wide">
                <div className="flex items-center gap-6">
                    <span className="inline-flex items-center gap-2 hover:text-white transition-colors cursor-pointer"><Phone className="h-3.5 w-3.5 text-primary" /> +974 5555 5555</span>
                    <span className="inline-flex items-center gap-2 hover:text-white transition-colors cursor-pointer"><Mail className="h-3.5 w-3.5 text-primary" /> hello@travelco.com</span>
                    <span className="inline-flex items-center gap-2 hover:text-white transition-colors cursor-pointer"><MapPin className="h-3.5 w-3.5 text-primary" /> Doha, Qatar</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-white/70">24/7 Premium Support Available</span>
                </div>
            </div>
        </div>
    );
}
