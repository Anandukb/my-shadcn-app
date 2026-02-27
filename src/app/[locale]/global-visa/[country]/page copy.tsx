"use client";

import * as React from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  FileText, Clock, DollarSign, ShieldCheck, Phone,
  MessageCircle, Mail, ChevronRight, CheckCircle2,
  Calendar, MapPin, Download, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/motion";
import { COUNTRIES, Country } from "@/lib/data/visa";
import { TopBar } from "@/components/layout/TopBar";
import { Header } from "@/components/layout/Header";
import { SiteFooter } from "@/components/layout/Footer";

import { PageHeader } from "@/components/layout/PageHeader";

export default function CountryVisaPage() {
  const params = useParams();
  const slug = String(params?.country ?? "");
  const data = COUNTRIES.find((c) => c.slug === slug) ?? COUNTRIES[0];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar />
      <Header />


      {/* ... inside CountryVisaPage component ... */}

      <main className="flex-1">
        <PageHeader
          title={<span className="flex items-center gap-4 justify-center"><span className="text-5xl md:text-7xl">{data.flag}</span> {data.name}</span>}
          description="Detailed visa information and requirements."
          image={data.image || "https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"}
          imageAlt={data.name}
          height="40vh"
        >
          <div className="flex justify-center">
            <Badge variant="secondary" className="bg-white/20 text-white border-none backdrop-blur-md hover:bg-white/30 px-3 py-1 text-sm pointer-events-none">
              <MapPin className="h-3 w-3 mr-2" /> {data.region}
            </Badge>
          </div>
        </PageHeader>


        <div className="container mx-auto px-4 py-10 relative z-10">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">

              {/* Stats Cards - Compact */}
              <StaggerContainer className="grid grid-cols-3 gap-3 md:gap-4">
                <StaggerItem>
                  <Card className="bg-card border shadow-sm">
                    <CardContent className="p-4 flex flex-col items-center text-center gap-1.5">
                      <Clock className="h-6 w-6 text-primary opacity-80" />
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Processing</p>
                        <p className="font-bold text-sm md:text-base">{data.processingTime || "5-7 Days"}</p>
                      </div>
                    </CardContent>
                  </Card>
                </StaggerItem>
                <StaggerItem>
                  <Card className="bg-card border shadow-sm">
                    <CardContent className="p-4 flex flex-col items-center text-center gap-1.5">
                      <DollarSign className="h-6 w-6 text-primary opacity-80" />
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Fees</p>
                        <p className="font-bold text-sm md:text-base">{data.price || "Contact Us"}</p>
                      </div>
                    </CardContent>
                  </Card>
                </StaggerItem>
                <StaggerItem>
                  <Card className="bg-card border shadow-sm">
                    <CardContent className="p-4 flex flex-col items-center text-center gap-1.5">
                      <ShieldCheck className="h-6 w-6 text-primary opacity-80" />
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Type</p>
                        <p className="font-bold text-sm md:text-base">Tourist</p>
                      </div>
                    </CardContent>
                  </Card>
                </StaggerItem>
              </StaggerContainer>

              <FadeIn delay={0.2}>
                <Tabs defaultValue="requirements" className="w-full">
                  <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 rounded-xl overflow-x-auto flex-nowrap mb-6">
                    <TabsTrigger value="requirements" className="rounded-lg px-6 py-2.5 h-auto flex-1 md:flex-none">Requirements</TabsTrigger>
                    <TabsTrigger value="process" className="rounded-lg px-6 py-2.5 h-auto flex-1 md:flex-none">Process</TabsTrigger>
                    <TabsTrigger value="faq" className="rounded-lg px-6 py-2.5 h-auto flex-1 md:flex-none">FAQ</TabsTrigger>
                  </TabsList>

                  <div className="min-h-[400px]">
                    <TabsContent value="requirements" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 mt-0">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-3 text-xl">
                            <FileText className="h-5 w-5 text-primary" />
                            Required Documents
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="grid gap-3">
                            {(data.requirements || ["Passport (6 months validity)", "2 Recent Photographs (White Background)", "Bank Statement (Last 3 Months)", "NOC from Employer"]).map((req, i) => (
                              <li key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                                <span className="text-sm md:text-base">{req}</span>
                              </li>
                            ))}
                            <li className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                              <span className="text-sm md:text-base">Travel Insurance (Mandatory for some regions)</span>
                            </li>
                          </ul>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="process" className="animate-in fade-in slide-in-from-bottom-4 duration-500 mt-0">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-xl">Application Steps</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="relative pl-8 space-y-8 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-muted">
                            {[
                              { title: "Submit Enquiry", desc: "Fill out the form with your details." },
                              { title: "Document Verification", desc: "Our team reviews your documents for accuracy." },
                              { title: "Application Submission", desc: "We submit your application to the embassy/consulate." },
                              { title: "Visa Approval", desc: "Receive your visa and get ready to travel!" }
                            ].map((step, i) => (
                              <div key={i} className="relative">
                                <div className="absolute -left-[29px] top-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-lg ring-4 ring-background">
                                  {i + 1}
                                </div>
                                <div>
                                  <h4 className="font-bold text-base">{step.title}</h4>
                                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="faq" className="animate-in fade-in slide-in-from-bottom-4 duration-500 mt-0">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div className="border rounded-xl p-4">
                              <h4 className="font-bold text-sm">Is travel insurance mandatory?</h4>
                              <p className="text-xs text-muted-foreground mt-1">For most countries, yes. We recommend having it for safety regardless.</p>
                            </div>
                            <div className="border rounded-xl p-4">
                              <h4 className="font-bold text-sm">What if my visa gets rejected?</h4>
                              <p className="text-xs text-muted-foreground mt-1">Visa fees are generally non-refundable. However, we ensure your application is error-free to minimize risk.</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </div>
                </Tabs>
              </FadeIn>
            </div>

            {/* Sidebar Sticky */}
            <div className="lg:col-span-1 space-y-6">
              <div className="sticky top-24 space-y-6">
                <FadeIn delay={0.4} direction="left">
                  <Card className="border-primary/20 shadow-xl overflow-hidden">
                    <div className="h-1.5 bg-gradient-to-r from-primary to-purple-600" />
                    <CardHeader>
                      <CardTitle className="text-lg">Ready to Apply?</CardTitle>
                      <CardDescription>Get expert assistance today.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button className="w-full h-11 text-base font-bold shadow-lg shadow-primary/20" size="lg">
                        <Phone className="mr-2 h-4 w-4" /> Call to Apply
                      </Button>
                      <Button variant="outline" className="w-full h-11 text-base font-bold border-primary text-primary hover:bg-primary/5">
                        <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp Us
                      </Button>
                      <Separator />
                      <div className="text-center text-xs text-muted-foreground">
                        <p className="flex items-center justify-center gap-2 mb-2">
                          <Mail className="h-3.5 w-3.5" /> visa@travelco.com
                        </p>
                        <p>Mon - Sat: 9:00 AM - 9:00 PM</p>
                      </div>
                    </CardContent>
                  </Card>
                </FadeIn>

                <FadeIn delay={0.5} direction="left">
                  <Card className="bg-muted/30 border-dashed">
                    <CardContent className="pt-6 flex flex-col items-center text-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-500 flex items-center justify-center">
                        <AlertCircle className="h-4 w-4" />
                      </div>
                      <p className="text-xs font-medium text-muted-foreground">Documents must be translated to English if in another language.</p>
                    </CardContent>
                  </Card>
                </FadeIn>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
