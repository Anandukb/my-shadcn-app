import React from "react";
import { Search, Filter, Globe, Landmark, TreePalm, Castle, Mountain, Wind, Map } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PackageFilterBarProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    selectedContinent: string;
    setSelectedContinent: (continent: string) => void;
    showFilterButton?: boolean;
}

const continents = [
    { id: "all", label: "All Regions", icon: Globe },
    { id: "Asia", label: "Asia", icon: Landmark },
    { id: "Europe", label: "Europe", icon: Castle },
    { id: "Africa", label: "Africa", icon: TreePalm },
    { id: "North America", label: "North America", icon: Wind },
    { id: "South America", label: "South America", icon: Mountain },
    { id: "Oceania", label: "Oceania", icon: Map }
];

export function PackageFilterBar({
    searchQuery,
    setSearchQuery,
    selectedContinent,
    setSelectedContinent,
    showFilterButton = true
}: PackageFilterBarProps) {
    return (
        <div className="w-full max-w-6xl bg-black/30 dark:bg-black/60 backdrop-blur-2xl border border-white/20 dark:border-white/10 p-4 md:p-6 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 mx-auto">
            <div className="flex flex-col md:flex-row gap-4 items-center w-full">
                {/* Search */}
                <div className="w-full flex-1 relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-white/90 group-focus-within:text-white transition-colors" />
                    <Input
                        placeholder="Search destinations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-14 pl-14 pr-6 bg-white/10 dark:bg-white/5 border-white/10 text-white placeholder:text-white/70 focus-visible:ring-1 focus-visible:ring-white/30 focus-visible:ring-offset-0 text-lg rounded-2xl md:rounded-full transition-all"
                    />
                </div>

                {/* Filter Button */}
                {showFilterButton && (
                    <Button
                        variant="ghost"
                        className="h-14 px-8 rounded-2xl md:rounded-full bg-black/40 text-white hover:bg-black/60 border border-white/10 font-bold transition-all duration-300 shadow-sm w-full md:w-auto shrink-0"
                    >
                        <Filter className="h-5 w-5 mr-3" />
                        Filters
                    </Button>
                )}
            </div>

            {/* Row 2: Region Filters */}
            <div className="pt-2 border-t border-white/10 mt-4">
                <div className="flex gap-2 overflow-x-auto p-1 no-scrollbar items-center justify-start xl:justify-center">
                    <span className="text-[10px] uppercase tracking-widest text-white/60 font-black mr-4 hidden md:block drop-shadow-md">Region:</span>
                    {continents.map((continent) => {
                        const isSelected = selectedContinent === continent.id;
                        const Icon = continent.icon;
                        return (
                            <Button
                                key={continent.id}
                                variant="ghost"
                                onClick={() => setSelectedContinent(continent.id)}
                                className={`h-11 px-6 rounded-full whitespace-nowrap transition-all duration-300 shadow-sm ${isSelected
                                    ? "bg-primary text-white hover:bg-primary/90 shadow-lg font-bold scale-105"
                                    : "bg-black/40 text-white hover:bg-black/60 border border-white/10 font-medium"
                                    }`}
                            >
                                <Icon className="h-4 w-4 mr-2 shadow-sm" />
                                <span className="text-sm shadow-sm">{continent.label}</span>
                            </Button>
                        )
                    })}
                </div>
            </div>
        </div>
    );
}
