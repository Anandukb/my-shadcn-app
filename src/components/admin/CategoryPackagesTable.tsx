"use client";

import React, { useEffect, useState } from "react";
import { Package } from "@/types/package";
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
  Tags
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CategoryPackagesTableProps {
  category: string; // 'all', 'holidays', 'cruise', 'medical', 'kerala', 'fixed-departure'
  pageTitle: string;
}

export default function CategoryPackagesTable({ category, pageTitle }: CategoryPackagesTableProps) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Dialog controls
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  // Active editing/deleting state
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [deletingPackage, setDeletingPackage] = useState<Package | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formDuration, setFormDuration] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formContinent, setFormContinent] = useState("Asia");
  const [formIncludes, setFormIncludes] = useState("");
  const [formFeatured, setFormFeatured] = useState(false);

  // Load packages
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

  // Open Form Dialog for Create
  const handleOpenCreate = () => {
    setEditingPackage(null);
    setFormTitle("");
    setFormCategory(category === "all" ? "holidays" : category);
    setFormDescription("");
    setFormPrice("");
    setFormImage("");
    setFormDuration("");
    setFormLocation("");
    setFormContinent("Asia");
    setFormIncludes("");
    setFormFeatured(false);
    setIsFormOpen(true);
  };

  // Open Form Dialog for Edit
  const handleOpenEdit = (pkg: Package) => {
    setEditingPackage(pkg);
    setFormTitle(pkg.title);
    setFormCategory(pkg.category);
    setFormDescription(pkg.description);
    setFormPrice(pkg.price.toString());
    setFormImage(pkg.image);
    setFormDuration(pkg.duration);
    setFormLocation(pkg.location);
    setFormContinent(pkg.continent);
    setFormIncludes(pkg.includes.join(", "));
    setFormFeatured(pkg.featured);
    setIsFormOpen(true);
  };

  // Open Delete Confirmation Dialog
  const handleOpenDelete = (pkg: Package) => {
    setDeletingPackage(pkg);
    setIsDeleteOpen(true);
  };

  // Save Form (Create or Edit)
  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formPrice || !formLocation || !formDuration) return;

    setSubmitting(true);
    const parsedIncludes = formIncludes
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

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
    };

    try {
      if (editingPackage) {
        // Edit flow
        await packagesService.update(editingPackage.id, packageData);
      } else {
        // Create flow
        await packagesService.create({
          ...packageData,
          rating: 5.0,
          reviews: 0
        });
      }
      setIsFormOpen(false);
      await loadPackages();
    } catch (error) {
      console.error("Failed to save package", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete package flow
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

  // Quick toggle featured favorite
  const handleToggleFeatured = async (id: number) => {
    try {
      await packagesService.toggleFeatured(id);
      // Fast state update locally without full loading screen for perfect responsive feel
      setPackages((prev) =>
        prev.map((pkg) => (pkg.id === id ? { ...pkg, featured: !pkg.featured } : pkg))
      );
    } catch (error) {
      console.error("Failed to toggle featured status", error);
    }
  };

  // Filter packages based on Search Query
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
      {/* Table Header Controls */}
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

      {/* Packages Table Container */}
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
                    {/* Package details with Image */}
                    <td className="px-6 py-3.5 flex items-center gap-4">
                      <div className="h-12 w-16 rounded-lg bg-slate-850 overflow-hidden relative border border-slate-800 shrink-0">
                        {pkg.image ? (
                          <img 
                            src={pkg.image} 
                            alt={pkg.title} 
                            className="object-cover h-full w-full group-hover:scale-105 transition-transform duration-500" 
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-slate-600">
                            <ImageIcon className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="block font-bold text-white leading-tight truncate max-w-[200px] sm:max-w-xs md:max-w-md group-hover:text-blue-400 transition-colors">
                          {pkg.title}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-medium">
                          <MapPin className="h-3.5 w-3.5 text-blue-500/60" />
                          {pkg.location} ({pkg.continent})
                        </span>
                      </div>
                    </td>
                    
                    {/* Category Column */}
                    <td className="px-6 py-3.5">
                      <Badge 
                        variant="outline" 
                        className={`font-semibold capitalize text-[10px] tracking-wider rounded-full px-2.5 py-0.5 ${
                          pkg.category === "holidays" 
                            ? "text-blue-400 border-blue-450/20 bg-blue-500/5"
                            : pkg.category === "cruise"
                            ? "text-violet-400 border-violet-450/20 bg-violet-500/5"
                            : pkg.category === "medical"
                            ? "text-emerald-400 border-emerald-450/20 bg-emerald-500/5"
                            : pkg.category === "kerala"
                            ? "text-amber-400 border-amber-450/20 bg-amber-500/5"
                            : "text-rose-400 border-rose-450/20 bg-rose-500/5"
                        }`}
                      >
                        {pkg.category}
                      </Badge>
                    </td>

                    {/* Duration Column */}
                    <td className="px-6 py-3.5 font-medium text-slate-350">
                      {pkg.duration}
                    </td>

                    {/* Price Column */}
                    <td className="px-6 py-3.5 font-bold text-white">
                      ${pkg.price.toLocaleString()}
                    </td>

                    {/* Featured / Favorite star checkbox */}
                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => handleToggleFeatured(pkg.id)}
                        className={`p-2 rounded-xl transition-all cursor-pointer ${
                          pkg.featured 
                            ? "text-amber-400 bg-amber-500/10" 
                            : "text-slate-650 hover:text-slate-400 hover:bg-slate-800/30"
                        }`}
                        title={pkg.featured ? "Remove from Favorites" : "Mark as Favorite"}
                      >
                        <Star className={`h-4.5 w-4.5 ${pkg.featured ? "fill-amber-400" : ""}`} />
                      </button>
                    </td>

                    {/* Edit/Delete Actions */}
                    <td className="px-6 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          onClick={() => handleOpenEdit(pkg)}
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                          title="Edit Package"
                        >
                          <Edit className="h-4.5 w-4.5" />
                        </Button>
                        <Button
                          onClick={() => handleOpenDelete(pkg)}
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-lg hover:bg-red-500/10 text-slate-450 hover:text-red-400 cursor-pointer"
                          title="Delete Package"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD / EDIT DIALOG FORM */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl bg-slate-900 border-slate-800/80 text-white rounded-[2rem] p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold flex items-center gap-2">
              <span className="h-9 w-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                {editingPackage ? <Edit className="h-4.5 w-4.5" /> : <Plus className="h-4.5 w-4.5" />}
              </span>
              {editingPackage ? "Modify Tourist Package" : "Create Tourist Package"}
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Fill in the travel package fields below. Updates save in real-time inside your browser's persistent storage.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSavePackage} className="space-y-5 pt-3">
            {/* Title & Category Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1 px-0.5">
                  <FileText className="h-3.5 w-3.5 text-blue-400" />
                  Package Title *
                </label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Munnar Tea Gardens Escape"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="h-11 border-slate-800 bg-slate-950/40 focus-visible:ring-blue-500 text-white rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1 px-0.5">
                  <Tags className="h-3.5 w-3.5 text-violet-400" />
                  Category *
                </label>
                <select
                  disabled={category !== "all"}
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full h-11 border border-slate-800 bg-slate-950 text-white rounded-xl px-3 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none capitalize disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  <option value="holidays">Holidays</option>
                  <option value="cruise">Cruise</option>
                  <option value="medical">Medical Tourism</option>
                  <option value="kerala">Kerala Tourism</option>
                  <option value="fixed-departure">Fixed Departure</option>
                </select>
              </div>
            </div>

            {/* Price, Duration, Location Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1 px-0.5">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                  Price (USD) *
                </label>
                <Input
                  type="number"
                  required
                  min="0"
                  placeholder="3499"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  className="h-11 border-slate-800 bg-slate-950/40 focus-visible:ring-blue-500 text-white rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1 px-0.5">
                  <Clock className="h-3.5 w-3.5 text-amber-400" />
                  Duration *
                </label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. 5 Days / 4 Nights"
                  value={formDuration}
                  onChange={(e) => setFormDuration(e.target.value)}
                  className="h-11 border-slate-800 bg-slate-950/40 focus-visible:ring-blue-500 text-white rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1 px-0.5">
                  <MapPin className="h-3.5 w-3.5 text-blue-400" />
                  Location *
                </label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Munnar, Kerala"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="h-11 border-slate-800 bg-slate-950/40 focus-visible:ring-blue-500 text-white rounded-xl"
                />
              </div>
            </div>

            {/* Continent & Image URL */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1 px-0.5">
                  <MapPin className="h-3.5 w-3.5 text-indigo-400" />
                  Continent
                </label>
                <select
                  value={formContinent}
                  onChange={(e) => setFormContinent(e.target.value)}
                  className="w-full h-11 border border-slate-800 bg-slate-950 text-white rounded-xl px-3 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="Asia">Asia</option>
                  <option value="Europe">Europe</option>
                  <option value="Africa">Africa</option>
                  <option value="North America">North America</option>
                  <option value="South America">South America</option>
                  <option value="Oceania">Oceania</option>
                </select>
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1 px-0.5">
                  <ImageIcon className="h-3.5 w-3.5 text-blue-400" />
                  Image URL
                </label>
                <Input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  className="h-11 border-slate-800 bg-slate-950/40 focus-visible:ring-blue-500 text-white rounded-xl"
                />
              </div>
            </div>

            {/* Description Textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1 px-0.5">
                <FileText className="h-3.5 w-3.5 text-violet-400" />
                Description
              </label>
              <Textarea
                placeholder="Write a captivating summary highlighting the experiences, amenities, and scenery for this package..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="min-h-[100px] border-slate-800 bg-slate-950/40 focus-visible:ring-blue-500 text-white rounded-xl"
              />
            </div>

            {/* Includes (comma separated) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1 px-0.5">
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                Includes (Comma-separated)
              </label>
              <Input
                type="text"
                placeholder="e.g. Flights, Hotels, Breakfast, Tour Guide, Entry Tickets"
                value={formIncludes}
                onChange={(e) => setFormIncludes(e.target.value)}
                className="h-11 border-slate-800 bg-slate-950/40 focus-visible:ring-blue-500 text-white rounded-xl"
              />
            </div>

            {/* Feature Toggle */}
            <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-800 bg-slate-950/20 px-4">
              <input
                type="checkbox"
                id="formFeatured"
                checked={formFeatured}
                onChange={(e) => setFormFeatured(e.target.checked)}
                className="h-4.5 w-4.5 rounded border-slate-850 bg-slate-950 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="formFeatured" className="text-xs font-semibold text-slate-350 cursor-pointer">
                Mark as Favorite (instantly highlight this package in the home carousel)
              </label>
            </div>

            {/* Form Actions */}
            <DialogFooter className="gap-2 border-t border-slate-800/80 pt-4 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
                disabled={submitting}
                className="h-11 px-5 border-slate-800 text-slate-400 hover:text-white rounded-xl font-bold cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="h-11 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/10 cursor-pointer flex items-center gap-1.5"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  "Save Package"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* CONFIRM DELETE DIALOG */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md bg-slate-900 border-slate-800 text-white rounded-[2rem] p-6">
          <DialogHeader className="text-center md:text-left">
            <DialogTitle className="text-xl font-extrabold flex items-center justify-center md:justify-start gap-2">
              <span className="h-9 w-9 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
                <Trash2 className="h-5 w-5" />
              </span>
              Delete Package?
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs text-center md:text-left mt-2">
              Are you sure you want to delete <strong className="text-white">"{deletingPackage?.title}"</strong>?
              This action is destructive and will remove the package immediately from your local dataset.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 mt-6 pt-4 border-t border-slate-800/50">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              disabled={submitting}
              className="w-full md:w-auto h-11 px-5 border-slate-800 text-slate-400 hover:text-white rounded-xl font-bold cursor-pointer"
            >
              No, Keep It
            </Button>
            <Button
              type="button"
              onClick={handleDeleteConfirm}
              disabled={submitting}
              className="w-full md:w-auto h-11 px-6 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-600/10 cursor-pointer flex items-center justify-center gap-1.5"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Yes, Delete It"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
