"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Package, PackagePrice, FlightDetails,
} from "@/types/package";
import type {
  PackageAdminInput, BilingualText,
  PackageRowItineraryDay, PackageRowHotel, PackageRowOptionalTour, PackageRowDepartureDate,
} from "@/lib/packages/types";
import {
  Search, Plus, Edit, Trash2, Star, Loader2, Check, X,
  Image as ImageIcon, DollarSign, Clock, MapPin, FileText,
  Tags, Trash, Upload, Plane, Building, Calendar, Users, Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { extractErrorMessage } from "@/lib/extract-error-message";

interface Props { category: string; pageTitle: string; }

const emptyPrice: PackagePrice = { adult: 0, stag: 0, child0to1: 0, child2to5: 0, child6to12: 0 };
const newId = () => Math.random().toString(36).slice(2, 9);

function FieldLabel({ children, icon: Icon, color = "text-blue-400" }: { children: React.ReactNode; icon?: any; color?: string }) {
  return (
    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
      {Icon && <Icon className={`h-3.5 w-3.5 ${color}`} />}
      {children}
    </label>
  );
}

function zipBilingualList(enText: string, arText: string, separator = ","): BilingualText[] {
  const enItems = enText.split(separator).map((s) => s.trim()).filter(Boolean);
  const arItems = arText.split(separator).map((s) => s.trim()).filter(Boolean);
  return enItems.map((en, i) => ({ en, ar: arItems[i] ?? "" }));
}

function BilingualInput({
  locale, valueEn, valueAr, onChangeEn, onChangeAr, ...inputProps
}: {
  locale: "en" | "ar";
  valueEn: string;
  valueAr: string;
  onChangeEn: (value: string) => void;
  onChangeAr: (value: string) => void;
} & Omit<React.ComponentProps<typeof Input>, "value" | "onChange">) {
  const value = locale === "en" ? valueEn : valueAr;
  const onChange = locale === "en" ? onChangeEn : onChangeAr;
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      dir={locale === "ar" ? "rtl" : "ltr"}
      {...inputProps}
    />
  );
}

function BilingualTextarea({
  locale, valueEn, valueAr, onChangeEn, onChangeAr, ...textareaProps
}: {
  locale: "en" | "ar";
  valueEn: string;
  valueAr: string;
  onChangeEn: (value: string) => void;
  onChangeAr: (value: string) => void;
} & Omit<React.ComponentProps<typeof Textarea>, "value" | "onChange">) {
  const value = locale === "en" ? valueEn : valueAr;
  const onChange = locale === "en" ? onChangeEn : onChangeAr;
  return (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      dir={locale === "ar" ? "rtl" : "ltr"}
      {...textareaProps}
    />
  );
}

async function fetchPackages(category: string): Promise<Package[]> {
  const res = await fetch(`/api/packages?category=${encodeURIComponent(category)}`);
  if (!res.ok) throw new Error("Failed to load packages");
  const json = await res.json();
  return json.packages as Package[];
}

export default function CategoryPackagesTable({ category, pageTitle }: Props) {
  const queryClient = useQueryClient();

  const { data: packages = [], isLoading: loading } = useQuery({
    queryKey: ["packages", category],
    queryFn: () => fetchPackages(category),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["packages"] });

  const createMutation = useMutation({
    mutationFn: async (data: PackageAdminInput) => {
      const res = await fetch("/api/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await extractErrorMessage(res, "Failed to create package"));
      return res.json() as Promise<Package>;
    },
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<PackageAdminInput> }) => {
      const res = await fetch(`/api/packages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await extractErrorMessage(res, "Failed to update package"));
      return res.json() as Promise<Package>;
    },
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/packages/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await extractErrorMessage(res, "Failed to delete package"));
    },
    onSuccess: invalidate,
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/packages/${id}/feature`, { method: "PATCH" });
      if (!res.ok) throw new Error("Failed to toggle featured");
      return res.json() as Promise<Package>;
    },
    onSuccess: invalidate,
  });

  const submitting = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [deletingPackage, setDeletingPackage] = useState<Package | null>(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [editingLocale, setEditingLocale] = useState<"en" | "ar">("en");
  const [saveError, setSaveError] = useState<string | null>(null);

  const editingId = editingPackage?.id;
  const { data: editingAdminInput, isFetching: loadingAdminInput } = useQuery({
    queryKey: ["packages", "admin-input", editingId],
    queryFn: async () => {
      const res = await fetch(`/api/packages/${editingId}/admin`);
      if (!res.ok) throw new Error("Failed to load package for editing");
      return res.json() as Promise<PackageAdminInput>;
    },
    enabled: isFormOpen && editingId !== undefined,
  });

  // ── Basic fields ──
  const [formTitleEn, setFormTitleEn] = useState("");
  const [formTitleAr, setFormTitleAr] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formDurationEn, setFormDurationEn] = useState("");
  const [formDurationAr, setFormDurationAr] = useState("");
  const [formLocationEn, setFormLocationEn] = useState("");
  const [formLocationAr, setFormLocationAr] = useState("");
  const [formContinent, setFormContinent] = useState("Asia");
  const [formFeatured, setFormFeatured] = useState(false);
  const [formDescriptionEn, setFormDescriptionEn] = useState("");
  const [formDescriptionAr, setFormDescriptionAr] = useState("");

  // ── Details fields ──
  const [formIncludesEn, setFormIncludesEn] = useState("");
  const [formIncludesAr, setFormIncludesAr] = useState("");
  const [formExclusionsEn, setFormExclusionsEn] = useState("");
  const [formExclusionsAr, setFormExclusionsAr] = useState("");
  const [formGroupSizeEn, setFormGroupSizeEn] = useState("");
  const [formGroupSizeAr, setFormGroupSizeAr] = useState("");
  const [formMealsEn, setFormMealsEn] = useState("");
  const [formMealsAr, setFormMealsAr] = useState("");
  const [formAccommodationEn, setFormAccommodationEn] = useState("");
  const [formAccommodationAr, setFormAccommodationAr] = useState("");
  const [formCancellationPolicyEn, setFormCancellationPolicyEn] = useState("");
  const [formCancellationPolicyAr, setFormCancellationPolicyAr] = useState("");

  // ── Pricing ──
  const [formPricing, setFormPricing] = useState<PackagePrice>(emptyPrice);
  const [formOfferPricing, setFormOfferPricing] = useState<PackagePrice>(emptyPrice);

  // ── Itinerary ──
  const [formItineraryFileUrl, setFormItineraryFileUrl] = useState("");
  const [formItinerary, setFormItinerary] = useState<PackageRowItineraryDay[]>([]);

  // ── Departure Dates ──
  const [formDepartures, setFormDepartures] = useState<PackageRowDepartureDate[]>([]);

  // ── Flights ──
  const [formFlights, setFormFlights] = useState<FlightDetails[]>([]);

  // ── Hotels ──
  const [formHotels, setFormHotels] = useState<PackageRowHotel[]>([]);

  // ── Optional Tours ──
  const [formOptionalTours, setFormOptionalTours] = useState<PackageRowOptionalTour[]>([]);

  const resetForm = (input?: PackageAdminInput) => {
    setActiveTab("basic");
    setEditingLocale("en");
    setSaveError(null);
    setFormTitleEn(input?.title.en ?? "");
    setFormTitleAr(input?.title.ar ?? "");
    setFormCategory(input?.category ?? (category === "all" ? "holidays" : category));
    setFormPrice(input?.price?.toString() ?? "");
    setFormImage(input?.image ?? "");
    setFormDurationEn(input?.duration.en ?? "");
    setFormDurationAr(input?.duration.ar ?? "");
    setFormLocationEn(input?.location.en ?? "");
    setFormLocationAr(input?.location.ar ?? "");
    setFormContinent(input?.continent ?? "Asia");
    setFormFeatured(input?.featured ?? false);
    setFormDescriptionEn(input?.description.en ?? "");
    setFormDescriptionAr(input?.description.ar ?? "");
    setFormIncludesEn(input?.includes?.map((i) => i.en).join(", ") ?? "");
    setFormIncludesAr(input?.includes?.map((i) => i.ar).join(", ") ?? "");
    setFormExclusionsEn(input?.exclusions?.map((i) => i.en).join(", ") ?? "");
    setFormExclusionsAr(input?.exclusions?.map((i) => i.ar).join(", ") ?? "");
    setFormGroupSizeEn(input?.groupSize?.en ?? "");
    setFormGroupSizeAr(input?.groupSize?.ar ?? "");
    setFormMealsEn(input?.meals?.en ?? "");
    setFormMealsAr(input?.meals?.ar ?? "");
    setFormAccommodationEn(input?.accommodation?.en ?? "");
    setFormAccommodationAr(input?.accommodation?.ar ?? "");
    setFormCancellationPolicyEn(input?.cancellationPolicy?.map((i) => i.en).join("\n") ?? "");
    setFormCancellationPolicyAr(input?.cancellationPolicy?.map((i) => i.ar).join("\n") ?? "");
    setFormPricing(input?.pricing ?? emptyPrice);
    setFormOfferPricing(input?.offerPricing ?? emptyPrice);
    setFormItineraryFileUrl(input?.itineraryFileUrl ?? "");
    setFormItinerary(input?.itinerary ?? []);
    setFormDepartures(input?.departureDates ?? []);
    setFormFlights(input?.flights ?? []);
    setFormHotels(input?.hotels ?? []);
    setFormOptionalTours(input?.optionalTours ?? []);
  };

  useEffect(() => {
    if (isFormOpen && editingAdminInput) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing fetched admin data into the (many) doubled form-field states is the intended purpose of this effect
      resetForm(editingAdminInput);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFormOpen, editingAdminInput]);

  const handleOpenCreate = () => { setEditingPackage(null); resetForm(); setIsFormOpen(true); };
  const handleOpenEdit = (pkg: Package) => { setEditingPackage(pkg); setSaveError(null); setIsFormOpen(true); };
  const handleOpenDelete = (pkg: Package) => { setDeletingPackage(pkg); setIsDeleteOpen(true); };

  const handleToggleFeatured = (id: number) => {
    toggleFeaturedMutation.mutate(id);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    if (!formTitleEn || !formPrice || !formLocationEn || !formDurationEn) {
      setActiveTab("basic");
      setEditingLocale("en");
      setSaveError("Please fill in the required fields (Title, Price, Duration, Location) on the Basic tab.");
      return;
    }
    const data: PackageAdminInput = {
      category: formCategory,
      title: { en: formTitleEn, ar: formTitleAr },
      description: {
        en: formDescriptionEn || "Discover beautiful attractions with Maram Holidays.",
        ar: formDescriptionAr,
      },
      price: parseFloat(formPrice),
      image: formImage || "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1200",
      duration: { en: formDurationEn, ar: formDurationAr },
      location: { en: formLocationEn, ar: formLocationAr },
      continent: formContinent,
      featured: formFeatured,
      rating: editingPackage?.rating ?? 5.0,
      reviews: editingPackage?.reviews ?? 0,
      includes: zipBilingualList(formIncludesEn, formIncludesAr),
      exclusions: zipBilingualList(formExclusionsEn, formExclusionsAr),
      groupSize: formGroupSizeEn ? { en: formGroupSizeEn, ar: formGroupSizeAr } : undefined,
      meals: formMealsEn ? { en: formMealsEn, ar: formMealsAr } : undefined,
      accommodation: formAccommodationEn ? { en: formAccommodationEn, ar: formAccommodationAr } : undefined,
      cancellationPolicy: zipBilingualList(formCancellationPolicyEn, formCancellationPolicyAr, "\n"),
      pricing: formPricing,
      offerPricing: formOfferPricing,
      itineraryFileUrl: formItineraryFileUrl,
      itinerary: formItinerary,
      departureDates: formDepartures,
      flights: formFlights,
      hotels: formHotels,
      optionalTours: formOptionalTours,
    };
    try {
      if (editingPackage) await updateMutation.mutateAsync({ id: editingPackage.id, data });
      else await createMutation.mutateAsync(data);
      setIsFormOpen(false);
    } catch (e) {
      console.error(e);
      setSaveError(e instanceof Error ? e.message : "Something went wrong while saving. Please try again.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPackage) return;
    try {
      await deleteMutation.mutateAsync(deletingPackage.id);
      setIsDeleteOpen(false);
    } catch (e) { console.error(e); }
  };

  // ── Itinerary helpers ──
  const addDay = () =>
    setFormItinerary([
      ...formItinerary,
      { day: formItinerary.length + 1, title: { en: "", ar: "" }, desc: { en: "", ar: "" }, highlights: [], images: [] },
    ]);
  const removeDay = (i: number) =>
    setFormItinerary(formItinerary.filter((_, idx) => idx !== i).map((d, idx) => ({ ...d, day: idx + 1 })));
  const updateDayNumber = (i: number, value: number) => {
    const updated = [...formItinerary];
    updated[i] = { ...updated[i], day: value };
    setFormItinerary(updated);
  };
  const updateDayField = (i: number, field: "title" | "desc", locale: "en" | "ar", value: string) => {
    const updated = [...formItinerary];
    updated[i] = { ...updated[i], [field]: { ...updated[i][field], [locale]: value } };
    setFormItinerary(updated);
  };
  const updateDayHighlights = (i: number, locale: "en" | "ar", value: string) => {
    const updated = [...formItinerary];
    const items = value.split(",").map((v) => v.trim()).filter(Boolean);
    const existingHighlights = updated[i].highlights;
    updated[i] = {
      ...updated[i],
      highlights: items.map((text, j) => ({
        en: locale === "en" ? text : existingHighlights[j]?.en ?? "",
        ar: locale === "ar" ? text : existingHighlights[j]?.ar ?? "",
      })),
    };
    setFormItinerary(updated);
  };
  const updateDayImages = (i: number, value: string) => {
    const updated = [...formItinerary];
    updated[i] = { ...updated[i], images: value.split(",").map((v) => v.trim()).filter(Boolean) };
    setFormItinerary(updated);
  };

  // ── Departure helpers ──
  const addDeparture = () =>
    setFormDepartures([
      ...formDepartures,
      { id: newId(), date: "", adult: 0, single: 0, child611: 0, child25: 0, infant: 0, seats: { en: "Available", ar: "" }, urgency: "green" },
    ]);
  const removeDeparture = (id: string) => setFormDepartures(formDepartures.filter((d) => d.id !== id));
  const updateDepartureDate = (id: string, value: string) =>
    setFormDepartures(formDepartures.map((d) => (d.id === id ? { ...d, date: value } : d)));
  const updateDepartureUrgency = (id: string, value: "red" | "amber" | "green") =>
    setFormDepartures(formDepartures.map((d) => (d.id === id ? { ...d, urgency: value } : d)));
  const updateDepartureSeats = (id: string, locale: "en" | "ar", value: string) =>
    setFormDepartures(formDepartures.map((d) => (d.id === id ? { ...d, seats: { ...d.seats, [locale]: value } } : d)));
  const updateDeparturePrice = (
    id: string,
    field: "adult" | "single" | "child611" | "child25" | "infant",
    value: number
  ) => setFormDepartures(formDepartures.map((d) => (d.id === id ? { ...d, [field]: value } : d)));

  // ── Flight helpers ──
  const addFlight = () => setFormFlights([...formFlights, { type: "Outbound", airline: "", flightNo: "", from: "", fromCity: "", to: "", toCity: "", departure: "", arrival: "", duration: "", class: "Economy", date: "" }]);
  const removeFlight = (i: number) => setFormFlights(formFlights.filter((_, idx) => idx !== i));
  const updateFlight = (i: number, field: keyof FlightDetails, value: string) => { const f = [...formFlights]; f[i] = { ...f[i], [field]: value }; setFormFlights(f); };

  // ── Hotel helpers ──
  const addHotel = () =>
    setFormHotels([
      ...formHotels,
      { name: "", rating: 4, location: "", nights: 1, checkIn: "", checkOut: "", roomType: { en: "", ar: "" }, description: { en: "", ar: "" }, image: "", badge: { en: "", ar: "" }, amenities: [] },
    ]);
  const removeHotel = (i: number) => setFormHotels(formHotels.filter((_, idx) => idx !== i));
  const updateHotelPlain = (i: number, field: "name" | "location" | "checkIn" | "checkOut" | "image", value: string) => {
    const updated = [...formHotels];
    updated[i] = { ...updated[i], [field]: value };
    setFormHotels(updated);
  };
  const updateHotelNumber = (i: number, field: "rating" | "nights", value: number) => {
    const updated = [...formHotels];
    updated[i] = { ...updated[i], [field]: value };
    setFormHotels(updated);
  };
  const updateHotelBilingual = (
    i: number,
    field: "roomType" | "description" | "badge",
    locale: "en" | "ar",
    value: string
  ) => {
    const updated = [...formHotels];
    const current = updated[i][field] ?? { en: "", ar: "" };
    updated[i] = { ...updated[i], [field]: { ...current, [locale]: value } };
    setFormHotels(updated);
  };
  const updateHotelAmenities = (i: number, locale: "en" | "ar", value: string) => {
    const updated = [...formHotels];
    const items = value.split(",").map((v) => v.trim()).filter(Boolean);
    const existingAmenities = updated[i].amenities ?? [];
    updated[i] = {
      ...updated[i],
      amenities: items.map((text, j) => ({
        en: locale === "en" ? text : existingAmenities[j]?.en ?? "",
        ar: locale === "ar" ? text : existingAmenities[j]?.ar ?? "",
      })),
    };
    setFormHotels(updated);
  };

  // ── Optional Tour helpers ──
  const addTour = () =>
    setFormOptionalTours([
      ...formOptionalTours,
      { id: newId(), title: { en: "", ar: "" }, tag: "Optional", desc: { en: "", ar: "" }, adult: 0, single: 0, child611: 0, child25: 0, infant: 0, images: [] },
    ]);
  const removeTour = (id: string) => setFormOptionalTours(formOptionalTours.filter((t) => t.id !== id));
  const updateTourTag = (id: string, value: "Mandatory" | "Optional") =>
    setFormOptionalTours(formOptionalTours.map((t) => (t.id === id ? { ...t, tag: value } : t)));
  const updateTourBilingual = (id: string, field: "title" | "desc", locale: "en" | "ar", value: string) => {
    setFormOptionalTours(
      formOptionalTours.map((t) => (t.id === id ? { ...t, [field]: { ...t[field], [locale]: value } } : t))
    );
  };
  const updateTourPrice = (
    id: string,
    field: "adult" | "single" | "child611" | "child25" | "infant",
    value: number
  ) => setFormOptionalTours(formOptionalTours.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
  const updateTourImages = (id: string, value: string) => {
    setFormOptionalTours(
      formOptionalTours.map((t) =>
        t.id === id ? { ...t, images: value.split(",").map((s) => s.trim()).filter(Boolean) } : t
      )
    );
  };

  const filteredPackages = packages.filter(p => {
    const q = searchQuery.toLowerCase();
    return p.title.toLowerCase().includes(q) || p.location.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
  });

  const isFixed = formCategory === "fixed-departure";

  const tabCls = "rounded-lg text-slate-400 data-[state=active]:bg-slate-800 data-[state=active]:text-white text-[11px] sm:text-xs px-2 sm:px-3";
  const inputCls = "h-10 border-slate-800 bg-slate-950/40 text-white rounded-xl text-sm placeholder-slate-600 focus-visible:ring-blue-500";
  const sectionCls = "p-4 rounded-2xl border border-slate-800 bg-slate-950/20 space-y-4";

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/35 border border-slate-800/80 p-4 rounded-2xl">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input type="text" placeholder="Search by title, location, category…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="h-11 pl-10 border-slate-800/80 bg-slate-950/40 text-slate-100 placeholder-slate-600 rounded-xl focus-visible:ring-blue-500" />
        </div>
        <Button onClick={handleOpenCreate} className="h-11 px-5 bg-blue-600 hover:bg-blue-500 font-bold rounded-xl gap-1.5 shadow-lg cursor-pointer">
          <Plus className="h-5 w-5" />Create New Package
        </Button>
      </div>

      {/* Table */}
      <div className="border border-slate-800/80 rounded-2xl overflow-hidden bg-slate-900/15">
        {loading ? (
          <div className="flex h-72 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>
        ) : filteredPackages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-72 text-center p-6">
            <Tags className="h-12 w-12 text-slate-600 mb-3" />
            <h3 className="text-base font-bold text-slate-350">No Packages Found</h3>
            <p className="text-xs text-slate-500 max-w-xs mt-1">No packages match your search. Click &quot;Create&quot; to add one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
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
                {filteredPackages.map(pkg => (
                  <tr key={pkg.id} className="hover:bg-slate-900/20 transition-colors group">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-16 rounded-lg bg-slate-850 overflow-hidden border border-slate-800 shrink-0">
                          {pkg.image ? <img src={pkg.image} alt={pkg.title} className="object-cover h-full w-full group-hover:scale-105 transition-transform duration-500" /> : <div className="h-full w-full flex items-center justify-center text-slate-600"><ImageIcon className="h-5 w-5" /></div>}
                        </div>
                        <div className="min-w-0">
                          <span className="block font-bold text-white truncate max-w-[220px] group-hover:text-blue-400 transition-colors">{pkg.title}</span>
                          <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3 text-blue-500/60" />{pkg.location}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <Badge variant="outline" className={`font-semibold capitalize text-[10px] tracking-wider rounded-full px-2.5 ${pkg.category === "holidays" ? "text-blue-400 border-blue-500/20 bg-blue-500/5" : pkg.category === "cruise" ? "text-violet-400 border-violet-500/20 bg-violet-500/5" : pkg.category === "medical" ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5" : pkg.category === "kerala" ? "text-amber-400 border-amber-500/20 bg-amber-500/5" : "text-rose-400 border-rose-500/20 bg-rose-500/5"}`}>{pkg.category}</Badge>
                    </td>
                    <td className="px-6 py-3.5 text-slate-350 font-medium">{pkg.duration}</td>
                    <td className="px-6 py-3.5 font-bold text-white">QAR {pkg.price.toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-center">
                      <button onClick={() => handleToggleFeatured(pkg.id)} className={`p-2 rounded-xl transition-all cursor-pointer ${pkg.featured ? "text-amber-400 bg-amber-500/10" : "text-slate-600 hover:text-slate-400 hover:bg-slate-800/30"}`}>
                        <Star className={`h-4 w-4 ${pkg.featured ? "fill-amber-400" : ""}`} />
                      </button>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button onClick={() => handleOpenEdit(pkg)} variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"><Edit className="h-4 w-4" /></Button>
                        <Button onClick={() => handleOpenDelete(pkg)} variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-red-500/10 text-slate-450 hover:text-red-400 cursor-pointer"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Create / Edit Dialog ── */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-[96vw] sm:max-w-6xl bg-slate-900 border-slate-800/80 text-white rounded-3xl p-6 max-h-[92vh] overflow-hidden flex flex-col">
          <DialogHeader className="shrink-0 mb-3">
            <DialogTitle className="text-xl font-extrabold flex items-center gap-2">
              <span className="h-9 w-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                {editingPackage ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </span>
              {editingPackage ? "Edit Package" : "Create Package"}
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">Complete all sections. The Detail page reflects exactly what you configure here.</DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-center gap-1 p-1 bg-slate-950 rounded-full w-fit mx-auto mb-3 shrink-0 border border-slate-800">
            <button
              type="button"
              onClick={() => setEditingLocale("en")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${editingLocale === "en" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setEditingLocale("ar")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${editingLocale === "ar" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              العربية
            </button>
          </div>

          {loadingAdminInput ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : (
          <form onSubmit={handleSave} className="flex-1 overflow-hidden flex flex-col min-h-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
              <TabsList className="grid bg-slate-950 p-1 rounded-xl shrink-0 overflow-x-auto" style={{ gridTemplateColumns: `repeat(${isFixed ? 7 : 6}, 1fr)` }}>
                {["basic","details","pricing","itinerary","hotels","tours",...(isFixed ? ["departures","flights"] : [])].slice(0, isFixed ? 7 : 6).map(t => (
                  <TabsTrigger key={t} value={t} className={tabCls}>{t === "basic" ? "Basic" : t === "details" ? "Details" : t === "pricing" ? "Pricing" : t === "itinerary" ? "Itinerary" : t === "hotels" ? "Hotels" : t === "tours" ? "Opt. Tours" : t === "departures" ? "Departures" : "Flights"}</TabsTrigger>
                ))}
              </TabsList>


              <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-1">

                {/* ── BASIC TAB ── */}
                <TabsContent value="basic" className="space-y-4 m-0">
                  <div className={sectionCls}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><FieldLabel icon={FileText} color="text-blue-400">Package Title *</FieldLabel><BilingualInput locale={editingLocale} placeholder={editingLocale === "en" ? "e.g. Maldives Paradise 4D/3N" : "مثال: جزر المالديف 4 أيام/3 ليالٍ"} valueEn={formTitleEn} valueAr={formTitleAr} onChangeEn={setFormTitleEn} onChangeAr={setFormTitleAr} className={inputCls} /></div>
                      <div><FieldLabel icon={Tags} color="text-violet-400">Category *</FieldLabel>
                        <select disabled={category !== "all"} value={formCategory} onChange={e => setFormCategory(e.target.value)} className="w-full h-10 border border-slate-800 bg-slate-950 text-white rounded-xl px-3 text-sm outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-60">
                          <option value="holidays">Holidays</option><option value="cruise">Cruise</option><option value="medical">Medical Tourism</option><option value="kerala">Kerala Tourism</option><option value="fixed-departure">Fixed Departure</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div><FieldLabel icon={DollarSign} color="text-emerald-400">Base Price (QAR) *</FieldLabel><Input required type="number" min="0" placeholder="3499" value={formPrice} onChange={e => setFormPrice(e.target.value)} className={inputCls} /></div>
                      <div><FieldLabel icon={Clock} color="text-amber-400">Duration *</FieldLabel><BilingualInput locale={editingLocale} placeholder={editingLocale === "en" ? "5 Days / 4 Nights" : "5 أيام / 4 ليالٍ"} valueEn={formDurationEn} valueAr={formDurationAr} onChangeEn={setFormDurationEn} onChangeAr={setFormDurationAr} className={inputCls} /></div>
                      <div><FieldLabel icon={MapPin} color="text-blue-400">Location *</FieldLabel><BilingualInput locale={editingLocale} placeholder={editingLocale === "en" ? "Munnar, Kerala" : "مونار، كيرالا"} valueEn={formLocationEn} valueAr={formLocationAr} onChangeEn={setFormLocationEn} onChangeAr={setFormLocationAr} className={inputCls} /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div><FieldLabel icon={MapPin} color="text-indigo-400">Continent</FieldLabel>
                        <select value={formContinent} onChange={e => setFormContinent(e.target.value)} className="w-full h-10 border border-slate-800 bg-slate-950 text-white rounded-xl px-3 text-sm outline-none focus:ring-1 focus:ring-blue-500">
                          {["Asia","Europe","Africa","North America","South America","Oceania"].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="md:col-span-3"><FieldLabel icon={ImageIcon} color="text-blue-400">Hero Image URL</FieldLabel><Input type="url" placeholder="https://images.unsplash.com/…" value={formImage} onChange={e => setFormImage(e.target.value)} className={inputCls} /></div>
                    </div>
                    {formImage && <div className="relative h-32 w-full rounded-xl overflow-hidden border border-slate-800"><img src={formImage} alt="preview" className="object-cover w-full h-full" /></div>}
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-800 bg-slate-950/30">
                      <input type="checkbox" id="featured" checked={formFeatured} onChange={e => setFormFeatured(e.target.checked)} className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-blue-600 cursor-pointer" />
                      <label htmlFor="featured" className="text-xs font-semibold text-slate-300 cursor-pointer">Mark as Featured — highlights this package in the home carousel</label>
                    </div>
                  </div>
                </TabsContent>

                {/* ── DETAILS TAB ── */}
                <TabsContent value="details" className="space-y-4 m-0">
                  <div className={sectionCls}>
                    <div><FieldLabel icon={FileText} color="text-violet-400">Description</FieldLabel><BilingualTextarea locale={editingLocale} placeholder={editingLocale === "en" ? "Write a captivating summary…" : "اكتب ملخصًا جذابًا…"} valueEn={formDescriptionEn} valueAr={formDescriptionAr} onChangeEn={setFormDescriptionEn} onChangeAr={setFormDescriptionAr} className="min-h-[72px] border-slate-800 bg-slate-950/40 text-white rounded-xl text-sm" /></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><FieldLabel icon={Check} color="text-emerald-400">Inclusions (comma-separated)</FieldLabel><BilingualTextarea locale={editingLocale} placeholder={editingLocale === "en" ? "Flights, Hotel, Breakfast, Guided Tours" : "رحلات جوية، فندق، إفطار، جولات مرشدة"} valueEn={formIncludesEn} valueAr={formIncludesAr} onChangeEn={setFormIncludesEn} onChangeAr={setFormIncludesAr} className="h-20 border-slate-800 bg-slate-950/40 text-white rounded-xl text-sm" /></div>
                      <div><FieldLabel icon={X} color="text-red-400">Exclusions (comma-separated)</FieldLabel><BilingualTextarea locale={editingLocale} placeholder={editingLocale === "en" ? "Visa fees, Travel insurance, Tips" : "رسوم التأشيرة، تأمين السفر، الإكراميات"} valueEn={formExclusionsEn} valueAr={formExclusionsAr} onChangeEn={setFormExclusionsEn} onChangeAr={setFormExclusionsAr} className="h-20 border-slate-800 bg-slate-950/40 text-white rounded-xl text-sm" /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div><FieldLabel icon={Users}>Group Size</FieldLabel><BilingualInput locale={editingLocale} placeholder={editingLocale === "en" ? "Max 15" : "بحد أقصى 15"} valueEn={formGroupSizeEn} valueAr={formGroupSizeAr} onChangeEn={setFormGroupSizeEn} onChangeAr={setFormGroupSizeAr} className={inputCls} /></div>
                      <div><FieldLabel>Meals</FieldLabel><BilingualInput locale={editingLocale} placeholder={editingLocale === "en" ? "Breakfast & Dinner" : "إفطار وعشاء"} valueEn={formMealsEn} valueAr={formMealsAr} onChangeEn={setFormMealsEn} onChangeAr={setFormMealsAr} className={inputCls} /></div>
                      <div><FieldLabel>Accommodation</FieldLabel><BilingualInput locale={editingLocale} placeholder={editingLocale === "en" ? "4-Star Hotel" : "فندق 4 نجوم"} valueEn={formAccommodationEn} valueAr={formAccommodationAr} onChangeEn={setFormAccommodationEn} onChangeAr={setFormAccommodationAr} className={inputCls} /></div>
                    </div>
                    <div><FieldLabel>Cancellation Policy (one rule per line)</FieldLabel><BilingualTextarea locale={editingLocale} placeholder={editingLocale === "en" ? "Free cancellation up to 30 days before travel…" : "إلغاء مجاني حتى 30 يومًا قبل السفر…"} valueEn={formCancellationPolicyEn} valueAr={formCancellationPolicyAr} onChangeEn={setFormCancellationPolicyEn} onChangeAr={setFormCancellationPolicyAr} className="h-20 border-slate-800 bg-slate-950/40 text-white rounded-xl text-sm" /></div>
                  </div>
                </TabsContent>

                {/* ── PRICING TAB ── */}
                <TabsContent value="pricing" className="space-y-4 m-0">
                  {([["Standard Pricing", formPricing, setFormPricing, "emerald"], ["Offer / Discounted Pricing (optional)", formOfferPricing, setFormOfferPricing, "amber"]] as const).map(([label, val, setter, col]) => (
                    <div key={label} className={sectionCls}>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2"><DollarSign className={`w-4 h-4 text-${col}-400`} />{label}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {(Object.keys(emptyPrice) as (keyof PackagePrice)[]).map(key => (
                          <div key={key}><FieldLabel>{key.replace(/([A-Z0-9])/g, ' $1').trim()}</FieldLabel><Input type="number" min="0" placeholder="0" value={(val as PackagePrice)[key] || ""} onChange={e => (setter as any)({ ...(val as PackagePrice), [key]: Number(e.target.value) })} className="h-9 border-slate-800 bg-slate-900/50 text-white rounded-lg text-sm" /></div>
                        ))}
                      </div>
                    </div>
                  ))}
                </TabsContent>

                {/* ── ITINERARY TAB ── */}
                <TabsContent value="itinerary" className="space-y-4 m-0">
                  <div className={sectionCls}>
                    <div><FieldLabel icon={Upload} color="text-blue-400">Itinerary PDF / File URL</FieldLabel><Input type="url" placeholder="https://example.com/itinerary.pdf" value={formItineraryFileUrl} onChange={e => setFormItineraryFileUrl(e.target.value)} className={inputCls} /></div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white">Daily Itinerary <span className="text-slate-500 font-normal">({formItinerary.length} days)</span></h3>
                      <Button type="button" onClick={addDay} className="h-8 px-3 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-lg cursor-pointer gap-1"><Plus className="w-3 h-3" />Add Day</Button>
                    </div>
                    {formItinerary.map((day, i) => (
                      <div key={i} className="p-4 rounded-2xl border border-slate-800 bg-slate-950/30 space-y-3 relative group">
                        <button type="button" onClick={() => removeDay(i)} className="absolute top-3 right-3 p-1.5 text-slate-600 hover:text-red-400 bg-slate-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"><Trash className="w-4 h-4" /></button>
                        <div className="flex gap-3">
                          <div className="w-16 shrink-0"><FieldLabel>Day</FieldLabel><Input type="number" min="1" value={day.day} onChange={e => updateDayNumber(i, parseInt(e.target.value))} className="h-9 border-slate-800 bg-slate-900 text-center text-sm" /></div>
                          <div className="flex-1"><FieldLabel>Title</FieldLabel><BilingualInput locale={editingLocale} placeholder={editingLocale === "en" ? "e.g. Arrival in Paris" : "مثال: الوصول إلى باريس"} valueEn={day.title.en} valueAr={day.title.ar} onChangeEn={v => updateDayField(i, "title", "en", v)} onChangeAr={v => updateDayField(i, "title", "ar", v)} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                        </div>
                        <div><FieldLabel>Description</FieldLabel><BilingualTextarea locale={editingLocale} placeholder={editingLocale === "en" ? "Describe the day's activities…" : "صف أنشطة اليوم…"} valueEn={day.desc.en} valueAr={day.desc.ar} onChangeEn={v => updateDayField(i, "desc", "en", v)} onChangeAr={v => updateDayField(i, "desc", "ar", v)} className="min-h-[60px] border-slate-800 bg-slate-900 text-sm" /></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div><FieldLabel>Highlights (comma-separated)</FieldLabel><BilingualInput locale={editingLocale} placeholder={editingLocale === "en" ? "Airport pickup, Hotel check-in" : "الاستقبال من المطار، تسجيل الدخول للفندق"} valueEn={day.highlights.map(h => h.en).join(", ")} valueAr={day.highlights.map(h => h.ar).join(", ")} onChangeEn={v => updateDayHighlights(i, "en", v)} onChangeAr={v => updateDayHighlights(i, "ar", v)} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                          <div><FieldLabel icon={Camera} color="text-teal-400">Photo URLs (comma-separated)</FieldLabel><Input placeholder="https://…, https://…, https://…" value={day.images?.join(", ")} onChange={e => updateDayImages(i, e.target.value)} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                        </div>
                        {day.images && day.images.length > 0 && (
                          <div className="flex gap-2 flex-wrap">
                            {day.images.slice(0, 3).map((img, ii) => (
                              <div key={ii} className="w-16 h-12 rounded-lg overflow-hidden border border-slate-700"><img src={img} alt="" className="object-cover w-full h-full" /></div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* ── HOTELS TAB ── */}
                <TabsContent value="hotels" className="space-y-3 m-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">Hotels <span className="text-slate-500 font-normal">({formHotels.length})</span></h3>
                    <Button type="button" onClick={addHotel} className="h-8 px-3 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-lg cursor-pointer gap-1"><Plus className="w-3 h-3" />Add Hotel</Button>
                  </div>
                  {formHotels.map((hotel, i) => (
                    <div key={i} className="p-4 rounded-2xl border border-slate-800 bg-slate-950/30 space-y-3 relative group">
                      <button type="button" onClick={() => removeHotel(i)} className="absolute top-3 right-3 p-1.5 text-slate-600 hover:text-red-400 bg-slate-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"><Trash className="w-4 h-4" /></button>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="md:col-span-2"><FieldLabel icon={Building} color="text-emerald-400">Hotel Name</FieldLabel><Input placeholder="Grand Hyatt" value={hotel.name} onChange={e => updateHotelPlain(i, "name", e.target.value)} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                        <div><FieldLabel>Stars (1–5)</FieldLabel><Input type="number" min="1" max="5" value={hotel.rating} onChange={e => updateHotelNumber(i, "rating", parseInt(e.target.value))} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                        <div><FieldLabel>Nights</FieldLabel><Input type="number" min="1" value={hotel.nights} onChange={e => updateHotelNumber(i, "nights", parseInt(e.target.value))} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                        <div><FieldLabel>Room Type</FieldLabel><BilingualInput locale={editingLocale} placeholder={editingLocale === "en" ? "Deluxe King Room" : "غرفة ديلوكس بسرير كينج"} valueEn={hotel.roomType?.en ?? ""} valueAr={hotel.roomType?.ar ?? ""} onChangeEn={v => updateHotelBilingual(i, "roomType", "en", v)} onChangeAr={v => updateHotelBilingual(i, "roomType", "ar", v)} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                        <div><FieldLabel>Badge Label</FieldLabel><BilingualInput locale={editingLocale} placeholder={editingLocale === "en" ? "Luxury Pick" : "اختيار فاخر"} valueEn={hotel.badge?.en ?? ""} valueAr={hotel.badge?.ar ?? ""} onChangeEn={v => updateHotelBilingual(i, "badge", "en", v)} onChangeAr={v => updateHotelBilingual(i, "badge", "ar", v)} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                        <div><FieldLabel>Check-in Date</FieldLabel><Input placeholder="08 Aug 2026" value={hotel.checkIn || ""} onChange={e => updateHotelPlain(i, "checkIn", e.target.value)} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                        <div><FieldLabel>Check-out Date</FieldLabel><Input placeholder="11 Aug 2026" value={hotel.checkOut || ""} onChange={e => updateHotelPlain(i, "checkOut", e.target.value)} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                        <div className="md:col-span-4"><FieldLabel icon={ImageIcon} color="text-blue-400">Hotel Image URL</FieldLabel><Input type="url" placeholder="https://images.unsplash.com/…" value={hotel.image || ""} onChange={e => updateHotelPlain(i, "image", e.target.value)} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                        <div className="md:col-span-4"><FieldLabel>Location / Address</FieldLabel><Input placeholder="City Centre, Dubai" value={hotel.location} onChange={e => updateHotelPlain(i, "location", e.target.value)} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                        <div className="md:col-span-4"><FieldLabel>Amenities (comma-separated)</FieldLabel><BilingualInput locale={editingLocale} placeholder={editingLocale === "en" ? "Free WiFi, Breakfast, Pool, Spa, Airport Transfer" : "واي فاي مجاني، إفطار، مسبح، سبا، نقل من المطار"} valueEn={(hotel.amenities ?? []).map(a => a.en).join(", ")} valueAr={(hotel.amenities ?? []).map(a => a.ar).join(", ")} onChangeEn={v => updateHotelAmenities(i, "en", v)} onChangeAr={v => updateHotelAmenities(i, "ar", v)} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                      </div>
                      {hotel.image && <div className="h-24 w-full rounded-xl overflow-hidden border border-slate-700"><img src={hotel.image} alt="" className="object-cover w-full h-full" /></div>}
                    </div>
                  ))}
                </TabsContent>

                {/* ── OPTIONAL TOURS TAB ── */}
                <TabsContent value="tours" className="space-y-3 m-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">Optional Tours <span className="text-slate-500 font-normal">({formOptionalTours.length})</span></h3>
                    <Button type="button" onClick={addTour} className="h-8 px-3 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-lg cursor-pointer gap-1"><Plus className="w-3 h-3" />Add Tour</Button>
                  </div>
                  {formOptionalTours.map((tour) => (
                    <div key={tour.id} className="p-4 rounded-2xl border border-slate-800 bg-slate-950/30 space-y-3 relative group">
                      <button type="button" onClick={() => removeTour(tour.id)} className="absolute top-3 right-3 p-1.5 text-slate-600 hover:text-red-400 bg-slate-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"><Trash className="w-4 h-4" /></button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div><FieldLabel>Tour Title</FieldLabel><BilingualInput locale={editingLocale} placeholder={editingLocale === "en" ? "Kyoto City Tour w/ Lunch" : "جولة مدينة كيوتو مع الغداء"} valueEn={tour.title.en} valueAr={tour.title.ar} onChangeEn={v => updateTourBilingual(tour.id, "title", "en", v)} onChangeAr={v => updateTourBilingual(tour.id, "title", "ar", v)} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                        <div><FieldLabel>Tag</FieldLabel>
                          <select value={tour.tag} onChange={e => updateTourTag(tour.id, e.target.value as "Mandatory" | "Optional")} className="w-full h-9 border border-slate-800 bg-slate-900 text-white rounded-xl px-3 text-sm outline-none focus:ring-1 focus:ring-blue-500">
                            <option value="Optional">Optional</option><option value="Mandatory">Mandatory</option>
                          </select>
                        </div>
                      </div>
                      <div><FieldLabel>Description</FieldLabel><BilingualTextarea locale={editingLocale} placeholder={editingLocale === "en" ? "Describe this optional tour…" : "صف هذه الجولة الاختيارية…"} valueEn={tour.desc.en} valueAr={tour.desc.ar} onChangeEn={v => updateTourBilingual(tour.id, "desc", "en", v)} onChangeAr={v => updateTourBilingual(tour.id, "desc", "ar", v)} className="min-h-[60px] border-slate-800 bg-slate-900 text-sm" /></div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {(["adult","single","child611","child25","infant"] as const).map(f => (
                          <div key={f}><FieldLabel>{f === "child611" ? "Child 6–11" : f === "child25" ? "Child 2–5" : f.charAt(0).toUpperCase() + f.slice(1)} (QAR)</FieldLabel><Input type="number" min="0" placeholder="0" value={tour[f] || ""} onChange={e => updateTourPrice(tour.id, f, Number(e.target.value))} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                        ))}
                      </div>
                      <div><FieldLabel icon={Camera} color="text-teal-400">Photo URLs (comma-separated, up to 3)</FieldLabel><Input placeholder="https://…, https://…, https://…" value={tour.images?.join(", ") || ""} onChange={e => updateTourImages(tour.id, e.target.value)} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                      {tour.images && tour.images.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {tour.images.slice(0, 3).map((img, ii) => (
                            <div key={ii} className="w-20 h-14 rounded-lg overflow-hidden border border-slate-700"><img src={img} alt="" className="object-cover w-full h-full" /></div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </TabsContent>

                {/* ── DEPARTURE DATES TAB (fixed-departure only) ── */}
                <TabsContent value="departures" className="space-y-3 m-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">Departure Dates <span className="text-slate-500 font-normal">({formDepartures.length})</span></h3>
                    <Button type="button" onClick={addDeparture} className="h-8 px-3 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-lg cursor-pointer gap-1"><Plus className="w-3 h-3" />Add Date</Button>
                  </div>
                  {formDepartures.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-32 rounded-2xl border border-dashed border-slate-700 text-slate-500 text-sm gap-2">
                      <Calendar className="w-6 h-6" /><span>No departure dates yet. Click &quot;Add Date&quot; to add one.</span>
                    </div>
                  )}
                  {formDepartures.map((dep) => (
                    <div key={dep.id} className="p-4 rounded-2xl border border-slate-800 bg-slate-950/30 space-y-3 relative group">
                      <button type="button" onClick={() => removeDeparture(dep.id)} className="absolute top-3 right-3 p-1.5 text-slate-600 hover:text-red-400 bg-slate-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"><Trash className="w-4 h-4" /></button>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="md:col-span-2"><FieldLabel icon={Calendar} color="text-blue-400">Departure Date</FieldLabel><Input placeholder="08 Aug 2026" value={dep.date} onChange={e => updateDepartureDate(dep.id, e.target.value)} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                        <div><FieldLabel>Seats Status</FieldLabel><BilingualInput locale={editingLocale} placeholder={editingLocale === "en" ? "4 Seats Left" : "4 مقاعد متبقية"} valueEn={dep.seats.en} valueAr={dep.seats.ar} onChangeEn={v => updateDepartureSeats(dep.id, "en", v)} onChangeAr={v => updateDepartureSeats(dep.id, "ar", v)} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                        <div><FieldLabel>Urgency Color</FieldLabel>
                          <select value={dep.urgency} onChange={e => updateDepartureUrgency(dep.id, e.target.value as "red" | "amber" | "green")} className="w-full h-9 border border-slate-800 bg-slate-900 text-white rounded-xl px-3 text-sm outline-none focus:ring-1 focus:ring-blue-500">
                            <option value="green">Green — Available</option><option value="amber">Amber — Filling Fast</option><option value="red">Red — Almost Full</option>
                          </select>
                        </div>
                      </div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Per-Person Prices (QAR)</p>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {([["adult","Adult"],["single","Single"],["child611","Child 6–11"],["child25","Child 2–5"],["infant","Infant"]] as const).map(([f, label]) => (
                          <div key={f}><FieldLabel>{label}</FieldLabel><Input type="number" min="0" placeholder="0" value={dep[f] || ""} onChange={e => updateDeparturePrice(dep.id, f, Number(e.target.value))} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                        ))}
                      </div>
                    </div>
                  ))}
                </TabsContent>

                {/* ── FLIGHTS TAB (fixed-departure only) ── */}
                <TabsContent value="flights" className="space-y-3 m-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">Flights <span className="text-slate-500 font-normal">({formFlights.length})</span></h3>
                    <Button type="button" onClick={addFlight} className="h-8 px-3 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-lg cursor-pointer gap-1"><Plus className="w-3 h-3" />Add Flight</Button>
                  </div>
                  {formFlights.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-32 rounded-2xl border border-dashed border-slate-700 text-slate-500 text-sm gap-2">
                      <Plane className="w-6 h-6" /><span>No flights yet. Click &quot;Add Flight&quot; to add one.</span>
                    </div>
                  )}
                  {formFlights.map((flight, i) => (
                    <div key={i} className="p-4 rounded-2xl border border-slate-800 bg-slate-950/30 space-y-3 relative group">
                      <button type="button" onClick={() => removeFlight(i)} className="absolute top-3 right-3 p-1.5 text-slate-600 hover:text-red-400 bg-slate-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"><Trash className="w-4 h-4" /></button>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div><FieldLabel>Type</FieldLabel>
                          <select value={flight.type} onChange={e => updateFlight(i, "type", e.target.value)} className="w-full h-9 border border-slate-800 bg-slate-900 text-white rounded-xl px-3 text-sm outline-none focus:ring-1 focus:ring-blue-500">
                            <option value="Outbound">Outbound</option><option value="Return">Return</option>
                          </select>
                        </div>
                        <div><FieldLabel>Airline</FieldLabel><Input placeholder="Emirates" value={flight.airline} onChange={e => updateFlight(i, "airline", e.target.value)} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                        <div><FieldLabel>Flight No.</FieldLabel><Input placeholder="EK 503" value={flight.flightNo || ""} onChange={e => updateFlight(i, "flightNo", e.target.value)} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                        <div><FieldLabel>Class</FieldLabel><Input placeholder="Economy" value={flight.class || ""} onChange={e => updateFlight(i, "class", e.target.value)} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                        <div><FieldLabel>From (code)</FieldLabel><Input placeholder="DOH" value={flight.from || ""} onChange={e => updateFlight(i, "from", e.target.value)} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                        <div><FieldLabel>From City</FieldLabel><Input placeholder="Doha" value={flight.fromCity || ""} onChange={e => updateFlight(i, "fromCity", e.target.value)} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                        <div><FieldLabel>To (code)</FieldLabel><Input placeholder="DXB" value={flight.to || ""} onChange={e => updateFlight(i, "to", e.target.value)} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                        <div><FieldLabel>To City</FieldLabel><Input placeholder="Dubai" value={flight.toCity || ""} onChange={e => updateFlight(i, "toCity", e.target.value)} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                        <div><FieldLabel>Departure Time</FieldLabel><Input placeholder="08:30" value={flight.departure} onChange={e => updateFlight(i, "departure", e.target.value)} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                        <div><FieldLabel>Arrival Time</FieldLabel><Input placeholder="09:05" value={flight.arrival} onChange={e => updateFlight(i, "arrival", e.target.value)} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                        <div><FieldLabel>Duration</FieldLabel><Input placeholder="1h 35m" value={flight.duration} onChange={e => updateFlight(i, "duration", e.target.value)} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                        <div><FieldLabel>Date</FieldLabel><Input placeholder="08 Aug 2026" value={flight.date || ""} onChange={e => updateFlight(i, "date", e.target.value)} className="h-9 border-slate-800 bg-slate-900 text-sm" /></div>
                      </div>
                    </div>
                  ))}
                </TabsContent>

              </div>{/* end scroll area */}

              {saveError && (
                <div className="shrink-0 mt-3 px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-xs font-medium flex items-start gap-2">
                  <X className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
                  <span>{saveError}</span>
                </div>
              )}

              <DialogFooter className="gap-2 border-t border-slate-800/80 pt-4 mt-3 shrink-0">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} disabled={submitting} className="h-11 px-5 border-slate-800 text-slate-400 hover:text-white rounded-xl font-bold cursor-pointer">Cancel</Button>
                <Button type="submit" disabled={submitting} className="h-11 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg cursor-pointer flex items-center gap-1.5">
                  {submitting ? <><Loader2 className="h-4 w-4 animate-spin" />Saving…</> : editingPackage ? "Save Changes" : "Create Package"}
                </Button>
              </DialogFooter>
            </Tabs>
          </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md bg-slate-900 border-slate-800 text-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold flex items-center gap-2">
              <span className="h-9 w-9 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 shrink-0"><Trash2 className="h-5 w-5" /></span>
              Delete Package?
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs mt-2">
              Are you sure you want to permanently delete <strong className="text-white">&quot;{deletingPackage?.title}&quot;</strong>? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-6 pt-4 border-t border-slate-800/50">
            <Button type="button" variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={submitting} className="h-11 px-5 border-slate-800 text-slate-400 hover:text-white rounded-xl font-bold cursor-pointer">No, Keep It</Button>
            <Button type="button" onClick={handleDeleteConfirm} disabled={submitting} className="h-11 px-6 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl cursor-pointer flex items-center gap-1.5">
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin" />Deleting…</> : "Yes, Delete It"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
