"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Phone, Mail, MapPin, Globe, Ship, Stethoscope, Plane, Hotel, Star, Calendar, Users, Search, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Stamp, ShieldCheck, Umbrella, FileCheck2 } from "lucide-react";

// -----------------------------------------------------------------------------
// Landing page for a Travel Agency using shadcn/ui + Tailwind (responsive)
// - Mobile-first header with Sheet menu
// - Hero with search bar
// - Featured Destinations & Packages
// - Services (Cruise Packages & Medical Tourism highlighted)
// - Why Choose Us
// - Testimonials
// - CTA Banner
// - Footer
// -----------------------------------------------------------------------------

export default function Page() {
  const pathname = usePathname();
  const isRTL = typeof document !== "undefined" && document?.dir === "rtl";

  return (
    <div className="min-h-screen bg-background text-foreground" dir={isRTL ? "rtl" : "ltr"}>
      <TopBar />
      <Header />
      <main>
        <Hero />
        <QuickSearch />
        <ServicesQuick />
        <FeaturedDestinations />
        <FeaturedPackages />
        <Services />
        <WhyChooseUs />
        <Testimonials />
        <CtaBanner />
      </main>
      <SiteFooter />
    </div>
  );
}

// -----------------------------------------------------------------------------
// Top contact bar
// -----------------------------------------------------------------------------
function TopBar() {
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

// -----------------------------------------------------------------------------
// Header / Navigation
// -----------------------------------------------------------------------------
function Header() {
  const nav = [
    { href: "/", label: "Home" },
    { href: "#destinations", label: "Destinations" },
    { href: "#cruise", label: "Cruise Packages" },
    { href: "#medical", label: "Medical Tourism" },
    { href: "#about", label: "About" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=400&auto=format&fit=crop" alt="TravelCo Logo" width={36} height={36} className="rounded-full" />
          <span className="font-bold text-xl tracking-tight">TravelCo</span>
        </div>

        <nav className="hidden lg:flex items-center gap-6">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="text-sm hover:text-primary transition-colors">
              {n.label}
            </Link>
          ))}
          <Button asChild>
            <Link href="#book">Book Now</Link>
          </Button>
        </nav>

        <div className="lg:hidden">
          <MobileMenu nav={nav} />
        </div>
      </div>
    </header>
  );
}

function MobileMenu({ nav }: { nav: { href: string; label: string }[] }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0"><Menu className="h-5 w-5" /></Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[320px] px-4">
        <div className="flex items-center gap-3 mb-6">
          <Image src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=200&auto=format&fit=crop" alt="TravelCo Logo" width={32} height={32} className="rounded-full" />
          <span className="font-semibold">TravelCo</span>
        </div>
        <nav className="grid gap-3">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="py-2 text-base hover:text-primary">
              {n.label}
            </Link>
          ))}
          <Button asChild className="mt-2">
            <Link href="#book">Book Now</Link>
          </Button>
        </nav>
        <Separator className="my-6" />
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="inline-flex items-center gap-2"><Phone className="h-4 w-4" /> +974 5555 5555</div>
          <div className="inline-flex items-center gap-2"><Mail className="h-4 w-4" /> hello@travelco.com</div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// -----------------------------------------------------------------------------
// Hero Section (Slider Banner with overlayed Explore button)
// -----------------------------------------------------------------------------
function Hero() {
  const slides = [
    {
      title: "Discover Maldives",
      subtitle: "Overwater villas, coral reefs, and crystal lagoons",
      image: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?q=80&w=2400&auto=format&fit=crop"
    },
    {
      title: "Explore Istanbul",
      subtitle: "Where East meets West—bazaars, mosques, and skyline sunsets",
      image: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?q=80&w=2400&auto=format&fit=crop"
    },
    {
      title: "Georgia Getaways",
      subtitle: "Mountains, vineyards, and storybook towns",
      image: "https://images.unsplash.com/photo-1565008576549-57569a49371d?q=80&w=2400&auto=format&fit=crop"
    },
  ];

  return (
    <section className="relative h-[90vh] w-full overflow-hidden">
      <Carousel opts={{ loop: true, duration: 60 }} plugins={[
        // @ts-ignore
        Autoplay({ delay: 6000, stopOnInteraction: false })
      ]} className="h-full w-full">
        <CarouselContent className="h-full -ml-0">
          {slides.map((s, i) => (
            <CarouselItem key={i} className="pl-0 h-full w-full relative">
              <div className="relative h-full w-full">
                <Image
                  src={s.image}
                  alt={s.title}
                  fill
                  className="object-cover brightness-75"
                  priority={i === 0}
                />

                {/* Gradient Overlay for better text visibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-black/20 to-black/30" />

                {/* Hero Content */}
                <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4 pt-20">
                  <Badge variant="outline" className="mb-6 text-white border-white/40 bg-white/10 backdrop-blur-sm px-4 py-1 text-sm tracking-widest uppercase">
                    Trending Destinations
                  </Badge>

                  <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tight mb-6 drop-shadow-2xl max-w-5xl leading-[1.1]">
                    {s.title}
                  </h1>

                  <p className="text-lg md:text-2xl text-white/90 max-w-2xl font-light leading-relaxed mb-10 drop-shadow-md">
                    {s.subtitle}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                    <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-primary/25 transition-all">
                      <Link href="#packages">Explore Packages</Link>
                    </Button>
                    <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-white text-white hover:bg-white hover:text-black backdrop-blur-sm transition-all">
                      <Link href="#destinations">View Destinations</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Custom Navigation */}
        <div className="absolute bottom-32 left-0 right-0 z-20 container mx-auto px-4 hidden md:flex justify-between items-end pointer-events-none">
          <div className="flex gap-2 pointer-events-auto">
            {/* Indicators could go here */}
          </div>
          <div className="flex gap-4 pointer-events-auto">
            <CarouselPrevious className="static translate-y-0 h-12 w-12 border-2 border-white/30 bg-black/20 text-white hover:bg-white hover:text-black hover:border-white transition-all backdrop-blur-sm" />
            <CarouselNext className="static translate-y-0 h-12 w-12 border-2 border-white/30 bg-black/20 text-white hover:bg-white hover:text-black hover:border-white transition-all backdrop-blur-sm" />
          </div>
        </div>
      </Carousel>
    </section>
  );
}

// -----------------------------------------------------------------------------
// Quick Search strip
// -----------------------------------------------------------------------------
function QuickSearch() {
  return (
    <section className="relative z-30 container mx-auto px-4 -mt-24">
      <div className="bg-white/80 dark:bg-black/60 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl p-6 md:p-8">
        <form className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-4 space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Destination</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Where do you want to go?"
                className="pl-9 h-12 bg-background/50 border-transparent hover:border-primary/20 focus:border-primary transition-all text-base"
              />
            </div>
          </div>

          <div className="md:col-span-3 space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Check In</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                className="pl-9 h-12 bg-background/50 border-transparent hover:border-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="md:col-span-3 space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Check Out</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                className="pl-9 h-12 bg-background/50 border-transparent hover:border-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <Button className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/25 rounded-xl transition-all hover:scale-105 active:scale-95">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
        </form>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium mr-2">Popular:</span>
          {["Maldives", "Istanbul", "Baku", "Phuket"].map(city => (
            <Badge key={city} variant="secondary" className="bg-background/50 hover:bg-background cursor-pointer px-3 py-1">
              {city}
            </Badge>
          ))}
        </div>
      </div>
    </section>
  );
}

// -----------------------------------------------------------------------------
// ServicesQuick
// -----------------------------------------------------------------------------
function ServicesQuick() {
  const router = useRouter();
  const items = [
    { title: "Holidays", icon: Umbrella },
    { title: "Hotel", icon: Hotel },
    { title: "Visa", icon: FileCheck2, to: "/visa" },
    { title: "Flights", icon: Plane },
    { title: "Attestation", icon: Stamp },
    { title: "Travel Insurance", icon: ShieldCheck },
  ];

  return (
    <section className="container mx-auto px-4 py-6 md:py-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {items.map((it) => (
          <Card key={it.title} className="border bg-muted/20 hover:bg-muted/40 transition-colors" onClick={() => router.push(it.to || "#")}>
            <CardContent className="py-6 flex flex-col items-center justify-center text-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary/10 inline-flex items-center justify-center">
                <it.icon className="h-6 w-6 text-primary" />
              </div>
              <span className="text-sm font-semibold tracking-wide">{it.title.toUpperCase()}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}



// -----------------------------------------------------------------------------
// Featured Destinations
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// Featured Destinations (Bento Grid)
// -----------------------------------------------------------------------------
function FeaturedDestinations() {
  const items = [
    { title: "Maldives", image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=1200", tag: "Beach", size: "col-span-12 md:col-span-8 row-span-2" },
    { title: "Istanbul", image: "https://images.unsplash.com/photo-1530053969600-caed2596d242?q=80&w=1200", tag: "Culture", size: "col-span-12 md:col-span-4 row-span-1" },
    { title: "Georgia", image: "https://images.unsplash.com/photo-1512446816042-444d641267d4?q=80&w=1200", tag: "Mountains", size: "col-span-6 md:col-span-4 row-span-1" },
    { title: "Baku", image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?q=80&w=1200", tag: "City", size: "col-span-6 md:col-span-4 row-span-1" },
    { title: "Phuket", image: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?q=80&w=1200", tag: "Island", size: "col-span-12 md:col-span-8 row-span-1" },
  ];

  return (
    <section id="destinations" className="container mx-auto px-4 py-24">
      <div className="flex flex-col md:flex-row items-end justify-between gap-4 mb-12">
        <div>
          <h2 className="text-4xl font-bold tracking-tight mb-2">Top Destinations</h2>
          <p className="text-lg text-muted-foreground">Handpicked places loved by our travelers</p>
        </div>
        <Button variant="outline" className="hidden md:inline-flex rounded-full px-6" asChild>
          <Link href="#packages">View all destinations <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-4 md:auto-rows-[240px]">
        {items.map((item, i) => (
          <div key={i} className={`relative group overflow-hidden rounded-3xl ${item.size} min-h-[240px]`}>
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
            <div className="absolute bottom-0 left-0 p-6 w-full">
              <Badge variant="secondary" className="mb-2 bg-white/20 text-white border-0 hover:bg-white/30 backdrop-blur-sm">
                {item.tag}
              </Badge>
              <h3 className="text-white font-bold text-2xl md:text-3xl tracking-tight translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                {item.title}
              </h3>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 text-center md:hidden">
        <Button variant="outline" className="rounded-full w-full" asChild>
          <Link href="#packages">View all destinations</Link>
        </Button>
      </div>
    </section>
  );
}

// -----------------------------------------------------------------------------
// Featured Packages (tabs)
// -----------------------------------------------------------------------------
function FeaturedPackages() {
  const holidays = [
    { title: "Maldives 4D/3N", price: 3499, image: "https://images.unsplash.com/photo-1526779259212-939e64788e3c?q=80&w=1200&auto=format&fit=crop" },
    { title: "Baku Escape 5D/4N", price: 1999, image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?q=80&w=1200&auto=format&fit=crop" },
    { title: "Istanbul Highlights 5D/4N", price: 2599, image: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=1200&auto=format&fit=crop" },
    { title: "Phuket Beach Fun 6D/5N", price: 2999, image: "https://images.unsplash.com/photo-1589330273594-fade1ee91647?q=80&w=1200&auto=format&fit=crop" },
    { title: "Swiss Alps Tour 7D/6N", price: 6599, image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=1200&auto=format&fit=crop" },
    { title: "London Explorer 5D/4N", price: 4199, image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1200&auto=format&fit=crop" },
  ];

  const cruises = [
    { title: "Arabian Gulf Cruise 7N", price: 4299, image: "https://images.unsplash.com/photo-1569931728440-1488c2cfd34b?q=80&w=1200&auto=format&fit=crop" },
    { title: "Mediterranean Voyage 5N", price: 3899, image: "https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?q=80&w=1200&auto=format&fit=crop" },
  ];

  const medical = [
    { title: "Cardiac Checkup – Turkey", price: 1599, image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop" },
    { title: "Dental Implants – Georgia", price: 899, image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=1200&auto=format&fit=crop" },
  ];

  return (
    <section id="packages" className="container mx-auto px-4 py-24 bg-muted/10">
      <div className="flex items-end justify-between gap-4 mb-10">
        <div>
          <h2 className="text-4xl font-bold tracking-tight mb-2">Featured Packages</h2>
          <p className="text-lg text-muted-foreground">Limited-time offers curated by our experts</p>
        </div>
      </div>

      <Tabs defaultValue="holidays" className="w-full">
        <div className="flex justify-center mb-8">
          <TabsList className="bg-muted/50 p-1 rounded-full h-14">
            <TabsTrigger value="holidays" className="rounded-full px-8 h-12 text-base data-[state=active]:bg-white data-[state=active]:shadow-sm"><Plane className="mr-2 h-4 w-4" /> Holidays</TabsTrigger>
            <TabsTrigger value="cruise" className="rounded-full px-8 h-12 text-base data-[state=active]:bg-white data-[state=active]:shadow-sm"><Ship className="mr-2 h-4 w-4" /> Cruise</TabsTrigger>
            <TabsTrigger value="medical" className="rounded-full px-8 h-12 text-base data-[state=active]:bg-white data-[state=active]:shadow-sm"><Stethoscope className="mr-2 h-4 w-4" /> Medical</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="holidays" className="animate-in fade-in zoom-in-95 duration-500">
          <PackageGrid items={holidays} />
        </TabsContent>
        <TabsContent value="cruise" id="cruise" className="animate-in fade-in zoom-in-95 duration-500">
          <PackageGrid items={cruises} />
        </TabsContent>
        <TabsContent value="medical" id="medical" className="animate-in fade-in zoom-in-95 duration-500">
          <PackageGrid items={medical} />
        </TabsContent>
      </Tabs>

      <div className="mt-12 flex justify-center">
        <Button size="lg" variant="outline" className="rounded-full px-8">View All Packages</Button>
      </div>
    </section>
  );
}

function PackageGrid({ items }: { items: { title: string; price: number; image: string }[] }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {items.map((pkg) => (
        <Card key={pkg.title} className="overflow-hidden group border-0 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-3xl">
          <div className="relative h-64 overflow-hidden">
            <Image src={pkg.image} alt={pkg.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Best Seller
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <CardTitle className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">{pkg.title}</CardTitle>
                <div className="flex items-center gap-1 text-amber-400">
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-muted-foreground text-xs ml-1">(4.9)</span>
                </div>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Starts From</p>
                <p className="text-2xl font-black text-primary">QAR {pkg.price.toLocaleString()}</p>
              </div>
              <Button className="rounded-full shadow-lg hover:shadow-primary/25">Book Now</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Services strip
// -----------------------------------------------------------------------------
function Services() {
  const services = [
    { icon: Plane, title: "Flight Tickets", desc: "Best fares with top airlines" },
    { icon: Hotel, title: "Hotel Bookings", desc: "Handpicked stays worldwide" },
    { icon: Ship, title: "Cruise Packages", desc: "Luxury voyages & short sails" },
    { icon: Stethoscope, title: "Medical Tourism", desc: "Trusted hospitals & care" },
  ];

  return (
    <section className="bg-muted/30">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Everything you need for a perfect trip</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s) => (
            <Card key={s.title}>
              <CardHeader>
                <div className="h-10 w-10 rounded-xl bg-primary/10 inline-flex items-center justify-center mb-3">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>{s.title}</CardTitle>
                <CardDescription>{s.desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// -----------------------------------------------------------------------------
// Why Choose Us (Accordion)
// -----------------------------------------------------------------------------
function WhyChooseUs() {
  const points = [
    { q: "Qatar-based travel experts", a: "Local team with global partners delivering consistent quality and support." },
    { q: "Custom itineraries in any budget", a: "From quick weekend getaways to long luxury holidays—crafted around you." },
    { q: "Transparent pricing", a: "No hidden fees. Clear inclusions and exclusions before you book." },
  ];

  return (
    <section id="about" className="container mx-auto px-4 py-12 md:py-20">
      <div className="grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Why travelers choose us</h2>
          <p className="text-muted-foreground mb-6">We blend human expertise with smart tools to make travel effortless.</p>
          <Accordion type="single" collapsible className="w-full">
            {points.map((p, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`}>
                <AccordionTrigger>{p.q}</AccordionTrigger>
                <AccordionContent>{p.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
          <Image src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=1600&auto=format&fit=crop" alt="Team at work" fill className="object-cover" />
        </div>
      </div>
    </section>
  );
}

// -----------------------------------------------------------------------------
// Testimonials (Modern)
// -----------------------------------------------------------------------------
function Testimonials() {
  const quotes = [
    { name: "Aisha M.", text: "Seamless experience from visa to hotel. The Maldives package was perfect!", place: "Maldives Holiday", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop" },
    { name: "Omar K.", text: "Cruise team handled everything. Great value and great memories.", place: "Gulf Cruise", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop" },
    { name: "Sara L.", text: "Medical trip to Turkey was smooth, hospital coordination was excellent.", place: "Medical Tourism", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop" },
  ];

  return (
    <section className="bg-muted/30 py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-4xl font-bold tracking-tight mb-4">Loved by thousands of travelers</h2>
          <p className="text-lg text-muted-foreground">Don't just take our word for it. Read what our customers have to say about their journey with us.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {quotes.map((q, i) => (
            <Card key={i} className="border-none shadow-xl bg-background/50 backdrop-blur-sm relative overflow-visible mt-6">
              <div className="absolute -top-6 left-8 h-12 w-12 rounded-full border-4 border-background overflow-hidden">
                <Image src={q.avatar} alt={q.name} fill className="object-cover" />
              </div>
              <CardContent className="pt-10 pb-8 px-8">
                <div className="flex gap-1 text-primary mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                </div>
                <p className="text-lg italic text-muted-foreground mb-6">“{q.text}”</p>
                <div>
                  <h4 className="font-bold text-foreground">{q.name}</h4>
                  <p className="text-sm text-primary font-medium">{q.place}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// -----------------------------------------------------------------------------
// CTA Banner
// -----------------------------------------------------------------------------
function CtaBanner() {
  return (
    <section id="book" className="container mx-auto px-4 py-24">
      <div className="relative rounded-[3rem] overflow-hidden">
        <div className="absolute inset-0">
          <Image src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop" alt="Sunset wing view" fill className="object-cover" />
          <div className="absolute inset-0 bg-primary/90 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
        </div>

        <div className="relative z-10 p-12 md:p-24 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-2xl">
            <h3 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">Ready to plan your next getaway?</h3>
            <p className="text-xl text-white/90">Talk to our travel consultants today and get a custom quote for your dream vacation.</p>
          </div>
          <div className="flex-shrink-0">
            <Button size="lg" className="h-16 px-10 rounded-full text-lg bg-white text-primary hover:bg-white/90 font-bold shadow-2xl">
              Get a Free Quote
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

// -----------------------------------------------------------------------------
// Footer
// -----------------------------------------------------------------------------
function SiteFooter() {
  return (
    <footer id="contact" className="bg-foreground text-background pt-20 pb-10">
      <div className="container mx-auto px-4 grid md:grid-cols-4 gap-12 mb-16">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 relative rounded-full overflow-hidden bg-white/10">
              <Image src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=200&auto=format&fit=crop" alt="TravelCo Logo" fill className="object-cover" />
            </div>
            <span className="font-bold text-2xl tracking-tight">TravelCo</span>
          </div>
          <p className="text-muted-foreground/80 leading-relaxed max-w-xs">Crafting unforgettable journeys from Doha to the world. Your trusted partner for seamless travel experiences.</p>
          <div className="flex gap-4">
            {/* Social icons placeholders */}
            <div className="h-10 w-10 rounded-full bg-white/5 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"><Globe className="h-5 w-5" /></div>
            <div className="h-10 w-10 rounded-full bg-white/5 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"><Mail className="h-5 w-5" /></div>
            <div className="h-10 w-10 rounded-full bg-white/5 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"><Phone className="h-5 w-5" /></div>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-lg mb-6">Company</h4>
          <ul className="space-y-4 text-muted-foreground/80">
            <li><Link href="#about" className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link href="#packages" className="hover:text-white transition-colors">Our Packages</Link></li>
            <li><Link href="#cruise" className="hover:text-white transition-colors">Cruise Deals</Link></li>
            <li><Link href="#medical" className="hover:text-white transition-colors">Medical Tourism</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-lg mb-6">Support</h4>
          <ul className="space-y-4 text-muted-foreground/80">
            <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">FAQs</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-lg mb-6">Contact Us</h4>
          <ul className="space-y-4 text-muted-foreground/80">
            <li className="flex items-start gap-3">
              <Phone className="h-5 w-5 shrink-0 text-primary mt-1" />
              <span>+974 5555 5555<br /><span className="text-xs opacity-70">Mon-Sun 9am-6pm</span></span>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="h-5 w-5 shrink-0 text-primary" />
              <span>hello@travelco.com</span>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="h-5 w-5 shrink-0 text-primary mt-1" />
              <span>Level 24, Tornado Tower,<br />West Bay, Doha, Qatar</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground/60">
        <span>© {new Date().getFullYear()} TravelCo. All rights reserved.</span>
        <div className="flex items-center gap-6">
          <span>Terms</span>
          <span>Privacy</span>
          <span>Cookies</span>
        </div>
      </div>
    </footer>
  );
}
