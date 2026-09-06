// src/components/admin/VisaCountriesTable.tsx
"use client";

import React, { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Loader2, Globe2, AlertCircle, Plus, Pencil, Trash2, Eye, EyeOff,
  Star, Upload, Wand2,
} from "lucide-react";
import type { VisaCountry } from "@/lib/visa/types";
import { REGIONS } from "@/lib/visa/types";
import type { VisaCountryInput } from "@/lib/visa/schema";
import { extractErrorMessage } from "@/lib/extract-error-message";
import { uploadImage } from "@/lib/upload-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

async function fetchVisaCountries(): Promise<VisaCountry[]> {
  const res = await fetch("/api/visa-countries?all=1");
  if (!res.ok) throw new Error(await extractErrorMessage(res, "Failed to load visa countries"));
  const json = await res.json();
  return json.countries as VisaCountry[];
}

async function createVisaCountry(input: VisaCountryInput): Promise<VisaCountry> {
  const res = await fetch("/api/visa-countries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await extractErrorMessage(res, "Failed to create visa country"));
  return res.json() as Promise<VisaCountry>;
}

async function updateVisaCountry(id: number, input: VisaCountryInput): Promise<VisaCountry> {
  const res = await fetch(`/api/visa-countries/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await extractErrorMessage(res, "Failed to update visa country"));
  return res.json() as Promise<VisaCountry>;
}

async function deleteVisaCountry(id: number): Promise<void> {
  const res = await fetch(`/api/visa-countries/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await extractErrorMessage(res, "Failed to delete visa country"));
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const emptyForm: VisaCountryInput = {
  name: "",
  code: "",
  slug: "",
  region: "Middle East",
  flag: "",
  description: "",
  requirements: [],
  processingTime: "",
  price: "",
  image: "",
  isFeatured: false,
  isActive: true,
  sortOrder: 0,
};

function ImageUploadButton({ onUploaded }: { onUploaded: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError(null);
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onUploaded(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1 shrink-0">
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="hidden" />
      <Button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="h-9 px-3 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-lg cursor-pointer gap-1.5"
      >
        {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
        Upload
      </Button>
      {error && <span className="text-[11px] text-red-400">{error}</span>}
    </div>
  );
}

function VisaCountryFormDialog({
  open,
  onOpenChange,
  initial,
  onSubmit,
  isSubmitting,
  submitError,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: VisaCountryInput;
  onSubmit: (input: VisaCountryInput) => void;
  isSubmitting: boolean;
  submitError: string | null;
}) {
  const [form, setForm] = useState<VisaCountryInput>(initial);
  const [requirementsText, setRequirementsText] = useState(initial.requirements.join("\n"));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-800/80 text-white rounded-2xl">
        <DialogHeader>
          <DialogTitle>{initial.name ? "Edit Visa Country" : "Add Visa Country"}</DialogTitle>
          <DialogDescription className="text-slate-400">
            This appears on the Global Visa listing, the country detail page, and (if featured) the homepage banner.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({ ...form, requirements: requirementsText.split("\n").map((r) => r.trim()).filter(Boolean) });
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide mb-1.5 block">Country name</label>
              <Input
                required
                value={form.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setForm((f) => ({ ...f, name, slug: f.slug || slugify(name) }));
                }}
                placeholder="e.g. Qatar"
                className="bg-slate-950 border-slate-800 text-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide mb-1.5 block">Country code</label>
              <Input
                required
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="e.g. QA"
                maxLength={10}
                className="bg-slate-950 border-slate-800 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide mb-1.5 block">
                Slug (used in the URL: /global-visa/&lt;slug&gt;)
              </label>
              <Input
                required
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="e.g. qatar"
                className="bg-slate-950 border-slate-800 text-white font-mono text-sm"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setForm((f) => ({ ...f, slug: slugify(f.name) }))}
              className="h-9 gap-1.5 cursor-pointer"
              title="Generate slug from name"
            >
              <Wand2 className="h-3.5 w-3.5" /> Generate
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide mb-1.5 block">Region</label>
              <select
                value={form.region}
                onChange={(e) => setForm((f) => ({ ...f, region: e.target.value as VisaCountryInput["region"] }))}
                className="w-full h-9 rounded-md bg-slate-950 border border-slate-800 text-white text-sm px-3 cursor-pointer"
              >
                {REGIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide mb-1.5 block">Flag emoji</label>
              <Input
                value={form.flag}
                onChange={(e) => setForm((f) => ({ ...f, flag: e.target.value }))}
                placeholder="e.g. 🇶🇦"
                className="bg-slate-950 border-slate-800 text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide mb-1.5 block">Description</label>
            <Textarea
              rows={2}
              value={form.description ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Short teaser shown on the country card"
              className="bg-slate-950 border-slate-800 text-white"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide mb-1.5 block">
              Required documents (one per line)
            </label>
            <Textarea
              rows={4}
              value={requirementsText}
              onChange={(e) => setRequirementsText(e.target.value)}
              placeholder={"Passport (6 months validity)\nPhoto\nHotel Booking"}
              className="bg-slate-950 border-slate-800 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide mb-1.5 block">Processing time</label>
              <Input
                value={form.processingTime ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, processingTime: e.target.value }))}
                placeholder="e.g. 2-3 Days"
                className="bg-slate-950 border-slate-800 text-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide mb-1.5 block">Fee</label>
              <Input
                value={form.price ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                placeholder="e.g. QAR 100"
                className="bg-slate-950 border-slate-800 text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide mb-1.5 block">Cover image</label>
            <div className="flex gap-2">
              <Input
                value={form.image ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                placeholder="https://..."
                className="bg-slate-950 border-slate-800 text-white"
              />
              <ImageUploadButton onUploaded={(url) => setForm((f) => ({ ...f, image: url }))} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 items-end">
            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide mb-1.5 block">Display order</label>
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) || 0 }))}
                className="bg-slate-950 border-slate-800 text-white"
              />
            </div>
            <div className="flex items-center gap-4 pb-1.5">
              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-900 accent-blue-600 cursor-pointer"
                />
                Active
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-900 accent-blue-600 cursor-pointer"
                />
                Featured on homepage
              </label>
            </div>
          </div>

          {submitError && (
            <p className="text-sm text-red-400 flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 shrink-0" /> {submitError}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="cursor-pointer">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function VisaCountryRowItem({
  country,
  onEdit,
  onToggleActive,
  onDelete,
  isToggling,
  isDeleting,
}: {
  country: VisaCountry;
  onEdit: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
  isToggling: boolean;
  isDeleting: boolean;
}) {
  return (
    <div className={`flex items-center gap-4 px-5 py-4 border-b border-slate-800/60 last:border-b-0 ${!country.isActive ? "opacity-50" : ""}`}>
      <span className="text-2xl shrink-0">{country.flag || "🏳️"}</span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-bold text-white">{country.name}</p>
          <span className="text-[11px] px-2 py-0.5 rounded-full border border-slate-700 text-slate-400">{country.region}</span>
          {country.isFeatured && (
            <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Star className="h-3 w-3 fill-current" /> Featured
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-0.5 font-mono">/global-visa/{country.slug}</p>
      </div>

      <div className="text-xs text-slate-400 shrink-0 hidden sm:block w-28">{country.processingTime || "—"}</div>
      <div className="text-xs text-slate-400 shrink-0 hidden sm:block w-24">{country.price || "—"}</div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={onToggleActive}
          disabled={isToggling}
          title={country.isActive ? "Hide from site" : "Show on site"}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-200 hover:bg-slate-800/40 transition-all cursor-pointer disabled:opacity-50"
        >
          {country.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={onEdit}
          title="Edit"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-200 hover:bg-slate-800/40 transition-all cursor-pointer"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={isDeleting}
          title="Delete"
          className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function VisaCountriesTable() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: countries = [], isLoading, error } = useQuery({
    queryKey: ["visa-countries", "admin"],
    queryFn: fetchVisaCountries,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["visa-countries"] });

  const createMutation = useMutation({
    mutationFn: createVisaCountry,
    onSuccess: () => {
      invalidate();
      setDialogOpen(false);
    },
    onError: (err) => setFormError(err instanceof Error ? err.message : "Something went wrong"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: VisaCountryInput }) => updateVisaCountry(id, input),
    onSuccess: () => {
      invalidate();
      setDialogOpen(false);
    },
    onError: (err) => setFormError(err instanceof Error ? err.message : "Something went wrong"),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (c: VisaCountry) =>
      updateVisaCountry(c.id, {
        name: c.name,
        code: c.code,
        slug: c.slug,
        region: c.region,
        flag: c.flag,
        description: c.description,
        requirements: c.requirements,
        processingTime: c.processingTime,
        price: c.price,
        image: c.image,
        isFeatured: c.isFeatured,
        isActive: !c.isActive,
        sortOrder: c.sortOrder,
      }),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteVisaCountry,
    onSuccess: invalidate,
  });

  const editingCountry = countries.find((c) => c.id === editingId) ?? null;

  const initialForm: VisaCountryInput = editingCountry
    ? {
        name: editingCountry.name,
        code: editingCountry.code,
        slug: editingCountry.slug,
        region: editingCountry.region,
        flag: editingCountry.flag,
        description: editingCountry.description ?? "",
        requirements: editingCountry.requirements,
        processingTime: editingCountry.processingTime ?? "",
        price: editingCountry.price ?? "",
        image: editingCountry.image ?? "",
        isFeatured: editingCountry.isFeatured,
        isActive: editingCountry.isActive,
        sortOrder: editingCountry.sortOrder,
      }
    : emptyForm;

  const openCreateDialog = () => {
    setEditingId(null);
    setFormError(null);
    setDialogOpen(true);
  };

  const openEditDialog = (id: number) => {
    setEditingId(id);
    setFormError(null);
    setDialogOpen(true);
  };

  const handleSubmit = (input: VisaCountryInput) => {
    setFormError(null);
    if (editingId != null) {
      updateMutation.mutate({ id: editingId, input });
    } else {
      createMutation.mutate(input);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button onClick={openCreateDialog} className="cursor-pointer gap-1.5">
          <Plus className="h-4 w-4" /> Add Country
        </Button>
      </div>

      <div className="border border-slate-800/80 rounded-2xl overflow-hidden bg-slate-900/15">
        {isLoading ? (
          <div className="flex h-72 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-72 text-center p-6">
            <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
            <h3 className="text-base font-bold text-slate-350">Failed to load visa countries</h3>
            <p className="text-xs text-slate-500 max-w-xs mt-1">
              {error instanceof Error ? error.message : "Something went wrong. Please try again."}
            </p>
          </div>
        ) : countries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-72 text-center p-6">
            <Globe2 className="h-12 w-12 text-slate-600 mb-3" />
            <h3 className="text-base font-bold text-slate-350">No Countries Yet</h3>
            <p className="text-xs text-slate-500 max-w-xs mt-1">
              Add a country to show it on the Global Visa page.
            </p>
          </div>
        ) : (
          <div>
            {countries.map((c) => (
              <VisaCountryRowItem
                key={c.id}
                country={c}
                onEdit={() => openEditDialog(c.id)}
                onToggleActive={() => toggleActiveMutation.mutate(c)}
                onDelete={() => {
                  if (window.confirm(`Delete ${c.name}? This can't be undone.`)) {
                    deleteMutation.mutate(c.id);
                  }
                }}
                isToggling={toggleActiveMutation.isPending && toggleActiveMutation.variables?.id === c.id}
                isDeleting={deleteMutation.isPending && deleteMutation.variables === c.id}
              />
            ))}
          </div>
        )}
      </div>

      <VisaCountryFormDialog
        key={`${editingId ?? "new"}-${dialogOpen}`}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={initialForm}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        submitError={formError}
      />
    </div>
  );
}
