"use client";
import { useCallback, useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin, Star, CheckCircle2, Clock, Users, ChevronRight, Hotel,
  Utensils, Shield, Phone, Mail, MessageCircle, Calendar, Sparkles,
  Plane, PlaneLanding, PlaneTakeoff, Eye, Info, BedDouble, Wifi,
  Car, Coffee, UtensilsCrossed, CreditCard, Ticket, HeartPulse,
  Luggage, Smartphone, BadgePercent, ArrowRight, SunMedium,
  Building2, Globe2, Headphones, Lock
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { useBookNow } from "@/components/layout/BookNowDialog";
import "./package-detail.css";
import { marketingImageUrl } from "@/lib/marketing-images";

// ─────────────────────────────────────────────
// Shared data builders
// ─────────────────────────────────────────────
function buildSharedData(pkg: any) {
  const itineraryDays = [
    { day: 1, title: `Arrival in ${pkg.location}`, desc: "Welcome to your destination! Upon arrival, you'll be greeted by our representative and transferred to your hotel. Check-in and relax. Evening at leisure to explore the neighborhood.", highlights: ["Airport pickup", "Hotel check-in", "Welcome briefing"], images: [marketingImageUrl("1436491865332-7a61a109cc05"),marketingImageUrl("1566073771259-6a8506099945"),marketingImageUrl("1520250497591-112f2f40a3f4")] },
    { day: 2, title: "City Highlights Tour", desc: `Full day guided tour of ${pkg.location}'s most iconic landmarks. Visit historical sites, cultural attractions, and vibrant markets. Lunch at a local restaurant included.`, highlights: ["Guided city tour", "Major landmarks", "Local lunch"], images: [marketingImageUrl("1477959858617-67f85cf4f1df"),marketingImageUrl("1515542622106-78bda8ba0e5b"),marketingImageUrl("1552832230-c0197dd311b5")] },
    { day: 3, title: "Adventure & Leisure", desc: "Morning adventure activity followed by afternoon at leisure. Optional excursions available. Evening cultural show or dinner experience.", highlights: ["Adventure activity", "Free time", "Cultural experience"], images: [marketingImageUrl("1530521954074-e64f6810b32d"),marketingImageUrl("1501555088652-021faa106b9b"),marketingImageUrl("1506905925346-21bda4d32df4")] },
    { day: 4, title: "Departure", desc: "Enjoy breakfast at the hotel. Check-out and transfer to airport for your departure flight. Take home wonderful memories!", highlights: ["Breakfast", "Hotel checkout", "Airport transfer"], images: [marketingImageUrl("1436491865332-7a61a109cc05"),marketingImageUrl("1559827260-dc66d52bef19"),marketingImageUrl("1542314831-068cd1dbfeeb")] },
  ];

  const inclusionItems = [
    { icon: Coffee, label: "Daily Breakfast", color: "text-amber-500" },
    { icon: Car, label: "All Transfers", color: "text-blue-500" },
    { icon: Plane, label: "Return Flights", color: "text-teal-500" },
    { icon: Building2, label: "4★ Hotel Stay", color: "text-purple-500" },
    { icon: Globe2, label: "Guided Tours", color: "text-emerald-500" },
    { icon: Shield, label: "Travel Insurance", color: "text-rose-500" },
    { icon: Headphones, label: "24/7 Support", color: "text-indigo-500" },
    ...pkg.includes.map((item: string) => ({ icon: CheckCircle2, label: item, color: "text-teal-600" })),
  ].filter((v: any, i: number, a: any[]) => a.findIndex((t: any) => t.label === v.label) === i);

  const exclusionItems = [
    { icon: CreditCard, label: "Visa Fees" },
    { icon: HeartPulse, label: "Medical Expenses" },
    { icon: UtensilsCrossed, label: "Lunches & Dinners" },
    { icon: Ticket, label: "Entry Fees (unless noted)" },
    { icon: Luggage, label: "Excess Baggage" },
    { icon: Smartphone, label: "International Roaming" },
    { icon: BadgePercent, label: "Tips & Gratuities" },
    { icon: SunMedium, label: "Optional Activities" },
  ];

  const optionalTours = [
    { id: 1, title: `${pkg.location} City Tour w/ Lunch`, tag: "Mandatory", desc: `Explore the cultural and historical richness of ${pkg.location} with a comprehensive full-day tour guided by a private expert. Discover iconic landmarks, hidden gems, and vibrant local markets while savoring authentic cuisine.`, adult: 349, single: 349, child611: 299, child25: 299, infant: 199, images: [marketingImageUrl("1477959858617-67f85cf4f1df"),marketingImageUrl("1515542622106-78bda8ba0e5b"),marketingImageUrl("1552832230-c0197dd311b5")] },
    { id: 2, title: "Desert Safari w/ Dinner", tag: "Optional", desc: "Embark on a thrilling desert adventure with dune bashing, camel riding, sandboarding and a traditional dinner under the stars. A private guide ensures a personal and memorable experience throughout the evening.", adult: 349, single: 349, child611: 299, child25: 299, infant: 199, images: [marketingImageUrl("1509316785289-025f5b846b35"),marketingImageUrl("1506905925346-21bda4d32df4"),marketingImageUrl("1530521954074-e64f6810b32d")] },
    { id: 3, title: "Sunset Dhow Cruise", tag: "Optional", desc: "Sail on a traditional wooden dhow as the sun sets over the horizon. Enjoy live entertainment, unlimited beverages, and a delicious buffet dinner while taking in spectacular waterfront views.", adult: 249, single: 249, child611: 199, child25: 149, infant: 0, images: [marketingImageUrl("1602174423520-daa2d87175a0"),marketingImageUrl("1543857778-c4a1a3e0b2eb"),marketingImageUrl("1501555088652-021faa106b9b")] },
  ];

  const hotels = [
    { name: "Grand Hyatt", nights: "3 Nights", room: "Deluxe King Room", stars: 5, image: marketingImageUrl("1542314831-068cd1dbfeeb"), checkIn: "08 Aug 2026", checkOut: "11 Aug 2026", amenities: [{ icon: Wifi, label: "Free WiFi" }, { icon: Coffee, label: "Breakfast" }, { icon: Car, label: "Transfers" }, { icon: Sparkles, label: "Spa" }], badge: "Luxury Pick", badgeColor: "bg-amber-500" },
    { name: "Hilton Garden Inn", nights: "1 Night", room: "Superior Twin Room", stars: 4, image: marketingImageUrl("1520250497591-112f2f40a3f4"), checkIn: "11 Aug 2026", checkOut: "12 Aug 2026", amenities: [{ icon: Wifi, label: "Free WiFi" }, { icon: Utensils, label: "Restaurant" }, { icon: MapPin, label: "City Centre" }], badge: "City Centre", badgeColor: "bg-teal-600" },
  ];

  return { itineraryDays, inclusionItems, exclusionItems, optionalTours, hotels };
}

// ─────────────────────────────────────────────
// Shared sub-components
// ─────────────────────────────────────────────

function Hero({ pkg }: { pkg: any }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      className="relative h-[420px] md:h-[540px] rounded-3xl overflow-hidden mb-8 shadow-2xl">
      <Image src={pkg.image} alt={pkg.title} fill sizes="100vw" className="object-cover" priority />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
      <div className="absolute top-5 left-5">
        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-teal-500 text-white shadow-lg tracking-wide uppercase">
          {pkg.category === "fixed-departure" ? "Fixed Departure" : "Featured Tour"}
        </span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
        <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight drop-shadow-lg">{pkg.title}</h1>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
              <MapPin className="w-4 h-4 text-teal-300" /><span className="text-white font-medium text-sm">{pkg.location}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
              <Clock className="w-4 h-4 text-teal-300" /><span className="text-white font-medium text-sm">{pkg.duration}</span>
            </div>
            <div className="flex items-center gap-2 bg-amber-500 px-4 py-2 rounded-full shadow-lg">
              <Star className="w-4 h-4 fill-white text-white" /><span className="text-white font-bold text-sm">{pkg.rating} · {pkg.reviews} reviews</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function Breadcrumb({ pkg }: { pkg: any }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5 text-sm text-slate-500 mb-5">
      <Link href="/" className="hover:text-teal-600 transition-colors">Home</Link>
      <ChevronRight className="w-3.5 h-3.5" />
      <Link href="/packages" className="hover:text-teal-600 transition-colors">Packages</Link>
      <ChevronRight className="w-3.5 h-3.5" />
      <span className="text-teal-700 font-medium truncate max-w-[200px]">{pkg.title}</span>
    </motion.div>
  );
}

function InclusionsExclusionsTab({ inclusionItems, exclusionItems }: { inclusionItems: any[]; exclusionItems: any[] }) {
  const [activeTab, setActiveTab] = useState("inclusions");
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="bg-white rounded-t-2xl border border-b-0 border-slate-100 shadow-sm px-5 pt-5">
          <TabsList className="bg-slate-100 rounded-xl p-1 h-auto gap-1 w-auto inline-flex">
            <TabsTrigger value="inclusions" className="rounded-lg px-5 py-2 text-sm font-semibold transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow">
              <CheckCircle2 className="w-4 h-4 mr-1.5" />Inclusions
            </TabsTrigger>
            <TabsTrigger value="exclusions" className="rounded-lg px-5 py-2 text-sm font-semibold transition-all data-[state=active]:bg-rose-500 data-[state=active]:text-white data-[state=active]:shadow">
              <Info className="w-4 h-4 mr-1.5" />Exclusions
            </TabsTrigger>
          </TabsList>
        </div>
        <AnimatePresence mode="wait">
          {activeTab === "inclusions" ? (
            <motion.div key="inclusions" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-white rounded-b-2xl border border-slate-100 shadow-sm p-5 md:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {inclusionItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-emerald-100 bg-emerald-50/60 hover:bg-emerald-50 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-white border border-emerald-200 flex items-center justify-center shrink-0 shadow-sm">
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                    </div>
                    <span className="text-sm font-medium text-slate-700">{item.label}</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto shrink-0" />
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="exclusions" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-white rounded-b-2xl border border-slate-100 shadow-sm p-5 md:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {exclusionItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-rose-100 bg-rose-50/60 hover:bg-rose-50 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-white border border-rose-200 flex items-center justify-center shrink-0 shadow-sm">
                      <item.icon className="w-4 h-4 text-rose-500" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">{item.label}</span>
                    <div className="ml-auto shrink-0 w-4 h-4 rounded-full bg-rose-100 flex items-center justify-center">
                      <span className="text-rose-500 text-xs font-black leading-none">✕</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Tabs>
    </motion.div>
  );
}

function ItinerarySection({ itineraryDays }: { itineraryDays: any[] }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-6 md:px-8 pt-6 pb-2">
        <h2 className="text-xl font-bold text-slate-900">Day by Day Itinerary</h2>
        <p className="text-sm text-slate-400 mt-1">Expand each day to see photos and highlights</p>
      </div>
      <div className="px-4 md:px-6 pb-6 mt-3">
        <Accordion type="single" collapsible defaultValue="day-1" className="space-y-3">
          {itineraryDays.map((day) => (
            <AccordionItem key={day.day} value={`day-${day.day}`} className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
              <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-slate-50 data-[state=open]:bg-teal-50 transition-colors">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-11 h-11 rounded-xl bg-teal-600 flex items-center justify-center shrink-0 shadow-sm">
                    <span className="text-white font-black text-sm">{day.day}</span>
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-bold text-slate-900 text-sm">Day {day.day}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{day.title}</p>
                  </div>
                  <div className="hidden sm:flex gap-1.5 mr-4">
                    {day.images.slice(0, 2).map((img: string, ii: number) => (
                      <div key={ii} className="w-9 h-9 rounded-lg overflow-hidden ring-2 ring-white shadow">
                        <Image src={img} alt="" width={36} height={36} className="object-cover w-full h-full" />
                      </div>
                    ))}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5 pt-1">
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {day.images.map((img: string, ii: number) => (
                    <div key={ii} className="relative h-28 rounded-xl overflow-hidden">
                      <Image src={img} alt={`Day ${day.day} photo`} fill sizes="33vw" className="object-cover hover:scale-105 transition-transform duration-300" />
                    </div>
                  ))}
                </div>
                <p className="text-slate-500 text-sm leading-relaxed mb-3">{day.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {day.highlights.map((h: string, hi: number) => (
                    <span key={hi} className="inline-flex items-center gap-1.5 text-xs font-medium bg-teal-50 text-teal-700 px-3 py-1.5 rounded-full border border-teal-100">
                      <CheckCircle2 className="w-3 h-3" />{h}
                    </span>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </motion.div>
  );
}

function HotelSection({ hotels, location }: { hotels: any[]; location: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center">
          <Hotel className="w-5 h-5 text-purple-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Hotel Details</h2>
      </div>
      <div className="space-y-4">
        {hotels.map((hotel, i) => (
          <div key={i} className="border border-slate-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row">
              <div className="relative md:w-52 h-44 md:h-auto shrink-0">
                <Image src={hotel.image} alt={hotel.name} fill sizes="(min-width: 768px) 208px, 100vw" className="object-cover" />
                <span className={`absolute top-3 left-3 text-xs font-bold text-white px-2.5 py-1 rounded-full shadow ${hotel.badgeColor}`}>{hotel.badge}</span>
              </div>
              <div className="p-5 flex-1">
                <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">{hotel.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5"><MapPin className="w-3 h-3" />{location}</div>
                  </div>
                  <div className="flex gap-0.5">{Array.from({ length: hotel.stars }).map((_, si) => <Star key={si} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}</div>
                </div>
                <div className="flex items-center gap-3 text-sm mb-3 flex-wrap">
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs"><BedDouble className="w-4 h-4" />{hotel.room}</div>
                  <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">{hotel.nights}</span>
                </div>
                <div className="flex gap-4 text-xs text-slate-500 mb-4 flex-wrap">
                  <span><span className="font-semibold text-slate-700">Check-in:</span> {hotel.checkIn}</span>
                  <span><span className="font-semibold text-slate-700">Check-out:</span> {hotel.checkOut}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {hotel.amenities.map((a: any, ai: number) => (
                    <span key={ai} className="inline-flex items-center gap-1.5 text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-1.5 rounded-lg">
                      <a.icon className="w-3.5 h-3.5 text-teal-500" />{a.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-400 mt-4 flex items-center gap-1.5">
        <Info className="w-3.5 h-3.5" />Hotels subject to availability and may be substituted with equivalent properties.
      </p>
    </motion.div>
  );
}

function ReviewsSection({ pkg }: { pkg: any }) {
  return (
    <div className="bg-white rounded-b-2xl border border-slate-100 shadow-sm p-5 md:p-7">
      <div className="flex items-start gap-8 mb-7 flex-wrap">
        <div className="text-center min-w-[90px]">
          <div className="text-5xl font-black text-teal-600">{pkg.rating}</div>
          <div className="flex gap-0.5 justify-center my-1.5">
            {Array.from({ length: 5 }).map((_, si) => <Star key={si} className={`w-4 h-4 ${si < Math.round(pkg.rating) ? "fill-amber-400 text-amber-400" : "text-slate-200 fill-slate-200"}`} />)}
          </div>
          <p className="text-xs text-slate-400">{pkg.reviews} reviews</p>
        </div>
        <div className="flex-1 space-y-2 min-w-[180px]">
          {[["Excellent", 78], ["Good", 15], ["Average", 5], ["Poor", 2]].map(([l, p]) => (
            <div key={l} className="flex items-center gap-3 text-xs">
              <span className="w-14 text-slate-500">{l}</span>
              <div className="flex-1 bg-slate-100 rounded-full h-1.5"><div className="bg-teal-500 rounded-full h-1.5" style={{ width: `${p}%` }} /></div>
              <span className="w-7 text-right text-slate-400">{p}%</span>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        {[
          { name: "Sarah M.", rating: 5, date: "March 2026", comment: "Absolutely incredible experience! Every detail was perfectly arranged. The hotels were luxurious and the guides were knowledgeable and friendly. Will definitely book again!" },
          { name: "James T.", rating: 5, date: "February 2026", comment: "Best trip of my life. The itinerary was well-paced and we got to see everything without feeling rushed. Highly recommend this package to anyone." },
          { name: "Priya K.", rating: 4, date: "January 2026", comment: "Great value for money. A few minor hiccups with timing but the team handled everything professionally. The optional desert safari was a highlight!" },
        ].map((r, ri) => (
          <div key={ri} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center font-black text-teal-700 text-sm">{r.name[0]}</div>
                <div><p className="font-semibold text-sm text-slate-800">{r.name}</p><p className="text-xs text-slate-400">{r.date}</p></div>
              </div>
              <div className="flex gap-0.5">{Array.from({ length: r.rating }).map((_, si) => <Star key={si} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}</div>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">{r.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function JourneyBanner() {
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-8">
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 p-8 md:p-12">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-80 h-80 bg-teal-400 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-400 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-teal-500/20 text-teal-400 border border-teal-500/30 px-4 py-1.5 rounded-full mb-4">
              <Sparkles className="w-3.5 h-3.5" />Premium Experience
            </span>
            <h2 className="text-2xl md:text-4xl font-black text-white mb-3">Your Journey, Our Promise</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm">From booking to returning home, every step is seamless and memorable.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5 mb-10">
            {[
              { step: "01", title: "Transparent Booking", desc: "Clear pricing, instant confirmation, no hidden fees.", icon: CheckCircle2 },
              { step: "02", title: "Pre-Trip Support", desc: "Detailed itinerary, travel tips, and 24/7 assistance.", icon: Shield },
              { step: "03", title: "Seamless Journey", desc: "On-ground help, quality hotels, memorable experiences.", icon: Sparkles },
            ].map((s, i) => (
              <div key={i} className="bg-white/[0.08] rounded-2xl p-5 border border-white/10 hover:bg-white/[0.12] transition-all">
                <span className="text-xs font-bold text-teal-400 mb-2 block">STEP {s.step}</span>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-600/30 flex items-center justify-center shrink-0"><s.icon className="w-5 h-5 text-teal-300" /></div>
                  <div><h3 className="font-bold text-white text-sm mb-1">{s.title}</h3><p className="text-slate-400 text-xs leading-relaxed">{s.desc}</p></div>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-white/10">
            {[{ v: "50K+", l: "Happy Travelers" }, { v: "98%", l: "Satisfaction" }, { v: "100+", l: "Destinations" }, { v: "24/7", l: "Support" }].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-black text-teal-400 mb-1">{s.v}</div>
                <div className="text-xs text-slate-400">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Sidebar({ pkg, handleBookNow }: { pkg: any; handleBookNow: (date?: string) => void }) {
  return (
    <div className="lg:col-span-1">
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="sticky top-24 space-y-5">
        <Card className="rounded-2xl border-0 shadow-xl overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-teal-500 to-teal-400" />
          <CardContent className="p-6 space-y-5">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-1">Starting from</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">QAR {pkg.price}</span>
                <span className="text-base text-slate-400 line-through">QAR {pkg.price + 800}</span>
              </div>
              <span className="inline-block mt-2 text-xs font-bold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">Save QAR 800</span>
            </div>
            <div className="space-y-2.5">
              <Button size="lg" onClick={() => handleBookNow()} className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-12 font-bold shadow-md hover:shadow-lg transition-all cursor-pointer text-sm">
                Book Now <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
              <Button variant="outline" size="lg" className="w-full rounded-xl h-11 font-semibold border-slate-200 text-slate-700 text-sm">Download Itinerary</Button>
            </div>
            <div className="space-y-2.5 pt-4 border-t border-slate-100">
              {["Free cancellation up to 24 hours", "Instant confirmation", "24/7 customer support"].map((t, i) => (
                <div key={i} className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /><span className="text-slate-500 text-xs">{t}</span></div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-slate-100 shadow-sm">
          <CardContent className="p-5">
            <p className="font-bold text-slate-900 mb-3 text-sm">Need Help?</p>
            <div className="space-y-2">
              {[{ icon: Phone, label: "Call Us" }, { icon: MessageCircle, label: "Live Chat" }, { icon: Mail, label: "Email Us" }].map((b, i) => (
                <Button key={i} variant="outline" className="w-full justify-start gap-3 h-11 rounded-xl text-sm border-slate-200 text-slate-700 hover:bg-slate-50">
                  <b.icon className="w-4 h-4 text-teal-500" />{b.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-slate-100 shadow-sm bg-gradient-to-b from-slate-50 to-white">
          <CardContent className="p-5">
            <p className="font-bold text-slate-900 mb-3 text-sm">Why Book With Us</p>
            <div className="space-y-2.5">
              {[{ icon: Users, label: "50K+ Happy Travelers" }, { icon: BadgePercent, label: "Best Price Guarantee" }, { icon: Lock, label: "Secure Payment" }, { icon: Headphones, label: "24/7 Support" }].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0"><item.icon className="w-4 h-4 text-teal-600" /></div>
                  <span className="text-sm font-medium text-slate-700">{item.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────
// FIXED DEPARTURE LAYOUT — full layout with departure table, flights, group size, pricing in tours
// ─────────────────────────────────────────────
function FixedDepartureLayout({ pkg, handleBookNow }: { pkg: any; handleBookNow: (d?: string) => void }) {
  const [activeBottomTab, setActiveBottomTab] = useState("optional-tours");
  const [expandedTour, setExpandedTour] = useState<number | null>(null);
  const { itineraryDays, inclusionItems, exclusionItems, optionalTours, hotels } = buildSharedData(pkg);

  const departures = [
    { date: "08 Aug 2026", adult: pkg.price, single: Math.round(pkg.price * 1.27), child611: Math.round(pkg.price * 0.96), child25: Math.round(pkg.price * 0.94), infant: Math.round(pkg.price * 0.22), seats: "4 Seats Left", urgency: "red" },
    { date: "22 Sep 2026", adult: pkg.price + 200, single: Math.round((pkg.price + 200) * 1.27), child611: Math.round((pkg.price + 200) * 0.96), child25: Math.round((pkg.price + 200) * 0.94), infant: Math.round((pkg.price + 200) * 0.22), seats: "8 Seats Left", urgency: "amber" },
    { date: "10 Nov 2026", adult: pkg.price + 400, single: Math.round((pkg.price + 400) * 1.27), child611: Math.round((pkg.price + 400) * 0.96), child25: Math.round((pkg.price + 400) * 0.94), infant: Math.round((pkg.price + 400) * 0.22), seats: "Available", urgency: "green" },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 pt-4">
      <div className="container mx-auto px-4 max-w-7xl">
        <Breadcrumb pkg={pkg} />
        <Hero pkg={pkg} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-7">
            {/* Quick stats — 4 cards incl. Group Size */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Calendar, label: "Duration", value: pkg.duration.split("/")[0].trim(), color: "bg-teal-50 text-teal-600" },
                { icon: Users, label: "Group Size", value: "Max 15", color: "bg-blue-50 text-blue-600" },
                { icon: Hotel, label: "Hotels", value: "4–5 Star", color: "bg-purple-50 text-purple-600" },
                { icon: Utensils, label: "Meals", value: "Breakfast", color: "bg-amber-50 text-amber-600" },
              ].map((item, i) => (
                <motion.div key={i} whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center hover:shadow-md transition-shadow">
                  <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center mx-auto mb-2.5`}><item.icon className="w-5 h-5" /></div>
                  <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide mb-0.5">{item.label}</p>
                  <p className="font-bold text-sm text-slate-800">{item.value}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* About */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-3">About This Tour</h2>
              <p className="text-slate-500 leading-relaxed text-sm md:text-base">{pkg.description}. Experience the perfect blend of adventure, culture, and relaxation. Our expertly crafted itinerary ensures you don&apos;t miss any highlights while maintaining a comfortable pace.</p>
              <div className="grid sm:grid-cols-2 gap-3 mt-5">
                <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0"><BadgePercent className="w-5 h-5 text-emerald-600" /></div>
                  <div><p className="font-semibold text-sm text-slate-800">Best Price Guarantee</p><p className="text-xs text-slate-500">We match any lower price</p></div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-xl border border-teal-100">
                  <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center shrink-0"><Lock className="w-5 h-5 text-teal-600" /></div>
                  <div><p className="font-semibold text-sm text-slate-800">Secure Booking</p><p className="text-xs text-slate-500">100% secure payments</p></div>
                </div>
              </div>
            </motion.div>

            <ItinerarySection itineraryDays={itineraryDays} />
            <InclusionsExclusionsTab inclusionItems={inclusionItems} exclusionItems={exclusionItems} />

            {/* Departure Dates */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 md:px-8 pt-6 pb-4 flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-xl font-bold text-slate-900">Departure Dates</h2>
                <div className="flex items-center gap-2 text-sm font-semibold text-rose-500 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100">
                  <Eye className="w-4 h-4" />50,620 viewed this week
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-800 text-white">
                      {["📅 Date", "👨 Adult", "🧑 Single", "👧 Child 6–11", "👶 Child 2–5", "🍼 Infant", "Seats", ""].map((h, i) => (
                        <th key={i} className={`px-4 py-3.5 font-semibold text-xs tracking-wide ${i === 0 ? "text-left" : "text-center"}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {departures.map((row, i) => (
                      <tr key={i} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-4 font-bold text-slate-800">{row.date}</td>
                        {[row.adult, row.single, row.child611, row.child25, row.infant].map((val, vi) => (
                          <td key={vi} className="px-4 py-4 text-center font-semibold text-slate-700"><span className="text-slate-400 text-xs mr-0.5">QAR</span>{val}</td>
                        ))}
                        <td className="px-4 py-4 text-center">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${row.urgency === "red" ? "bg-rose-50 text-rose-600" : row.urgency === "amber" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>{row.seats}</span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Button size="sm" onClick={() => handleBookNow(row.date)} className="bg-rose-600 hover:bg-rose-700 text-white rounded-lg px-5 font-bold text-xs cursor-pointer shadow-sm hover:shadow-md transition-all">Book Now</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Flight Details */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center"><Plane className="w-5 h-5 text-teal-600" /></div>
                <h2 className="text-xl font-bold text-slate-900">Flight Details</h2>
              </div>
              <div className="space-y-4">
                {[
                  { type: "Outbound", from: "DOH", fromCity: "Doha", to: "DXB", toCity: "Dubai", dep: "08:30", arr: "09:05", date: "08 Aug 2026", dur: "1h 35m", flight: "EK 503", cls: "Economy" },
                  { type: "Return", from: "DXB", fromCity: "Dubai", to: "DOH", toCity: "Doha", dep: "21:15", arr: "21:55", date: "12 Aug 2026", dur: "1h 40m", flight: "EK 504", cls: "Economy" },
                ].map((f, i) => (
                  <div key={i} className={`rounded-2xl p-5 border ${i === 0 ? "bg-teal-50/40 border-teal-100" : "bg-slate-50/60 border-slate-100"}`}>
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${i === 0 ? "bg-teal-600 text-white" : "bg-slate-600 text-white"}`}>
                        {i === 0 ? <PlaneTakeoff className="w-3.5 h-3.5" /> : <PlaneLanding className="w-3.5 h-3.5" />}{f.type}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">{f.date}</span>
                    </div>
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-3 min-w-[120px]">
                        <div className="w-11 h-11 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-xl shadow-sm">✈️</div>
                        <div><p className="font-bold text-sm text-slate-800">Emirates</p><p className="text-xs text-slate-400">{f.flight} · {f.cls}</p></div>
                      </div>
                      <div className="flex items-center gap-3 flex-1 justify-center min-w-[200px]">
                        <div className="text-center"><p className="text-2xl font-black text-slate-900">{f.dep}</p><p className="text-xs font-bold text-slate-500">{f.from}</p><p className="text-xs text-slate-400">{f.fromCity}</p></div>
                        <div className="flex-1 flex flex-col items-center gap-1">
                          <p className="text-xs text-slate-400">{f.dur}</p>
                          <div className="flex items-center w-full gap-1"><div className="h-px flex-1 bg-slate-300"></div><Plane className="w-4 h-4 text-slate-400" /><div className="h-px flex-1 bg-slate-300"></div></div>
                          <p className="text-[11px] text-emerald-600 font-semibold">Non-stop</p>
                        </div>
                        <div className="text-center"><p className="text-2xl font-black text-slate-900">{f.arr}</p><p className="text-xs font-bold text-slate-500">{f.to}</p><p className="text-xs text-slate-400">{f.toCity}</p></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-4 flex items-center gap-1.5"><Info className="w-3.5 h-3.5" />Flight timings are indicative. Actual tickets issued upon booking confirmation.</p>
            </motion.div>

            <HotelSection hotels={hotels} location={pkg.location} />
          </div>
          <Sidebar pkg={pkg} handleBookNow={handleBookNow} />
        </div>

        {/* Optional Tours & Reviews — with pricing table */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-8">
          <Tabs value={activeBottomTab} onValueChange={setActiveBottomTab}>
            <div className="bg-white rounded-t-2xl border border-b-0 border-slate-100 shadow-sm px-5 pt-5">
              <TabsList className="bg-slate-100 rounded-xl p-1 h-auto gap-1 inline-flex">
                <TabsTrigger value="optional-tours" className="rounded-lg px-6 py-2.5 text-sm font-semibold data-[state=active]:bg-teal-600 data-[state=active]:text-white data-[state=active]:shadow transition-all">Optional Tours</TabsTrigger>
                <TabsTrigger value="reviews" className="rounded-lg px-6 py-2.5 text-sm font-semibold data-[state=active]:bg-teal-600 data-[state=active]:text-white data-[state=active]:shadow transition-all">Reviews</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="optional-tours" className="mt-0">
              <div className="bg-white rounded-b-2xl border border-slate-100 shadow-sm p-5 md:p-7 space-y-5">
                {optionalTours.map((tour) => (
                  <div key={tour.id} className="border border-slate-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row">
                      <div className="flex-1 p-5">
                        <div className="flex items-start gap-3 mb-3">
                          <h3 className="font-bold text-slate-900">{tour.title}</h3>
                          <span className={`shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full ${tour.tag === "Mandatory" ? "bg-rose-100 text-rose-600" : "bg-teal-100 text-teal-700"}`}>{tour.tag}</span>
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed mb-2">{expandedTour === tour.id ? tour.desc : `${tour.desc.slice(0, 160)}…`}</p>
                        <button onClick={() => setExpandedTour(expandedTour === tour.id ? null : tour.id)} className="text-xs font-bold text-teal-600 hover:underline mb-4 transition-colors">{expandedTour === tour.id ? "Read less" : "Read more"}</button>
                        {/* Pricing table — fixed departure only */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs border border-slate-100 rounded-xl overflow-hidden">
                            <thead><tr className="bg-slate-50">{["Adult","Single","Child 6–11","Child 2–5","Infant"].map(h => <th key={h} className="px-3 py-2 text-left font-semibold text-slate-600">{h}</th>)}</tr></thead>
                            <tbody><tr className="bg-white">{[tour.adult,tour.single,tour.child611,tour.child25,tour.infant].map((v,vi) => <td key={vi} className="px-3 py-2 text-slate-700 font-medium"><span className="text-slate-400 text-[10px] mr-0.5">QAR</span>{v}</td>)}</tr></tbody>
                          </table>
                        </div>
                      </div>
                      <div className="md:w-72 shrink-0">
                        <div className="grid grid-cols-3 md:grid-cols-1 gap-1 p-2 h-full">
                          {tour.images.map((img: string, ii: number) => (
                            <div key={ii} className="relative h-28 md:h-[88px] rounded-xl overflow-hidden">
                              <Image src={img} alt="" fill sizes="(min-width: 768px) 288px, 33vw" className="object-cover hover:scale-105 transition-transform duration-300" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="mt-0"><ReviewsSection pkg={pkg} /></TabsContent>
          </Tabs>
        </motion.div>
        <JourneyBanner />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// GENERAL LAYOUT — holidays, kerala, cruise, medical (no departure, no flights, no tour pricing, no group size)
// ─────────────────────────────────────────────
function GeneralLayout({ pkg, handleBookNow }: { pkg: any; handleBookNow: (d?: string) => void }) {
  const [activeBottomTab, setActiveBottomTab] = useState("optional-tours");
  const [expandedTour, setExpandedTour] = useState<number | null>(null);
  const { itineraryDays, inclusionItems, exclusionItems, optionalTours, hotels } = buildSharedData(pkg);

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 pt-4">
      <div className="container mx-auto px-4 max-w-7xl">
        <Breadcrumb pkg={pkg} />
        <Hero pkg={pkg} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-7">
            {/* Quick stats — 3 cards, no Group Size */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-3 gap-4">
              {[
                { icon: Calendar, label: "Duration", value: pkg.duration.split("/")[0].trim(), color: "bg-teal-50 text-teal-600" },
                { icon: Hotel, label: "Hotels", value: "4–5 Star", color: "bg-purple-50 text-purple-600" },
                { icon: Utensils, label: "Meals", value: "Breakfast", color: "bg-amber-50 text-amber-600" },
              ].map((item, i) => (
                <motion.div key={i} whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center hover:shadow-md transition-shadow">
                  <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center mx-auto mb-2.5`}><item.icon className="w-5 h-5" /></div>
                  <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide mb-0.5">{item.label}</p>
                  <p className="font-bold text-sm text-slate-800">{item.value}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* About */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-3">About This Tour</h2>
              <p className="text-slate-500 leading-relaxed text-sm md:text-base">{pkg.description}. Experience the perfect blend of adventure, culture, and relaxation. Our expertly crafted itinerary ensures you don&apos;t miss any highlights while maintaining a comfortable pace. With premium accommodations, knowledgeable guides, and seamless logistics, your journey will be truly unforgettable.</p>
              <div className="grid sm:grid-cols-2 gap-3 mt-5">
                <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0"><BadgePercent className="w-5 h-5 text-emerald-600" /></div>
                  <div><p className="font-semibold text-sm text-slate-800">Best Price Guarantee</p><p className="text-xs text-slate-500">We match any lower price</p></div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-xl border border-teal-100">
                  <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center shrink-0"><Lock className="w-5 h-5 text-teal-600" /></div>
                  <div><p className="font-semibold text-sm text-slate-800">Secure Booking</p><p className="text-xs text-slate-500">100% secure payments</p></div>
                </div>
              </div>
            </motion.div>

            <ItinerarySection itineraryDays={itineraryDays} />
            <InclusionsExclusionsTab inclusionItems={inclusionItems} exclusionItems={exclusionItems} />
            <HotelSection hotels={hotels} location={pkg.location} />
          </div>
          <Sidebar pkg={pkg} handleBookNow={handleBookNow} />
        </div>

        {/* Optional Tours & Reviews — no pricing table */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-8">
          <Tabs value={activeBottomTab} onValueChange={setActiveBottomTab}>
            <div className="bg-white rounded-t-2xl border border-b-0 border-slate-100 shadow-sm px-5 pt-5">
              <TabsList className="bg-slate-100 rounded-xl p-1 h-auto gap-1 inline-flex">
                <TabsTrigger value="optional-tours" className="rounded-lg px-6 py-2.5 text-sm font-semibold data-[state=active]:bg-teal-600 data-[state=active]:text-white data-[state=active]:shadow transition-all">Optional Tours</TabsTrigger>
                <TabsTrigger value="reviews" className="rounded-lg px-6 py-2.5 text-sm font-semibold data-[state=active]:bg-teal-600 data-[state=active]:text-white data-[state=active]:shadow transition-all">Reviews</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="optional-tours" className="mt-0">
              <div className="bg-white rounded-b-2xl border border-slate-100 shadow-sm p-5 md:p-7 space-y-5">
                {optionalTours.map((tour) => (
                  <div key={tour.id} className="border border-slate-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row">
                      {/* Right: Images — shown first on mobile via order */}
                      <div className="md:w-72 shrink-0 order-first md:order-last">
                        <div className="grid grid-cols-3 md:grid-cols-1 gap-1 p-2 h-full">
                          {tour.images.map((img: string, ii: number) => (
                            <div key={ii} className="relative h-28 md:h-[88px] rounded-xl overflow-hidden">
                              <Image src={img} alt="" fill sizes="(min-width: 768px) 288px, 33vw" className="object-cover hover:scale-105 transition-transform duration-300" />
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Left: Text only — no pricing */}
                      <div className="flex-1 p-5">
                        <div className="flex items-start gap-3 mb-3">
                          <h3 className="font-bold text-slate-900">{tour.title}</h3>
                          <span className={`shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full ${tour.tag === "Mandatory" ? "bg-rose-100 text-rose-600" : "bg-teal-100 text-teal-700"}`}>{tour.tag}</span>
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed mb-3">{expandedTour === tour.id ? tour.desc : `${tour.desc.slice(0, 200)}…`}</p>
                        <button onClick={() => setExpandedTour(expandedTour === tour.id ? null : tour.id)} className="text-xs font-bold text-teal-600 hover:underline transition-colors">{expandedTour === tour.id ? "Read less" : "Read more"}</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="mt-0"><ReviewsSection pkg={pkg} /></TabsContent>
          </Tabs>
        </motion.div>
        <JourneyBanner />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Root export — routes to the right layout
// ─────────────────────────────────────────────
export default function PackageDetailClient({ pkg }: { pkg: any }) {
  const { open: openBookNow } = useBookNow();

  const handleBookNow = useCallback(
    (travelDate?: string) =>
      openBookNow({
        packageId: pkg.id,
        packageTitle: pkg.title,
        destination: pkg.location,
        travelDate,
      }),
    [openBookNow, pkg.id, pkg.title, pkg.location]
  );

  if (pkg.category === "fixed-departure") {
    return <FixedDepartureLayout pkg={pkg} handleBookNow={handleBookNow} />;
  }

  return <GeneralLayout pkg={pkg} handleBookNow={handleBookNow} />;
}
