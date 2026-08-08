"use client";

import React, { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { extractErrorMessage } from "@/lib/extract-error-message";
import type { Enquiry } from "@/lib/enquiries/types";
import type { Booking } from "@/lib/bookings/types";
import type { Package } from "@/types/package";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceEnquiry?: Enquiry | null;
  onCreated?: () => void;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: string;
  packageId: string;
  price: string;
  notes: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  phone: "",
  destination: "",
  startDate: "",
  endDate: "",
  travelers: "",
  packageId: "",
  price: "",
  notes: "",
};

function formFromEnquiry(enquiry: Enquiry): FormState {
  const d = enquiry.details;
  return {
    name: enquiry.name ?? "",
    email: enquiry.email,
    phone: enquiry.phone,
    destination: typeof d.destination === "string" ? d.destination : "",
    startDate: typeof d.checkInDate === "string" ? d.checkInDate.slice(0, 10) : typeof d.travelDate === "string" ? d.travelDate.slice(0, 10) : "",
    endDate: typeof d.checkOutDate === "string" ? d.checkOutDate.slice(0, 10) : "",
    travelers: "",
    packageId: enquiry.packageId != null ? String(enquiry.packageId) : "",
    price: "",
    notes: enquiry.message ?? "",
  };
}

async function fetchAllPackages(): Promise<Package[]> {
  const res = await fetch("/api/packages?category=all");
  if (!res.ok) throw new Error("Failed to load packages");
  const json = await res.json();
  return json.packages as Package[];
}

const inputCls = "h-10 border-slate-800 bg-slate-950/40 text-white rounded-xl text-sm placeholder-slate-600 focus-visible:ring-blue-500";
const labelCls = "text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block";

export default function CreateBookingDialog({ open, onOpenChange, sourceEnquiry, onCreated }: Props) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  useEffect(() => {
    if (open) {
      setForm(sourceEnquiry ? formFromEnquiry(sourceEnquiry) : EMPTY_FORM);
    }
  }, [open, sourceEnquiry]);

  const { data: packages = [] } = useQuery({
    queryKey: ["packages", "all"],
    queryFn: fetchAllPackages,
    enabled: open,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          destination: form.destination || undefined,
          startDate: form.startDate || undefined,
          endDate: form.endDate || undefined,
          travelers: form.travelers ? Number(form.travelers) : undefined,
          packageId: form.packageId ? Number(form.packageId) : undefined,
          price: form.price ? Number(form.price) : undefined,
          notes: form.notes || undefined,
          enquiryId: sourceEnquiry?.id,
        }),
      });
      if (!res.ok) throw new Error(await extractErrorMessage(res, "Failed to create booking"));
      return res.json() as Promise<Booking>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      if (sourceEnquiry) {
        queryClient.invalidateQueries({ queryKey: ["enquiries"] });
      }
      onOpenChange(false);
      onCreated?.();
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-slate-900 border-slate-800/80 text-white rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Create Booking</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            createMutation.mutate();
          }}
          className="space-y-4 mt-2"
        >
          <div>
            <label className={labelCls}>Name *</label>
            <Input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Email *</label>
              <Input required type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Phone *</label>
              <Input required value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Destination</label>
            <Input value={form.destination} onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))} className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Start Date</label>
              <Input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>End Date</label>
              <Input type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Travelers</label>
              <Input type="number" min="0" value={form.travelers} onChange={(e) => setForm((f) => ({ ...f, travelers: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Price (QAR)</label>
              <Input type="number" min="0" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Package (optional)</label>
            <select
              value={form.packageId}
              onChange={(e) => setForm((f) => ({ ...f, packageId: e.target.value }))}
              className="h-10 w-full rounded-xl border border-slate-800 bg-slate-950/40 text-white text-sm px-3"
            >
              <option value="">None</option>
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.title} — {pkg.location}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Notes</label>
            <Textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} className="bg-slate-950/40 border-slate-800 text-white rounded-xl text-sm" rows={3} />
          </div>

          {createMutation.isError && (
            <p className="text-sm text-red-400">{createMutation.error instanceof Error ? createMutation.error.message : "Failed to create booking"}</p>
          )}

          <Button type="submit" disabled={createMutation.isPending} className="w-full h-11 bg-blue-600 hover:bg-blue-500 font-bold rounded-xl cursor-pointer">
            {createMutation.isPending ? "Creating..." : "Create Booking"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
