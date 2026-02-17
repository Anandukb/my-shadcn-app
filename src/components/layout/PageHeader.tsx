"use client";

import React from "react";
import Image from "next/image";
import { FadeIn } from "@/components/ui/motion";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
    title: React.ReactNode;
    description?: string;
    image: string;
    imageAlt: string;
    children?: React.ReactNode;
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
    height = "40vh",
    overlayOpacity = "bg-black/30",
    className,
}: PageHeaderProps) {
    return (
        <section
            className={cn("relative w-full flex items-center justify-center overflow-hidden", className)}
            style={{ minHeight: "400px", height }}
        >
            <div className="absolute inset-0 -z-10">
                <Image
                    src={image}
                    alt={imageAlt}
                    fill
                    className="object-cover brightness-[0.7]"
                    priority
                />
                <div className={cn("absolute inset-0", overlayOpacity)} />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
            </div>

            <div className="container mx-auto px-4 text-center z-10 pt-10">
                <FadeIn>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-4 drop-shadow-xl">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-light leading-relaxed">
                            {description}
                        </p>
                    )}

                    {children && <div className="mt-8">{children}</div>}
                </FadeIn>
            </div>
        </section>
    );
}
