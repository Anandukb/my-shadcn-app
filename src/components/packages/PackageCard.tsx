import React from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Calendar } from "lucide-react";
import { Package } from "@/types/package";

export function PackageCard({ pkg }: { pkg: Package }) {
    return (
        <Card className="group flex flex-col overflow-hidden bg-white/50 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-3xl">
            {/* Image Container */}
            <div className="relative h-64 overflow-hidden shrink-0">
                <Image
                    src={pkg.image}
                    alt={pkg.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent opacity-80" />
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 to-transparent" />

                {/* Top Badges */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                    {pkg.featured ? (
                        <Badge className="bg-amber-500/90 hover:bg-amber-500 text-white border-0 shadow-md backdrop-blur-md">
                            Best Seller
                        </Badge>
                    ) : (
                        <div />
                    )}
                    <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-xs font-semibold shadow-md">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span>{pkg.rating} <span className="opacity-70 font-normal">({pkg.reviews})</span></span>
                    </div>
                </div>

                {/* Bottom Image Info */}
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                    <div className="flex items-center gap-1.5 text-white shadow-md bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full text-sm font-medium border border-white/20">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate max-w-[150px]">{pkg.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-white shadow-md bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full text-sm font-medium border border-white/20">
                        <Calendar className="h-4 w-4" />
                        <span>{pkg.duration.split('/')[0].trim()}</span>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <CardContent className="p-6 flex flex-col flex-1">
                <div className="mb-4">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {pkg.title}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-2">
                        {pkg.description}
                    </p>
                </div>

                {/* Highlights/Includes */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                    {pkg.includes.slice(0, 3).map((item, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs bg-muted/50 text-foreground font-normal rounded-lg px-2.5 py-1 hover:bg-muted/80">
                            {item}
                        </Badge>
                    ))}
                    {pkg.includes.length > 3 && (
                        <Badge variant="secondary" className="text-xs bg-muted/40 text-foreground font-normal rounded-lg px-2.5 py-1">
                            +{pkg.includes.length - 3}
                        </Badge>
                    )}
                </div>

                {/* Price & Action */}
                <div className="flex items-center justify-between pt-4 border-t mt-auto">
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">Starts From</p>
                        <p className="text-2xl font-black text-primary">
                            QAR {pkg.price.toLocaleString()}
                        </p>
                    </div>
                    <Button className="rounded-full shadow-lg hover:shadow-primary/25 px-6 font-semibold" asChild>
                        <Link href={`/packages/${pkg.id}`}>View Details</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
