"use client";

import * as React from "react";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { Search, Globe, MapPin, ArrowRight, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion";
import { COUNTRIES, REGIONS, Region, Country } from "@/lib/data/visa";
import { PageHeader } from "@/components/layout/PageHeader";

export default function VisaPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
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
    <main className="flex-1">
      {/* <PageHeader
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
      </PageHeader> */}

      {/* Hero Section */}
      <section className="relative h-[40vh] min-h-[300px] bg-gradient-to-r from-primary/90 to-primary/70">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Explore Our Visa Services..
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl">
            Discover amazing destinations and experiences tailored just for you
          </p>
          <div className="mt-6 relative flex items-center bg-background/95 backdrop-blur-xl border border-white/10 rounded-full p-1.5 shadow-2xl">
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
      </section>

      {/* Search and Filter Section */}
      {/* <section className="container mx-auto px-4 -mt-8 relative z-10">
                <Card className="shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search destinations, packages..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                        
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section> */}

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
  );
}

function CountryCard({ country, locale }: { country: Country; locale: string }) {
  return (
    <Link href={`/global-visa/${country.slug}`} className="block h-full">
      <div className="group relative h-[320px] rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
        {/* Background Image */}
        {country.image ? (
          <Image
            src={country.image}
            alt={country.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 bg-muted" />
        )}

        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
          <div className="bg-black/20 backdrop-blur-md rounded-full px-2 py-1 shadow-sm border border-white/10">
            <span className="text-3xl filter drop-shadow-md transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 leading-none block">{country.flag}</span>
          </div>
          <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/20 shadow-lg px-3 py-1 font-semibold tracking-wide">
            {country.region}
          </Badge>
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-10 flex flex-col justify-end h-full">
          <div className="mt-auto transform transition-transform duration-300 group-hover:-translate-y-2">
            <h3 className="text-2xl font-bold text-white mb-2 tracking-wide drop-shadow-lg">{country.name}</h3>

            <div className="space-y-2 mb-2">
              {country.processingTime && (
                <div className="flex items-center gap-2 text-sm text-white/90">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  <span className="font-medium drop-shadow-sm">Time: <span className="text-white font-bold ml-1">{country.processingTime}</span></span>
                </div>
              )}
              {country.price && (
                <div className="flex items-center gap-2 text-sm text-white/90">
                  <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
                  <span className="font-medium drop-shadow-sm">Fee From: <span className="text-white font-bold ml-1">{country.price}</span></span>
                </div>
              )}
            </div>

            <div className="overflow-hidden">
              <div className="flex items-center text-primary font-semibold text-sm transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-75">
                <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center border border-white/10 text-white shadow-lg">
                  View Visa Details <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}