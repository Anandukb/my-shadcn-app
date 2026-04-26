"use client";
import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Star, CheckCircle2, XCircle, Clock, Users, ChevronRight, Hotel, Utensils, Shield, Phone, Mail, MessageCircle, Calendar, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import "./package-detail.css";

export default function PackageDetailClient({ pkg }: { pkg: any }) {
  const [activeTab, setActiveTab] = useState("itinerary");

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-16 pt-6">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Breadcrumb */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-sm text-muted-foreground mb-6"
        >
          <Link href="/" className="hover:pkg-text-primary transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/packages" className="hover:pkg-text-primary transition-colors">Packages</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="pkg-text-primary font-medium">{pkg.title}</span>
        </motion.div>

        {/* Hero Image Gallery */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative h-[400px] md:h-[500px] rounded-3xl overflow-hidden mb-8 shadow-2xl"
        >
          <Image 
            src={pkg.image} 
            alt={pkg.title} 
            fill 
            className="object-cover" 
            priority 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Floating badges */}
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute top-6 left-6"
          >
            <Badge className="pkg-badge-primary px-4 py-2 text-sm font-bold shadow-lg">
              FEATURED TOUR
            </Badge>
          </motion.div>

          {/* Bottom info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <h1 className="text-3xl md:text-5xl font-black text-white mb-4 drop-shadow-lg">
                {pkg.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full">
                  <MapPin className="w-4 h-4 text-white" />
                  <span className="text-white font-semibold text-sm">{pkg.location}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full">
                  <Clock className="w-4 h-4 text-white" />
                  <span className="text-white font-semibold text-sm">{pkg.duration}</span>
                </div>
                <div className="flex items-center gap-2 bg-amber-500/90 backdrop-blur-md px-4 py-2 rounded-full">
                  <Star className="w-4 h-4 fill-white text-white" />
                  <span className="text-white font-bold text-sm">{pkg.rating} ({pkg.reviews} reviews)</span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Quick Info Cards */}
            <motion.div 
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {[
                { icon: Calendar, label: "Duration", value: pkg.duration.split("/")[0] },
                { icon: Users, label: "Group Size", value: "Max 15" },
                { icon: Hotel, label: "Accommodation", value: "4-5 Star" },
                { icon: Utensils, label: "Meals", value: "Breakfast" }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  variants={fadeInUp}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="bg-white p-4 rounded-2xl border shadow-sm text-center"
                >
                  <item.icon className="w-6 h-6 pkg-icon-primary mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                  <p className="font-bold text-sm">{item.value}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Overview Section - Outside Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 md:p-8 border shadow-sm space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold mb-4">About This Tour</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {pkg.description}. Experience the perfect blend of adventure, culture, and relaxation. 
                  Our expertly crafted itinerary ensures you don't miss any highlights while maintaining 
                  a comfortable pace. With premium accommodations, knowledgeable guides, and seamless 
                  logistics, your journey will be truly unforgettable.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 pt-4">
                <div className="flex items-start gap-3 p-4 pkg-bg-success-light rounded-xl border pkg-border-success">
                  <div className="w-10 h-10 rounded-full pkg-bg-success-medium flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 pkg-icon-success" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm mb-1">Best Price Guarantee</h4>
                    <p className="text-xs text-muted-foreground">We match any lower price you find</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 pkg-bg-info-light rounded-xl border pkg-border-info">
                  <div className="w-10 h-10 rounded-full pkg-bg-info-medium flex items-center justify-center shrink-0">
                    <Shield className="w-5 h-5 pkg-icon-info" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm mb-1">Secure Booking</h4>
                    <p className="text-xs text-muted-foreground">100% secure payment processing</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Tabs Navigation - Only Itinerary and Inclusions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full justify-start bg-white border rounded-2xl p-1 h-auto shadow-sm">
                  <TabsTrigger 
                    value="itinerary" 
                    className="rounded-xl px-8 py-3 data-[state=active]:pkg-tab-active font-semibold transition-all"
                  >
                    Itinerary
                  </TabsTrigger>
                  <TabsTrigger 
                    value="inclusions" 
                    className="rounded-xl px-8 py-3 data-[state=active]:pkg-tab-active font-semibold transition-all"
                  >
                    Inclusions
                  </TabsTrigger>
                </TabsList>

                {/* Itinerary Tab */}
                <TabsContent value="itinerary" className="mt-6">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white rounded-2xl p-6 md:p-8 border shadow-sm"
                  >
                    <h2 className="text-2xl font-bold mb-6">Day by Day Itinerary</h2>
                    <Accordion type="single" collapsible defaultValue="day-1" className="space-y-4">
                      {[
                        { 
                          day: 1, 
                          title: `Arrival in ${pkg.location}`, 
                          desc: "Welcome to your destination! Upon arrival, you'll be greeted by our representative and transferred to your hotel. Check-in and relax. Evening at leisure to explore the neighborhood.",
                          highlights: ["Airport pickup", "Hotel check-in", "Welcome briefing"]
                        },
                        { 
                          day: 2, 
                          title: "City Highlights Tour", 
                          desc: `Full day guided tour of ${pkg.location}'s most iconic landmarks. Visit historical sites, cultural attractions, and vibrant markets. Lunch at a local restaurant included.`,
                          highlights: ["Guided city tour", "Major landmarks", "Local lunch"]
                        },
                        { 
                          day: 3, 
                          title: "Adventure & Leisure", 
                          desc: "Morning adventure activity followed by afternoon at leisure. Optional excursions available. Evening cultural show or dinner experience.",
                          highlights: ["Adventure activity", "Free time", "Cultural experience"]
                        },
                        { 
                          day: 4, 
                          title: "Departure", 
                          desc: "Enjoy breakfast at the hotel. Check-out and transfer to airport for your departure flight. Take home wonderful memories!",
                          highlights: ["Breakfast", "Hotel checkout", "Airport transfer"]
                        }
                      ].map((day) => (
                        <AccordionItem 
                          key={day.day} 
                          value={`day-${day.day}`}
                          className="border rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                        >
                          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-slate-50 data-[state=open]:pkg-accordion-open">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full pkg-bg-primary-medium flex items-center justify-center shrink-0">
                                <span className="font-bold pkg-text-primary">{day.day}</span>
                              </div>
                              <div className="text-left">
                                <p className="font-bold">Day {day.day}</p>
                                <p className="text-sm text-muted-foreground">{day.title}</p>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-6 pb-6">
                            <p className="text-muted-foreground mb-4">{day.desc}</p>
                            <div className="flex flex-wrap gap-2">
                              {day.highlights.map((highlight, idx) => (
                                <Badge key={idx} variant="outline" className="bg-slate-50">
                                  {highlight}
                                </Badge>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </motion.div>
                </TabsContent>

                {/* Inclusions Tab */}
                <TabsContent value="inclusions" className="mt-6">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white rounded-2xl p-6 md:p-8 border shadow-sm space-y-6"
                  >
                    <div>
                      <h2 className="text-2xl font-bold mb-4 pkg-text-success">What's Included</h2>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {pkg.includes.map((item: string, idx: number) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="flex items-center gap-3 p-3 pkg-bg-success-light rounded-xl border pkg-border-success"
                          >
                            <CheckCircle2 className="w-5 h-5 pkg-icon-success shrink-0" />
                            <span className="font-medium text-sm">{item}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold mb-4 pkg-text-primary">What's Not Included</h2>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {[
                          "International flights",
                          "Travel insurance",
                          "Visa fees",
                          "Personal expenses",
                          "Tips & gratuities",
                          "Optional activities"
                        ].map((item, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="flex items-center gap-3 p-3 pkg-bg-primary-light rounded-xl border pkg-border-primary"
                          >
                            <XCircle className="w-5 h-5 pkg-icon-primary shrink-0" />
                            <span className="font-medium text-sm">{item}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </TabsContent>
              </Tabs>
            </motion.div>

            {/* Dates & Prices Section - Outside Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl p-6 md:p-8 border shadow-sm"
            >
              <h2 className="text-2xl font-bold mb-6">Available Departure Dates</h2>
              
              <div className="space-y-4">
                {[
                  { date: "24 May 2024", adult: pkg.price, status: "5 Seats Left", statusClass: "pkg-status-success" },
                  { date: "15 Jun 2024", adult: pkg.price + 200, status: "Filling Fast", statusClass: "pkg-status-warning" },
                  { date: "10 Jul 2024", adult: pkg.price + 300, status: "Available", statusClass: "pkg-status-info" }
                ].map((departure, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="border-2 rounded-2xl p-6 hover:shadow-lg transition-all cursor-pointer pkg-hover-border-primary"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-2xl pkg-date-badge flex flex-col items-center justify-center text-white shadow-lg">
                          <span className="text-3xl font-black">{departure.date.split(" ")[0]}</span>
                          <span className="text-xs font-semibold uppercase">{departure.date.split(" ")[1]}</span>
                        </div>
                        <div>
                          <p className="font-black text-2xl text-slate-900">QAR {departure.adult}</p>
                          <p className="text-sm text-muted-foreground font-medium">per person</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={`${departure.statusClass} border-0 px-4 py-2 font-bold`}>
                          {departure.status}
                        </Badge>
                        <Button className="pkg-btn-primary rounded-full px-8 h-12 shadow-lg">
                          Book Now
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="sticky top-24 space-y-6"
            >
              
              {/* Price Card */}
              <Card className="rounded-2xl border-2 shadow-xl overflow-hidden">
                <div className="h-2 pkg-gradient-primary" />
                <CardContent className="p-6 space-y-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Starting from</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-slate-900">QAR {pkg.price}</span>
                      <span className="text-lg text-muted-foreground line-through">QAR {pkg.price + 800}</span>
                    </div>
                    <Badge className="mt-2 pkg-status-success hover:pkg-status-success">
                      Save QAR {800}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <Button 
                      size="lg" 
                      className="w-full pkg-btn-primary rounded-xl h-12 shadow-lg hover:shadow-xl transition-all"
                    >
                      Book Now
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="w-full rounded-xl h-12 font-semibold border-2"
                    >
                      Download Itinerary
                    </Button>
                  </div>

                  <div className="pt-4 border-t space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <CheckCircle2 className="w-5 h-5 pkg-icon-success shrink-0" />
                      <span className="text-muted-foreground">Free cancellation up to 24 hours</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <CheckCircle2 className="w-5 h-5 pkg-icon-success shrink-0" />
                      <span className="text-muted-foreground">Instant confirmation</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <CheckCircle2 className="w-5 h-5 pkg-icon-success shrink-0" />
                      <span className="text-muted-foreground">24/7 customer support</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Card */}
              <Card className="rounded-2xl border shadow-sm">
                <CardContent className="p-6">
                  <h3 className="font-bold mb-4">Need Help?</h3>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start gap-3 h-12 rounded-xl hover:bg-slate-50">
                      <Phone className="w-4 h-4" />
                      <span>Call Us</span>
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-3 h-12 rounded-xl hover:bg-slate-50">
                      <MessageCircle className="w-4 h-4" />
                      <span>Live Chat</span>
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-3 h-12 rounded-xl hover:bg-slate-50">
                      <Mail className="w-4 h-4" />
                      <span>Email Us</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Trust Badges */}
              <Card className="rounded-2xl border shadow-sm bg-gradient-to-br from-slate-50 to-white">
                <CardContent className="p-6">
                  <h4 className="font-bold text-sm mb-4">Why Book With Us</h4>
                  <div className="space-y-3">
                    {[
                      "50K+ Happy Travelers",
                      "Best Price Guarantee",
                      "Secure Payment",
                      "24/7 Support"
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full pkg-bg-success-medium flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4 h-4 pkg-icon-success" />
                        </div>
                        <span className="text-sm font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

            </motion.div>
          </div>

        </div>

        {/* Client Journey Experience Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16"
        >
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10">
              <div className="text-center mb-12">
                <Badge className="pkg-badge-primary mb-4">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Premium Experience
                </Badge>
                <h2 className="text-3xl md:text-4xl font-black mb-4">Client Journey Experience</h2>
                <p className="text-slate-300 max-w-2xl mx-auto">
                  From booking to returning home, we ensure every step of your journey is seamless and memorable
                </p>
              </div>

              {/* Journey Steps */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {[
                  {
                    step: "01",
                    title: "Transparent Booking",
                    desc: "Clear pricing, instant confirmation, and no hidden fees. Book with confidence.",
                    icon: CheckCircle2
                  },
                  {
                    step: "02",
                    title: "Pre-Trip Support",
                    desc: "Detailed itinerary, travel tips, and 24/7 support before you depart.",
                    icon: Shield
                  },
                  {
                    step: "03",
                    title: "Seamless Journey",
                    desc: "On-ground assistance, quality accommodations, and memorable experiences.",
                    icon: Sparkles
                  }
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + idx * 0.1 }}
                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl pkg-bg-primary flex items-center justify-center shrink-0">
                        <item.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-teal-400 mb-1">STEP {item.step}</div>
                        <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                        <p className="text-sm text-slate-300">{item.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-white/20">
                {[
                  { value: "50K+", label: "Happy Travelers" },
                  { value: "98%", label: "Satisfaction Rate" },
                  { value: "100+", label: "Destinations" },
                  { value: "24/7", label: "Support Available" }
                ].map((stat, idx) => (
                  <div key={idx} className="text-center">
                    <div className="text-3xl md:text-4xl font-black text-teal-400 mb-1">{stat.value}</div>
                    <div className="text-sm text-slate-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
