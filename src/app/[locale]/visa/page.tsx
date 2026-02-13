"use client";

// =============================================================
// HOW TO USE
// - Save the first export as app/visa/page.tsx
// - Save the second export as app/visa/[country]/page.tsx
// - Components used: button, card, badge, input, textarea, tabs, popover, command, separator
//   Install via shadcn if needed: 
//   npx shadcn@latest add button card badge input textarea tabs popover command separator
// =============================================================

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  Search,
  Globe,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  FileText,
  ShieldCheck,
  Clock,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Separator } from "@/components/ui/separator";

// -------------------------------------------------------------
// Mock Data
// -------------------------------------------------------------
export type Region = "Middle East" | "Asia" | "Europe" | "Africa" | "Americas" | "Oceania";

export type Country = {
  name: string;
  code: string; // ISO-like code
  slug: string;
  region: Region;
  flag: string; // emoji for simplicity
};

const COUNTRIES: Country[] = [
  { name: "Qatar", code: "QA", slug: "qatar", region: "Middle East", flag: "🇶🇦" },
  { name: "United Arab Emirates", code: "AE", slug: "united-arab-emirates", region: "Middle East", flag: "🇦🇪" },
  { name: "Saudi Arabia", code: "SA", slug: "saudi-arabia", region: "Middle East", flag: "🇸🇦" },
  { name: "Turkey", code: "TR", slug: "turkey", region: "Europe", flag: "🇹🇷" },
  { name: "Georgia", code: "GE", slug: "georgia", region: "Europe", flag: "🇬🇪" },
  { name: "United Kingdom", code: "GB", slug: "united-kingdom", region: "Europe", flag: "🇬🇧" },
  { name: "India", code: "IN", slug: "india", region: "Asia", flag: "🇮🇳" },
  { name: "Thailand", code: "TH", slug: "thailand", region: "Asia", flag: "🇹🇭" },
  { name: "Japan", code: "JP", slug: "japan", region: "Asia", flag: "🇯🇵" },
  { name: "United States", code: "US", slug: "united-states", region: "Americas", flag: "🇺🇸" },
  { name: "Canada", code: "CA", slug: "canada", region: "Americas", flag: "🇨🇦" },
  { name: "Australia", code: "AU", slug: "australia", region: "Oceania", flag: "🇦🇺" },
  { name: "Kenya", code: "KE", slug: "kenya", region: "Africa", flag: "🇰🇪" },
];

const REGIONS: Region[] = [
  "Middle East",
  "Asia",
  "Europe",
  "Africa",
  "Americas",
  "Oceania",
];

// =============================================================
// app/visa/page.tsx — VISA LISTING PAGE
// =============================================================
export default function VisaPage() {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [region, setRegion] = React.useState<Region | "All">("All");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return COUNTRIES.filter((c) =>
      (region === "All" || c.region === region) &&
      (q === "" || c.name.toLowerCase().includes(q))
    );
  }, [query, region]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Banner */}
      <section className="relative">
        <div className="absolute inset-0 -z-10">
          <Image
            src="https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop"
            alt="Visa banner"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 to-background" />
        </div>
        <div className="container mx-auto px-4 py-16 md:py-24">
          <Badge variant="secondary" className="mb-3 inline-flex items-center gap-2"><Globe className="h-4 w-4"/> Visa Services</Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Find visa info for any country</h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">Search by country and filter by region. Click a country card to view requirements, processing time, and how to enquire.</p>

          {/* Search combobox */}
          <div className="mt-6 max-w-xl">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <div className="relative">
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search a country..."
                    className="pl-9"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                </div>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-[--radix-popover-trigger-width]">
                <Command shouldFilter={false}>
                  <CommandInput placeholder="Type a country" value={query} onValueChange={setQuery} />
                  <CommandList>
                    <CommandEmpty>No results.</CommandEmpty>
                    <CommandGroup>
                      {filtered.slice(0,8).map((c) => (
                        <CommandItem key={c.slug} onSelect={() => router.push(`/visa/${c.slug}`)}>
                          <span className="mr-2 text-lg">{c.flag}</span>
                          {c.name}
                          <Badge variant="secondary" className="ml-auto">{c.region}</Badge>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Region filters */}
          <div className="mt-6">
            <Tabs value={region} onValueChange={(v) => setRegion(v as Region | "All")}> 
              <TabsList className="flex flex-wrap gap-2">
                <TabsTrigger value="All">All Regions</TabsTrigger>
                {REGIONS.map((r) => (
                  <TabsTrigger key={r} value={r}>{r}</TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Countries grid */}
      <section className="container mx-auto px-4 py-10">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((c) => (
            <CountryCard key={c.slug} country={c} />
          ))}
        </div>
      </section>
    </div>
  );
}

function CountryCard({ country }: { country: Country }) {
  return (
    <Link href={`/visa/${country.slug}`}>
      <Card className="group h-full">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
            <span aria-hidden>{country.flag}</span>
          </div>
          <div>
            <div className="font-semibold leading-tight">{country.name}</div>
            <div className="text-xs text-muted-foreground">{country.region}</div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}