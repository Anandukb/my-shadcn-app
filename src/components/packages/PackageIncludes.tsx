"use client";

import React from "react";
import Image from "next/image";
import { CheckCircle2, Plane, Hotel, MapPin, Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { marketingImageUrl } from "@/lib/marketing-images";

interface PackageIncludesProps {
  includes: string[];
  location: string;
}

export function PackageIncludes({ includes, location }: PackageIncludesProps) {
  return (
    <div className="grid sm:grid-cols-2 gap-3 max-w-2xl">
      {includes.map((item, idx) => {
        const isFlights = item.toLowerCase().includes("flight");
        
        const isHotel = item.toLowerCase().includes("hotel") || item.toLowerCase().includes("accommodation");
        
        const cardContent = (
          <div className="flex items-center gap-3 p-3 bg-card border rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="bg-muted rounded-full p-1.5 shrink-0">
              <CheckCircle2 className="w-4 h-4 text-primary" />
            </div>
            <span className="font-medium text-sm">{item}</span>
          </div>
        );

        if (isFlights) {
          return (
            <Dialog key={idx}>
              <DialogTrigger asChild>
                <div className="flex items-center gap-3 p-3 bg-card border rounded-xl shadow-sm hover:shadow-md hover:border-primary/40 transition-all cursor-pointer">
                  <div className="bg-muted rounded-full p-1.5 shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-medium text-sm">{item}</span>
                </div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md w-[95vw] rounded-3xl">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold flex items-center gap-2">
                    <Plane className="w-5 h-5 text-primary fill-primary/20 -rotate-45" /> Flight Itinerary
                  </DialogTitle>
                </DialogHeader>
                <div className="py-8 px-4">
                  <div className="flex items-center justify-between relative mt-2">
                     {/* Dotted Line */}
                     <div className="absolute top-1/2 left-[20%] right-[20%] h-0.5 border-t-2 border-dashed border-primary/30 -translate-y-1/2" />
                     {/* Animation Plane */}
                     <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 bg-background px-3 z-10 text-primary">
                        <Plane className="w-6 h-6 rotate-90 fill-primary/20" />
                     </div>

                     <div className="flex flex-col items-center gap-3 bg-background z-10">
                       <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 shadow-sm">
                         <span className="font-black text-xl text-primary">DOH</span>
                       </div>
                       <div className="text-center">
                         <p className="font-bold text-sm">Doha (HIA)</p>
                         <p className="text-xs text-muted-foreground font-semibold mt-0.5">08:30 AM</p>
                       </div>
                     </div>

                     <div className="flex flex-col items-center gap-3 bg-background z-10">
                       <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 shadow-sm">
                         <span className="font-black text-xl text-primary">{location.slice(0,3).toUpperCase()}</span>
                       </div>
                       <div className="text-center">
                         <p className="font-bold text-sm truncate max-w-[100px]">{location}</p>
                         <p className="text-xs text-muted-foreground font-semibold mt-0.5">02:45 PM</p>
                       </div>
                     </div>
                  </div>
                  
                  <div className="mt-10 bg-muted/30 rounded-2xl p-5 border flex justify-between items-center shadow-sm">
                    <div>
                      <p className="text-muted-foreground text-xs mb-1.5 font-medium uppercase tracking-wider">Airline</p>
                      <p className="font-bold text-sm">Qatar Airways</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-1.5 font-medium uppercase tracking-wider text-center">Class</p>
                      <p className="font-bold text-sm text-center">Economy</p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground text-xs mb-1.5 font-medium uppercase tracking-wider">Duration</p>
                      <p className="font-bold text-sm text-primary">5h 15m</p>
                    </div>
                  </div>

                </div>
              </DialogContent>
            </Dialog>
          );
        } else if (isHotel) {
          return (
            <Dialog key={idx}>
              <DialogTrigger asChild>
                <div className="flex items-center gap-3 p-3 bg-card border rounded-xl shadow-sm hover:shadow-md hover:border-primary/40 transition-all cursor-pointer">
                  <div className="bg-muted rounded-full p-1.5 shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-medium text-sm">{item}</span>
                </div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md w-[95vw] rounded-3xl p-0 overflow-hidden border-0">
                <div className="relative h-48 w-full">
                  <Image 
                    src={marketingImageUrl("1566073771259-6a8506099945")} 
                    alt="Luxury Hotel" 
                    fill 
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-full px-3 py-1 flex items-center gap-1.5 shadow-sm border border-white/20">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-white text-xs font-bold">5 Star</span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <Badge className="bg-primary hover:bg-primary text-primary-foreground mb-2 text-[10px] tracking-widest px-2 py-0.5">PREMIUM STAY</Badge>
                    <h3 className="text-2xl font-bold text-white drop-shadow-md">Grand Resort & Spa</h3>
                  </div>
                </div>
                
                <div className="p-6 bg-card">
                  <div className="flex items-center gap-2 text-muted-foreground mb-6">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm font-medium">{location}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-muted/40 p-4 rounded-2xl border">
                      <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Check In</p>
                      <p className="font-bold text-sm">After 2:00 PM</p>
                    </div>
                    <div className="bg-muted/40 p-4 rounded-2xl border">
                      <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Check Out</p>
                      <p className="font-bold text-sm">Before 12:00 PM</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-bold text-sm uppercase tracking-wide text-foreground/80 mb-2">Room Amenities</h4>
                    <ul className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Free Wi-Fi</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Buffet Breakfast</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Pool Access</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Airport Transfer</li>
                    </ul>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          );
        }

        return <React.Fragment key={idx}>{cardContent}</React.Fragment>;
      })}
    </div>
  );
}
