"use client";

import { useState } from "react";
import { Search, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export interface FilterState {
    search: string;
    location: string;
    niches: string[];
    followersRange: number[]; // [min, max]
    priceRange: number[]; // [min, max]
}

interface MarketplaceSidebarProps {
    filters: FilterState;
    setFilters: (filters: FilterState) => void;
    onApply: () => void;
    onReset: () => void;
    className?: string;
}

const NICHES = [
    "Fashion & Health",
    "Tech & Gadgets",
    "Fashion",
    "Music",
    "Travel",
    "Food",
    "Lifestyle",
    "Gaming",
    "Fitness",
    "Beauty",
    "Photography",
    "Art & Design",
    "Business",
    "Education",
    "Family",
    "Animals"
];

const LOCATIONS = [
    "India",
    "United States",
    "United Kingdom",
    "Canada",
    "Australia",
    "Germany",
    "France",
    "Japan",
    "Mumbai",
    "Delhi",
    "Bangalore",
    "New York",
    "London",
    "Toronto"
];

export function MarketplaceSidebar({
    filters,
    setFilters,
    onApply,
    onReset,
    className
}: MarketplaceSidebarProps) {
    const [showAllNiches, setShowAllNiches] = useState(false);

    const handleNicheChange = (niche: string, checked: boolean) => {
        const currentNiches = [...filters.niches];
        if (checked) {
            setFilters({ ...filters, niches: [...currentNiches, niche] });
        } else {
            setFilters({
                ...filters,
                niches: currentNiches.filter((n) => n !== niche),
            });
        }
    };

    const toggleShowMore = () => setShowAllNiches(!showAllNiches);

    const displayedNiches = showAllNiches ? NICHES : NICHES.slice(0, 4);

    return (
        <div className={`w-full lg:w-72 flex-shrink-0 space-y-8 p-1 ${className || ''}`}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Refine Search</h2>
                <button
                    onClick={onReset}
                    className="text-sm font-medium text-teal-600 hover:text-teal-700"
                >
                    Reset
                </button>
            </div>

            {/* Search */}
            <div className="space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search by name..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        className="pl-9 bg-white"
                    />
                </div>
            </div>

            {/* Location */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-700 font-medium">
                    <MapPin className="w-4 h-4" />
                    Location
                </div>
                <Select
                    value={filters.location}
                    onValueChange={(value) => setFilters({ ...filters, location: value })}
                >
                    <SelectTrigger className="w-full bg-white">
                        <SelectValue placeholder="Select Location" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Locations</SelectItem>
                        {LOCATIONS.map((loc) => (
                            <SelectItem key={loc} value={loc}>
                                {loc}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Niche & Category */}
            <div className="space-y-3">
                <div className="font-medium text-gray-700">Niche & Category</div>
                <div className="space-y-2">
                    {displayedNiches.map((niche) => (
                        <div key={niche} className="flex items-center space-x-2">
                            <Checkbox
                                id={`niche-${niche}`}
                                checked={filters.niches.includes(niche)}
                                onCheckedChange={(checked) =>
                                    handleNicheChange(niche, checked as boolean)
                                }
                                className="border-gray-300 data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
                            />
                            <Label
                                htmlFor={`niche-${niche}`}
                                className="text-sm text-gray-600 cursor-pointer select-none leading-none font-normal"
                            >
                                {niche}
                            </Label>
                        </div>
                    ))}
                    <button
                        onClick={toggleShowMore}
                        className="text-sm font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1 mt-2"
                    >
                        {showAllNiches ? (
                            <>
                                - Show less <ChevronUp className="w-3 h-3" />
                            </>
                        ) : (
                            <>
                                + Show {NICHES.length - 4} more
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Followers Filter */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="font-medium text-gray-700">Followers</div>
                    <div className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                        {filters.followersRange[0] === 0 ? '0k' : `${filters.followersRange[0] / 1000}k`} - {filters.followersRange[1] >= 1000000 ? '1M+' : `${filters.followersRange[1] / 1000}k`}
                    </div>
                </div>
                <Slider
                    defaultValue={[0, 1000000]}
                    value={filters.followersRange}
                    max={1000000}
                    step={1000}
                    onValueChange={(val) => setFilters({ ...filters, followersRange: val })}
                    className="py-4"
                />
                <div className="flex justify-between text-xs text-gray-400 px-1 font-medium">
                    <span>0k</span>
                    <span>1M+</span>
                </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="font-medium text-gray-700">Price per Post</div>
                    <div className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                        ₹{filters.priceRange[0]} - ₹{filters.priceRange[1] >= 5000 ? '5k+' : filters.priceRange[1]}
                    </div>
                </div>
                <Slider
                    defaultValue={[50, 5000]}
                    value={filters.priceRange}
                    min={50}
                    max={5000}
                    step={50}
                    onValueChange={(val) => setFilters({ ...filters, priceRange: val })}
                    className="py-4"
                />
                <div className="flex justify-between text-xs text-gray-400 px-1 font-medium">
                    <span>₹50</span>
                    <span>₹5k+</span>
                </div>
            </div>

            <Button
                onClick={onApply}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-6 rounded-xl shadow-lg shadow-teal-600/20 transition-all hover:scale-[1.02]"
            >
                Apply Filters
            </Button>
        </div>
    );
}
