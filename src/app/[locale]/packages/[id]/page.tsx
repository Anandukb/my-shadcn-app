import React from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Star, CheckCircle2 } from "lucide-react";
import { getPackageById } from "@/lib/api";

export async function generateMetadata(
  // @ts-ignore : params typing differs based on Next version
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const pkg = await getPackageById(params.id);
  
  if (!pkg) {
    return {
      title: "Package Not Found"
    };
  }

  return {
    title: `${pkg.title} | Premium Travel`,
    description: pkg.description,
    openGraph: {
      title: pkg.title,
      description: pkg.description,
      images: [pkg.image],
    }
  };
}

export default async function PackageDetailPage(
  // @ts-ignore
  { params }: { params: { id: string } }
) {
  const pkg = await getPackageById(params.id);

  if (!pkg) {
    notFound();
  }


  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Hero Section */}
      <div className="relative h-[50vh] min-h-[400px] w-full">
        <Image
          src={pkg.image}
          alt={pkg.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-8 container mx-auto z-10">
          <Badge className="mb-4 bg-primary text-primary-foreground border-none">
            {pkg.category.toUpperCase().replace('-', ' ')}
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg max-w-4xl">
            {pkg.title}
          </h1>
          <div className="flex flex-wrap gap-6 text-white/90">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 shadow-sm" />
              <span className="text-lg font-medium drop-shadow-sm">{pkg.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 shadow-sm" />
              <span className="text-lg font-medium drop-shadow-sm">{pkg.duration}</span>
            </div>
            <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-semibold">{pkg.rating} <span className="font-normal opacity-80">({pkg.reviews} reviews)</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 mt-12 grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <section>
            <h2 className="text-3xl font-bold mb-6">Overview</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {pkg.description}
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-6">What's Included</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {pkg.includes.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 p-5 bg-card border rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="bg-primary/10 rounded-full p-2">
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  </div>
                  <span className="font-medium text-lg">{item}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar Card */}
        <div className="lg:col-span-1">
          <Card className="sticky top-28 border border-border shadow-xl bg-card rounded-3xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-primary to-primary/50" />
            <CardContent className="p-8">
              <div className="mb-8">
                <p className="text-sm text-muted-foreground uppercase tracking-widest mb-2 font-semibold">Starting from</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-primary">QAR {pkg.price.toLocaleString()}</span>
                  <span className="text-muted-foreground font-medium">/ person</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <Button size="lg" className="w-full text-lg h-14 rounded-2xl shadow-lg hover:shadow-primary/25 transition-all font-semibold">
                  Book Now
                </Button>
                <Button size="lg" variant="outline" className="w-full h-14 rounded-2xl font-semibold border-2 hover:bg-muted">
                  Download Itinerary
                </Button>
              </div>
              
              {pkg.featured && (
                <div className="mt-8 pt-6 border-t text-center">
                  <Badge variant="secondary" className="px-4 py-2 text-sm font-medium bg-amber-500/10 text-amber-600 border-0">
                    🌟 Popular Package - Books fast!
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
