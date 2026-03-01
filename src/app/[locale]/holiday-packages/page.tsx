"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Star, MapPin, Calendar, Users, Search, Filter, Plane, Ship, Stethoscope } from "lucide-react";

export default function PackagesPage() {
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // All packages data
  const allPackages = [
    // Holiday Packages
    {
      id: 1,
      category: "holidays",
      title: "Maldives Paradise 4D/3N",
      description: "Overwater villas, pristine beaches, and crystal-clear waters",
      price: 3499,
      image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=1200&auto=format&fit=crop",
      duration: "4 Days / 3 Nights",
      location: "Maldives",
      rating: 4.9,
      reviews: 234,
      featured: true,
      includes: ["Flights", "Hotel", "Breakfast", "Water Sports"]
    },
    {
      id: 2,
      category: "holidays",
      title: "Baku Escape 5D/4N",
      description: "Explore the Land of Fire with modern architecture and ancient history",
      price: 1999,
      image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?q=80&w=1200&auto=format&fit=crop",
      duration: "5 Days / 4 Nights",
      location: "Baku, Azerbaijan",
      rating: 4.7,
      reviews: 189,
      featured: true,
      includes: ["Flights", "Hotel", "City Tour", "Breakfast"]
    },
    {
      id: 3,
      category: "holidays",
      title: "Istanbul Highlights 5D/4N",
      description: "Where East meets West - bazaars, mosques, and Bosphorus views",
      price: 2599,
      image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=1200&auto=format&fit=crop",
      duration: "5 Days / 4 Nights",
      location: "Istanbul, Turkey",
      rating: 4.8,
      reviews: 312,
      featured: true,
      includes: ["Flights", "Hotel", "Guided Tours", "Breakfast"]
    },
    {
      id: 4,
      category: "holidays",
      title: "Georgia Adventure 6D/5N",
      description: "Mountains, vineyards, and charming old towns",
      price: 2299,
      image: "https://images.unsplash.com/photo-1512446816042-444d641267d4?q=80&w=1200&auto=format&fit=crop",
      duration: "6 Days / 5 Nights",
      location: "Tbilisi, Georgia",
      rating: 4.6,
      reviews: 156,
      featured: false,
      includes: ["Flights", "Hotel", "Wine Tour", "Breakfast"]
    },
    {
      id: 5,
      category: "holidays",
      title: "Phuket Beach Getaway 5D/4N",
      description: "Tropical paradise with stunning beaches and vibrant nightlife",
      price: 2899,
      image: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?q=80&w=1200&auto=format&fit=crop",
      duration: "5 Days / 4 Nights",
      location: "Phuket, Thailand",
      rating: 4.7,
      reviews: 278,
      featured: false,
      includes: ["Flights", "Resort", "Island Tour", "Breakfast"]
    },
    {
      id: 6,
      category: "holidays",
      title: "Dubai Luxury 4D/3N",
      description: "Experience luxury shopping, ultramodern architecture, and desert safaris",
      price: 3299,
      image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200&auto=format&fit=crop",
      duration: "4 Days / 3 Nights",
      location: "Dubai, UAE",
      rating: 4.9,
      reviews: 445,
      featured: true,
      includes: ["Flights", "5-Star Hotel", "Desert Safari", "Breakfast"]
    },
    // Cruise Packages
    {
      id: 7,
      category: "cruise",
      title: "Arabian Gulf Cruise 7N",
      description: "Sail through the Arabian Gulf visiting multiple emirates",
      price: 4299,
      image: "https://images.unsplash.com/photo-1569931728440-1488c2cfd34b?q=80&w=1200&auto=format&fit=crop",
      duration: "7 Nights",
      location: "Arabian Gulf",
      rating: 4.8,
      reviews: 167,
      featured: true,
      includes: ["All Meals", "Entertainment", "Shore Excursions", "Spa Access"]
    },
    {
      id: 8,
      category: "cruise",
      title: "Mediterranean Voyage 5N",
      description: "Explore the Mediterranean coastline in style",
      price: 3899,
      image: "https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?q=80&w=1200&auto=format&fit=crop",
      duration: "5 Nights",
      location: "Mediterranean Sea",
      rating: 4.9,
      reviews: 223,
      featured: true,
      includes: ["All Meals", "Entertainment", "Port Visits", "Activities"]
    },
    {
      id: 9,
      category: "cruise",
      title: "Red Sea Explorer 6N",
      description: "Discover the wonders of the Red Sea with snorkeling and diving",
      price: 3599,
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1200&auto=format&fit=crop",
      duration: "6 Nights",
      location: "Red Sea",
      rating: 4.7,
      reviews: 134,
      featured: false,
      includes: ["All Meals", "Diving", "Water Sports", "Entertainment"]
    },
    // Medical Tourism
    {
      id: 10,
      category: "medical",
      title: "Cardiac Checkup – Turkey",
      description: "Comprehensive cardiac screening at world-class hospitals",
      price: 1599,
      image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop",
      duration: "3 Days / 2 Nights",
      location: "Istanbul, Turkey",
      rating: 4.9,
      reviews: 89,
      featured: true,
      includes: ["Medical Tests", "Consultation", "Hotel", "Airport Transfer"]
    },
    {
      id: 11,
      category: "medical",
      title: "Dental Implants – Georgia",
      description: "High-quality dental care at affordable prices",
      price: 899,
      image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=1200&auto=format&fit=crop",
      duration: "5 Days / 4 Nights",
      location: "Tbilisi, Georgia",
      rating: 4.8,
      reviews: 156,
      featured: true,
      includes: ["Dental Procedure", "Follow-up", "Hotel", "City Tour"]
    },
    {
      id: 12,
      category: "medical",
      title: "Wellness Retreat – Thailand",
      description: "Holistic wellness and rejuvenation programs",
      price: 2199,
      image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1200&auto=format&fit=crop",
      duration: "7 Days / 6 Nights",
      location: "Phuket, Thailand",
      rating: 4.7,
      reviews: 201,
      featured: false,
      includes: ["Wellness Program", "Spa", "Yoga", "Healthy Meals"]
    }
  ];

  // Filter packages
  const filteredPackages = allPackages.filter(pkg => {
    const matchesCategory = selectedCategory === "all" || pkg.category === selectedCategory;
    const matchesSearch = pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: "all", label: "All Packages", icon: Filter, count: allPackages.length },
    { id: "holidays", label: "Holidays", icon: Plane, count: allPackages.filter(p => p.category === "holidays").length },
    { id: "cruise", label: "Cruise Packages", icon: Ship, count: allPackages.filter(p => p.category === "cruise").length },
    { id: "medical", label: "Medical Tourism", icon: Stethoscope, count: allPackages.filter(p => p.category === "medical").length }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[40vh] min-h-[300px] bg-gradient-to-r from-primary/90 to-primary/70">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Explore Our Packages
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl">
            Discover amazing destinations and experiences tailored just for you
          </p>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="container mx-auto px-4 -mt-8 relative z-10">
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
                {categories.map((cat) => (
                  <Button
                    key={cat.id}
                    variant={selectedCategory === cat.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat.id)}
                    className="whitespace-nowrap"
                  >
                    <cat.icon className="h-4 w-4 mr-2" />
                    {cat.label}
                    <Badge variant="secondary" className="ml-2">{cat.count}</Badge>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Packages Grid */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">
              {selectedCategory === "all" ? "All Packages" : categories.find(c => c.id === selectedCategory)?.label}
            </h2>
            <p className="text-muted-foreground">
              {filteredPackages.length} {filteredPackages.length === 1 ? "package" : "packages"} found
            </p>
          </div>
        </div>

        {filteredPackages.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground text-lg">No packages found matching your criteria.</p>
            <Button onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }} className="mt-4">
              Clear Filters
            </Button>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPackages.map((pkg) => (
              <Card key={pkg.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={pkg.image}
                    alt={pkg.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  {pkg.featured && (
                    <Badge className="absolute top-3 left-3 bg-amber-500">
                      Best Seller
                    </Badge>
                  )}
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex items-center gap-2 text-white text-sm mb-1">
                      <MapPin className="h-4 w-4" />
                      <span>{pkg.location}</span>
                    </div>
                  </div>
                </div>

                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg line-clamp-2">{pkg.title}</CardTitle>
                  </div>
                  <CardDescription className="line-clamp-2">{pkg.description}</CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{pkg.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                        <span className="font-medium">{pkg.rating}</span>
                        <span className="text-muted-foreground">({pkg.reviews})</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {pkg.includes.slice(0, 3).map((item, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                      {pkg.includes.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{pkg.includes.length - 3} more
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div>
                        <p className="text-xs text-muted-foreground">From</p>
                        <p className="text-2xl font-bold text-primary">
                          QAR {pkg.price.toLocaleString()}
                        </p>
                      </div>
                      <Button asChild>
                        <Link href={`/packages/${pkg.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Can&apos;t Find What You&apos;re Looking For?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Our travel experts can create a custom package tailored to your preferences and budget.
          </p>
          <Button size="lg" asChild>
            <Link href="/#contact">Contact Us</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
