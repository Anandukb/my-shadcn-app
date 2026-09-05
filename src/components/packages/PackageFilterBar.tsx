"use client";

import React, { useState } from "react";
import { Search, Filter, Globe, MapPin, Landmark, TreePalm, Castle, Mountain, Wind, Map, ChevronDown, Check, X, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

interface PackageFilterBarProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    selectedContinent: string;
    setSelectedContinent: (continent: string) => void;
    showFilterButton?: boolean;
}

const continentIcons: Record<string, typeof Globe> = {
    all: Globe,
    Asia: Landmark,
    Europe: Castle,
    Africa: TreePalm,
    "North America": Wind,
    "South America": Mountain,
    Oceania: Map,
};
const continentIds = ["all", "Asia", "Europe", "Africa", "North America", "South America", "Oceania"];

export function PackageFilterBar({
    searchQuery,
    setSearchQuery,
    selectedContinent,
    setSelectedContinent,
    showFilterButton = true
}: PackageFilterBarProps) {
    const t = useTranslations();
    const [popoverOpen, setPopoverOpen] = useState(false);

    // Get selected continent label
    const selectedLabel = t(`packageFilterBar.continents.${selectedContinent in continentIcons ? selectedContinent : "all"}.label`);
    const SelectedIcon = continentIcons[selectedContinent] || Globe;

    return (
        <div className="w-full max-w-4xl mx-auto px-4 md:px-0">
            {/* Unified Luxury Multi-Segment Booking Engine Bar */}
            <div className="w-full bg-black/45 dark:bg-black/75 backdrop-blur-3xl border border-white/15 p-2 rounded-3xl md:rounded-full shadow-[0_30px_70px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-stretch gap-2 md:gap-0 relative z-40 animate-in fade-in slide-in-from-bottom-8 duration-1000">

                {/* Segment 1: Destination Search */}
                <div className="w-full md:w-5/12 px-6 py-2.5 flex flex-col items-start gap-1 justify-center border-b md:border-b-0 md:border-r border-white/10 hover:bg-white/5 rounded-2xl md:rounded-l-full md:rounded-r-none transition-colors group">
                    <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-emerald-400 flex items-center gap-1.5 leading-none">
                        <MapPin className="h-3 w-3 text-emerald-400" />
                        <span>{t('packageFilterBar.whereTo')}</span>
                    </span>
                    <div className="w-full relative flex items-center">
                        <Input
                            placeholder={t('packageFilterBar.searchPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-8 p-0 bg-transparent border-0 text-white placeholder:text-white/45 focus-visible:ring-0 focus-visible:ring-offset-0 text-base font-semibold shadow-none rounded-none outline-none leading-normal"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-0 p-1 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Segment 2: Region Dropdown/Popover */}
                <div className="w-full md:w-4/12 border-b md:border-b-0 md:border-r border-white/10 hover:bg-white/5 rounded-2xl md:rounded-none transition-colors">
                    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                        <PopoverTrigger asChild>
                            <button className="w-full h-full px-6 py-2.5 flex flex-col items-start gap-1 justify-center text-left select-none outline-none">
                                <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-emerald-400 flex items-center gap-1.5 leading-none">
                                    <Globe className="h-3 w-3 text-emerald-400 animate-pulse" />
                                    <span>{t('packageFilterBar.continent')}</span>
                                </span>
                                <div className="w-full flex items-center justify-between text-white mt-0.5">
                                    <div className="flex items-center gap-2 font-semibold text-base truncate">
                                        <SelectedIcon className="h-4 w-4 text-emerald-400 shrink-0" />
                                        <span className="truncate">{selectedLabel}</span>
                                    </div>
                                    <ChevronDown className="h-4 w-4 text-white/50 shrink-0 group-hover:text-white transition-colors" />
                                </div>
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 bg-slate-950/95 border border-white/15 p-2 rounded-3xl shadow-2xl backdrop-blur-3xl z-50 mt-2">
                            <div className="space-y-1 max-h-[300px] overflow-y-auto no-scrollbar">
                                <p className="text-[10px] uppercase tracking-[0.2em] font-black text-white/40 px-3 py-1.5">{t('packageFilterBar.selectRegion')}</p>
                                {continentIds.map((continentId) => {
                                    const isSelected = selectedContinent === continentId;
                                    const Icon = continentIcons[continentId];
                                    return (
                                        <button
                                            key={continentId}
                                            onClick={() => {
                                                setSelectedContinent(continentId);
                                                setPopoverOpen(false);
                                            }}
                                            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-left transition-all duration-200 ${isSelected
                                                ? "bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold"
                                                : "text-white/80 hover:bg-white/5 hover:text-white"
                                                }`}
                                        >
                                            <div className={`p-2 rounded-xl shrink-0 ${isSelected ? "bg-white/15" : "bg-white/5 text-emerald-400"}`}>
                                                <Icon className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold truncate leading-tight">{t(`packageFilterBar.continents.${continentId}.label`)}</p>
                                                <p className={`text-[10px] truncate mt-0.5 ${isSelected ? "text-emerald-100/70" : "text-white/40"}`}>
                                                    {t(`packageFilterBar.continents.${continentId}.desc`)}
                                                </p>
                                            </div>
                                            {isSelected && (
                                                <Check className="h-4 w-4 text-white shrink-0" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Segment 3: Actions Column (Filters & Glowing Explore Button) */}
                <div className="w-full md:w-3/12 pl-6 pr-2 py-2 flex items-center justify-between gap-4">
                    {/* Filters trigger icon */}
                    {/* {showFilterButton ? (
                        <button className="h-10 w-10 shrink-0 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 group shadow-md">
                            <Filter className="h-4 w-4 text-white/70 group-hover:text-white group-hover:rotate-180 transition-all duration-500" />
                        </button>
                    ) : (
                        <div />
                    )} */}

                    {/* Highly intense glowing Search pill button */}
                    <button className="flex-1 md:flex-initial h-12 px-6 rounded-2xl md:rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-slate-950 font-black text-sm uppercase tracking-[0.15em] flex items-center justify-center gap-2 hover:scale-[1.03] active:scale-95 transition-all duration-300 shadow-[0_4px_20px_rgba(16,185,129,0.4)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.6)] cursor-pointer group">
                        <Sparkles className="h-4 w-4 text-slate-900 animate-pulse" />
                        <span>{t('packageFilterBar.explore')}</span>
                    </button>
                </div>

            </div>
        </div>
    );
}
