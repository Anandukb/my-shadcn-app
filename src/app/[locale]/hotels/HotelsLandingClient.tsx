"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

export default function HotelsLandingClient() {
  const [searchData, setSearchData] = useState({
    destination: "",
    checkInDate: null as Date | null,
    checkOutDate: null as Date | null,
    adults: "2",
    children: "0",
  });

  const [showModal, setShowModal] = useState(false);
  const [contactData, setContactData] = useState({
    email: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const bookingData = {
      ...searchData,
      ...contactData,
    };
    console.log("Booking data:", bookingData);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setContactData({ email: "", phone: "" });
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
          <div className="absolute inset-0 bg-gradient-to-br from-teal-900/90 via-slate-900/80 to-teal-800/90" />
          
          {/* Animated Overlay Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-72 h-72 bg-teal-400 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-400 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 py-8 w-full">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge className="bg-teal-500/20 backdrop-blur-sm border-teal-400/30 text-teal-100 hover:bg-teal-500/30 mb-4 px-6 py-2 text-sm font-semibold">
                <Sparkles className="w-4 h-4 mr-2" />
                Premium Hotel Bookings Worldwide
              </Badge>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-3 leading-tight">
                Discover Your
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-300 to-teal-200 animate-gradient">
                  Perfect Stay
                </span>
              </h1>
              
              <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 max-w-2xl mx-auto leading-relaxed">
                From luxury resorts to cozy boutique hotels, find your ideal accommodation
              </p>
            </motion.div>

            {/* Search Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Card className="shadow-2xl border-2 border-white/10 backdrop-blur-sm bg-white/95">
                <CardContent className="p-4 sm:p-5 md:p-6">
                  <form onSubmit={handleSearch}>
                    <div className="grid gap-3">
                      
                      {/* Destination - Full Width */}
                      <div>
                        <label className="block text-xs sm:text-sm font-bold mb-1.5 text-slate-700 flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-600" />
                          Where are you going?
                        </label>
                        <Input
                          value={searchData.destination}
                          onChange={(e) => setSearchData(prev => ({ ...prev, destination: e.target.value }))}
                          placeholder="City, hotel, or destination"
                          required
                          className="h-11 sm:h-12 text-sm sm:text-base border-2 focus:border-teal-500"
                        />
                      </div>

                      {/* Dates and Guests Row */}
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {/* Check-in */}
                        <div>
                          <label className="block text-xs sm:text-sm font-bold mb-1.5 text-slate-700 flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-600" />
                            Check-in
                          </label>
                          <DatePicker
                            selected={searchData.checkInDate}
                            onChange={(date: Date | null) => setSearchData(prev => ({ ...prev, checkInDate: date }))}
                            minDate={new Date()}
                            dateFormat="dd MMM yyyy"
                            placeholderText="Select date"
                            required
                            className="w-full h-11 sm:h-12 px-3 sm:px-4 border-2 border-input rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm sm:text-base"
                          />
                        </div>

                        {/* Check-out */}
                        <div>
                          <label className="block text-xs sm:text-sm font-bold mb-1.5 text-slate-700 flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-600" />
                            Check-out
                          </label>
                          <DatePicker
                            selected={searchData.checkOutDate}
                            onChange={(date: Date | null) => setSearchData(prev => ({ ...prev, checkOutDate: date }))}
                            minDate={searchData.checkInDate || new Date()}
                            dateFormat="dd MMM yyyy"
                            placeholderText="Select date"
                            required
                            className="w-full h-11 sm:h-12 px-3 sm:px-4 border-2 border-input rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm sm:text-base"
                          />
                        </div>

                        {/* Guests */}
                        <div>
                          <label className="block text-xs sm:text-sm font-bold mb-1.5 text-slate-700 flex items-center gap-2">
                            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-600" />
                            Guests
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <select
                              value={searchData.adults}
                              onChange={(e) => setSearchData(prev => ({ ...prev, adults: e.target.value }))}
                              className="h-11 sm:h-12 px-2 sm:px-3 border-2 border-input rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-xs sm:text-base font-medium"
                            >
                              {[1, 2, 3, 4, 5, 6].map(num => (
                                <option key={num} value={num}>{num} Adult{num > 1 ? 's' : ''}</option>
                              ))}
                            </select>
                            <select
                              value={searchData.children}
                              onChange={(e) => setSearchData(prev => ({ ...prev, children: e.target.value }))}
                              className="h-11 sm:h-12 px-2 sm:px-3 border-2 border-input rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-xs sm:text-base font-medium"
                            >
                              {[0, 1, 2, 3, 4].map(num => (
                                <option key={num} value={num}>{num} Child{num !== 1 ? 'ren' : ''}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Search Button */}
                      <Button
                        type="submit"
                        className="w-full h-12 sm:h-14 text-base sm:text-lg font-bold bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 shadow-lg hover:shadow-xl transition-all"
                      >
                        <Search className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                        Search Hotels
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
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
          <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100 mb-4">
            Why Choose Us
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4">
            Book With <span className="text-teal-600">Confidence</span>
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
              color: "text-teal-600",
              bg: "bg-teal-50",
              border: "border-teal-200"
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
            <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100 mb-4">
              <TrendingUp className="w-3 h-3 mr-1" />
              Trending Now
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4">
              Popular <span className="text-teal-600">Destinations</span>
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
        <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-3xl p-8 md:p-12 shadow-2xl">
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
                <div className="text-teal-100 font-medium">{stat.label}</div>
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
                            adults: "2",
                            children: "0",
                          });
                          setContactData({ email: "", phone: "" });
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
                    <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-5 mb-6 border-2 border-teal-100">
                      <h3 className="font-bold text-sm text-teal-900 mb-3 flex items-center gap-2">
                        <Hotel className="w-4 h-4" />
                        Your Booking Details
                      </h3>
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-3 text-sm">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0">
                            <MapPin className="w-4 h-4 text-teal-600" />
                          </div>
                          <div>
                            <p className="text-xs text-teal-700 font-medium">Destination</p>
                            <p className="font-bold text-slate-900">{searchData.destination}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0">
                            <Calendar className="w-4 h-4 text-teal-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-teal-700 font-medium">Dates</p>
                            <p className="font-bold text-slate-900 text-xs">
                              {formatDate(searchData.checkInDate)} - {formatDate(searchData.checkOutDate)}
                            </p>
                          </div>
                          <Badge className="bg-teal-600 text-white hover:bg-teal-600">
                            {calculateNights()} Night{calculateNights() !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0">
                            <Users className="w-4 h-4 text-teal-600" />
                          </div>
                          <div>
                            <p className="text-xs text-teal-700 font-medium">Guests</p>
                            <p className="font-bold text-slate-900">
                              {searchData.adults} Adult{searchData.adults !== "1" ? 's' : ''}
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
                          <Mail className="w-4 h-4 text-teal-600" />
                          Email Address
                        </label>
                        <Input
                          type="email"
                          value={contactData.email}
                          onChange={(e) => setContactData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="your.email@example.com"
                          required
                          className="h-12 border-2 focus:border-teal-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold mb-2 flex items-center gap-2">
                          <Phone className="w-4 h-4 text-teal-600" />
                          Phone Number
                        </label>
                        <Input
                          type="tel"
                          value={contactData.phone}
                          onChange={(e) => setContactData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="+971 50 123 4567"
                          required
                          className="h-12 border-2 focus:border-teal-500"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-14 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 font-bold text-lg shadow-lg"
                      >
                        {isSubmitting ? (
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
