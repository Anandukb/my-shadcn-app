"use client";

import React, { useEffect, useState } from "react";
import { Package, PackagePrice, ItineraryDay, FlightDetails, HotelDetails } from "@/types/package";
import { packagesService } from "@/lib/packages-service";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  Loader2, 
  Check, 
  X, 
  Image as ImageIcon,
  DollarSign,
  Clock,
  MapPin,
  FileText,
  Tags,
  Trash,
  Upload,
  Plane,
  Building
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CategoryPackagesTableProps {
  category: string; 
  pageTitle: string;
}

const emptyPrice: PackagePrice = { adult: 0, stag: 0, child0to1: 0, child2to5: 0, child6to12: 0 };

export default function CategoryPackagesTable({ category, pageTitle }: CategoryPackagesTableProps) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [deletingPackage, setDeletingPackage] = useState<Package | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [activeTab, setActiveTab] = useState("basic");
  
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formPrice, setFormPrice] = useState(""); 
  const [formImage, setFormImage] = useState("");
  const [formDuration, setFormDuration] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formContinent, setFormContinent] = useState("Asia");
  const [formFeatured, setFormFeatured] = useState(false);
  
  const [formDescription, setFormDescription] = useState("");
  const [formIncludes, setFormIncludes] = useState("");
  const [formExclusions, setFormExclusions] = useState("");
  const [formGroupSize, setFormGroupSize] = useState("");
  const [formMeals, setFormMeals] = useState("");
  const [formAccommodation, setFormAccommodation] = useState("");
  
  const [formPricing, setFormPricing] = useState<PackagePrice>(emptyPrice);
  const [formOfferPricing, setFormOfferPricing] = useState<PackagePrice>(emptyPrice);
  
  const [formItineraryFileUrl, setFormItineraryFileUrl] = useState("");
  const [formItinerary, setFormItinerary] = useState<ItineraryDay[]>([]);

  // New Fields
  const [formFlights, setFormFlights] = useState<FlightDetails[]>([]);
  const [formHotels, setFormHotels] = useState<HotelDetails[]>([]);
  const [formCancellationPolicy, setFormCancellationPolicy] = useState("");

  const loadPackages = async () => {
    setLoading(true);
    try {
      const data = await packagesService.getByCategory(category);
      setPackages(data);
    } catch (error) {
      console.error("Failed to load packages", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackages();
  }, [category]);

  const handleOpenCreate = () => {
    setEditingPackage(null);
    setActiveTab("basic");
    
    setFormTitle("");
    setFormCategory(category === "all" ? "holidays" : category);
    setFormPrice("");
    setFormImage("");
    setFormDuration("");
    setFormLocation("");
    setFormContinent("Asia");
    setFormFeatured(false);
    
    setFormDescription("");
    setFormIncludes("");
    setFormExclusions("");
    setFormGroupSize("");
    setFormMeals("");
    setFormAccommodation("");
    
    setFormPricing(emptyPrice);
    setFormOfferPricing(emptyPrice);
    
    setFormItineraryFileUrl("");
    setFormItinerary([]);

    setFormFlights([]);
    setFormHotels([]);
    setFormCancellationPolicy("");
    
    setIsFormOpen(true);
  };

  const handleOpenEdit = (pkg: Package) => {
    setEditingPackage(pkg);
    setActiveTab("basic");
    
    setFormTitle(pkg.title);
    setFormCategory(pkg.category);
    setFormPrice(pkg.price.toString());
    setFormImage(pkg.image);
    setFormDuration(pkg.duration);
    setFormLocation(pkg.location);
    setFormContinent(pkg.continent);
    setFormFeatured(pkg.featured);
    
    setFormDescription(pkg.description);
    setFormIncludes(pkg.includes.join(", "));
    setFormExclusions(pkg.exclusions ? pkg.exclusions.join(", ") : "");
    setFormGroupSize(pkg.groupSize || "");
    setFormMeals(pkg.meals || "");
    setFormAccommodation(pkg.accommodation || "");
    
    setFormPricing(pkg.pricing || emptyPrice);
    setFormOfferPricing(pkg.offerPricing || emptyPrice);
    
    setFormItineraryFileUrl(pkg.itineraryFileUrl || "");
    setFormItinerary(pkg.itinerary || []);

    setFormFlights(pkg.flights || []);
    setFormHotels(pkg.hotels || []);
    setFormCancellationPolicy(pkg.cancellationPolicy?.join("\n") || "");
    
    setIsFormOpen(true);
  };

  const handleOpenDelete = (pkg: Package) => {
    setDeletingPackage(pkg);
    setIsDeleteOpen(true);
  };

  const handleAddItineraryDay = () => setFormItinerary([...formItinerary, { day: formItinerary.length + 1, title: "", desc: "", highlights: [] }]);
  const handleRemoveItineraryDay = (index: number) => {
    const newItinerary = [...formItinerary];
    newItinerary.splice(index, 1);
    newItinerary.forEach((item, i) => { item.day = i + 1; });
    setFormItinerary(newItinerary);
  };
  const handleUpdateItineraryDay = (index: number, field: keyof ItineraryDay, value: any) => {
    const newItinerary = [...formItinerary];
    if (field === "highlights") {
      newItinerary[index][field] = typeof value === "string" ? value.split(",").map(v => v.trim()).filter(v => v) : value;
    } else {
      newItinerary[index][field] = value as never;
    }
    setFormItinerary(newItinerary);
  };

  // Flights & Hotels handlers
  const handleAddFlight = () => setFormFlights([...formFlights, { type: "Outbound", airline: "", departure: "", arrival: "", duration: "" }]);
  const handleRemoveFlight = (index: number) => setFormFlights(formFlights.filter((_, i) => i !== index));
  const handleUpdateFlight = (index: number, field: keyof FlightDetails, value: string) => {
    const newFlights = [...formFlights];
    newFlights[index][field] = value;
    setFormFlights(newFlights);
  };

  const handleAddHotel = () => setFormHotels([...formHotels, { name: "", rating: 4, location: "", nights: 1, description: "" }]);
  const handleRemoveHotel = (index: number) => setFormHotels(formHotels.filter((_, i) => i !== index));
  const handleUpdateHotel = (index: number, field: keyof HotelDetails, value: any) => {
    const newHotels = [...formHotels];
    newHotels[index][field] = value;
    setFormHotels(newHotels);
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formPrice || !formLocation || !formDuration) {
      setActiveTab("basic");
      return;
    }

    setSubmitting(true);
    const parsedIncludes = formIncludes.split(",").map((item) => item.trim()).filter((item) => item.length > 0);
    const parsedExclusions = formExclusions.split(",").map((item) => item.trim()).filter((item) => item.length > 0);
    const parsedCancellation = formCancellationPolicy.split("\n").map((item) => item.trim()).filter((item) => item.length > 0);

    const packageData = {
      title: formTitle,
      category: formCategory,
      description: formDescription || "Discover beautiful attractions with Maram Holidays.",
      price: parseFloat(formPrice),
      image: formImage || "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1200",
      duration: formDuration,
      location: formLocation,
      continent: formContinent,
      featured: formFeatured,
      includes: parsedIncludes,
      exclusions: parsedExclusions,
      groupSize: formGroupSize,
      meals: formMeals,
      accommodation: formAccommodation,
      pricing: formPricing,
      offerPricing: formOfferPricing,
      itineraryFileUrl: formItineraryFileUrl,
      itinerary: formItinerary,
      flights: formFlights,
      hotels: formHotels,
      cancellationPolicy: parsedCancellation
    };

    try {
      if (editingPackage) {
        await packagesService.update(editingPackage.id, packageData);
      } else {
        await packagesService.create({ ...packageData, rating: 5.0, reviews: 0 });
      }
      setIsFormOpen(false);
      await loadPackages();
    } catch (error) {
      console.error("Failed to save package", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPackage) return;
    setSubmitting(true);
    try {
      await packagesService.delete(deletingPackage.id);
      setIsDeleteOpen(false);
      await loadPackages();
    } catch (error) {
      console.error("Failed to delete package", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleFeatured = async (id: number) => {
    try {
      await packagesService.toggleFeatured(id);
      setPackages((prev) =>
        prev.map((pkg) => (pkg.id === id ? { ...pkg, featured: !pkg.featured } : pkg))
      );
    } catch (error) {
      console.error("Failed to toggle featured status", error);
    }
  };

  const filteredPackages = packages.filter((pkg) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      pkg.title.toLowerCase().includes(searchLower) ||
      pkg.location.toLowerCase().includes(searchLower) ||
      pkg.category.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/35 border border-slate-800/80 p-4 rounded-2xl">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            type="text"
            placeholder="Search packages by title, location or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 pl-10 pr-4 border-slate-800/80 bg-slate-950/40 text-slate-105 placeholder-slate-600 focus-visible:ring-blue-500 focus-visible:border-blue-500 rounded-xl"
          />
        </div>
        
        <Button
          onClick={handleOpenCreate}
          className="h-11 px-5 bg-blue-600 hover:bg-blue-500 font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-blue-600/10 cursor-pointer transition-all"
        >
          <Plus className="h-5 w-5" />
          Create New Package
        </Button>
      </div>

      <div className="border border-slate-800/80 rounded-2xl overflow-hidden bg-slate-900/15">
        {loading ? (
          <div className="flex h-72 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-72 text-center p-6">
            <Tags className="h-12 w-12 text-slate-600 mb-3" />
            <h3 className="text-base font-bold text-slate-350">No Packages Found</h3>
            <p className="text-xs text-slate-500 max-w-xs mt-1">
              There are currently no tourist packages matching your filter or search query. Click the create button to add a new package.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse select-none">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-900/30 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Package</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-4 py-4 text-center">Featured</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-sm">
                {filteredPackages.map((pkg) => (
                  <tr 
                    key={pkg.id} 
                    className="hover:bg-slate-900/20 transition-colors group"
                  >
                    <td className="px-6 py-3.5 flex items-center gap-4">
                      <div className="h-12 w-16 rounded-lg bg-slate-850 overflow-hidden relative border border-slate-800 shrink-0">
                        {pkg.image ? (
                          <img src={pkg.image} alt={pkg.title} className="object-cover h-full w-full group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-slate-600"><ImageIcon className="h-5 w-5" /></div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="block font-bold text-white leading-tight truncate max-w-[200px] sm:max-w-xs md:max-w-md group-hover:text-blue-400 transition-colors">{pkg.title}</span>
                        <span className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-medium"><MapPin className="h-3.5 w-3.5 text-blue-500/60" />{pkg.location} ({pkg.continent})</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <Badge variant="outline" className={`font-semibold capitalize text-[10px] tracking-wider rounded-full px-2.5 py-0.5 ${pkg.category === "holidays" ? "text-blue-400 border-blue-450/20 bg-blue-500/5" : pkg.category === "cruise" ? "text-violet-400 border-violet-450/20 bg-violet-500/5" : pkg.category === "medical" ? "text-emerald-400 border-emerald-450/20 bg-emerald-500/5" : pkg.category === "kerala" ? "text-amber-400 border-amber-450/20 bg-amber-500/5" : "text-rose-400 border-rose-450/20 bg-rose-500/5"}`}>
                        {pkg.category}
                      </Badge>
                    </td>
                    <td className="px-6 py-3.5 font-medium text-slate-350">{pkg.duration}</td>
                    <td className="px-6 py-3.5 font-bold text-white">${pkg.price.toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-center">
                      <button onClick={() => handleToggleFeatured(pkg.id)} className={`p-2 rounded-xl transition-all cursor-pointer ${pkg.featured ? "text-amber-400 bg-amber-500/10" : "text-slate-650 hover:text-slate-400 hover:bg-slate-800/30"}`} title={pkg.featured ? "Remove from Favorites" : "Mark as Favorite"}>
                        <Star className={`h-4.5 w-4.5 ${pkg.featured ? "fill-amber-400" : ""}`} />
                      </button>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button onClick={() => handleOpenEdit(pkg)} variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"><Edit className="h-4.5 w-4.5" /></Button>
                        <Button onClick={() => handleOpenDelete(pkg)} variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-red-500/10 text-slate-450 hover:text-red-400 cursor-pointer"><Trash2 className="h-4.5 w-4.5" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-6xl bg-slate-900 border-slate-800/80 text-white rounded-[2rem] p-6 max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="shrink-0 mb-4">
            <DialogTitle className="text-xl font-extrabold flex items-center gap-2">
              <span className="h-9 w-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                {editingPackage ? <Edit className="h-4.5 w-4.5" /> : <Plus className="h-4.5 w-4.5" />}
              </span>
              {editingPackage ? "Modify Tourist Package" : "Create Tourist Package"}
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">Fill in the travel package fields below across the multiple tabs.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSavePackage} className="flex-1 overflow-hidden flex flex-col min-h-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
              <TabsList className="grid grid-cols-5 bg-slate-950 p-1 rounded-xl shrink-0 overflow-x-auto">
                <TabsTrigger value="basic" className="rounded-lg text-slate-400 data-[state=active]:bg-slate-800 data-[state=active]:text-white text-xs sm:text-sm">Basic Info</TabsTrigger>
                <TabsTrigger value="details" className="rounded-lg text-slate-400 data-[state=active]:bg-slate-800 data-[state=active]:text-white text-xs sm:text-sm">Details & Inc.</TabsTrigger>
                <TabsTrigger value="pricing" className="rounded-lg text-slate-400 data-[state=active]:bg-slate-800 data-[state=active]:text-white text-xs sm:text-sm">Pricing</TabsTrigger>
                <TabsTrigger value="flights" className="rounded-lg text-slate-400 data-[state=active]:bg-slate-800 data-[state=active]:text-white text-xs sm:text-sm">Flights & Hotels</TabsTrigger>
                <TabsTrigger value="itinerary" className="rounded-lg text-slate-400 data-[state=active]:bg-slate-800 data-[state=active]:text-white text-xs sm:text-sm">Itinerary</TabsTrigger>
              </TabsList>
              
              <div className="flex-1 overflow-y-auto pr-2 mt-4 space-y-4">
                
                {/* BASIC INFO TAB */}
                <TabsContent value="basic" className="space-y-4 m-0 outline-none">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5"><label className="text-xs font-bold text-slate-300 flex items-center gap-1"><FileText className="h-3.5 w-3.5 text-blue-400" />Package Title *</label><Input type="text" required placeholder="e.g. Munnar Tea Gardens Escape" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="h-11 border-slate-800 bg-slate-950/40 text-white rounded-xl" /></div>
                    <div className="space-y-1.5"><label className="text-xs font-bold text-slate-300 flex items-center gap-1"><Tags className="h-3.5 w-3.5 text-violet-400" />Category *</label><select disabled={category !== "all"} value={formCategory} onChange={(e) => setFormCategory(e.target.value)} className="w-full h-11 border border-slate-800 bg-slate-950 text-white rounded-xl px-3 text-sm focus:ring-1 focus:ring-blue-500 outline-none capitalize disabled:opacity-75"><option value="holidays">Holidays</option><option value="cruise">Cruise</option><option value="medical">Medical Tourism</option><option value="kerala">Kerala Tourism</option><option value="fixed-departure">Fixed Departure</option></select></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5"><label className="text-xs font-bold text-slate-300 flex items-center gap-1"><DollarSign className="h-3.5 w-3.5 text-emerald-400" />Base Price *</label><Input type="number" required min="0" placeholder="3499" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} className="h-11 border-slate-800 bg-slate-950/40 text-white rounded-xl" /></div>
                    <div className="space-y-1.5"><label className="text-xs font-bold text-slate-300 flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-amber-400" />Duration *</label><Input type="text" required placeholder="e.g. 5 Days / 4 Nights" value={formDuration} onChange={(e) => setFormDuration(e.target.value)} className="h-11 border-slate-800 bg-slate-950/40 text-white rounded-xl" /></div>
                    <div className="space-y-1.5"><label className="text-xs font-bold text-slate-300 flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-blue-400" />Location *</label><Input type="text" required placeholder="e.g. Munnar, Kerala" value={formLocation} onChange={(e) => setFormLocation(e.target.value)} className="h-11 border-slate-800 bg-slate-950/40 text-white rounded-xl" /></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5"><label className="text-xs font-bold text-slate-300 flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-indigo-400" />Continent</label><select value={formContinent} onChange={(e) => setFormContinent(e.target.value)} className="w-full h-11 border border-slate-800 bg-slate-950 text-white rounded-xl px-3 text-sm focus:ring-1 focus:ring-blue-500 outline-none"><option value="Asia">Asia</option><option value="Europe">Europe</option><option value="Africa">Africa</option><option value="North America">North America</option><option value="South America">South America</option><option value="Oceania">Oceania</option></select></div>
                    <div className="md:col-span-2 space-y-1.5"><label className="text-xs font-bold text-slate-300 flex items-center gap-1"><ImageIcon className="h-3.5 w-3.5 text-blue-400" />Image URL</label><Input type="url" placeholder="https://images.unsplash.com/..." value={formImage} onChange={(e) => setFormImage(e.target.value)} className="h-11 border-slate-800 bg-slate-950/40 text-white rounded-xl" /></div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-800 bg-slate-950/20 px-4">
                    <input type="checkbox" id="formFeatured" checked={formFeatured} onChange={(e) => setFormFeatured(e.target.checked)} className="h-4.5 w-4.5 rounded border-slate-850 bg-slate-950 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                    <label htmlFor="formFeatured" className="text-xs font-semibold text-slate-350 cursor-pointer">Mark as Favorite (instantly highlight this package in the home carousel)</label>
                  </div>
                </TabsContent>

                {/* DETAILS TAB */}
                <TabsContent value="details" className="space-y-4 m-0 outline-none">
                  <div className="space-y-1.5"><label className="text-xs font-bold text-slate-300 flex items-center gap-1"><FileText className="h-3.5 w-3.5 text-violet-400" />Description</label><Textarea placeholder="Write a captivating summary..." value={formDescription} onChange={(e) => setFormDescription(e.target.value)} className="min-h-[80px] border-slate-800 bg-slate-950/40 text-white rounded-xl" /></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5"><label className="text-xs font-bold text-slate-300 flex items-center gap-1"><Check className="h-3.5 w-3.5 text-emerald-400" />Includes (Comma-separated)</label><Textarea placeholder="e.g. Flights, Hotels" value={formIncludes} onChange={(e) => setFormIncludes(e.target.value)} className="h-20 border-slate-800 bg-slate-950/40 text-white rounded-xl" /></div>
                    <div className="space-y-1.5"><label className="text-xs font-bold text-slate-300 flex items-center gap-1"><X className="h-3.5 w-3.5 text-red-400" />Exclusions (Comma-separated)</label><Textarea placeholder="e.g. Visa fees, Travel insurance" value={formExclusions} onChange={(e) => setFormExclusions(e.target.value)} className="h-20 border-slate-800 bg-slate-950/40 text-white rounded-xl" /></div>
                  </div>
                  <div className="space-y-1.5"><label className="text-xs font-bold text-slate-300 flex items-center gap-1">Cancellation Policy (New line separated)</label><Textarea placeholder="e.g. Free cancellation up to 30 days..." value={formCancellationPolicy} onChange={(e) => setFormCancellationPolicy(e.target.value)} className="h-20 border-slate-800 bg-slate-950/40 text-white rounded-xl" /></div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5"><label className="text-xs font-bold text-slate-300">Group Size</label><Input type="text" placeholder="e.g. Max 15" value={formGroupSize} onChange={(e) => setFormGroupSize(e.target.value)} className="h-11 border-slate-800 bg-slate-950/40 text-white rounded-xl" /></div>
                    <div className="space-y-1.5"><label className="text-xs font-bold text-slate-300">Meals</label><Input type="text" placeholder="e.g. Breakfast & Dinner" value={formMeals} onChange={(e) => setFormMeals(e.target.value)} className="h-11 border-slate-800 bg-slate-950/40 text-white rounded-xl" /></div>
                    <div className="space-y-1.5"><label className="text-xs font-bold text-slate-300">Accommodation Type</label><Input type="text" placeholder="e.g. 4-Star Hotel" value={formAccommodation} onChange={(e) => setFormAccommodation(e.target.value)} className="h-11 border-slate-800 bg-slate-950/40 text-white rounded-xl" /></div>
                  </div>
                </TabsContent>

                {/* PRICING TAB */}
                <TabsContent value="pricing" className="space-y-6 m-0 outline-none">
                  <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/20">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><DollarSign className="w-4 h-4 text-emerald-400" />Standard Pricing Breakdown</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {Object.keys(emptyPrice).map((key) => (
                        <div key={`std-${key}`} className="space-y-1.5"><label className="text-xs font-bold text-slate-400 capitalize">{key.replace(/([A-Z0-9])/g, ' $1').trim()}</label><Input type="number" min="0" placeholder="0" value={formPricing[key as keyof PackagePrice] || ""} onChange={(e) => setFormPricing({ ...formPricing, [key]: Number(e.target.value) })} className="h-10 border-slate-800 bg-slate-900/50 text-white rounded-lg text-sm" /></div>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/20">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Star className="w-4 h-4 text-amber-400" />Offer Pricing Breakdown (Optional)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {Object.keys(emptyPrice).map((key) => (
                        <div key={`offer-${key}`} className="space-y-1.5"><label className="text-xs font-bold text-slate-400 capitalize">{key.replace(/([A-Z0-9])/g, ' $1').trim()}</label><Input type="number" min="0" placeholder="0" value={formOfferPricing[key as keyof PackagePrice] || ""} onChange={(e) => setFormOfferPricing({ ...formOfferPricing, [key]: Number(e.target.value) })} className="h-10 border-slate-800 bg-slate-900/50 text-white rounded-lg text-sm" /></div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* FLIGHTS & HOTELS TAB */}
                <TabsContent value="flights" className="space-y-6 m-0 outline-none">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2"><Plane className="w-4 h-4 text-blue-400"/>Flights</h3>
                      <Button type="button" onClick={handleAddFlight} className="h-8 px-3 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-lg cursor-pointer"><Plus className="w-3 h-3 mr-1" /> Add Flight</Button>
                    </div>
                    <div className="space-y-3">
                      {formFlights.map((flight, index) => (
                        <div key={index} className="p-4 rounded-xl border border-slate-800 bg-slate-950/30 space-y-3 relative group">
                          <button type="button" onClick={() => handleRemoveFlight(index)} className="absolute top-2 right-2 p-1.5 text-slate-500 hover:text-red-400 bg-slate-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"><Trash className="w-4 h-4" /></button>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Type</label><select value={flight.type} onChange={(e) => handleUpdateFlight(index, "type", e.target.value)} className="w-full h-9 border border-slate-800 bg-slate-900 text-white rounded-lg px-2 text-xs outline-none"><option value="Outbound">Outbound</option><option value="Return">Return</option></select></div>
                            <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Airline</label><Input type="text" placeholder="e.g. Emirates" value={flight.airline} onChange={(e) => handleUpdateFlight(index, "airline", e.target.value)} className="h-9 border-slate-800 bg-slate-900 text-xs" /></div>
                            <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Departure</label><Input type="text" placeholder="e.g. DXB 10:00" value={flight.departure} onChange={(e) => handleUpdateFlight(index, "departure", e.target.value)} className="h-9 border-slate-800 bg-slate-900 text-xs" /></div>
                            <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Arrival</label><Input type="text" placeholder="e.g. NRT 22:00" value={flight.arrival} onChange={(e) => handleUpdateFlight(index, "arrival", e.target.value)} className="h-9 border-slate-800 bg-slate-900 text-xs" /></div>
                            <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Duration</label><Input type="text" placeholder="e.g. 9h 30m" value={flight.duration} onChange={(e) => handleUpdateFlight(index, "duration", e.target.value)} className="h-9 border-slate-800 bg-slate-900 text-xs" /></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2"><Building className="w-4 h-4 text-emerald-400"/>Hotels</h3>
                      <Button type="button" onClick={handleAddHotel} className="h-8 px-3 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-lg cursor-pointer"><Plus className="w-3 h-3 mr-1" /> Add Hotel</Button>
                    </div>
                    <div className="space-y-3">
                      {formHotels.map((hotel, index) => (
                        <div key={index} className="p-4 rounded-xl border border-slate-800 bg-slate-950/30 space-y-3 relative group">
                          <button type="button" onClick={() => handleRemoveHotel(index)} className="absolute top-2 right-2 p-1.5 text-slate-500 hover:text-red-400 bg-slate-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"><Trash className="w-4 h-4" /></button>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="space-y-1 md:col-span-2"><label className="text-[10px] font-bold text-slate-400 uppercase">Hotel Name</label><Input type="text" placeholder="e.g. Grand Palace" value={hotel.name} onChange={(e) => handleUpdateHotel(index, "name", e.target.value)} className="h-9 border-slate-800 bg-slate-900 text-xs" /></div>
                            <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Rating (1-5)</label><Input type="number" min="1" max="5" value={hotel.rating} onChange={(e) => handleUpdateHotel(index, "rating", parseInt(e.target.value))} className="h-9 border-slate-800 bg-slate-900 text-xs" /></div>
                            <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Nights</label><Input type="number" min="1" value={hotel.nights} onChange={(e) => handleUpdateHotel(index, "nights", parseInt(e.target.value))} className="h-9 border-slate-800 bg-slate-900 text-xs" /></div>
                            <div className="space-y-1 md:col-span-4"><label className="text-[10px] font-bold text-slate-400 uppercase">Location & Desc.</label><Input type="text" placeholder="e.g. City Center. A lovely hotel..." value={hotel.location} onChange={(e) => handleUpdateHotel(index, "location", e.target.value)} className="h-9 border-slate-800 bg-slate-900 text-xs" /></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* ITINERARY TAB */}
                <TabsContent value="itinerary" className="space-y-6 m-0 outline-none">
                  <div className="space-y-1.5"><label className="text-xs font-bold text-slate-300 flex items-center gap-1 px-0.5"><Upload className="h-3.5 w-3.5 text-blue-400" />Itinerary File / PDF URL (Optional)</label><div className="flex gap-2"><Input type="url" placeholder="https://example.com/itinerary.pdf" value={formItineraryFileUrl} onChange={(e) => setFormItineraryFileUrl(e.target.value)} className="flex-1 h-11 border-slate-800 bg-slate-950/40 text-white rounded-xl" /><Button type="button" variant="outline" className="h-11 px-4 border-slate-800 rounded-xl cursor-pointer hover:bg-slate-800"><Upload className="w-4 h-4 mr-2" />Browse</Button></div></div>
                  <div>
                    <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-bold text-white">Daily Itinerary</h3><Button type="button" onClick={handleAddItineraryDay} className="h-8 px-3 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-lg cursor-pointer"><Plus className="w-3 h-3 mr-1" /> Add Day</Button></div>
                    <div className="space-y-3">
                      {formItinerary.map((day, index) => (
                        <div key={index} className="p-4 rounded-xl border border-slate-800 bg-slate-950/30 space-y-3 relative group">
                          <button type="button" onClick={() => handleRemoveItineraryDay(index)} className="absolute top-2 right-2 p-1.5 text-slate-500 hover:text-red-400 bg-slate-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"><Trash className="w-4 h-4" /></button>
                          <div className="flex gap-3">
                            <div className="w-16 shrink-0 space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Day</label><Input type="number" min="1" value={day.day} onChange={(e) => handleUpdateItineraryDay(index, "day", parseInt(e.target.value))} className="h-9 border-slate-800 bg-slate-900 text-center" /></div>
                            <div className="flex-1 space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Title</label><Input type="text" placeholder="e.g. Arrival in Paris" value={day.title} onChange={(e) => handleUpdateItineraryDay(index, "title", e.target.value)} className="h-9 border-slate-800 bg-slate-900 pr-8" /></div>
                          </div>
                          <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Description</label><Textarea placeholder="Describe the day's activities..." value={day.desc} onChange={(e) => handleUpdateItineraryDay(index, "desc", e.target.value)} className="min-h-[60px] border-slate-800 bg-slate-900 text-sm" /></div>
                          <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Highlights (Comma-separated)</label><Input type="text" placeholder="e.g. Airport pickup, Hotel check-in" value={day.highlights?.join(", ")} onChange={(e) => handleUpdateItineraryDay(index, "highlights", e.target.value)} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </div>

              <DialogFooter className="gap-2 border-t border-slate-800/80 pt-4 mt-2 shrink-0">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} disabled={submitting} className="h-11 px-5 border-slate-800 text-slate-400 hover:text-white rounded-xl font-bold cursor-pointer">Cancel</Button>
                <Button type="submit" disabled={submitting} className="h-11 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/10 cursor-pointer flex items-center gap-1.5">{submitting ? <><Loader2 className="h-4.5 w-4.5 animate-spin" />Saving Changes...</> : "Save Package"}</Button>
              </DialogFooter>
            </Tabs>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md bg-slate-900 border-slate-800 text-white rounded-[2rem] p-6">
          <DialogHeader className="text-center md:text-left"><DialogTitle className="text-xl font-extrabold flex items-center justify-center md:justify-start gap-2"><span className="h-9 w-9 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 shrink-0"><Trash2 className="h-5 w-5" /></span>Delete Package?</DialogTitle><DialogDescription className="text-slate-400 text-xs text-center md:text-left mt-2">Are you sure you want to delete <strong className="text-white">"{deletingPackage?.title}"</strong>?</DialogDescription></DialogHeader>
          <DialogFooter className="gap-2 mt-6 pt-4 border-t border-slate-800/50">
            <Button type="button" variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={submitting} className="w-full md:w-auto h-11 px-5 border-slate-800 text-slate-400 hover:text-white rounded-xl font-bold cursor-pointer">No, Keep It</Button>
            <Button type="button" onClick={handleDeleteConfirm} disabled={submitting} className="w-full md:w-auto h-11 px-6 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-600/10 cursor-pointer flex items-center justify-center gap-1.5">{submitting ? <><Loader2 className="h-4.5 w-4.5 animate-spin" />Deleting...</> : "Yes, Delete It"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
