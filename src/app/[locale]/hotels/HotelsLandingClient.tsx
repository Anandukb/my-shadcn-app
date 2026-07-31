"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./datepicker-custom.css";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Hotel, 
  Calendar, 
  MapPin, 
  Users, 
  Search,
  CheckCircle2,
  Star,
  Shield,
  Clock,
  Sparkles,
  X,
  Mail,
  Phone,
  Send,
  Award,
  TrendingUp,
  Zap
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { extractErrorMessage } from "@/lib/extract-error-message";

export default function HotelsLandingClient() {
  const [searchData, setSearchData] = useState({
    destination: "",
    checkInDate: null as Date | null,
    checkOutDate: null as Date | null,
    rooms: "1",
    adults: "2",
    children: "0",
  });

  const [showModal, setShowModal] = useState(false);
  const [contactData, setContactData] = useState({
    email: "",
    phone: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowModal(true);
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "hotel_search",
          email: contactData.email,
          phone: contactData.phone,
          details: {
            destination: searchData.destination,
            checkInDate: searchData.checkInDate?.toISOString() ?? "",
            checkOutDate: searchData.checkOutDate?.toISOString() ?? "",
            rooms: searchData.rooms,
            adults: searchData.adults,
            children: searchData.children,
          },
        }),
      });
      if (!res.ok) throw new Error(await extractErrorMessage(res, "Failed to submit enquiry"));
      return res.json();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    try {
      await submitMutation.mutateAsync();
      setIsSubmitted(true);
    } catch (error) {
      console.error(error);
      setSubmitError(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setContactData({ email: "", phone: "" });
    setSubmitError(null);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateNights = () => {
    if (!searchData.checkInDate || !searchData.checkOutDate) return 0;
    const diff = searchData.checkOutDate.getTime() - searchData.checkInDate.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2000&auto=format&fit=crop"
            alt="Luxury Hotel"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/95 via-blue-800/90 to-cyan-900/95" />
          
          {/* Animated Overlay Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-20 left-20 w-96 h-96 bg-cyan-400 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-blue-400 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-8"
              >
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 leading-tight">
                  Same hotel, Cheapest price.
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-300 to-cyan-200">
                    Guaranteed!
                  </span>
                </h1>
                
                <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-2 max-w-3xl mx-auto leading-relaxed">
                  Book hotels worldwide with the best prices and instant confirmation
                </p>
              </motion.div>

              {/* Search Card - Full Width Modern Design */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Card className="shadow-2xl border-0 bg-white overflow-hidden">
                  <CardContent className="p-0">
                    <form onSubmit={handleSearch}>
                      {/* Single Row - Full Width */}
                      <div className="flex flex-col lg:flex-row">
                        
                        {/* Destination */}
                        <div className="flex-1 border-b lg:border-b-0 lg:border-r border-slate-200 p-5 lg:p-6 hover:bg-slate-50/50 transition-colors">
                          <label className="flex items-center gap-2 text-xs font-bold mb-2 text-slate-600 uppercase tracking-wider">
                            <MapPin className="w-4 h-4 text-blue-600" />
                            Enter Destination
                          </label>
                          <Input
                            value={searchData.destination}
                            onChange={(e) => setSearchData(prev => ({ ...prev, destination: e.target.value }))}
                            placeholder="City, hotel name, or landmark"
                            required
                            className="h-12 border-0 px-0 text-lg font-semibold focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-slate-400 placeholder:font-normal bg-transparent"
                          />
                        </div>

                        {/* Check-in */}
                        <div className="lg:w-56 border-b lg:border-b-0 lg:border-r border-slate-200 p-5 lg:p-6 hover:bg-slate-50/50 transition-colors">
                          <label className="flex items-center gap-2 text-xs font-bold mb-2 text-slate-600 uppercase tracking-wider">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            Check-In
                          </label>
                          <DatePicker
                            selected={searchData.checkInDate}
                            onChange={(date: Date | null) => setSearchData(prev => ({ ...prev, checkInDate: date }))}
                            minDate={new Date()}
                            dateFormat="dd MMM yyyy"
                            placeholderText="Add date"
                            required
                            className="w-full h-12 px-0 border-0 focus:outline-none focus:ring-0 text-lg font-semibold placeholder:text-slate-400 placeholder:font-normal bg-transparent cursor-pointer"
                          />
                          {searchData.checkInDate && (
                            <div className="text-xs text-slate-500 mt-1 font-medium">
                              {searchData.checkInDate.toLocaleDateString('en-US', { weekday: 'long' })}
                            </div>
                          )}
                        </div>

                        {/* Check-out */}
                        <div className="lg:w-56 border-b lg:border-b-0 lg:border-r border-slate-200 p-5 lg:p-6 hover:bg-slate-50/50 transition-colors">
                          <label className="flex items-center gap-2 text-xs font-bold mb-2 text-slate-600 uppercase tracking-wider">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            Check-Out
                          </label>
                          <DatePicker
                            selected={searchData.checkOutDate}
                            onChange={(date: Date | null) => setSearchData(prev => ({ ...prev, checkOutDate: date }))}
                            minDate={
                              searchData.checkInDate
                                ? new Date(searchData.checkInDate.getTime() + 86400000)
                                : new Date(new Date().getTime() + 86400000)
                            }
                            dateFormat="dd MMM yyyy"
                            placeholderText="Add date"
                            required
                            className="w-full h-12 px-0 border-0 focus:outline-none focus:ring-0 text-lg font-semibold placeholder:text-slate-400 placeholder:font-normal bg-transparent cursor-pointer"
                          />
                          {searchData.checkOutDate && (
                            <div className="text-xs text-slate-500 mt-1 font-medium">
                              {searchData.checkOutDate.toLocaleDateString('en-US', { weekday: 'long' })}
                            </div>
                          )}
                        </div>

                        {/* Rooms & Guests */}
                        <div className="lg:flex-1 border-b lg:border-b-0 lg:border-r border-slate-200 p-5 lg:p-6 hover:bg-slate-50/50 transition-colors">
                          <label className="flex items-center gap-2 text-xs font-bold mb-2 text-slate-600 uppercase tracking-wider">
                            <Users className="w-4 h-4 text-blue-600" />
                            Rooms & Guests
                          </label>
                          <div className="flex flex-wrap sm:flex-nowrap items-center gap-y-2 gap-x-3 sm:h-12">
                            <div className="flex items-center gap-1">
                              <select
                                value={searchData.rooms}
                                onChange={(e) => setSearchData(prev => ({ ...prev, rooms: e.target.value }))}
                                className="h-10 sm:h-12 px-1 border-0 focus:outline-none focus:ring-0 text-lg font-semibold bg-transparent cursor-pointer"
                              >
                                {Array.from({ length: 15 }, (_, i) => i + 1).map(num => (
                                  <option key={`room-${num}`} value={num}>{num}</option>
                                ))}
                              </select>
                              <span className="text-sm text-slate-500 whitespace-nowrap">Rooms</span>
                            </div>
                            <div className="h-6 w-px bg-slate-300 hidden sm:block"></div>
                            <div className="flex items-center gap-1">
                              <select
                                value={searchData.adults}
                                onChange={(e) => setSearchData(prev => ({ ...prev, adults: e.target.value }))}
                                className="h-10 sm:h-12 px-1 border-0 focus:outline-none focus:ring-0 text-lg font-semibold bg-transparent cursor-pointer"
                              >
                                {Array.from({ length: 15 }, (_, i) => i + 1).map(num => (
                                  <option key={`adult-${num}`} value={num}>{num}</option>
                                ))}
                              </select>
                              <span className="text-sm text-slate-500 whitespace-nowrap">Adults</span>
                            </div>
                            <div className="h-6 w-px bg-slate-300 hidden sm:block"></div>
                            <div className="flex items-center gap-1">
                              <select
                                value={searchData.children}
                                onChange={(e) => setSearchData(prev => ({ ...prev, children: e.target.value }))}
                                className="h-10 sm:h-12 px-1 border-0 focus:outline-none focus:ring-0 text-lg font-semibold bg-transparent cursor-pointer"
                              >
                                {Array.from({ length: 16 }, (_, i) => i).map(num => (
                                  <option key={`child-${num}`} value={num}>{num}</option>
                                ))}
                              </select>
                              <span className="text-sm text-slate-500 whitespace-nowrap">Children</span>
                            </div>
                          </div>
                        </div>

                        {/* Search Button */}
                        <Button
                          type="submit"
                          className="cursor-pointer flex-shrink-0 flex items-center justify-center p-5 lg:p-6 lg:px-10 bg-primary hover:bg-primary/90 transition-all rounded-none h-auto min-h-full text-lg font-bold shadow-none uppercase tracking-wider text-primary-foreground w-full lg:w-auto"
                        >
                          <Search className="w-5 h-5 mr-2" />
                          Search
                        </Button>
                      </div>
                    </form>
                    
                    {/* Quick Links Below Search */}
                    {/* Quick Links Below Search */}
                    {/* <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-t border-slate-200">
                      <div className="flex flex-wrap gap-3">
                        <Badge variant="outline" className="bg-white border-amber-300 text-amber-700 hover:bg-amber-50 px-4 py-2 text-sm font-semibold">
                          <Clock className="w-4 h-4 mr-2" />
                          Last Minute Deals
                        </Badge>
                        <Badge variant="outline" className="bg-white border-green-300 text-green-700 hover:bg-green-50 px-4 py-2 text-sm font-semibold">
                          <Shield className="w-4 h-4 mr-2" />
                          Lowest Price Guarantee
                        </Badge>
                      </div>
                      <Button variant="link" className="text-blue-600 hover:text-blue-700 px-0 h-auto text-sm font-bold">
                        List Your Hotel For Free →
                      </Button>
                    </div> */}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 mb-4">
            Why Choose Us
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4">
            Book With <span className="text-blue-600">Confidence</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Experience hassle-free hotel bookings with exclusive benefits and 24/7 support
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Award,
              title: "Best Price Guarantee",
              desc: "Find a lower price? We'll match it and give you an extra 5% discount",
              color: "text-amber-600",
              bg: "bg-amber-50",
              border: "border-amber-200"
            },
            {
              icon: Star,
              title: "Verified Reviews",
              desc: "Real reviews from real travelers to help you make the right choice",
              color: "text-yellow-600",
              bg: "bg-yellow-50",
              border: "border-yellow-200"
            },
            {
              icon: Shield,
              title: "Secure Booking",
              desc: "Your data is protected with industry-leading security standards",
              color: "text-blue-600",
              bg: "bg-blue-50",
              border: "border-blue-200"
            },
            {
              icon: Zap,
              title: "Instant Confirmation",
              desc: "Get immediate booking confirmation and 24/7 customer support",
              color: "text-cyan-600",
              bg: "bg-cyan-50",
              border: "border-cyan-200"
            }
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
            >
              <Card className={`h-full hover:shadow-2xl transition-all border-2 ${feature.border}`}>
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 ${feature.bg} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <feature.icon className={`w-8 h-8 ${feature.color}`} />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Popular Destinations */}
      <div className="bg-gradient-to-b from-slate-50 to-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 mb-4">
              <TrendingUp className="w-3 h-3 mr-1" />
              Trending Now
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4">
              Popular <span className="text-blue-600">Destinations</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Explore hotels in the world's most sought-after locations
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { 
                name: "Dubai", 
                hotels: "1,200+ Hotels", 
                image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800&auto=format&fit=crop",
                badge: "Luxury"
              },
              { 
                name: "Maldives", 
                hotels: "450+ Resorts", 
                image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=800&auto=format&fit=crop",
                badge: "Beach"
              },
              { 
                name: "Istanbul", 
                hotels: "800+ Hotels", 
                image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=800&auto=format&fit=crop",
                badge: "Cultural"
              }
            ].map((dest, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="relative h-80 rounded-3xl overflow-hidden group cursor-pointer shadow-xl"
              >
                <Image
                  src={dest.image}
                  alt={dest.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                
                {/* Badge */}
                <div className="absolute top-4 right-4">
                  <Badge className="bg-white/20 backdrop-blur-md text-white border-white/30">
                    {dest.badge}
                  </Badge>
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform group-hover:translate-y-0 transition-transform">
                  <h3 className="text-3xl font-black mb-2">{dest.name}</h3>
                  <p className="text-white/90 font-medium">{dest.hotels}</p>
                  <Button 
                    className="mt-4 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border-white/30 opacity-0 group-hover:opacity-100 transition-opacity"
                    size="sm"
                  >
                    Explore Hotels
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl p-8 md:p-12 shadow-2xl">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center text-white">
            {[
              { value: "50K+", label: "Happy Travelers" },
              { value: "10K+", label: "Hotels Worldwide" },
              { value: "98%", label: "Satisfaction Rate" },
              { value: "24/7", label: "Customer Support" }
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="text-4xl md:text-5xl font-black mb-2">{stat.value}</div>
                <div className="text-blue-100 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Details Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-lg"
            >
              {isSubmitted ? (
                // Success State
                <Card className="shadow-2xl border-2">
                  <CardContent className="p-8 md:p-10 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.2 }}
                      className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
                    >
                      <CheckCircle2 className="w-12 h-12 text-white" />
                    </motion.div>
                    <h2 className="text-3xl font-black mb-4">Enquiry Submitted!</h2>
                    <p className="text-muted-foreground mb-8 leading-relaxed">
                      Thank you for your hotel booking enquiry. Our team will review your request and get back to you within 24 hours with the best available options.
                    </p>
                    <div className="space-y-3">
                      <Button
                        onClick={() => {
                          setIsSubmitted(false);
                          setShowModal(false);
                          setSearchData({
                            destination: "",
                            checkInDate: null,
                            checkOutDate: null,
                            rooms: "1",
                            adults: "2",
                            children: "0",
                          });
                          setContactData({ email: "", phone: "" });
                          setSubmitError(null);
                        }}
                        className="w-full h-12 bg-teal-600 hover:bg-teal-700 font-bold"
                      >
                        Search More Hotels
                      </Button>
                      <Link href="/">
                        <Button variant="outline" className="w-full h-12 font-semibold">
                          Back to Home
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                // Form State
                <Card className="shadow-2xl border-2">
                  <CardContent className="p-6 md:p-8">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h2 className="text-2xl md:text-3xl font-black mb-2">Complete Your Enquiry</h2>
                        <p className="text-sm text-muted-foreground">We'll contact you with the best options</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={closeModal}
                        className="rounded-full hover:bg-slate-100 -mt-2 -mr-2"
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>

                    {/* Booking Summary */}
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 mb-6 border-2 border-blue-100">
                      <h3 className="font-bold text-sm text-blue-900 mb-3 flex items-center gap-2">
                        <Hotel className="w-4 h-4" />
                        Your Booking Details
                      </h3>
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-3 text-sm">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0">
                            <MapPin className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs text-blue-700 font-medium">Destination</p>
                            <p className="font-bold text-slate-900">{searchData.destination}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0">
                            <Calendar className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-blue-700 font-medium">Dates</p>
                            <p className="font-bold text-slate-900 text-xs">
                              {formatDate(searchData.checkInDate)} - {formatDate(searchData.checkOutDate)}
                            </p>
                          </div>
                          <Badge className="bg-blue-600 text-white hover:bg-blue-600">
                            {calculateNights()} Night{calculateNights() !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0">
                            <Users className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                              <p className="text-xs text-blue-700 font-medium">Rooms & Guests</p>
                            <p className="font-bold text-slate-900">
                                {searchData.rooms} Room{searchData.rooms !== "1" ? 's' : ''}, {searchData.adults} Adult{searchData.adults !== "1" ? 's' : ''}
                              {searchData.children !== "0" && `, ${searchData.children} Child${searchData.children !== "1" ? 'ren' : ''}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contact Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div>
                        <label className="block text-sm font-bold mb-2 flex items-center gap-2">
                          <Mail className="w-4 h-4 text-blue-600" />
                          Email Address
                        </label>
                        <Input
                          type="email"
                          value={contactData.email}
                          onChange={(e) => setContactData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="your.email@example.com"
                          required
                          className="h-12 border-2 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold mb-2 flex items-center gap-2">
                          <Phone className="w-4 h-4 text-blue-600" />
                          Phone Number
                        </label>
                        <Input
                          type="tel"
                          value={contactData.phone}
                          onChange={(e) => setContactData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="+971 50 123 4567"
                          required
                          className="h-12 border-2 focus:border-blue-500"
                        />
                      </div>

                      {submitError && (
                        <div className="px-4 py-3 rounded-xl border border-red-300 bg-red-50 text-red-700 text-sm font-medium">
                          {submitError}
                        </div>
                      )}

                      <Button
                        type="submit"
                        disabled={submitMutation.isPending}
                        className="w-full h-14 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 font-bold text-lg shadow-lg"
                      >
                        {submitMutation.isPending ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5 mr-2" />
                            Submit Enquiry
                          </>
                        )}
                      </Button>

                      <p className="text-xs text-center text-muted-foreground leading-relaxed">
                        By submitting, you agree to our terms and conditions. We'll respond within 24 hours with personalized hotel options.
                      </p>
                    </form>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
