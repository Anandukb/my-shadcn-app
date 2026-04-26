"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./datepicker-custom.css";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Hotel, 
  Calendar, 
  MapPin, 
  Users, 
  Mail, 
  Phone, 
  User, 
  Globe,
  CheckCircle2,
  ArrowLeft,
  Send
} from "lucide-react";
import { Link } from "@/i18n/navigation";

export default function HotelBookingClient() {
  const [formData, setFormData] = useState({
    // Hotel Details
    destination: "",
    checkInDate: null as Date | null,
    checkOutDate: null as Date | null,
    rooms: "1",
    adults: "2",
    children: "0",
    
    // User Details
    fullName: "",
    email: "",
    phone: "",
    nationality: "",
    
    // Additional Info
    specialRequests: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="text-center p-8 shadow-xl">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Enquiry Submitted!</h2>
            <p className="text-muted-foreground mb-6">
              Thank you for your hotel booking enquiry. Our team will review your request and get back to you within 24 hours with the best available options.
            </p>
            <Link href="/">
              <Button className="w-full bg-teal-600 hover:bg-teal-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link href="/" className="inline-flex items-center text-teal-600 hover:text-teal-700 mb-4 font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center">
              <Hotel className="w-8 h-8 text-teal-600" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900">Hotel Booking Enquiry</h1>
              <p className="text-muted-foreground">Tell us your requirements and we'll find the perfect stay</p>
            </div>
          </div>
          
          <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100">
            Free Consultation • Best Price Guarantee
          </Badge>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <form onSubmit={handleSubmit}>
            <Card className="shadow-xl">
              <CardContent className="p-6 md:p-8 space-y-8">
                
                {/* Hotel Details Section */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                      <Hotel className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Hotel Details</h2>
                      <p className="text-sm text-muted-foreground">Where and when do you want to stay?</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Destination */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold mb-2">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        Destination
                      </label>
                      <Input
                        name="destination"
                        value={formData.destination}
                        onChange={handleInputChange}
                        placeholder="e.g., Dubai, Maldives, Istanbul"
                        required
                        className="h-12"
                      />
                    </div>

                    {/* Check-in Date */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Check-in Date
                      </label>
                      <DatePicker
                        selected={formData.checkInDate}
                        onChange={(date: Date | null) => setFormData(prev => ({ ...prev, checkInDate: date }))}
                        minDate={new Date()}
                        dateFormat="dd MMM yyyy"
                        placeholderText="Select check-in date"
                        required
                        className="w-full h-12 px-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    {/* Check-out Date */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Check-out Date
                      </label>
                      <DatePicker
                        selected={formData.checkOutDate}
                        onChange={(date: Date | null) => setFormData(prev => ({ ...prev, checkOutDate: date }))}
                        minDate={formData.checkInDate || new Date()}
                        dateFormat="dd MMM yyyy"
                        placeholderText="Select check-out date"
                        required
                        className="w-full h-12 px-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    {/* Rooms */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        <Hotel className="w-4 h-4 inline mr-1" />
                        Number of Rooms
                      </label>
                      <select
                        name="rooms"
                        value={formData.rooms}
                        onChange={handleInputChange}
                        required
                        className="w-full h-12 px-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                          <option key={num} value={num}>{num} {num === 1 ? 'Room' : 'Rooms'}</option>
                        ))}
                      </select>
                    </div>

                    {/* Adults */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        <Users className="w-4 h-4 inline mr-1" />
                        Adults
                      </label>
                      <select
                        name="adults"
                        value={formData.adults}
                        onChange={handleInputChange}
                        required
                        className="w-full h-12 px-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                          <option key={num} value={num}>{num} {num === 1 ? 'Adult' : 'Adults'}</option>
                        ))}
                      </select>
                    </div>

                    {/* Children */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold mb-2">
                        <Users className="w-4 h-4 inline mr-1" />
                        Children (0-12 years)
                      </label>
                      <select
                        name="children"
                        value={formData.children}
                        onChange={handleInputChange}
                        className="w-full h-12 px-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        {[0, 1, 2, 3, 4, 5, 6].map(num => (
                          <option key={num} value={num}>{num} {num === 1 ? 'Child' : 'Children'}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Your Details</h2>
                      <p className="text-sm text-muted-foreground">We need this to contact you</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold mb-2">
                        <User className="w-4 h-4 inline mr-1" />
                        Full Name
                      </label>
                      <Input
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        required
                        className="h-12"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        <Mail className="w-4 h-4 inline mr-1" />
                        Email Address
                      </label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="your.email@example.com"
                        required
                        className="h-12"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        <Phone className="w-4 h-4 inline mr-1" />
                        Phone Number
                      </label>
                      <Input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+971 50 123 4567"
                        required
                        className="h-12"
                      />
                    </div>

                    {/* Nationality */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold mb-2">
                        <Globe className="w-4 h-4 inline mr-1" />
                        Nationality
                      </label>
                      <Input
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleInputChange}
                        placeholder="e.g., United Arab Emirates"
                        required
                        className="h-12"
                      />
                    </div>
                  </div>
                </div>

                {/* Special Requests */}
                <div className="border-t pt-8">
                  <label className="block text-sm font-semibold mb-2">
                    Special Requests (Optional)
                  </label>
                  <Textarea
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleInputChange}
                    placeholder="Any special requirements? (e.g., room preferences, dietary needs, accessibility requirements)"
                    rows={4}
                    className="resize-none"
                  />
                </div>

                {/* Submit Button */}
                <div className="border-t pt-8">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-14 text-lg font-bold bg-teal-600 hover:bg-teal-700 shadow-lg"
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
                  
                  <p className="text-center text-sm text-muted-foreground mt-4">
                    By submitting, you agree to our terms and conditions. We'll respond within 24 hours.
                  </p>
                </div>

              </CardContent>
            </Card>
          </form>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 grid md:grid-cols-3 gap-4"
        >
          {[
            { icon: CheckCircle2, title: "Best Price Guarantee", desc: "We match any lower price" },
            { icon: Hotel, title: "Verified Hotels", desc: "Only trusted properties" },
            { icon: Users, title: "24/7 Support", desc: "We're here to help" }
          ].map((item, idx) => (
            <Card key={idx} className="p-4 text-center hover:shadow-lg transition-shadow">
              <item.icon className="w-8 h-8 text-teal-600 mx-auto mb-2" />
              <h3 className="font-bold text-sm mb-1">{item.title}</h3>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </Card>
          ))}
        </motion.div>

      </div>
    </div>
  );
}
