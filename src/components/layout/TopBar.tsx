"use client";

import { usePathname } from "next/navigation";
import { Phone, Mail, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function TopBar() {
    return (
        <div className="hidden md:block border-b bg-muted/30">
            <div className="container mx-auto px-4 flex items-center justify-between py-2 text-sm">
                <div className="flex items-center gap-4">
                    <span className="inline-flex items-center gap-2"><Phone className="h-4 w-4" /> +974 5555 5555</span>
                    <span className="inline-flex items-center gap-2"><Mail className="h-4 w-4" /> hello@travelco.com</span>
                    <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" /> Doha, Qatar</span>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="rounded-full">24/7 Support</Badge>
                </div>
            </div>
        </div>
    );
}
