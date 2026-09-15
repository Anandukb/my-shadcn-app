"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { FadeIn } from "@/components/ui/motion";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
    title: React.ReactNode;
    description?: string;
    image: string;
    imageAlt: string;
    children?: React.ReactNode;
    badgeText?: string;
    height?: string;
    overlayOpacity?: string;
    className?: string;
}

export function PageHeader({
    title,
    description,
    image,
    imageAlt,
    children,
    badgeText,
    height = "50vh",
    overlayOpacity = "bg-black/40",
    className,
}: PageHeaderProps) {
    return (
        <section
            className={cn("relative w-full flex items-center justify-center overflow-hidden", className)}
            style={{ minHeight: "460px", height }}
        >
            <div className="absolute inset-0 z-0">
                <motion.div
                    initial={{ scale: 1 }}
                    animate={{ scale: 1.08 }}
                    transition={{ duration: 20, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
                    className="absolute inset-0"
                >
                    <Image
                        src={image}
                        alt={imageAlt}
                        fill
                        sizes="100vw"
                        className="object-cover brightness-[0.75]"
                        priority
                    />
                </motion.div>
                <div className={cn("absolute inset-0", overlayOpacity)} />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                {/* Extra top darkening so the floating header stays legible */}
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/70 to-transparent" />
            </div>

            <div className="container mx-auto px-4 text-center z-10 pt-24 md:pt-28">
                <FadeIn>
                    {badgeText && (
                        <div className="flex items-center justify-center gap-2 mb-5">
                            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                            <Badge
                                variant="outline"
                                className="text-white border-white/20 bg-white/10 backdrop-blur-md px-5 py-2 text-xs font-bold tracking-[0.25em] uppercase rounded-full shadow-2xl"
                            >
                                {badgeText}
                            </Badge>
                        </div>
                    )}
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight mb-4 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-base md:text-xl text-white/90 max-w-2xl mx-auto font-light leading-relaxed">
                            {description}
                        </p>
                    )}

                    {children && <div className="mt-8">{children}</div>}
                </FadeIn>
            </div>
        </section>
    );
}
