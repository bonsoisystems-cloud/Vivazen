"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
    ArrowRight, 
    ChevronDown, 
    IndianRupee, 
    Check, 
    Calendar, 
    Sparkles, 
    X, 
    Search,
    ShoppingBag,
    Trash2,
    CheckCircle2,
    Layers,
    ChevronUp
} from "lucide-react";

export interface ServiceSubItem {
    id?: string;
    name: string;
    price: number;
    description?: string;
}

export interface ServiceSubCategory {
    id?: string;
    name: string;
    items: ServiceSubItem[];
}

export interface ServiceCategoryItem {
    id?: string;
    slug: string;
    name: string;
    icon: string;
    desc: string;
    gradient: string;
    subcategories: ServiceSubCategory[];
}

export interface SelectedServiceItem {
    id: string; // `${categorySlug}-${subName}-${itemName}`
    categorySlug: string;
    categoryName: string;
    subName: string;
    itemName: string;
    price: number;
}

function mapServiceCategory(cat: any): ServiceCategoryItem {
    return {
        id: cat.id,
        slug: cat.slug,
        name: cat.name,
        icon: cat.icon,
        desc: cat.desc,
        gradient: cat.gradient,
        subcategories: (cat.subcategories || []).map((sub: any) => ({
            id: sub.id,
            name: sub.name,
            items: (sub.items || []).map((item: any) => ({
                id: item.id,
                name: item.name,
                price: Number(item.price),
                description: item.description || item.desc,
            })),
        })),
    };
}

interface ServicesClientViewProps {
    initialServices?: any[];
}

export default function ServicesClientView({ initialServices }: ServicesClientViewProps) {
    const router = useRouter();
    const [servicesList, setServicesList] = useState<ServiceCategoryItem[]>(() =>
        initialServices && initialServices.length > 0 ? initialServices.map(mapServiceCategory) : []
    );
    const [loading, setLoading] = useState(() => !initialServices || initialServices.length === 0);
    
    // Categories are MINIMIZED / COLLAPSED by default
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
    const [openSubSections, setOpenSubSections] = useState<Record<string, boolean>>({});
    
    // Cross-Category Multi-Service Selection
    const [selectedItems, setSelectedItems] = useState<SelectedServiceItem[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    useEffect(() => {
        if (servicesList.length > 0) {
            setLoading(false);
            return;
        }

        async function fetchServices() {
            try {
                const res = await fetch("/api/services");
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && Array.isArray(data.data)) {
                        setServicesList(data.data.map(mapServiceCategory));
                    }
                }
            } catch (err) {
                console.error("Error fetching services:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchServices();
    }, [servicesList.length]);

    // Auto-expand and scroll to category when arriving with ?cat=slug or #slug
    useEffect(() => {
        if (typeof window !== "undefined") {
            const searchParams = new URLSearchParams(window.location.search);
            const hash = window.location.hash.replace("#", "").trim().toLowerCase();
            const targetCat = searchParams.get("cat") || searchParams.get("category") || hash;

            if (targetCat) {
                setExpandedCategories((prev) => ({ ...prev, [targetCat]: true }));
                setTimeout(() => {
                    const el = document.getElementById(targetCat);
                    if (el) {
                        el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                }, 350);
            }
        }
    }, [servicesList]);

    const toggleCategory = (slug: string) => {
        setExpandedCategories((prev) => ({ ...prev, [slug]: !prev[slug] }));
    };

    const toggleSubSection = (key: string) => {
        setOpenSubSections((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const toggleAllCategories = () => {
        const allExpanded = servicesList.every(s => expandedCategories[s.slug]);
        const newState: Record<string, boolean> = {};
        servicesList.forEach(s => {
            newState[s.slug] = !allExpanded;
        });
        setExpandedCategories(newState);
    };

    // Toggle specific item
    const toggleSelectItem = (category: ServiceCategoryItem, subName: string, item: ServiceSubItem, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        const itemId = `${category.slug}-${subName}-${item.name}`.toLowerCase();
        setSelectedItems((prev) => {
            const exists = prev.some((i) => i.id === itemId);
            if (exists) {
                return prev.filter((i) => i.id !== itemId);
            } else {
                return [
                    ...prev,
                    {
                        id: itemId,
                        categorySlug: category.slug,
                        categoryName: category.name,
                        subName,
                        itemName: item.name,
                        price: item.price,
                    },
                ];
            }
        });
    };

    // Toggle entire subcategory
    const toggleSelectSubCategory = (category: ServiceCategoryItem, sub: ServiceSubCategory, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        const subItemIds = sub.items.map(i => `${category.slug}-${sub.name}-${i.name}`.toLowerCase());
        const allSelected = subItemIds.every(id => selectedItems.some(item => item.id === id));

        if (allSelected) {
            setSelectedItems(prev => prev.filter(i => !subItemIds.includes(i.id)));
        } else {
            const newItems: SelectedServiceItem[] = sub.items.map(i => ({
                id: `${category.slug}-${sub.name}-${i.name}`.toLowerCase(),
                categorySlug: category.slug,
                categoryName: category.name,
                subName: sub.name,
                itemName: i.name,
                price: i.price,
            }));
            setSelectedItems(prev => {
                const filtered = prev.filter(i => !subItemIds.includes(i.id));
                return [...filtered, ...newItems];
            });
        }
    };

    const isItemChecked = (categorySlug: string, subName: string, itemName: string) => {
        const id = `${categorySlug}-${subName}-${itemName}`.toLowerCase();
        return selectedItems.some((i) => i.id === id);
    };

    const isSubCategoryFullyChecked = (categorySlug: string, sub: ServiceSubCategory) => {
        if (!sub.items || sub.items.length === 0) return false;
        return sub.items.every(item => isItemChecked(categorySlug, sub.name, item.name));
    };

    const isSubCategoryPartiallyChecked = (categorySlug: string, sub: ServiceSubCategory) => {
        if (!sub.items || sub.items.length === 0) return false;
        const some = sub.items.some(item => isItemChecked(categorySlug, sub.name, item.name));
        return some && !isSubCategoryFullyChecked(categorySlug, sub);
    };

    const removeItemById = (id: string) => {
        setSelectedItems(prev => prev.filter(i => i.id !== id));
    };

    const clearAllSelections = () => {
        setSelectedItems([]);
        setIsDrawerOpen(false);
    };

    const totalPrice = useMemo(() => {
        return selectedItems.reduce((acc, item) => acc + (item.price || 0), 0);
    }, [selectedItems]);

    // Group selected items by category for summary display
    const selectedGroupedByCategory = useMemo(() => {
        const groups: Record<string, SelectedServiceItem[]> = {};
        selectedItems.forEach(item => {
            if (!groups[item.categoryName]) {
                groups[item.categoryName] = [];
            }
            groups[item.categoryName].push(item);
        });
        return groups;
    }, [selectedItems]);

    // Search filtering - if user types a search, auto-expand matching categories
    const filteredServices = useMemo(() => {
        let list = servicesList;
        if (!searchQuery.trim()) return list;

        const q = searchQuery.toLowerCase().trim();
        return list.map(svc => {
            const matchesCat = svc.name.toLowerCase().includes(q) || svc.desc.toLowerCase().includes(q);
            const filteredSubs = svc.subcategories.map(sub => {
                const matchesSub = sub.name.toLowerCase().includes(q);
                const filteredItems = sub.items.filter(item => 
                    item.name.toLowerCase().includes(q) || (item.description && item.description.toLowerCase().includes(q))
                );
                if (matchesSub || filteredItems.length > 0) {
                    return { ...sub, items: matchesSub ? sub.items : filteredItems };
                }
                return null;
            }).filter(Boolean) as ServiceSubCategory[];

            if (matchesCat || filteredSubs.length > 0) {
                return {
                    ...svc,
                    subcategories: filteredSubs.length > 0 ? filteredSubs : svc.subcategories,
                };
            }
            return null;
        }).filter(Boolean) as ServiceCategoryItem[];
    }, [servicesList, searchQuery]);

    const handleBookAllSelected = () => {
        if (selectedItems.length === 0) return;
        try {
            sessionStorage.setItem("vivazen_selected_services", JSON.stringify(selectedItems));
        } catch (e) {
            console.error("sessionStorage error:", e);
        }
        router.push("/contact");
    };

    const isAllCategoriesExpanded = servicesList.length > 0 && servicesList.every(s => expandedCategories[s.slug]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-rose-50/20 to-white relative overflow-hidden pb-36">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-1/4 w-[750px] h-[500px] bg-rose-100/20 rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute top-1/2 right-0 w-[650px] h-[600px] bg-amber-100/15 rounded-full blur-[150px] pointer-events-none" />

            {/* Hero Header */}
            <section className="pt-28 pb-6 px-6 text-center relative z-10">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <div className="h-[1px] w-10 bg-gradient-to-r from-transparent to-rose-400/60" />
                        <span className="text-rose-600 text-[10px] sm:text-[11px] tracking-[0.35em] uppercase font-semibold">
                            Haute Salon Menu
                        </span>
                        <div className="h-[1px] w-10 bg-gradient-to-l from-transparent to-rose-400/60" />
                    </div>
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold tracking-tight text-gray-900 mb-3">
                        Our Signature Services
                    </h1>
                    <p className="text-gray-500 max-w-xl mx-auto text-sm sm:text-base font-light leading-relaxed">
                        Explore each category below. Tap any service to customize your multi-treatment salon experience.
                    </p>
                    <div className="mt-4 flex justify-center">
                        <div className="h-[2px] w-12 bg-gradient-to-r from-rose-400 to-amber-400 rounded-full" />
                    </div>
                </motion.div>
            </section>

            {/* Sticky Search Bar (Only Search on top as requested) */}
            <div className="sticky top-20 z-30 max-w-5xl mx-auto px-4 sm:px-6 mb-8">
                <div className="bg-white/95 backdrop-blur-2xl rounded-2xl p-2.5 sm:p-3 border border-gray-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] ring-1 ring-black/[0.02] flex items-center gap-2.5">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search any ritual (e.g. Keratin, Hydra Facial, Balayage, Gel Nails, Bridal)..."
                            className="w-full pl-10 pr-10 py-2.5 bg-gray-50/80 border border-gray-200/70 rounded-xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Expand/Collapse All Toggle Button */}
                    <button
                        type="button"
                        onClick={toggleAllCategories}
                        className="press-tactile flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100/80 text-rose-700 border border-rose-200/70 text-xs font-semibold transition-colors"
                        title={isAllCategoriesExpanded ? "Collapse All Categories" : "Expand All Categories"}
                    >
                        <Layers className="w-3.5 h-3.5 text-rose-600" />
                        <span className="hidden sm:inline">{isAllCategoriesExpanded ? "Collapse All" : "Expand All"}</span>
                    </button>
                </div>
            </div>

            {/* Collapsed Categories Directory Listing */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 space-y-4">
                {loading ? (
                    <div className="space-y-4">
                        {Array.from({ length: 6 }).map((_, idx) => (
                            <div key={idx} className="h-24 rounded-2xl bg-gray-100 animate-pulse border border-gray-200/50" />
                        ))}
                    </div>
                ) : filteredServices.length === 0 ? (
                    <div className="text-center py-16 bg-white/80 backdrop-blur-md rounded-2xl border border-dashed border-gray-200 p-8">
                        <p className="text-gray-500 font-serif text-lg">No services found matching "{searchQuery}".</p>
                        <button
                            onClick={() => setSearchQuery("")}
                            className="mt-3 px-5 py-2 bg-gradient-to-r from-rose-500 to-amber-500 text-white text-xs font-semibold rounded-xl press-tactile"
                        >
                            Clear Search
                        </button>
                    </div>
                ) : (
                    filteredServices.map((svc, idx) => {
                        const isExpanded = searchQuery.trim() !== "" || !!expandedCategories[svc.slug];
                        const selectedInCat = selectedItems.filter(i => i.categorySlug === svc.slug);
                        const totalSubCount = svc.subcategories.length;
                        const totalRitualsCount = svc.subcategories.reduce((acc, s) => acc + s.items.length, 0);
                        
                        // Calculate price range in this category
                        const allPrices = svc.subcategories.flatMap(s => s.items.map(i => i.price)).filter(p => p > 0);
                        const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0;
                        const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : 0;

                        return (
                            <div
                                key={svc.id || svc.slug || idx}
                                id={svc.slug}
                                className="scroll-mt-32 rounded-2xl border border-gray-200/80 bg-white/95 backdrop-blur-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-rose-300/70 hover:shadow-[0_8px_24px_rgba(244,63,94,0.06)] transition-all duration-300 overflow-hidden ring-1 ring-black/[0.02]"
                            >
                                {/* Category Collapsed / Minimized Header Card */}
                                <div
                                    onClick={() => toggleCategory(svc.slug)}
                                    className={`w-full p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer transition-colors select-none ${
                                        isExpanded ? "bg-rose-50/30 border-b border-gray-100" : "hover:bg-gray-50/50"
                                    }`}
                                >
                                    {/* Icon and Title */}
                                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-50 to-amber-50 border border-rose-200/60 flex items-center justify-center flex-shrink-0 p-2 relative shadow-xs">
                                            <Image src={svc.icon} alt={svc.name} fill className="object-contain p-2" />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h2 className="text-lg sm:text-xl font-serif font-bold text-gray-900 truncate">
                                                    {svc.name}
                                                </h2>

                                                {selectedInCat.length > 0 && (
                                                    <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-300/80 text-rose-700 font-bold shadow-2xs">
                                                        <Check className="w-3 h-3 text-rose-600 stroke-[3]" />
                                                        <span>{selectedInCat.length} chosen</span>
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-gray-500 text-xs font-light truncate mt-0.5">
                                                {svc.desc}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Right Meta & Chevron */}
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <div className="text-right hidden sm:block">
                                            <span className="text-[11px] text-gray-400 font-mono block">
                                                {totalRitualsCount} Rituals • {totalSubCount} Categories
                                            </span>
                                            {minPrice > 0 && (
                                                <span className="text-xs font-semibold text-gray-800 font-mono tabular-nums">
                                                    ₹{minPrice.toLocaleString("en-IN")} – ₹{maxPrice.toLocaleString("en-IN")}
                                                </span>
                                            )}
                                        </div>

                                        <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 transition-transform duration-300 ${
                                            isExpanded ? "rotate-180 bg-rose-50 text-rose-700" : ""
                                        }`}>
                                            <ChevronDown className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Content (Subcategories & Treatments) */}
                                <AnimatePresence initial={false}>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-4 sm:p-6 space-y-4 bg-gray-50/30">
                                                {svc.subcategories.map((sub) => {
                                                    const subKey = `${svc.slug}-${sub.name}`;
                                                    const isSubOpen = openSubSections[subKey] !== false; // default open inside expanded category
                                                    const isFullyChecked = isSubCategoryFullyChecked(svc.slug, sub);
                                                    const isPartiallyChecked = isSubCategoryPartiallyChecked(svc.slug, sub);
                                                    const selectedSubCount = sub.items.filter(i => isItemChecked(svc.slug, sub.name, i.name)).length;
                                                    const subMinPrice = sub.items.length > 0 ? Math.min(...sub.items.map((i) => i.price)) : 0;
                                                    const subMaxPrice = sub.items.length > 0 ? Math.max(...sub.items.map((i) => i.price)) : 0;

                                                    return (
                                                        <div
                                                            key={sub.id || subKey}
                                                            className="rounded-xl border border-gray-200/80 bg-white overflow-hidden shadow-xs"
                                                        >
                                                            {/* Subcategory Header */}
                                                            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-rose-50/40 to-amber-50/20 border-b border-gray-100">
                                                                <div
                                                                    onClick={(e) => toggleSelectSubCategory(svc, sub, e)}
                                                                    className="flex items-center gap-2.5 flex-1 cursor-pointer"
                                                                >
                                                                    {/* Checkbox button */}
                                                                    <div
                                                                        className={`w-4 h-4 rounded-md flex items-center justify-center transition-colors flex-shrink-0 ${
                                                                            isFullyChecked
                                                                                ? "bg-gradient-to-br from-rose-500 to-amber-500 text-white shadow-2xs"
                                                                                : isPartiallyChecked
                                                                                ? "bg-rose-400 text-white"
                                                                                : "border border-gray-300 bg-white"
                                                                        }`}
                                                                        title={isFullyChecked ? "Deselect subcategory" : "Select all in subcategory"}
                                                                    >
                                                                        {isFullyChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                                                        {isPartiallyChecked && <span className="w-2 h-0.5 bg-white rounded-full" />}
                                                                    </div>

                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                        <span className="text-xs sm:text-sm font-semibold text-gray-800">
                                                                            {sub.name}
                                                                        </span>
                                                                        <span className="text-[10px] text-gray-400 font-mono bg-white px-2 py-0.5 rounded-full border border-gray-200/60">
                                                                            {sub.items.length} {sub.items.length === 1 ? "ritual" : "rituals"}
                                                                        </span>
                                                                        {selectedSubCount > 0 && (
                                                                            <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/60">
                                                                                {selectedSubCount} selected
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center gap-3">
                                                                    {sub.items.length > 0 && (
                                                                        <span className="text-xs text-gray-400 font-mono tabular-nums hidden sm:block">
                                                                            ₹{subMinPrice.toLocaleString("en-IN")} – ₹{subMaxPrice.toLocaleString("en-IN")}
                                                                        </span>
                                                                    )}

                                                                    <button
                                                                        type="button"
                                                                        onClick={() => toggleSubSection(subKey)}
                                                                        className="p-1 text-gray-400 hover:text-gray-700 transition-colors press-tactile"
                                                                    >
                                                                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isSubOpen ? "rotate-180" : ""}`} />
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {/* Subcategory Items */}
                                                            <AnimatePresence initial={false}>
                                                                {isSubOpen && (
                                                                    <motion.div
                                                                        initial={{ height: 0, opacity: 0 }}
                                                                        animate={{ height: "auto", opacity: 1 }}
                                                                        exit={{ height: 0, opacity: 0 }}
                                                                        transition={{ duration: 0.2, ease: "easeInOut" }}
                                                                        className="overflow-hidden"
                                                                    >
                                                                        <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                            {sub.items.map((item) => {
                                                                                const isChecked = isItemChecked(svc.slug, sub.name, item.name);
                                                                                return (
                                                                                    <div
                                                                                        key={item.id || item.name}
                                                                                        onClick={(e) => toggleSelectItem(svc, sub.name, item, e)}
                                                                                        className={`flex items-center justify-between p-2.5 rounded-xl border transition-all duration-200 cursor-pointer press-tactile ${
                                                                                            isChecked
                                                                                                ? "bg-rose-50/80 border-rose-300 text-gray-900 shadow-2xs ring-1 ring-rose-300/60"
                                                                                                : "bg-gray-50/70 hover:bg-white hover:border-gray-300 border-gray-200/70 text-gray-800"
                                                                                        }`}
                                                                                    >
                                                                                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                                                                            <div className={`w-4 h-4 rounded-md flex items-center justify-center transition-colors flex-shrink-0 ${
                                                                                                isChecked ? "bg-gradient-to-br from-rose-500 to-amber-500 text-white shadow-2xs" : "border border-gray-300 bg-white"
                                                                                            }`}>
                                                                                                {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                                                                            </div>
                                                                                            <span className="text-xs font-medium truncate">
                                                                                                {item.name}
                                                                                            </span>
                                                                                        </div>

                                                                                        <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                                                                                            <span className={`text-xs font-bold font-mono tabular-nums flex items-center gap-0.5 ${
                                                                                                isChecked ? "text-rose-600" : "text-gray-900"
                                                                                            }`}>
                                                                                                <IndianRupee className="w-3 h-3 opacity-70" />
                                                                                                {item.price.toLocaleString("en-IN")}
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Floating Multi-Category Selection Drawer & Concierge Bar */}
            <AnimatePresence>
                {selectedItems.length > 0 && (
                    <>
                        {/* Expanded Selection Breakdown Drawer */}
                        {isDrawerOpen && (
                            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-md">
                                <motion.div
                                    initial={{ opacity: 0, y: 100 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 100 }}
                                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                    className="bg-white rounded-t-[2rem] sm:rounded-[2rem] max-w-2xl w-full max-h-[85vh] shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-gray-200 flex flex-col overflow-hidden"
                                >
                                    <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-rose-50/50 to-amber-50/30">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center shadow-xs">
                                                <ShoppingBag className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-serif font-bold text-gray-900">
                                                    Your Selected Rituals ({selectedItems.length})
                                                </h3>
                                                <p className="text-xs text-gray-500 font-light">
                                                    Spanning {Object.keys(selectedGroupedByCategory).length} categories
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setIsDrawerOpen(false)}
                                            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-colors press-tactile"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Breakdown by Category */}
                                    <div className="p-5 overflow-y-auto space-y-5 flex-1 divide-y divide-gray-100">
                                        {Object.entries(selectedGroupedByCategory).map(([categoryName, items]) => (
                                            <div key={categoryName} className="pt-4 first:pt-0">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs font-bold uppercase tracking-widest text-rose-700">
                                                        {categoryName}
                                                    </span>
                                                    <span className="text-[11px] text-gray-400 font-mono">
                                                        {items.length} items
                                                    </span>
                                                </div>

                                                <div className="space-y-1.5">
                                                    {items.map((item) => (
                                                        <div
                                                            key={item.id}
                                                            className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50/80 border border-gray-200/70"
                                                        >
                                                            <div>
                                                                <p className="text-xs font-medium text-gray-800">{item.itemName}</p>
                                                                <p className="text-[10px] text-gray-400 font-light">{item.subName}</p>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-xs font-bold text-gray-900 font-mono tabular-nums">
                                                                    ₹{item.price.toLocaleString("en-IN")}
                                                                </span>
                                                                <button
                                                                    onClick={() => removeItemById(item.id)}
                                                                    className="text-gray-400 hover:text-rose-600 p-1 transition-colors press-tactile"
                                                                    title="Remove ritual"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Drawer Footer with Totals */}
                                    <div className="p-5 border-t border-gray-100 bg-gray-50/80 flex items-center justify-between gap-4">
                                        <div>
                                            <span className="text-xs text-gray-400 uppercase tracking-wider block">Estimated Total</span>
                                            <span className="text-xl font-serif font-bold text-rose-600 font-mono tabular-nums">
                                                ₹{totalPrice.toLocaleString("en-IN")}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={clearAllSelections}
                                                className="px-3.5 py-2 text-xs text-gray-500 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors press-tactile"
                                            >
                                                Clear All
                                            </button>
                                            <button
                                                onClick={handleBookAllSelected}
                                                className="press-tactile inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-rose-500/20 hover:shadow-lg hover:shadow-rose-500/30 transition-all"
                                            >
                                                <span>Proceed to Booking</span>
                                                <ArrowRight className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        )}

                        {/* Floating Bottom Bar */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className="fixed bottom-6 inset-x-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 z-40 max-w-2xl w-full bg-white/95 backdrop-blur-2xl text-gray-900 p-4 rounded-2xl shadow-[0_20px_50px_rgba(244,63,94,0.12)] border border-rose-200/90 ring-1 ring-rose-100 flex flex-col sm:flex-row items-center justify-between gap-4"
                        >
                            <div
                                onClick={() => setIsDrawerOpen(true)}
                                className="flex items-center gap-3.5 w-full sm:w-auto cursor-pointer group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-rose-500/20 font-bold">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-gray-900">
                                            {selectedItems.length} {selectedItems.length === 1 ? "Ritual" : "Rituals"} Selected
                                        </span>
                                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/70 font-mono tabular-nums font-bold">
                                            ₹{totalPrice.toLocaleString("en-IN")}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-gray-500 font-light truncate group-hover:text-rose-600 transition-colors">
                                        {Object.keys(selectedGroupedByCategory).join(" • ")} (Tap to review)
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
                                <button
                                    onClick={() => setIsDrawerOpen(true)}
                                    className="px-3.5 py-2 text-xs text-gray-500 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors press-tactile"
                                >
                                    Review
                                </button>

                                <button
                                    onClick={handleBookAllSelected}
                                    className="press-tactile flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-rose-500/20 hover:shadow-lg hover:shadow-rose-500/30 transition-all duration-300 hover:scale-[1.01] cursor-pointer"
                                >
                                    <span>Book Selected</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}


