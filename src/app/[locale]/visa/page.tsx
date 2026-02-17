"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Search, Globe, MapPin, ArrowRight, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion";
import { COUNTRIES, REGIONS, Region, Country } from "@/lib/data/visa";
import { TopBar } from "@/components/layout/TopBar";
import { Header } from "@/components/layout/Header";
import { SiteFooter } from "@/components/layout/Footer";

import { PageHeader } from "@/components/layout/PageHeader";

export default function VisaPage() {
  const router = useRouter();
  const params = useParams();
  const locale = String(params?.locale || "en");
  const [query, setQuery] = React.useState("");
  const [region, setRegion] = React.useState<Region | "All">("All");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return COUNTRIES.filter((c) =>
      (region === "All" || c.region === region) &&
      (q === "" || c.name.toLowerCase().includes(q))
    );
  }, [query, region]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <TopBar />
      <Header />


      <main className="flex-1">
        <PageHeader
          title="Visa Services"
          description="Seamless visa processing for over 100+ countries. Start your journey with confidence."
          image="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
          imageAlt="Visa Services Banner"
        >
          <div className="max-w-xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-purple-600 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-500" />
              <div className="relative flex items-center bg-background/95 backdrop-blur-xl border border-white/10 rounded-full p-1.5 shadow-2xl">
                <Search className="ml-4 h-5 w-5 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Where do you want to travel?"
                  className="flex-1 border-none bg-transparent h-11 text-base focus-visible:ring-0 px-4 placeholder:text-muted-foreground/70"
                />
                <Button size="lg" className="rounded-full px-6 font-bold shadow-lg h-11">
                  Search
                </Button>
              </div>
            </div>
          </div>
        </PageHeader>

        {/* Main Content */}
        <section className="container mx-auto px-4 py-12">

          {/* Filters */}
          <FadeIn>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <Tabs value={region} onValueChange={(v) => setRegion(v as Region | "All")} className="w-full">
                <TabsList className="h-auto p-1 bg-muted/50 rounded-full w-full md:w-auto overflow-x-auto flex-nowrap justify-start scrollbar-hide mx-auto md:mx-0">
                  <TabsTrigger value="All" className="rounded-full px-5 py-2.5">All</TabsTrigger>
                  {REGIONS.map((r) => (
                    <TabsTrigger key={r} value={r} className="rounded-full px-5 py-2.5 whitespace-nowrap">{r}</TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </FadeIn>

          {/* Grid - Adjusted for better sizing: sm:2, lg:3, xl:4. Reduced card padding. */}
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((c) => (
              <StaggerItem key={c.slug}>
                <CountryCard country={c} locale={locale} />
              </StaggerItem>
            ))}
          </StaggerContainer>

          {filtered.length === 0 && (
            <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">No countries found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter</p>
              <Button variant="link" onClick={() => { setQuery(""); setRegion("All") }} className="mt-2 text-primary">Clear all filters</Button>
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function CountryCard({ country, locale }: { country: Country; locale: string }) {
  return (
    <Link href={`/${locale}/visa/${country.slug}`} className="block h-full">
      <div className="group relative h-full bg-card border hover:border-primary/50 rounded-2xl p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col">

        <div className="flex items-start justify-between mb-3">
          <span className="text-4xl filter drop-shadow-sm transform group-hover:scale-110 transition-transform duration-500">{country.flag}</span>
          <Badge variant="secondary" className="bg-muted hover:bg-primary/10 hover:text-primary transition-colors text-xs">
            {country.region}
          </Badge>
        </div>

        <div className="mt-auto">
          <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1">{country.name}</h3>

          <div className="space-y-1.5 text-sm text-muted-foreground mb-3">
            {country.processingTime && (
              <div className="flex items-center gap-2 text-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="truncate">Proc: <span className="text-foreground font-medium">{country.processingTime}</span></span>
              </div>
            )}
            {country.price && (
              <div className="flex items-center gap-2 text-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                <span className="truncate">From: <span className="text-foreground font-medium">{country.price}</span></span>
              </div>
            )}
          </div>

          <div className="flex items-center text-primary font-semibold text-xs opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
            View Details <ArrowRight className="ml-1.5 h-3 w-3" />
          </div>
        </div>
      </div>
    </Link>
  );
}