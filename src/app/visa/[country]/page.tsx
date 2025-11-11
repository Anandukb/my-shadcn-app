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


export default function CountryVisaPage() {
  const params = useParams();
  const slug = String(params?.country ?? "");
  const data = COUNTRIES.find((c) => c.slug === slug) ?? COUNTRIES[0];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0 -z-10">
          <Image src={`https://source.unsplash.com/1600x900/?${data.name},landmark`} alt={data.name} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 to-background" />
        </div>
        <div className="container mx-auto px-4 py-16 md:py-24">
          <Badge variant="secondary" className="mb-3 inline-flex items-center gap-2"><MapPin className="h-4 w-4"/> {data.region}</Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight flex items-center gap-3">
            <span className="text-5xl">{data.flag}</span> {data.name} Visa Information
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">Guidelines, requirements, and processing details for travellers applying for a {data.name} visa from Qatar.</p>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 py-10 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <InfoCard icon={<FileText className="h-5 w-5"/>} title="General Requirements">
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>Passport valid for at least 6 months beyond travel dates.</li>
              <li>Recent passport-size photographs with white background.</li>
              <li>Confirmed flight itinerary and proof of accommodation.</li>
              <li>Bank statements for the last 3 months / proof of funds.</li>
              <li>Travel insurance covering the full stay duration.</li>
            </ul>
          </InfoCard>

          <div className="grid sm:grid-cols-2 gap-6">
            <InfoCard icon={<Clock className="h-5 w-5"/>} title="Processing Time">
              <p className="text-sm text-muted-foreground">Typically 5–10 working days depending on the embassy and season.</p>
            </InfoCard>
            <InfoCard icon={<DollarSign className="h-5 w-5"/>} title="Fees (indicative)">
              <p className="text-sm text-muted-foreground">Tourist visa: QAR 350–600 • Business visa: QAR 450–800. Prices may vary.</p>
            </InfoCard>
          </div>

          <InfoCard icon={<ShieldCheck className="h-5 w-5"/>} title="Important Notes">
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>Some nationalities qualify for visa-on-arrival. Verify before booking.</li>
              <li>Documents must be in English or translated by a certified translator.</li>
              <li>Additional documents may be requested by the consulate.</li>
            </ul>
          </InfoCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <ContactCards />
          <EnquiryForm country={data.name} />
        </div>
      </section>
    </div>
  );
}

function InfoCard({ icon, title, children }: React.PropsWithChildren<{ icon: React.ReactNode; title: string }>) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-primary/10 inline-flex items-center justify-center">{icon}</div>
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription>Sample content for demonstration</CardDescription>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function ContactCards() {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <Card>
        <CardContent className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 inline-flex items-center justify-center"><Phone className="h-5 w-5 text-primary"/></div>
          <div>
            <div className="font-semibold">Call Us</div>
            <div className="text-sm text-muted-foreground">+974 5555 5555</div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 inline-flex items-center justify-center"><MessageCircle className="h-5 w-5 text-primary"/></div>
          <div>
            <div className="font-semibold">WhatsApp</div>
            <div className="text-sm text-muted-foreground">+974 5555 0000</div>
          </div>
        </CardContent>
      </Card>
      <Card className="sm:col-span-2">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 inline-flex items-center justify-center"><Mail className="h-5 w-5 text-primary"/></div>
          <div>
            <div className="font-semibold">Email</div>
            <div className="text-sm text-muted-foreground">visa@travelco.com</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EnquiryForm({ country }: { country: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Enquire Now</CardTitle>
        <CardDescription>Tell us a bit about your trip and we’ll reach out.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid grid-cols-1 gap-3">
          <Input placeholder="Full Name" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input placeholder="Email" type="email" />
            <Input placeholder="Phone" />
          </div>
          <Textarea placeholder={`Message about ${country} visa...`} rows={4} />
          <Button type="button" className="w-full">Submit Enquiry</Button>
        </form>
      </CardContent>
    </Card>
  );
}
