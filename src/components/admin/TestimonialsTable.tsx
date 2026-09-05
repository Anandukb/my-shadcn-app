// src/components/admin/TestimonialsTable.tsx
"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Loader2, MessageSquareQuote, AlertCircle, Plus, Pencil, Trash2, Star,
  Eye, EyeOff, GripVertical,
} from "lucide-react";
import type { Testimonial } from "@/lib/testimonials/types";
import type { TestimonialInput } from "@/lib/testimonials/schema";
import { extractErrorMessage } from "@/lib/extract-error-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

async function fetchTestimonials(): Promise<Testimonial[]> {
  const res = await fetch("/api/testimonials");
  if (!res.ok) throw new Error(await extractErrorMessage(res, "Failed to load testimonials"));
  const json = await res.json();
  return json.testimonials as Testimonial[];
}

async function createTestimonial(input: TestimonialInput): Promise<Testimonial> {
  const res = await fetch("/api/testimonials", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await extractErrorMessage(res, "Failed to create testimonial"));
  return res.json() as Promise<Testimonial>;
}

async function updateTestimonial(id: number, input: TestimonialInput): Promise<Testimonial> {
  const res = await fetch(`/api/testimonials/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await extractErrorMessage(res, "Failed to update testimonial"));
  return res.json() as Promise<Testimonial>;
}

async function deleteTestimonial(id: number): Promise<void> {
  const res = await fetch(`/api/testimonials/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await extractErrorMessage(res, "Failed to delete testimonial"));
}

const emptyForm: TestimonialInput = {
  name: "",
  place: "",
  text: "",
  rating: 5,
  isActive: true,
  sortOrder: 0,
};

function StarRatingInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="cursor-pointer p-0.5"
          aria-label={`${n} star${n === 1 ? "" : "s"}`}
        >
          <Star className={`h-5 w-5 ${n <= value ? "text-amber-500 fill-current" : "text-slate-700"}`} />
        </button>
      ))}
    </div>
  );
}

function TestimonialFormDialog({
  open,
  onOpenChange,
  initial,
  onSubmit,
  isSubmitting,
  submitError,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: TestimonialInput;
  onSubmit: (input: TestimonialInput) => void;
  isSubmitting: boolean;
  submitError: string | null;
}) {
  // `key` on the parent's usage of this component (below) remounts it
  // fresh whenever the dialog opens or switches between add/edit, so this
  // initial state is always up to date without needing a sync effect.
  const [form, setForm] = useState<TestimonialInput>(initial);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-slate-900 border-slate-800/80 text-white rounded-2xl">
        <DialogHeader>
          <DialogTitle>{initial.name ? "Edit Testimonial" : "Add Testimonial"}</DialogTitle>
          <DialogDescription className="text-slate-400">
            This appears in the Testimonials carousel on the homepage.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(form);
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide mb-1.5 block">
                Reviewer name
              </label>
              <Input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Sarath Krishna"
                className="bg-slate-950 border-slate-800 text-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide mb-1.5 block">
                Trip / place
              </label>
              <Input
                required
                value={form.place}
                onChange={(e) => setForm((f) => ({ ...f, place: e.target.value }))}
                placeholder="e.g. Thailand Tour"
                className="bg-slate-950 border-slate-800 text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide mb-1.5 block">
              Review text
            </label>
            <Textarea
              required
              rows={6}
              value={form.text}
              onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
              placeholder="Paste the full review here..."
              className="bg-slate-950 border-slate-800 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 items-end">
            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide mb-1.5 block">
                Rating
              </label>
              <StarRatingInput value={form.rating} onChange={(rating) => setForm((f) => ({ ...f, rating }))} />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide mb-1.5 block">
                Display order
              </label>
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) || 0 }))}
                className="bg-slate-950 border-slate-800 text-white"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-700 bg-slate-900 accent-blue-600 cursor-pointer"
            />
            Show on the homepage
          </label>

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

function TestimonialRow({
  testimonial,
  onEdit,
  onToggleActive,
  onDelete,
  isToggling,
  isDeleting,
}: {
  testimonial: Testimonial;
  onEdit: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
  isToggling: boolean;
  isDeleting: boolean;
}) {
  return (
    <div className={`flex items-start gap-4 px-5 py-4 border-b border-slate-800/60 last:border-b-0 ${!testimonial.isActive ? "opacity-50" : ""}`}>
      <GripVertical className="h-4 w-4 text-slate-700 mt-1 shrink-0" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-bold text-white">{testimonial.name}</p>
          <span className="text-xs text-primary font-semibold uppercase tracking-wide">{testimonial.place}</span>
          <span className="flex items-center gap-0.5 text-amber-500">
            {[...Array(testimonial.rating)].map((_, i) => (
              <Star key={i} className="h-3 w-3 fill-current" />
            ))}
          </span>
        </div>
        <p className="text-sm text-slate-400 mt-1 line-clamp-2">{testimonial.text}</p>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={onToggleActive}
          disabled={isToggling}
          title={testimonial.isActive ? "Hide from homepage" : "Show on homepage"}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-200 hover:bg-slate-800/40 transition-all cursor-pointer disabled:opacity-50"
        >
          {testimonial.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
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

export default function TestimonialsTable() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: testimonials = [], isLoading, error } = useQuery({
    queryKey: ["testimonials"],
    queryFn: fetchTestimonials,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["testimonials"] });

  const createMutation = useMutation({
    mutationFn: createTestimonial,
    onSuccess: () => {
      invalidate();
      setDialogOpen(false);
    },
    onError: (err) => setFormError(err instanceof Error ? err.message : "Something went wrong"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: TestimonialInput }) => updateTestimonial(id, input),
    onSuccess: () => {
      invalidate();
      setDialogOpen(false);
    },
    onError: (err) => setFormError(err instanceof Error ? err.message : "Something went wrong"),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (t: Testimonial) =>
      updateTestimonial(t.id, {
        name: t.name,
        place: t.place,
        text: t.text,
        rating: t.rating,
        isActive: !t.isActive,
        sortOrder: t.sortOrder,
      }),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTestimonial,
    onSuccess: invalidate,
  });

  const editingTestimonial = testimonials.find((t) => t.id === editingId) ?? null;

  const initialForm: TestimonialInput = editingTestimonial
    ? {
        name: editingTestimonial.name,
        place: editingTestimonial.place,
        text: editingTestimonial.text,
        rating: editingTestimonial.rating,
        isActive: editingTestimonial.isActive,
        sortOrder: editingTestimonial.sortOrder,
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

  const handleSubmit = (input: TestimonialInput) => {
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
          <Plus className="h-4 w-4" /> Add Testimonial
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
            <h3 className="text-base font-bold text-slate-350">Failed to load testimonials</h3>
            <p className="text-xs text-slate-500 max-w-xs mt-1">
              {error instanceof Error ? error.message : "Something went wrong. Please try again."}
            </p>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-72 text-center p-6">
            <MessageSquareQuote className="h-12 w-12 text-slate-600 mb-3" />
            <h3 className="text-base font-bold text-slate-350">No Testimonials Yet</h3>
            <p className="text-xs text-slate-500 max-w-xs mt-1">
              Add a customer review to show it in the Testimonials carousel on the homepage.
            </p>
          </div>
        ) : (
          <div>
            {testimonials.map((t) => (
              <TestimonialRow
                key={t.id}
                testimonial={t}
                onEdit={() => openEditDialog(t.id)}
                onToggleActive={() => toggleActiveMutation.mutate(t)}
                onDelete={() => {
                  if (window.confirm(`Delete the testimonial from ${t.name}? This can't be undone.`)) {
                    deleteMutation.mutate(t.id);
                  }
                }}
                isToggling={toggleActiveMutation.isPending && toggleActiveMutation.variables?.id === t.id}
                isDeleting={deleteMutation.isPending && deleteMutation.variables === t.id}
              />
            ))}
          </div>
        )}
      </div>

      <TestimonialFormDialog
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
