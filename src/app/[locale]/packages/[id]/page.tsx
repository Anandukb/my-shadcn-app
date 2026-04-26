import React from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Star, CheckCircle2, XCircle, ShieldCheck, CreditCard, ChevronRight, Plane, ThumbsUp, HeartHandshake, ShieldAlert } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { getPackageById } from "@/lib/api";
import { PackageIncludes } from "@/components/packages/PackageIncludes";
import { Link } from "@/i18n/navigation";

export async function generateMetadata(
  // @ts-ignore : params typing differs based on Next version
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const resolvedParams = await params;
  const pkg = await getPackageById(resolvedParams.id);
  
  if (!pkg) {
    return {
      title: "Package Not Found"
    };
  }

  return {
    title: `${pkg.title} | Premium Travel`,
    description: pkg.description,
    openGraph: {
      title: pkg.title,
      description: pkg.description,
      images: [pkg.image],
    }
  };
}

export default async function PackageDetailPage(
  // @ts-ignore
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const pkg = await getPackageById(resolvedParams.id);

  if (!pkg) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50/40 pb-16 pt-6">
      <div className="container mx-auto px-4 max-w-[1400px]">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 font-medium">
          <Link href="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href={`/${pkg.category.toLowerCase()}-packages`} className="hover:text-primary capitalize">{pkg.category.replace('-', ' ')}</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-red-600 font-semibold">{pkg.title}</span>
        </div>

        {/* Bento Gallery */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 md:gap-4 mb-8 h-[300px] md:h-[450px]">
          <div className="lg:col-span-2 relative rounded-xl md:rounded-3xl overflow-hidden h-full group">
            <Image src={pkg.image} alt={pkg.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" priority />
             <div className="absolute top-4 left-4">
               <Badge className="bg-red-600/90 hover:bg-red-600 text-white border-0 font-bold tracking-widest uppercase">
                 PREMIUM TOUR
               </Badge>
             </div>
             <div className="absolute bottom-4 left-4">
                <Badge className="bg-black/50 hover:bg-black/50 backdrop-blur-md border-0 text-white px-4 py-1.5 font-semibold shadow-lg">
                  Gallery
                </Badge>
             </div>
          </div>
          <div className="hidden lg:grid grid-cols-2 grid-rows-2 gap-4 h-full">
             {[1,2,3,4].map((i) => (
               <div key={i} className="relative rounded-2xl overflow-hidden h-full group cursor-pointer shadow-sm">
                 <Image src={`https://images.unsplash.com/photo-${1516483638261 + i * 15}?q=80&w=400&auto=format&fit=crop`} alt="Gallery Thumbnail" fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                 {i === 4 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center hover:bg-black/70 transition-colors backdrop-blur-[2px]">
                       <span className="text-white font-bold text-sm tracking-wide shadow-sm">+ See all photos</span>
                    </div>
                 )}
               </div>
             ))}
          </div>
        </div>

        {/* Two Column Layout (70/30) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* Main Content (Left) */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-10">
            
            {/* Header Details */}
            <section className="bg-white p-6 md:p-8 rounded-3xl border shadow-sm">
               <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                 <div>
                    <h1 className="text-3xl md:text-4xl font-black mb-3 text-slate-800">{pkg.title}</h1>
                    <div className="flex items-center gap-4 text-muted-foreground text-sm font-semibold mb-6 flex-wrap">
                      <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg"><MapPin className="w-4 h-4 text-red-600" /> {pkg.location}</span>
                      <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg"><Calendar className="w-4 h-4 text-red-600" /> {pkg.duration}</span>
                    </div>
                 </div>
                 <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-xl border border-amber-100">
                    <div className="flex -space-x-1">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                    </div>
                    <span className="font-bold text-amber-700 ml-2">{pkg.rating} <span className="font-medium text-amber-600/70 text-xs text-nowrap">({pkg.reviews} reviews)</span></span>
                 </div>
               </div>

               <div className="flex flex-wrap gap-3">
                 <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700 px-3 py-1 text-xs gap-1.5 font-bold"><ShieldCheck className="w-4 h-4" /> Quality Guarantee</Badge>
                 <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 px-3 py-1 text-xs gap-1.5 font-bold"><ThumbsUp className="w-4 h-4" /> Trusted Operator</Badge>
                 <Badge variant="outline" className="border-orange-200 bg-orange-50 text-orange-700 px-3 py-1 text-xs gap-1.5 font-bold"><HeartHandshake className="w-4 h-4" /> Comfort inside Journey</Badge>
               </div>
            </section>

            {/* Overview */}
            <section className="bg-white p-6 md:p-8 rounded-3xl border shadow-sm">
              <h2 className="text-xl font-black mb-4">Overview</h2>
              <p className="text-muted-foreground leading-relaxed">
                {pkg.description} With a blend of carefully selected top destinations, premium stays, and guided explorations, we ensure an unforgettable journey. Relax and let our experienced team manage all aspects of your travel. Taste local cuisines, learn rich history, and snap breathtaking photos.
              </p>
            </section>

            {/* Inclusions / Exclusions Tabs */}
            <section className="bg-white rounded-3xl border shadow-sm overflow-hidden">
               <Tabs defaultValue="inclusions" className="w-full">
                  <TabsList className="w-full justify-start rounded-none bg-slate-100 h-auto p-0 border-b">
                     <TabsTrigger value="inclusions" className="px-8 py-4 data-[state=active]:bg-white data-[state=active]:border-t-2 data-[state=active]:border-t-red-600 rounded-none font-bold text-[15px]"> Inclusions</TabsTrigger>
                     <TabsTrigger value="exclusions" className="px-8 py-4 data-[state=active]:bg-white data-[state=active]:border-t-2 data-[state=active]:border-t-red-600 rounded-none font-bold text-[15px]">Exclusions</TabsTrigger>
                  </TabsList>
                  <TabsContent value="inclusions" className="p-6 md:p-8 m-0 focus-visible:outline-none">
                     <PackageIncludes includes={pkg.includes} location={pkg.location} />
                  </TabsContent>
                  <TabsContent value="exclusions" className="p-6 md:p-8 m-0 focus-visible:outline-none">
                    <div className="grid sm:grid-cols-2 gap-3">
                      {[
                        "International Airfare (Unless specified)",
                        "Early check-in & late checkout",
                        "Visa Fees & Processing",
                        "Travel Insurance",
                        "Any items of personal nature",
                        "Tips and Porterage"
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-red-50/50 border border-red-100 rounded-xl">
                          <div className="bg-red-100 rounded-full p-1.5 shrink-0 text-red-600">
                            <XCircle className="w-4 h-4" />
                          </div>
                          <span className="font-medium text-sm text-slate-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
               </Tabs>
            </section>

            {/* Departure Dates & Flight Table */}
            <section>
              <div className="flex items-center justify-between bg-red-50 text-red-700 p-4 rounded-t-3xl border border-b-0 border-red-100 font-semibold shadow-sm">
                 <span className="text-sm">🔥 Discount Ends Soon</span> 
                 <span className="flex items-center gap-2 text-xs font-bold px-3 py-1 bg-white rounded-full"><ShieldAlert className="w-4 h-4 text-red-500" /> 1122 people viewing this package</span>
              </div>
              <div className="bg-white rounded-b-3xl rounded-tr-3xl border shadow-sm overflow-hidden border-t-0 p-6 md:p-8">
                 <div className="overflow-x-auto rounded-2xl border">
                   <table className="w-full text-sm text-left">
                      <thead className="bg-red-600 text-white">
                         <tr>
                             <th className="p-4 whitespace-nowrap font-bold text-xs uppercase tracking-wider">🗓 Date</th>
                             <th className="p-4 font-bold text-xs uppercase tracking-wider">Adult</th>
                             <th className="p-4 font-bold text-xs uppercase tracking-wider">Single</th>
                             <th className="p-4 font-bold text-xs uppercase tracking-wider">Infant</th>
                             <th className="p-4 font-bold text-xs uppercase tracking-wider">Seats</th>
                             <th className="p-4 font-bold text-xs uppercase tracking-wider text-center">Action</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y text-slate-700 font-medium">
                         <tr className="hover:bg-slate-50 transition-colors">
                            <td className="p-4">24 May 2024</td>
                            <td className="p-4">AED {pkg.price}</td>
                            <td className="p-4">AED {pkg.price + 500}</td>
                            <td className="p-4">AED 999</td>
                            <td className="p-4 text-green-600 font-bold">• 5 Seats Left</td>
                            <td className="p-4 text-center"><Button size="sm" className="bg-red-600 hover:bg-red-700 rounded-full px-6 shadow-md font-bold">Book</Button></td>
                         </tr>
                         <tr className="hover:bg-slate-50 transition-colors">
                            <td className="p-4">15 Jun 2024</td>
                            <td className="p-4">AED {pkg.price + 200}</td>
                            <td className="p-4">AED {pkg.price + 700}</td>
                            <td className="p-4">AED 999</td>
                            <td className="p-4 text-amber-600 font-bold">• Filling Fast</td>
                            <td className="p-4 text-center"><Button size="sm" className="bg-red-600 hover:bg-red-700 rounded-full px-6 shadow-md font-bold">Book</Button></td>
                         </tr>
                      </tbody>
                   </table>
                 </div>

                 {/* Flight details internal box */}
                 <div className="mt-8 bg-slate-50 border rounded-2xl p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b pb-4">
                        <span className="font-black text-slate-800">Flight Details</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-muted-foreground uppercase">Select Date:</span>
                          <select className="border-slate-300 border bg-white p-2 rounded-lg text-sm font-semibold max-w-[150px]"><option>24 May 2024</option></select>
                        </div>
                    </div>
                    
                    {/* Dummy Flight UI */}
                    <div className="flex justify-between items-center text-center max-w-3xl mx-auto py-2">
                        <div className="flex flex-col items-center">
                           <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-2"><Plane className="w-6 h-6 text-red-600 transform -rotate-45" /></div>
                           <p className="font-black text-xl">08:30</p>
                           <p className="text-xs text-slate-500 font-medium">Thu 24 May</p>
                           <p className="text-[10px] font-bold mt-1 uppercase text-slate-400">DXB</p>
                        </div>
                        <div className="flex-1 px-4 text-xs font-semibold text-muted-foreground relative flex flex-col items-center">
                            <div className="w-full absolute top-1/2 left-0 right-0 z-0 border-t-2 border-dashed border-slate-300"></div>
                            <span className="bg-slate-50 relative z-10 px-4 text-green-600 font-bold border border-green-200 rounded-full py-1">Qatar Airways</span>
                            <span className="bg-slate-50 relative z-10 px-2 mt-2 font-medium text-[10px]">Non-stop • 4h 15m</span>
                        </div>
                        <div className="flex flex-col items-center">
                           <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-2"><Plane className="w-6 h-6 text-red-600 transform rotate-45" /></div>
                           <p className="font-black text-xl">12:45</p>
                           <p className="text-xs text-slate-500 font-medium">Thu 24 May</p>
                           <p className="text-[10px] font-bold mt-1 uppercase text-slate-400">{pkg.location.slice(0,3).toUpperCase()}</p>
                        </div>
                    </div>
                 </div>
              </div>
            </section>

            {/* Itinerary & Route Map */}
            <section className="bg-white rounded-3xl border shadow-sm p-6 md:p-8">
               <h2 className="text-2xl font-black mb-6 text-slate-800">Itinerary & Route Map</h2>
               <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                  {/* Left: Map */}
                  <div className="lg:col-span-2">
                     <div className="relative w-full aspect-[3/4] lg:h-full bg-slate-100 rounded-2xl overflow-hidden border">
                        <Image src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800&auto=format&fit=crop" alt="Route Map" fill className="object-cover opacity-80 mix-blend-multiply" />
                        <div className="absolute top-4 left-4 right-4 bg-white/80 backdrop-blur pb-2 px-3 py-2 rounded-xl shadow-sm text-center border">
                           <span className="text-xs font-bold uppercase tracking-widest text-slate-600">Route Map</span>
                        </div>
                     </div>
                  </div>
                  
                  {/* Right: Accordion */}
                  <div className="lg:col-span-3">
                     <Accordion type="single" collapsible defaultValue="day-1" className="space-y-4">
                        {[
                          { day: 1, title: `UAE - ${pkg.location} (Transfer to Hotel)`, desc: "Arrive at the destination. We will seamlessly transfer you to your premium selected hotel. Enjoy the view on your way to your accommodation." },
                          { day: 2, title: `Full Day City Highlights Tour`, desc: `After a hearty breakfast, embark on a full-day guided city tour of ${pkg.location}. Visit iconic landmarks, historical monuments, and vibrant local markets.` },
                          { day: 3, title: "Cultural & Optional Exploration", desc: "Engage in thrilling adventure activities or enjoy a peaceful boat ride depending on your package. Evening is free for leisure, shopping, or optional cultural shows." },
                          { day: 4, title: "Departure", desc: "Enjoy your final morning with a leisurely breakfast. Check out of your hotel and transfer to the airport for your onward journey with unforgettable memories." }
                        ].map((it) => (
                           <AccordionItem value={`day-${it.day}`} key={it.day} className="bg-slate-50 border rounded-2xl overflow-hidden shadow-sm data-[state=open]:border-red-200 transition-colors">
                              <AccordionTrigger className="hover:no-underline px-5 py-4 font-bold text-left hover:bg-slate-100 data-[state=open]:bg-red-50/50 data-[state=open]:text-red-700">
                                Day 0{it.day}: {it.title}
                              </AccordionTrigger>
                              <AccordionContent className="px-5 pb-5 pt-2">
                                 <p className="text-sm text-slate-600 leading-relaxed mb-4">{it.desc}</p>
                                 <div className="grid grid-cols-3 gap-2">
                                    <div className="relative aspect-video rounded-lg overflow-hidden border">
                                       <Image src={`https://images.unsplash.com/photo-${1500648767791 + it.day}?q=80&w=300&auto=format&fit=crop`} alt="Itinerary" fill className="object-cover" />
                                    </div>
                                    <div className="relative aspect-video rounded-lg overflow-hidden border">
                                       <Image src={`https://images.unsplash.com/photo-${1516483638261 + it.day}?q=80&w=300&auto=format&fit=crop`} alt="Itinerary" fill className="object-cover" />
                                    </div>
                                    <div className="relative aspect-video rounded-lg overflow-hidden border">
                                       <Image src={`https://images.unsplash.com/photo-${1526779259212 + it.day}?q=80&w=300&auto=format&fit=crop`} alt="Itinerary" fill className="object-cover" />
                                    </div>
                                 </div>
                              </AccordionContent>
                           </AccordionItem>
                        ))}
                     </Accordion>
                  </div>
               </div>
            </section>
          </div>

          {/* Sticky Sidebar (Right) */}
          <div className="lg:col-span-4 xl:col-span-3 relative">
            <div className="sticky top-24 space-y-6">
              
              {/* Pricing Card */}
              <Card className="rounded-3xl border shadow-xl overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-red-600 to-red-400" />
                <CardContent className="p-6">
                  <div className="mb-6">
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">Price From</p>
                    <div className="flex items-center gap-3">
                      <span className="text-4xl font-black text-slate-800">QAR {pkg.price}</span>
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground line-through font-medium">QAR {pkg.price + 800}</span>
                        <Badge className="bg-amber-400/20 text-amber-700 hover:bg-amber-400/20 border-0 text-[10px] px-1.5 py-0">Save 15%</Badge>
                      </div>
                    </div>
                    <p className="text-[11px] font-bold text-red-600 mt-2 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Quality Guaranteed</p>
                  </div>
                  
                  <Button size="lg" className="w-full text-base h-12 rounded-xl shadow-lg bg-red-600 hover:bg-red-700 font-bold mb-3">
                    Select Departures
                  </Button>
                  <Button variant="outline" size="lg" className="w-full h-12 rounded-xl font-bold border-2 text-slate-700 hover:bg-slate-50">
                    Download Itinerary
                  </Button>
                </CardContent>
              </Card>

              {/* Guarantees Box */}
              <Card className="rounded-3xl border shadow-sm">
                 <CardContent className="p-6">
                    <h4 className="font-bold text-sm text-slate-800 mb-4 pb-2 border-b">Why book with AFC Holidays?</h4>
                    <ul className="space-y-3">
                       {["50K+ Happy Travellers", "Tours across the Globe", "Exceptional Client Journey", "100+ Visa Success Rate", "Premium Tourist Service"].map((g, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                             <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                <CheckCircle2 className="w-3 h-3 text-green-600" />
                             </div>
                             {g}
                          </li>
                       ))}
                    </ul>
                    
                    <div className="mt-6 pt-4 border-t">
                       <p className="text-xs text-slate-500 font-semibold mb-2">Payment Options</p>
                       <div className="flex gap-2">
                           <div className="bg-slate-100 px-3 py-1.5 rounded text-[10px] font-bold text-blue-800 border">VISA</div>
                           <div className="bg-slate-100 px-3 py-1.5 rounded text-[10px] font-bold text-red-600 border flex items-center"><div className="w-2 h-2 rounded-full bg-red-500 -mr-1 mix-blend-multiply border border-white"></div><div className="w-2 h-2 rounded-full bg-amber-500 mix-blend-multiply border border-white"></div> card</div>
                       </div>
                    </div>
                 </CardContent>
              </Card>

              {/* Destination Diary Mock */}
              <Card className="rounded-3xl border shadow-sm overflow-hidden bg-orange-50/50">
                 <div className="bg-orange-100 p-3 text-center border-b border-orange-200">
                    <span className="text-xs font-bold text-orange-800 tracking-wider uppercase">Destination Diary</span>
                 </div>
                 <div className="p-4 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md mb-3">
                       <Image src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop" alt="Guide" width={64} height={64} className="object-cover w-full h-full" />
                    </div>
                    <p className="text-sm font-bold mb-1">Meet Our Local Expert</p>
                    <p className="text-xs text-slate-600 mb-4 px-2">"Tbilisi's cobblestone streets and sulfur baths are magic. Join us on this premium journey!"</p>
                    <Button variant="outline" size="sm" className="rounded-full h-8 text-xs font-bold border-orange-300 text-orange-800 hover:bg-orange-100">Read full diary</Button>
                 </div>
              </Card>

            </div>
          </div>
        </div>

        {/* Client Journey Process */}
        <div className="mt-12 md:mt-16 bg-white rounded-[2rem] border p-8 md:p-12 shadow-sm text-center">
            <h3 className="text-2xl md:text-3xl font-black mb-10 text-slate-800">Client Journey - Experience the Difference</h3>
            <div className="flex flex-wrap justify-center gap-4 md:gap-8 lg:gap-12 text-sm relative">
                {/* Connecting Line */}
                <div className="hidden lg:block absolute top-7 left-[10%] right-[10%] h-[2px] bg-slate-200 -z-10"></div>
                {['Transparent Booking', 'Destination Confidence', 'Organised & Innovative', 'Destination Support', 'Visas Support', 'Global Support', 'Seamless Journey'].map((step, i) => (
                    <div key={i} className="flex flex-col items-center gap-3 w-[100px] md:w-[130px] bg-white z-10 p-2 relative group cursor-pointer">
                        <div className={`w-14 h-14 rounded-full border-[3px] flex items-center justify-center transition-colors bg-white ${i===0?'border-red-600 text-red-600 shadow-md shadow-red-100':'border-slate-200 text-slate-400 group-hover:border-slate-400 group-hover:text-slate-600'}`}>
                           {i===0 ? <CheckCircle2 className="w-6 h-6" /> : <div className="w-2 h-2 rounded-full bg-current"></div>}
                        </div>
                        <span className={`font-bold leading-tight ${i===0?'text-red-700':'text-slate-600'}`}>{step}</span>
                    </div>
                ))}
            </div>
            
            <div className="mt-12 max-w-3xl mx-auto bg-slate-50 p-6 md:p-8 rounded-2xl border text-left flex flex-col md:flex-row gap-6 items-start shadow-inner">
               <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 font-black text-xl flex items-center justify-center shrink-0 border border-red-200">1</div>
               <div>
                  <h4 className="font-bold text-lg mb-3 break-words text-slate-800">Transparent Booking Process</h4>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">We ensure every journey should be smooth. With our team, you can expect real-time confirmations, no hidden costs, clear travel itineraries before you even pay, and dedicated support around the clock. Your holiday starts before you pack your bags.</p>
               </div>
            </div>
        </div>

      </div>
    </div>
  );
}
