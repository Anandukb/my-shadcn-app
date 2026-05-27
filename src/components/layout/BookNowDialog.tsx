"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Check, Mail, MapPin, Phone, Send, Users } from "lucide-react";

// -----------------------------------------------------------------------------
// Public API
// -----------------------------------------------------------------------------
export type BookNowInitialData = {
  packageId?: number | string;
  packageTitle?: string;
  destination?: string;
  travelDate?: string;
};

type BookNowContextValue = {
  open: (initial?: BookNowInitialData) => void;
  close: () => void;
};

const BookNowContext = createContext<BookNowContextValue | null>(null);

export function useBookNow() {
  const ctx = useContext(BookNowContext);
  if (!ctx) throw new Error("useBookNow must be used inside <BookNowProvider>");
  return ctx;
}

// -----------------------------------------------------------------------------
// Provider — keeps dialog state out of the page tree so opens/closes don't
// rerender the rest of the app. The context value is stable across renders.
// -----------------------------------------------------------------------------
export function BookNowProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [initial, setInitial] = useState<BookNowInitialData | undefined>(undefined);

  const open = useCallback((data?: BookNowInitialData) => {
    setInitial(data);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo<BookNowContextValue>(() => ({ open, close }), [open, close]);

  return (
    <BookNowContext.Provider value={value}>
      {children}
      <BookNowDialog open={isOpen} onOpenChange={setIsOpen} initial={initial} />
    </BookNowContext.Provider>
  );
}

// -----------------------------------------------------------------------------
// The dialog itself
// -----------------------------------------------------------------------------
type FormState = {
  name: string;
  phone: string;
  email: string;
  destination: string;
  travelDate: string;
  travelers: string;
  message: string;
};

const emptyForm: FormState = {
  name: "",
  phone: "",
  email: "",
  destination: "",
  travelDate: "",
  travelers: "",
  message: "",
};

function BookNowDialog({
  open,
  onOpenChange,
  initial,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: BookNowInitialData;
}) {
  const t = useTranslations("bookNow");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Re-seed the form whenever the dialog opens with new initial data
  useEffect(() => {
    if (!open) return;
    setForm({
      ...emptyForm,
      destination: initial?.destination ?? initial?.packageTitle ?? "",
      travelDate: initial?.travelDate ?? "",
    });
    setIsSubmitted(false);
  }, [open, initial]);

  const update = useCallback(
    (key: keyof FormState) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((prev) => ({ ...prev, [key]: e.target.value })),
    []
  );

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // TODO: hook into your real booking endpoint
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
  }, []);

  const title = initial?.packageTitle
    ? t("titleWithPackage", { name: initial.packageTitle })
    : t("title");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl">
        {isSubmitted ? (
          <div className="text-center py-6">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Check className="w-10 h-10 text-white" />
            </div>
            <DialogHeader className="text-center sm:text-center">
              <DialogTitle className="text-2xl md:text-3xl font-black mb-2">
                {t("successTitle")}
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground leading-relaxed">
                {t("successDesc")}
              </DialogDescription>
            </DialogHeader>
            <Button
              onClick={() => onOpenChange(false)}
              className="mt-6 w-full h-12 bg-primary hover:bg-primary/90 font-bold cursor-pointer"
            >
              {t("close")}
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl md:text-3xl font-black">{title}</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {t("subtitle")}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 text-left mt-2">
              <div>
                <label className="text-sm font-bold mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  {t("fullName")}
                </label>
                <Input
                  type="text"
                  value={form.name}
                  onChange={update("name")}
                  placeholder={t("fullNamePlaceholder")}
                  required
                  className="h-12 border-2 focus:border-primary"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary" />
                    {t("phone")}
                  </label>
                  <Input
                    type="tel"
                    value={form.phone}
                    onChange={update("phone")}
                    placeholder="+974 5555 5555"
                    required
                    className="h-12 border-2 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    {t("email")}{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      {t("optional")}
                    </span>
                  </label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={update("email")}
                    placeholder="you@example.com"
                    className="h-12 border-2 focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    {t("destination")}
                  </label>
                  <Input
                    type="text"
                    value={form.destination}
                    onChange={update("destination")}
                    placeholder={t("destinationPlaceholder")}
                    required
                    className="h-12 border-2 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    {t("travelDate")}
                  </label>
                  <Input
                    type="date"
                    value={form.travelDate}
                    onChange={update("travelDate")}
                    className="h-12 border-2 focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-bold mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  {t("travelers")}
                </label>
                <Input
                  type="number"
                  min={1}
                  value={form.travelers}
                  onChange={update("travelers")}
                  placeholder="2"
                  className="h-12 border-2 focus:border-primary"
                />
              </div>

              <div>
                <label className="text-sm font-bold mb-2 block">
                  {t("message")}{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    {t("optional")}
                  </span>
                </label>
                <Textarea
                  value={form.message}
                  onChange={update("message")}
                  placeholder={t("messagePlaceholder")}
                  rows={3}
                  className="border-2 focus:border-primary resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 bg-primary hover:bg-primary/90 font-bold text-lg shadow-lg cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {t("submitting")}
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    {t("submit")}
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center pt-1">
                {t("disclaimer")}
              </p>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
