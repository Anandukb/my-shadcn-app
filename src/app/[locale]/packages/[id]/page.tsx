import React from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Star, CheckCircle2, XCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPackageById } from "@/lib/api";
import { PackageIncludes } from "@/components/packages/PackageIncludes";

export async function generateMetadata(
  // @ts-ignore : params typing differs based on Next version
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const resolvedParams = await params;
  const pkg = await getPackageById(resolvedParams.id);
  
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
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const pkg = await getPackageById(resolvedParams.id);

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
            <PackageIncludes includes={pkg.includes} location={pkg.location} />
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-6 text-foreground/90">Excludes</h2>
            <div className="grid sm:grid-cols-2 gap-3 max-w-2xl">
              {[
                "International Airfare",
                "Visa Fees & Processing",
                "Travel Insurance",
                "Personal Expenses & Tips",
                "Optional Tours"
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-red-500/5 dark:bg-red-500/10 border border-red-500/10 rounded-xl">
                  <div className="bg-red-500/20 rounded-full p-1.5 shrink-0 text-red-500">
                    <XCircle className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-sm text-foreground/80">{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-6 text-foreground/90">Detailed Itinerary</h2>
            <Tabs defaultValue="day-1" className="w-full">
              <div className="overflow-x-auto pb-4 mb-2 md:pb-0 scrollbar-hide">
                <TabsList className="bg-muted/50 p-1.5 rounded-2xl flex w-max sm:w-auto h-auto">
                  {[1, 2, 3, 4].map((day) => (
                    <TabsTrigger 
                      key={day} 
                      value={`day-${day}`} 
                      className="rounded-xl px-5 py-2.5 text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all whitespace-nowrap"
                    >
                      Day {day}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {[
                { day: 1, title: "Arrival & Welcome", desc: "Arrive at the airport where our representative will greet you. Private transfer to your luxury hotel for check-in. The rest of the day is at your leisure to relax after your journey." },
                { day: 2, title: "City Highlights Tour", desc: "After breakfast, embark on a comprehensive guided city tour covering top landmarks, monuments, and historical points of interest. Includes a break for a local traditional lunch." },
                { day: 3, title: "Cultural Experience", desc: "Immerse yourself in the local culture with a hands-on activity or a scenic cruise depending on the destination. Evening is free for shopping and dining." },
                { day: 4, title: "Departure", desc: "Enjoy your final breakfast at the hotel. Check out and private transfer back to the airport for your onward flight." }
              ].map((itinerary) => (
                <TabsContent key={itinerary.day} value={`day-${itinerary.day}`} className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="bg-card border rounded-3xl p-6 md:p-8 shadow-sm">
                    <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-sm tracking-wide mb-4">
                      DAY {itinerary.day}
                    </div>
                    <h3 className="text-2xl font-bold mb-4">{itinerary.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-lg">
                      {itinerary.desc}
                    </p>
                    
                    <div className="mt-8 pt-6 border-t flex flex-wrap gap-4 text-sm font-medium">
                       <span className="flex items-center gap-2 text-foreground/70 bg-muted px-3 py-1.5 rounded-lg"><MapPin className="w-4 h-4 text-primary" /> Transportation included</span>
                       <span className="flex items-center gap-2 text-foreground/70 bg-muted px-3 py-1.5 rounded-lg"><CheckCircle2 className="w-4 h-4 text-primary" /> Breakfast included</span>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
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
