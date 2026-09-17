"use client";
import { useCallback, useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";
import {
  MapPin, Star, CheckCircle2, Clock, Users, ChevronRight, Hotel,
  Utensils, Shield, Phone, Mail, MessageCircle, Calendar, Sparkles,
  Plane, PlaneLanding, PlaneTakeoff, Info, BedDouble,
  CreditCard, ArrowRight,
  Building2, Headphones, Lock, FileWarning, CalendarX2, PlaneTakeoff as PlaneOff,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { useBookNow } from "@/components/layout/BookNowDialog";
import "./package-detail.css";
import type { Package } from "@/types/package";

// ─────────────────────────────────────────────
// Empty-state helper — shown whenever the admin hasn't filled a
// given section in yet, instead of falling back to fake placeholder data.
// ─────────────────────────────────────────────
function EmptySection({ icon: Icon = Info, title, hint }: { icon?: LucideIcon; title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-6 rounded-xl border border-dashed border-slate-200 bg-slate-50/60">
      <Icon className="w-6 h-6 text-slate-300 mb-2" />
      <p className="text-sm font-semibold text-slate-400">{title}</p>
      {hint && <p className="text-xs text-slate-400 mt-1 max-w-sm">{hint}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────
// Shared sub-components
// ─────────────────────────────────────────────

function Hero({ pkg }: { pkg: Package }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      className="relative h-[420px] md:h-[540px] rounded-3xl overflow-hidden mb-8 shadow-2xl">
      {pkg.image ? (
        <Image src={pkg.image} alt={pkg.title} fill sizes="100vw" className="object-cover" priority />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
          <span className="text-white/40 text-sm font-semibold">No hero image yet</span>
        </div>
      )}
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

function Breadcrumb({ pkg }: { pkg: Package }) {
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

function InclusionsExclusionsTab({ includes, exclusions }: { includes: string[]; exclusions: string[] }) {
  const [activeTab, setActiveTab] = useState("inclusions");
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="bg-white rounded-t-2xl border border-b-0 border-slate-100 shadow-sm px-5 pt-5 flex items-center gap-3 flex-wrap">
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
              {includes.length === 0 ? (
                <EmptySection icon={CheckCircle2} title="No inclusions added yet" hint="Add what's included in the Details tab of the admin panel." />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {includes.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-emerald-100 bg-emerald-50/60 hover:bg-emerald-50 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-white border border-emerald-200 flex items-center justify-center shrink-0 shadow-sm">
                        <CheckCircle2 className="w-4 h-4 text-teal-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-700">{item}</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="exclusions" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-white rounded-b-2xl border border-slate-100 shadow-sm p-5 md:p-6">
              {exclusions.length === 0 ? (
                <EmptySection icon={Info} title="No exclusions added yet" hint="Add what's not included in the Details tab of the admin panel." />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {exclusions.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-rose-100 bg-rose-50/60 hover:bg-rose-50 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-white border border-rose-200 flex items-center justify-center shrink-0 shadow-sm">
                        <Info className="w-4 h-4 text-rose-500" />
                      </div>
                      <span className="text-sm font-medium text-slate-700">{item}</span>
                      <div className="ml-auto shrink-0 w-4 h-4 rounded-full bg-rose-100 flex items-center justify-center">
                        <span className="text-rose-500 text-xs font-black leading-none">✕</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Tabs>
    </motion.div>
  );
}

function ItinerarySection({ itinerary }: { itinerary: Package["itinerary"] }) {
  const days = itinerary ?? [];
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-6 md:px-8 pt-6 pb-2">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-xl font-bold text-slate-900">Day by Day Itinerary</h2>
        </div>
        {days.length > 0 && <p className="text-sm text-slate-400 mt-1">Expand each day to see photos and highlights</p>}
      </div>
      <div className="px-4 md:px-6 pb-6 mt-3">
        {days.length === 0 ? (
          <EmptySection icon={Calendar} title="Itinerary not added yet" hint="Add a day-by-day plan from the Itinerary tab of the admin panel." />
        ) : (
        <Accordion type="single" collapsible defaultValue="day-1" className="space-y-3">
          {days.map((day) => (
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
                  {(day.images ?? []).length > 0 && (
                    <div className="hidden sm:flex gap-1.5 mr-4">
                      {(day.images ?? []).slice(0, 2).map((img, ii) => (
                        <div key={ii} className="w-9 h-9 rounded-lg overflow-hidden ring-2 ring-white shadow">
                          <Image src={img} alt="" width={36} height={36} className="object-cover w-full h-full" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5 pt-1">
                {(day.images ?? []).length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {(day.images ?? []).map((img, ii) => (
                      <div key={ii} className="relative h-28 rounded-xl overflow-hidden">
                        <Image src={img} alt={`Day ${day.day} photo`} fill sizes="33vw" className="object-cover hover:scale-105 transition-transform duration-300" />
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-slate-500 text-sm leading-relaxed mb-3">{day.desc}</p>
                {day.highlights.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {day.highlights.map((h, hi) => (
                      <span key={hi} className="inline-flex items-center gap-1.5 text-xs font-medium bg-teal-50 text-teal-700 px-3 py-1.5 rounded-full border border-teal-100">
                        <CheckCircle2 className="w-3 h-3" />{h}
                      </span>
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        )}
      </div>
    </motion.div>
  );
}

function HotelSection({ hotels, location }: { hotels: Package["hotels"]; location: string }) {
  const list = hotels ?? [];
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center">
          <Hotel className="w-5 h-5 text-purple-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Hotel Details</h2>
      </div>
      {list.length === 0 ? (
        <EmptySection icon={Hotel} title="No hotels added yet" hint="Add the hotels for this package from the Hotels tab of the admin panel." />
      ) : (
      <div className="space-y-4">
        {list.map((hotel, i) => (
          <div key={i} className="border border-slate-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row">
              <div className="relative md:w-52 h-44 md:h-auto shrink-0 bg-slate-100">
                {hotel.image && <Image src={hotel.image} alt={hotel.name} fill sizes="(min-width: 768px) 208px, 100vw" className="object-cover" />}
                {hotel.badge && <span className="absolute top-3 left-3 text-xs font-bold text-white px-2.5 py-1 rounded-full shadow bg-slate-800">{hotel.badge}</span>}
              </div>
              <div className="p-5 flex-1">
                <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">{hotel.name || "Untitled Hotel"}</h3>
                    <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5"><MapPin className="w-3 h-3" />{hotel.location || location}</div>
                  </div>
                  <div className="flex gap-0.5">{Array.from({ length: Math.max(0, Math.min(5, hotel.rating || 0)) }).map((_, si) => <Star key={si} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}</div>
                </div>
                <div className="flex items-center gap-3 text-sm mb-3 flex-wrap">
                  {hotel.roomType && <div className="flex items-center gap-1.5 text-slate-500 text-xs"><BedDouble className="w-4 h-4" />{hotel.roomType}</div>}
                  {hotel.nights > 0 && <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">{hotel.nights} {hotel.nights === 1 ? "Night" : "Nights"}</span>}
                </div>
                {(hotel.checkIn || hotel.checkOut) && (
                  <div className="flex gap-4 text-xs text-slate-500 mb-4 flex-wrap">
                    {hotel.checkIn && <span><span className="font-semibold text-slate-700">Check-in:</span> {hotel.checkIn}</span>}
                    {hotel.checkOut && <span><span className="font-semibold text-slate-700">Check-out:</span> {hotel.checkOut}</span>}
                  </div>
                )}
                {(hotel.amenities ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {(hotel.amenities ?? []).map((a, ai) => (
                      <span key={ai} className="inline-flex items-center gap-1.5 text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-1.5 rounded-lg">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />{a}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      )}
      <p className="text-xs text-slate-400 mt-4 flex items-center gap-1.5">
        <Info className="w-3.5 h-3.5" />Hotels subject to availability and may be substituted with equivalent properties.
      </p>
    </motion.div>
  );
}

function ReviewsSection({ pkg }: { pkg: Package }) {
  return (
    <div className="bg-white rounded-b-2xl border border-slate-100 shadow-sm p-5 md:p-7">
      <div className="flex items-start gap-8 mb-3 flex-wrap">
        <div className="text-center min-w-[90px]">
          <div className="text-5xl font-black text-teal-600">{pkg.rating}</div>
          <div className="flex gap-0.5 justify-center my-1.5">
            {Array.from({ length: 5 }).map((_, si) => <Star key={si} className={`w-4 h-4 ${si < Math.round(pkg.rating) ? "fill-amber-400 text-amber-400" : "text-slate-200 fill-slate-200"}`} />)}
          </div>
          <p className="text-xs text-slate-400">{pkg.reviews} reviews</p>
        </div>
        <div className="flex-1 min-w-[180px] flex items-center">
          <p className="text-sm text-slate-500 leading-relaxed">
            Average rating from confirmed travelers on this package. Individual written reviews aren&apos;t collected yet — ask us for recent traveler feedback.
          </p>
        </div>
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
          <div className="grid md:grid-cols-3 gap-5">
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
        </div>
      </div>
    </motion.div>
  );
}

function Sidebar({ pkg, handleBookNow }: { pkg: Package; handleBookNow: (date?: string) => void }) {
  const offerAdult = pkg.offerPricing?.adult;
  const standardAdult = pkg.pricing?.adult;
  const hasRealDiscount = !!offerAdult && !!standardAdult && offerAdult < standardAdult;
  const displayPrice = hasRealDiscount ? offerAdult : (standardAdult ?? pkg.price);
  const policy = (pkg.cancellationPolicy ?? []).slice(0, 3);

  return (
    <div className="lg:col-span-1">
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="sticky top-24 space-y-5">
        <Card className="rounded-2xl border-0 shadow-xl overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-teal-500 to-teal-400" />
          <CardContent className="p-6 space-y-5">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-1">Starting from</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">QAR {displayPrice}</span>
                {hasRealDiscount && <span className="text-base text-slate-400 line-through">QAR {standardAdult}</span>}
              </div>
              {hasRealDiscount && (
                <span className="inline-block mt-2 text-xs font-bold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">
                  Save QAR {(standardAdult! - offerAdult!)}
                </span>
              )}
            </div>
            <div className="space-y-2.5">
              <Button size="lg" onClick={() => handleBookNow()} className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-12 font-bold shadow-md hover:shadow-lg transition-all cursor-pointer text-sm">
                Book Now <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
              {pkg.itineraryFileUrl && (
                <Button asChild variant="outline" size="lg" className="w-full rounded-xl h-11 font-semibold border-slate-200 text-slate-700 text-sm">
                  <a href={pkg.itineraryFileUrl} target="_blank" rel="noopener noreferrer">Download Itinerary</a>
                </Button>
              )}
            </div>
            <div className="space-y-2.5 pt-4 border-t border-slate-100">
              {policy.length > 0 ? (
                policy.map((t, i) => (
                  <div key={i} className="flex items-center gap-2.5"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /><span className="text-slate-500 text-xs">{t}</span></div>
                ))
              ) : (
                <div className="flex items-center gap-2.5"><Info className="w-4 h-4 text-slate-400 shrink-0" /><span className="text-slate-400 text-xs">Cancellation policy not specified yet — contact us for details.</span></div>
              )}
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
              {[{ icon: Users, label: "Trusted Travel Partner" }, { icon: Building2, label: "Best Price Guarantee" }, { icon: Lock, label: "Secure Payment" }, { icon: Headphones, label: "24/7 Support" }].map((item, i) => (
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
// FIXED DEPARTURE LAYOUT
// ─────────────────────────────────────────────
function FixedDepartureLayout({ pkg, handleBookNow }: { pkg: Package; handleBookNow: (d?: string) => void }) {
  const [activeBottomTab, setActiveBottomTab] = useState("optional-tours");
  const [expandedTour, setExpandedTour] = useState<string | null>(null);
  const departures = pkg.departureDates ?? [];
  const flights = pkg.flights ?? [];
  const tours = pkg.optionalTours ?? [];

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
                { icon: Users, label: "Group Size", value: pkg.groupSize || "Contact us", color: "bg-blue-50 text-blue-600" },
                { icon: Hotel, label: "Hotels", value: pkg.accommodation || "See below", color: "bg-purple-50 text-purple-600" },
                { icon: Utensils, label: "Meals", value: pkg.meals || "See inclusions", color: "bg-amber-50 text-amber-600" },
              ].map((item, i) => (
                <motion.div key={i} whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center hover:shadow-md transition-shadow">
                  <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center mx-auto mb-2.5`}><item.icon className="w-5 h-5" /></div>
                  <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide mb-0.5">{item.label}</p>
                  <p className="font-bold text-sm text-slate-800 flex items-center justify-center gap-1.5">{item.value}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* About */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-3">About This Tour</h2>
              <p className="text-slate-500 leading-relaxed text-sm md:text-base">{pkg.description}</p>
              <div className="grid sm:grid-cols-2 gap-3 mt-5">
                <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0"><CreditCard className="w-5 h-5 text-emerald-600" /></div>
                  <div><p className="font-semibold text-sm text-slate-800">Best Price Guarantee</p><p className="text-xs text-slate-500">We match any lower price</p></div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-xl border border-teal-100">
                  <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center shrink-0"><Lock className="w-5 h-5 text-teal-600" /></div>
                  <div><p className="font-semibold text-sm text-slate-800">Secure Booking</p><p className="text-xs text-slate-500">100% secure payments</p></div>
                </div>
              </div>
            </motion.div>

            <ItinerarySection itinerary={pkg.itinerary} />
            <InclusionsExclusionsTab includes={pkg.includes} exclusions={pkg.exclusions ?? []} />

            {/* Departure Dates */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 md:px-8 pt-6 pb-4 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-xl font-bold text-slate-900">Departure Dates</h2>
                </div>
              </div>
              {departures.length === 0 ? (
                <div className="px-6 md:px-8 pb-6"><EmptySection icon={CalendarX2} title="No departure dates configured yet" hint="Add upcoming departure dates and per-traveler pricing from the Departures tab of the admin panel." /></div>
              ) : (
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
                      <tr key={row.id ?? i} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
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
              )}
            </motion.div>

            {/* Flight Details */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center"><Plane className="w-5 h-5 text-teal-600" /></div>
                <h2 className="text-xl font-bold text-slate-900">Flight Details</h2>
              </div>
              {flights.length === 0 ? (
                <EmptySection icon={PlaneOff} title="Flight details not added yet" hint="Add outbound/return flights from the Flights tab of the admin panel." />
              ) : (
              <div className="space-y-4">
                {flights.map((f, i) => (
                  <div key={i} className={`rounded-2xl p-5 border ${f.type === "Outbound" ? "bg-teal-50/40 border-teal-100" : "bg-slate-50/60 border-slate-100"}`}>
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${f.type === "Outbound" ? "bg-teal-600 text-white" : "bg-slate-600 text-white"}`}>
                        {f.type === "Outbound" ? <PlaneTakeoff className="w-3.5 h-3.5" /> : <PlaneLanding className="w-3.5 h-3.5" />}{f.type}
                      </span>
                      {f.date && <span className="text-xs text-slate-400 font-medium">{f.date}</span>}
                    </div>
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-3 min-w-[120px]">
                        <div className="w-11 h-11 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-xl shadow-sm">✈️</div>
                        <div><p className="font-bold text-sm text-slate-800">{f.airline || "Airline TBC"}</p><p className="text-xs text-slate-400">{[f.flightNo, f.class].filter(Boolean).join(" · ")}</p></div>
                      </div>
                      <div className="flex items-center gap-3 flex-1 justify-center min-w-[200px]">
                        <div className="text-center"><p className="text-2xl font-black text-slate-900">{f.departure}</p><p className="text-xs font-bold text-slate-500">{f.from}</p><p className="text-xs text-slate-400">{f.fromCity}</p></div>
                        <div className="flex-1 flex flex-col items-center gap-1">
                          <p className="text-xs text-slate-400">{f.duration}</p>
                          <div className="flex items-center w-full gap-1"><div className="h-px flex-1 bg-slate-300"></div><Plane className="w-4 h-4 text-slate-400" /><div className="h-px flex-1 bg-slate-300"></div></div>
                        </div>
                        <div className="text-center"><p className="text-2xl font-black text-slate-900">{f.arrival}</p><p className="text-xs font-bold text-slate-500">{f.to}</p><p className="text-xs text-slate-400">{f.toCity}</p></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              )}
              <p className="text-xs text-slate-400 mt-4 flex items-center gap-1.5"><Info className="w-3.5 h-3.5" />Flight timings are indicative. Actual tickets issued upon booking confirmation.</p>
            </motion.div>

            <HotelSection hotels={pkg.hotels} location={pkg.location} />
          </div>
          <Sidebar pkg={pkg} handleBookNow={handleBookNow} />
        </div>

        {/* Optional Tours & Reviews */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-8">
          <Tabs value={activeBottomTab} onValueChange={setActiveBottomTab}>
            <div className="bg-white rounded-t-2xl border border-b-0 border-slate-100 shadow-sm px-5 pt-5 flex items-center gap-3 flex-wrap">
              <TabsList className="bg-slate-100 rounded-xl p-1 h-auto gap-1 inline-flex">
                <TabsTrigger value="optional-tours" className="rounded-lg px-6 py-2.5 text-sm font-semibold data-[state=active]:bg-teal-600 data-[state=active]:text-white data-[state=active]:shadow transition-all">Optional Tours</TabsTrigger>
                <TabsTrigger value="reviews" className="rounded-lg px-6 py-2.5 text-sm font-semibold data-[state=active]:bg-teal-600 data-[state=active]:text-white data-[state=active]:shadow transition-all">Reviews</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="optional-tours" className="mt-0">
              <div className="bg-white rounded-b-2xl border border-slate-100 shadow-sm p-5 md:p-7 space-y-5">
                {tours.length === 0 ? (
                  <EmptySection icon={FileWarning} title="No optional tours added yet" hint="Add optional add-on tours from the Opt. Tours tab of the admin panel." />
                ) : tours.map((tour) => (
                  <div key={tour.id} className="border border-slate-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row">
                      <div className="flex-1 p-5">
                        <div className="flex items-start gap-3 mb-3">
                          <h3 className="font-bold text-slate-900">{tour.title}</h3>
                          <span className={`shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full ${tour.tag === "Mandatory" ? "bg-rose-100 text-rose-600" : "bg-teal-100 text-teal-700"}`}>{tour.tag}</span>
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed mb-2">{expandedTour === tour.id ? tour.desc : `${tour.desc.slice(0, 160)}${tour.desc.length > 160 ? "…" : ""}`}</p>
                        {tour.desc.length > 160 && (
                          <button onClick={() => setExpandedTour(expandedTour === tour.id ? null : tour.id)} className="text-xs font-bold text-teal-600 hover:underline mb-4 transition-colors">{expandedTour === tour.id ? "Read less" : "Read more"}</button>
                        )}
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs border border-slate-100 rounded-xl overflow-hidden">
                            <thead><tr className="bg-slate-50">{["Adult","Single","Child 6–11","Child 2–5","Infant"].map(h => <th key={h} className="px-3 py-2 text-left font-semibold text-slate-600">{h}</th>)}</tr></thead>
                            <tbody><tr className="bg-white">{[tour.adult,tour.single,tour.child611,tour.child25,tour.infant].map((v,vi) => <td key={vi} className="px-3 py-2 text-slate-700 font-medium"><span className="text-slate-400 text-[10px] mr-0.5">QAR</span>{v}</td>)}</tr></tbody>
                          </table>
                        </div>
                      </div>
                      {tour.images.length > 0 && (
                        <div className="md:w-72 shrink-0">
                          <div className="grid grid-cols-3 md:grid-cols-1 gap-1 p-2 h-full">
                            {tour.images.map((img, ii) => (
                              <div key={ii} className="relative h-28 md:h-[88px] rounded-xl overflow-hidden">
                                <Image src={img} alt="" fill sizes="(min-width: 768px) 288px, 33vw" className="object-cover hover:scale-105 transition-transform duration-300" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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
// GENERAL LAYOUT — holidays, kerala, cruise, medical
// ─────────────────────────────────────────────
function GeneralLayout({ pkg, handleBookNow }: { pkg: Package; handleBookNow: (d?: string) => void }) {
  const [activeBottomTab, setActiveBottomTab] = useState("optional-tours");
  const [expandedTour, setExpandedTour] = useState<string | null>(null);
  const tours = pkg.optionalTours ?? [];

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
                { icon: Hotel, label: "Hotels", value: pkg.accommodation || "See below", color: "bg-purple-50 text-purple-600" },
                { icon: Utensils, label: "Meals", value: pkg.meals || "See inclusions", color: "bg-amber-50 text-amber-600" },
              ].map((item, i) => (
                <motion.div key={i} whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center hover:shadow-md transition-shadow">
                  <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center mx-auto mb-2.5`}><item.icon className="w-5 h-5" /></div>
                  <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide mb-0.5">{item.label}</p>
                  <p className="font-bold text-sm text-slate-800 flex items-center justify-center gap-1.5">{item.value}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* About */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-3">About This Tour</h2>
              <p className="text-slate-500 leading-relaxed text-sm md:text-base">{pkg.description}</p>
              <div className="grid sm:grid-cols-2 gap-3 mt-5">
                <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0"><CreditCard className="w-5 h-5 text-emerald-600" /></div>
                  <div><p className="font-semibold text-sm text-slate-800">Best Price Guarantee</p><p className="text-xs text-slate-500">We match any lower price</p></div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-xl border border-teal-100">
                  <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center shrink-0"><Lock className="w-5 h-5 text-teal-600" /></div>
                  <div><p className="font-semibold text-sm text-slate-800">Secure Booking</p><p className="text-xs text-slate-500">100% secure payments</p></div>
                </div>
              </div>
            </motion.div>

            <ItinerarySection itinerary={pkg.itinerary} />
            <InclusionsExclusionsTab includes={pkg.includes} exclusions={pkg.exclusions ?? []} />
            <HotelSection hotels={pkg.hotels} location={pkg.location} />
          </div>
          <Sidebar pkg={pkg} handleBookNow={handleBookNow} />
        </div>

        {/* Optional Tours & Reviews — no pricing table */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-8">
          <Tabs value={activeBottomTab} onValueChange={setActiveBottomTab}>
            <div className="bg-white rounded-t-2xl border border-b-0 border-slate-100 shadow-sm px-5 pt-5 flex items-center gap-3 flex-wrap">
              <TabsList className="bg-slate-100 rounded-xl p-1 h-auto gap-1 inline-flex">
                <TabsTrigger value="optional-tours" className="rounded-lg px-6 py-2.5 text-sm font-semibold data-[state=active]:bg-teal-600 data-[state=active]:text-white data-[state=active]:shadow transition-all">Optional Tours</TabsTrigger>
                <TabsTrigger value="reviews" className="rounded-lg px-6 py-2.5 text-sm font-semibold data-[state=active]:bg-teal-600 data-[state=active]:text-white data-[state=active]:shadow transition-all">Reviews</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="optional-tours" className="mt-0">
              <div className="bg-white rounded-b-2xl border border-slate-100 shadow-sm p-5 md:p-7 space-y-5">
                {tours.length === 0 ? (
                  <EmptySection icon={FileWarning} title="No optional tours added yet" hint="Add optional add-on tours from the Opt. Tours tab of the admin panel." />
                ) : tours.map((tour) => (
                  <div key={tour.id} className="border border-slate-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row">
                      {tour.images.length > 0 && (
                        <div className="md:w-72 shrink-0 order-first md:order-last">
                          <div className="grid grid-cols-3 md:grid-cols-1 gap-1 p-2 h-full">
                            {tour.images.map((img, ii) => (
                              <div key={ii} className="relative h-28 md:h-[88px] rounded-xl overflow-hidden">
                                <Image src={img} alt="" fill sizes="(min-width: 768px) 288px, 33vw" className="object-cover hover:scale-105 transition-transform duration-300" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex-1 p-5">
                        <div className="flex items-start gap-3 mb-3">
                          <h3 className="font-bold text-slate-900">{tour.title}</h3>
                          <span className={`shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full ${tour.tag === "Mandatory" ? "bg-rose-100 text-rose-600" : "bg-teal-100 text-teal-700"}`}>{tour.tag}</span>
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed mb-3">{expandedTour === tour.id ? tour.desc : `${tour.desc.slice(0, 200)}${tour.desc.length > 200 ? "…" : ""}`}</p>
                        {tour.desc.length > 200 && (
                          <button onClick={() => setExpandedTour(expandedTour === tour.id ? null : tour.id)} className="text-xs font-bold text-teal-600 hover:underline transition-colors">{expandedTour === tour.id ? "Read less" : "Read more"}</button>
                        )}
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
// Root view — routes to the right layout. Exported by name so the
// admin panel can render the exact same component for its live preview.
// ─────────────────────────────────────────────
export function PackageDetailView({ pkg }: { pkg: Package }) {
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

export default function PackageDetailClient({ pkg }: { pkg: Package }) {
  return <PackageDetailView pkg={pkg} />;
}
