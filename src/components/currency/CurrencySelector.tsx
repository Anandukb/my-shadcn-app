"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CURRENCIES } from "@/lib/currency/currencies";
import { cn } from "@/lib/utils";
import { useCurrency } from "./CurrencyProvider";

/** Header dropdown: switches every price on the site to the chosen currency. */
export function CurrencySelector({ className, align = "end" }: { className?: string; align?: "start" | "center" | "end" }) {
  const t = useTranslations("currency");
  const { currency, setCurrency, isConverted } = useCurrency();
  const [open, setOpen] = useState(false);
  const active = CURRENCIES.find((c) => c.code === currency) ?? CURRENCIES[0];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={t("label")}
          className={cn(
            "shrink-0 inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-full border px-3 text-xs font-black uppercase leading-none tracking-wider transition-colors duration-300",
            className,
          )}
        >
          <span className="tabular-nums">{active.code}</span>
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
        </button>
      </PopoverTrigger>
      <PopoverContent align={align} className="w-72 rounded-2xl p-2">
        <p className="px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{t("label")}</p>
        <ul className="max-h-72 space-y-0.5 overflow-y-auto">
          {CURRENCIES.map((c) => (
            <li key={c.code}>
              <button
                type="button"
                onClick={() => {
                  setCurrency(c.code);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-start text-sm transition-colors hover:bg-primary/10",
                  c.code === currency && "bg-primary/10 font-semibold text-primary",
                )}
              >
                <span className="w-10 shrink-0 font-bold tabular-nums">{c.code}</span>
                <span className="flex-1 truncate text-muted-foreground">{c.name}</span>
                {c.code === currency && <Check className="h-4 w-4 shrink-0" />}
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-1 border-t px-3 pb-2 pt-2.5 text-[11px] leading-snug text-muted-foreground">
          {isConverted ? t("noteConverted") : t("noteBase")}
        </p>
      </PopoverContent>
    </Popover>
  );
}
