"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Phone, Mail, MapPin, Globe, Ship, Stethoscope, Plane, Hotel, Star, Calendar, Users, Search, Check } from "lucide-react";
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
    { title: "Discover Maldives", subtitle: "Overwater villas, coral reefs, and crystal lagoons",
      image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=1600&auto=format&fit=crop"},
    { title: "Explore Istanbul", subtitle: "Where East meets West—bazaars, mosques, and skyline sunsets",
      image: "https://images.unsplash.com/photo-1530053969600-caed2596d242?q=80&w=1600&auto=format&fit=crop"},
    { title: "Georgia Getaways", subtitle: "Mountains, vineyards, and storybook towns",
      image: "https://images.unsplash.com/photo-1512446816042-444d641267d4?q=80&w=1600&auto=format&fit=crop"},
  ];

  return (
    <section className="relative z-0">
      <Carousel opts={{ loop: true }} plugins={[
        // @ts-ignore
        Autoplay({ delay: 4500, stopOnInteraction: false })
      ]}>
        <CarouselContent>
          {slides.map((s, i) => (
            <CarouselItem key={i} className="basis-full">
              <div className="relative h-[54vh] min-h-[360px] md:h-[72vh]">
                <Image src={s.image} alt={s.title} fill className="object-cover" priority={i===0}/>
                {/* decorative gradient should NOT catch clicks */}
                <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/40 to-background/80 pointer-events-none"/>
                {/* overlay content */}
                <div className="container mx-auto px-4 absolute inset-0 flex items-center">
                  <div className="max-w-2xl">
                    <Badge className="mb-3" variant="secondary">Trending</Badge>
                    <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">{s.title}</h1>
                    <p className="mt-3 text-base md:text-lg text-muted-foreground">{s.subtitle}</p>
                    <div className="mt-6 inline-flex gap-3">
                      <Button size="lg" asChild><Link href="#packages">Explore</Link></Button>
                      <Button variant="secondary" asChild><Link href="#destinations">See Destinations</Link></Button>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* controls container should be non-interactive except buttons */}
        <div className="pointer-events-none absolute inset-x-0 bottom-4 flex items-center justify-between container mx-auto px-4">
          <div className="flex gap-2 text-xs text-muted-foreground">
            <span className="h-1.5 w-6 rounded-full bg-foreground/30"/><span className="h-1.5 w-6 rounded-full bg-foreground/30"/><span className="h-1.5 w-6 rounded-full bg-foreground/30"/>
          </div>
          <div className="flex gap-2">
            <CarouselPrevious className="relative pointer-events-auto"/>
            <CarouselNext className="relative pointer-events-auto"/>
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
    <section className="relative z-20 container mx-auto px-4 -mt-10 md:-mt-16">
      <Card className="shadow-xl">
        <CardContent className="p-4 md:p-6">
          <form className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-2 block">Destination</label>
              <Input placeholder="e.g., Maldives, Turkey, Georgia" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">From</label>
              <Input type="date" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">To</label>
              <Input type="date" />
            </div>
            <div className="flex items-end">
              <Button className="w-full"><Search className="mr-2 h-4 w-4" /> Search</Button>
            </div>
          </form>
          <p className="mt-3 text-xs text-muted-foreground">Popular: Maldives • Baku • Istanbul • Phuket</p>
        </CardContent>
      </Card>
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
    { title: "Visa", icon: FileCheck2, to:"/visa" },
    { title: "Flights", icon: Plane },
    { title: "Attestation", icon: Stamp },
    { title: "Travel Insurance", icon: ShieldCheck },
  ];

  return (
    <section className="container mx-auto px-4 py-6 md:py-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {items.map((it) => (
          <Card key={it.title} className="border bg-muted/20 hover:bg-muted/40 transition-colors" onClick={()=>router.push(it.to || "#")}>
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
function FeaturedDestinations() {
  const items = [
    { title: "Maldives", image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=1200&auto=format&fit=crop", tag: "Beach" },
    { title: "Istanbul", image: "https://images.unsplash.com/photo-1530053969600-caed2596d242?q=80&w=1200&auto=format&fit=crop", tag: "Culture" },
    { title: "Georgia", image: "https://images.unsplash.com/photo-1512446816042-444d641267d4?q=80&w=1200&auto=format&fit=crop", tag: "Mountains" },
    { title: "Phuket", image: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?q=80&w=1200&auto=format&fit=crop", tag: "Island" },
  ];

  return (
    <section id="destinations" className="container mx-auto px-4 py-12 md:py-20">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">Top Destinations</h2>
          <p className="text-muted-foreground">Handpicked places loved by our travelers</p>
        </div>
        <Button variant="secondary" className="hidden md:inline-flex" asChild>
          <Link href="#packages">View all</Link>
        </Button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <Card key={item.title} className="group overflow-hidden">
            <div className="relative h-52">
              <Image src={item.image} alt={item.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <h3 className="text-white font-semibold text-lg drop-shadow">{item.title}</h3>
                <Badge variant="secondary">{item.tag}</Badge>
              </div>
            </div>
          </Card>
        ))}
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
    <section id="packages" className="container mx-auto px-4 py-12 md:py-20">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">Featured Packages</h2>
          <p className="text-muted-foreground">Limited-time offers curated by our experts</p>
        </div>
      </div>

      <Tabs defaultValue="holidays" className="w-full">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="holidays"><Plane className="mr-2 h-4 w-4" /> Holidays</TabsTrigger>
          <TabsTrigger value="cruise"><Ship className="mr-2 h-4 w-4" /> Cruise Packages</TabsTrigger>
          <TabsTrigger value="medical"><Stethoscope className="mr-2 h-4 w-4" /> Medical Tourism</TabsTrigger>
        </TabsList>
        <TabsContent value="holidays">
          <PackageGrid items={holidays} />
        </TabsContent>
        <TabsContent value="cruise" id="cruise">
          <PackageGrid items={cruises} />
        </TabsContent>
        <TabsContent value="medical" id="medical">
          <PackageGrid items={medical} />
        </TabsContent>
      </Tabs>
    </section>
  );
}

function PackageGrid({ items }: { items: { title: string; price: number; image: string }[] }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {items.map((pkg) => (
        <Card key={pkg.title} className="overflow-hidden group">
          <div className="relative h-48">
            <Image src={pkg.image} alt={pkg.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
            <Badge className="absolute top-3 left-3">Best Seller</Badge>
          </div>
          <CardHeader>
            <CardTitle className="text-lg">{pkg.title}</CardTitle>
            <CardDescription className="text-base font-medium text-foreground">From QAR {pkg.price.toLocaleString()}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <Button variant="secondary">View Details</Button>
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
// Testimonials
// -----------------------------------------------------------------------------
function Testimonials() {
  const quotes = [
    { name: "Aisha M.", text: "Seamless experience from visa to hotel. The Maldives package was perfect!", place: "Maldives Holiday" },
    { name: "Omar K.", text: "Cruise team handled everything. Great value and great memories.", place: "Gulf Cruise" },
    { name: "Sara L.", text: "Medical trip to Turkey was smooth, hospital coordination was excellent.", place: "Medical Tourism" },
  ];

  return (
    <section className="bg-muted/30">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Loved by thousands of travelers</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {quotes.map((q) => (
            <Card key={q.name}>
              <CardHeader>
                <div className="inline-flex items-center gap-2">
                  <div className="h-9 w-9 rounded-full bg-primary/10 inline-flex items-center justify-center"><UserIcon /></div>
                  <div>
                    <CardTitle className="text-base">{q.name}</CardTitle>
                    <CardDescription>{q.place}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">“{q.text}”</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path d="M12 12c2.761 0 5-2.686 5-6s-2.239-6-5-6-5 2.686-5 6 2.239 6 5 6Zm0 2c-4.418 0-8 2.686-8 6v2h16v-2c0-3.314-3.582-6-8-6Z" fill="currentColor" />
    </svg>
  );
}

// -----------------------------------------------------------------------------
// CTA Banner
// -----------------------------------------------------------------------------
function CtaBanner() {
  return (
    <section id="book" className="container mx-auto px-4 py-12 md:py-20">
      <Card className="overflow-hidden">
        <div className="relative">
          <Image src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop" alt="Sunset wing view" width={1600} height={600} className="h-64 w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-transparent" />
        </div>
        <CardContent className="md:absolute md:inset-0 md:flex md:items-center md:justify-between p-6 md:p-10">
          <div className="invisible"> 
            <h3 className="text-2xl md:text-3xl font-bold">Ready to plan your next getaway?</h3>
            <p className="text-muted-foreground mt-1">Talk to our travel consultants today and get a custom quote.</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button size="lg">Get a Free Quote</Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

// -----------------------------------------------------------------------------
// Footer
// -----------------------------------------------------------------------------
function SiteFooter() {
  return (
    <footer id="contact" className="border-t">
      <div className="container mx-auto px-4 py-10 grid md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Image src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=200&auto=format&fit=crop" alt="TravelCo Logo" width={32} height={32} className="rounded-full" />
            <span className="font-semibold">TravelCo</span>
          </div>
          <p className="text-sm text-muted-foreground">Crafting unforgettable journeys from Doha to the world.</p>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="#about" className="hover:text-primary">About</Link></li>
            <li><Link href="#packages" className="hover:text-primary">Packages</Link></li>
            <li><Link href="#cruise" className="hover:text-primary">Cruise Packages</Link></li>
            <li><Link href="#medical" className="hover:text-primary">Medical Tourism</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Support</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>FAQ</li>
            <li>Terms & Conditions</li>
            <li>Privacy Policy</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Contact</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="inline-flex items-center gap-2"><Phone className="h-4 w-4" /> +974 5555 5555</li>
            <li className="inline-flex items-center gap-2"><Mail className="h-4 w-4" /> hello@travelco.com</li>
            <li className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" /> Doha, Qatar</li>
          </ul>
        </div>
      </div>
      <div className="border-t">
        <div className="container mx-auto px-4 py-6 text-xs text-muted-foreground flex items-center justify-between">
          <span>© {new Date().getFullYear()} TravelCo. All rights reserved.</span>
          <div className="inline-flex items-center gap-1"><Globe className="h-3.5 w-3.5" /> English</div>
        </div>
      </div>
    </footer>
  );
}
