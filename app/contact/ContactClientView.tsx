"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
    Phone,
    Mail,
    User,
    MessageSquare,
    CheckCircle2,
    Sparkles,
    Send,
    Star,
    Check,
    X,
    Plus,
    Trash2,
    IndianRupee,
    Calendar,
    Clock,
    Scissors,
    ChevronDown,
    ChevronUp,
    SunMedium,
    Sun,
    Sunset
} from "lucide-react";

interface SubItem {
    id?: string;
    name: string;
    price: number;
    description?: string;
}

interface SubCategory {
    id?: string;
    name: string;
    items: SubItem[];
}

interface ServiceCategory {
    id?: string;
    slug: string;
    name: string;
    icon: string;
    desc: string;
    gradient: string;
    subcategories: SubCategory[];
}

interface PackageItem {
    id: string;
    name: string;
    slug: string;
    price: number;
    originalPrice: number;
    badge?: string;
    items: string[];
    popular?: boolean;
}

export interface SelectedServiceItem {
    id: string;
    categorySlug: string;
    categoryName: string;
    subName: string;
    itemName: string;
    price: number;
}

interface ContactClientViewProps {
    initialServices?: any[];
    initialPackages?: any[];
}

function ContactPageContent({ initialServices, initialPackages }: ContactClientViewProps) {
    const searchParams = useSearchParams();
    const serviceParam = searchParams.get("service");
    const subParam = searchParams.get("sub");
    const subsParam = searchParams.get("subs");
    const packageParam = searchParams.get("package");
    const itemParam = searchParams.get("item");
    const selectedServicesParam = searchParams.get("selectedServices");

    const [servicesList, setServicesList] = useState<ServiceCategory[]>(() => initialServices || []);
    const [packagesList, setPackagesList] = useState<PackageItem[]>(() => initialPackages || []);
    const [selectedItems, setSelectedItems] = useState<SelectedServiceItem[]>([]);
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
    const [isServicePickerOpen, setIsServicePickerOpen] = useState(false);
    const [activePickerCategory, setActivePickerCategory] = useState<string>("");
    const [loading, setLoading] = useState(() => (!initialServices || initialServices.length === 0));

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        date: "",
        timeSlot: "Afternoon (1:00 PM – 5:00 PM)",
        message: "",
    });
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initial setup from props or fallback client fetch
    useEffect(() => {
        if (servicesList.length > 0) {
            setupInitialSelection(servicesList, packagesList);
            setLoading(false);
            return;
        }

        async function fetchInitialData() {
            try {
                const [servRes, pkgRes] = await Promise.all([
                    fetch("/api/services"),
                    fetch("/api/packages"),
                ]);

                let loadedServices: ServiceCategory[] = [];
                let loadedPackages: PackageItem[] = [];

                if (servRes.ok) {
                    const servData = await servRes.json();
                    if (servData.success && Array.isArray(servData.data)) {
                        loadedServices = servData.data;
                        setServicesList(loadedServices);
                    }
                }

                if (pkgRes.ok) {
                    const pkgData = await pkgRes.json();
                    if (pkgData.success && Array.isArray(pkgData.data)) {
                        loadedPackages = pkgData.data;
                        setPackagesList(loadedPackages);
                    }
                }

                setupInitialSelection(loadedServices, loadedPackages);
            } catch (err) {
                console.error("Error fetching services/packages:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchInitialData();
    }, [servicesList.length]);

    const setupInitialSelection = (loadedServices: ServiceCategory[], loadedPackages: PackageItem[]) => {
        if (loadedServices.length > 0 && !activePickerCategory) {
            setActivePickerCategory(loadedServices[0].slug);
        }

        // 1. Try sessionStorage first (clean URL transfer)
        if (typeof window !== "undefined") {
            try {
                const stored = sessionStorage.getItem("vivazen_selected_services");
                if (stored) {
                    const parsed: SelectedServiceItem[] = JSON.parse(stored);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        setSelectedItems(parsed);
                        sessionStorage.removeItem("vivazen_selected_services");
                        return;
                    }
                }
            } catch (err) {
                console.error("Failed parsing sessionStorage selected services:", err);
            }
        }

        // 2. If multi-service payload passed via URL, parse and clean URL
        if (selectedServicesParam) {
            try {
                const parsed: SelectedServiceItem[] = JSON.parse(decodeURIComponent(selectedServicesParam));
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setSelectedItems(parsed);
                    if (typeof window !== "undefined") {
                        window.history.replaceState({}, "", "/contact");
                    }
                    return;
                }
            } catch (err) {
                console.error("Failed parsing selectedServices param:", err);
            }
        }

        // 3. Fallback to single category/sub/item params
        if (loadedServices.length > 0) {
            let matchedService = loadedServices[0];
            if (serviceParam) {
                const found = loadedServices.find(
                    (s) =>
                        s.slug.toLowerCase() === serviceParam.toLowerCase() ||
                        s.name.toLowerCase() === serviceParam.toLowerCase()
                );
                if (found) {
                    matchedService = found;
                    setActivePickerCategory(found.slug);
                }
            }

            const initialItems: SelectedServiceItem[] = [];

            if (itemParam) {
                matchedService.subcategories.forEach((sub) => {
                    const matchedItem = sub.items.find(
                        (i) => i.name.toLowerCase() === itemParam.trim().toLowerCase()
                    );
                    if (matchedItem) {
                        initialItems.push({
                            id: `${matchedService.slug}-${sub.name}-${matchedItem.name}`.toLowerCase(),
                            categorySlug: matchedService.slug,
                            categoryName: matchedService.name,
                            subName: sub.name,
                            itemName: matchedItem.name,
                            price: matchedItem.price,
                        });
                    }
                });
            } else if (subsParam) {
                const requestedSubs = subsParam.split(",").map((s) => s.trim().toLowerCase());
                matchedService.subcategories.forEach((sub) => {
                    if (requestedSubs.includes(sub.name.toLowerCase())) {
                        sub.items.forEach((item) => {
                            initialItems.push({
                                id: `${matchedService.slug}-${sub.name}-${item.name}`.toLowerCase(),
                                categorySlug: matchedService.slug,
                                categoryName: matchedService.name,
                                subName: sub.name,
                                itemName: item.name,
                                price: item.price,
                            });
                        });
                    }
                });
            } else if (subParam) {
                const requestedSub = subParam.trim().toLowerCase();
                const matchedSub = matchedService.subcategories.find(
                    (sub) => sub.name.toLowerCase() === requestedSub
                );
                if (matchedSub) {
                    matchedSub.items.forEach((item) => {
                        initialItems.push({
                            id: `${matchedService.slug}-${matchedSub.name}-${item.name}`.toLowerCase(),
                            categorySlug: matchedService.slug,
                            categoryName: matchedService.name,
                            subName: matchedSub.name,
                            itemName: item.name,
                            price: item.price,
                        });
                    });
                }
            }

            if (initialItems.length > 0) {
                setSelectedItems(initialItems);
            }
        }

        if (packageParam) {
            setSelectedPackage(packageParam);
            const foundPkg = loadedPackages.find(
                (p) => p.name.toLowerCase() === packageParam.toLowerCase()
            );
            if (foundPkg) {
                setFormData((prev) => ({
                    ...prev,
                    message: `Interested in booking ${foundPkg.name} package (₹${foundPkg.price})`,
                }));
            }
        }
    };

    const toggleItemSelection = (category: ServiceCategory, subName: string, item: SubItem) => {
        const id = `${category.slug}-${subName}-${item.name}`.toLowerCase();
        setSelectedItems((prev) => {
            const exists = prev.some((i) => i.id === id);
            if (exists) {
                return prev.filter((i) => i.id !== id);
            } else {
                return [
                    ...prev,
                    {
                        id,
                        categorySlug: category.slug,
                        categoryName: category.name,
                        subName,
                        itemName: item.name,
                        price: item.price,
                    },
                ];
            }
        });
        setSelectedPackage(null);
    };

    const isItemActive = (categorySlug: string, subName: string, itemName: string) => {
        const id = `${categorySlug}-${subName}-${itemName}`.toLowerCase();
        return selectedItems.some((i) => i.id === id);
    };

    const removeItem = (id: string) => {
        setSelectedItems((prev) => prev.filter((i) => i.id !== id));
    };

    const clearAllSelections = () => {
        setSelectedItems([]);
        setSelectedPackage(null);
    };

    const handleSelectPackage = (pkg: PackageItem) => {
        setSelectedPackage(pkg.name);
        setSelectedItems([]);
        setFormData((prev) => ({
            ...prev,
            message: `Interested in booking ${pkg.name} package (₹${pkg.price})`,
        }));
    };

    // Calculate total price
    const totalEstimatedPrice = useMemo(() => {
        if (selectedPackage) {
            const pkg = packagesList.find((p) => p.name === selectedPackage);
            return pkg ? pkg.price : 0;
        }
        return selectedItems.reduce((acc, item) => acc + (item.price || 0), 0);
    }, [selectedItems, selectedPackage, packagesList]);

    // Group selected items by category
    const groupedSelectedItems = useMemo(() => {
        const groups: Record<string, SelectedServiceItem[]> = {};
        selectedItems.forEach((item) => {
            if (!groups[item.categoryName]) {
                groups[item.categoryName] = [];
            }
            groups[item.categoryName].push(item);
        });
        return groups;
    }, [selectedItems]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const serviceSummary = selectedItems.map(i => `${i.categoryName}: ${i.itemName} (₹${i.price})`).join("; ");

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    phone: formData.phone,
                    email: formData.email,
                    date: formData.date,
                    timeSlot: formData.timeSlot,
                    service: selectedPackage ? `Package: ${selectedPackage}` : (selectedItems.length > 0 ? "Custom Selected Services" : "General Enquiry"),
                    subServices: selectedItems.map((i) => i.itemName),
                    selectedServicesList: selectedItems,
                    totalEstimatedPrice,
                    package: selectedPackage,
                    message: formData.message,
                }),
            });

            if (res.ok) {
                setSubmitted(true);
            }
        } catch (err) {
            console.error("Submission failed:", err);
            setSubmitted(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-rose-50/20 to-white relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-[700px] h-[550px] bg-rose-100/20 rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute bottom-40 left-0 w-[600px] h-[550px] bg-amber-100/15 rounded-full blur-[150px] pointer-events-none" />

            {/* Header */}
            <section className="pt-28 pb-8 px-6 text-center relative z-10">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <div className="h-[1px] w-10 bg-gradient-to-r from-transparent to-rose-400/60" />
                        <span className="text-rose-600 text-[10px] sm:text-[11px] tracking-[0.35em] uppercase font-semibold">
                            Salon Concierge
                        </span>
                        <div className="h-[1px] w-10 bg-gradient-to-l from-transparent to-rose-400/60" />
                    </div>
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold tracking-tight text-gray-900 mb-3">
                        Book Your Experience
                    </h1>
                    <p className="text-gray-500 max-w-xl mx-auto text-sm sm:text-base font-light leading-relaxed">
                        Customize your salon session across hair, skin, and makeup. Our senior artists ensure bespoke perfection.
                    </p>
                    <div className="mt-4 flex justify-center">
                        <div className="h-[2px] w-12 bg-gradient-to-r from-rose-400 to-amber-400 rounded-full" />
                    </div>
                </motion.div>
            </section>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-24 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Column: Multi-Category Selected Services Summary & In-Place Adder */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                        className="lg:col-span-6 space-y-6"
                    >
                        {/* Executive Selected Services Card */}
                        <div className="bg-white/95 backdrop-blur-xl rounded-[1.75rem] border border-gray-200/80 p-6 sm:p-7 shadow-[0_4px_24px_rgba(0,0,0,0.03)] ring-1 ring-black/[0.02]">
                            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center shadow-xs">
                                        <Scissors className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-serif font-bold text-gray-900">
                                            Selected Rituals
                                        </h2>
                                        <p className="text-xs text-gray-400 font-light">
                                            {selectedPackage ? "1 Curated Package" : `${selectedItems.length} services across ${Object.keys(groupedSelectedItems).length} categories`}
                                        </p>
                                    </div>
                                </div>

                                {(selectedItems.length > 0 || selectedPackage) && (
                                    <button
                                        type="button"
                                        onClick={clearAllSelections}
                                        className="text-[11px] text-gray-400 hover:text-rose-600 font-medium transition-colors press-tactile"
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>

                            {/* Package Selected View */}
                            {selectedPackage && (
                                <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200/80 mb-4 flex items-center justify-between">
                                    <div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">Package Selected</span>
                                        <span className="text-sm font-serif font-bold text-gray-900">{selectedPackage}</span>
                                    </div>
                                    <span className="text-sm font-bold text-rose-600 font-mono tabular-nums">
                                        ₹{totalEstimatedPrice.toLocaleString("en-IN")}
                                    </span>
                                </div>
                            )}

                            {/* Multi-Category Selected Items List */}
                            {selectedItems.length > 0 ? (
                                <div className="space-y-4 mb-6">
                                    {Object.entries(groupedSelectedItems).map(([catName, items]) => (
                                        <div key={catName} className="rounded-xl bg-gray-50/70 p-3.5 border border-gray-200/60">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
                                                    {catName}
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-mono">
                                                    {items.length} {items.length === 1 ? "ritual" : "rituals"}
                                                </span>
                                            </div>

                                            <div className="space-y-1.5">
                                                {items.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-gray-200/60 shadow-2xs"
                                                    >
                                                        <div className="min-w-0 flex-1 pr-2">
                                                            <p className="text-xs font-medium text-gray-800 truncate">
                                                                {item.itemName}
                                                            </p>
                                                            <p className="text-[10px] text-gray-400 font-light truncate">
                                                                {item.subName}
                                                            </p>
                                                        </div>

                                                        <div className="flex items-center gap-2.5 flex-shrink-0">
                                                            <span className="text-xs font-bold text-gray-900 font-mono tabular-nums">
                                                                ₹{item.price.toLocaleString("en-IN")}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeItem(item.id)}
                                                                className="w-5 h-5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-rose-600 flex items-center justify-center transition-colors press-tactile"
                                                                title="Remove"
                                                            >
                                                                <X className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : !selectedPackage && (
                                <div className="text-center py-8 px-4 rounded-2xl bg-gray-50/50 border border-dashed border-gray-200/80 mb-6">
                                    <Sparkles className="w-6 h-6 text-rose-400 mx-auto mb-2" />
                                    <p className="text-xs font-serif font-medium text-gray-700">No specific rituals selected yet</p>
                                    <p className="text-[11px] text-gray-400 font-light mt-0.5">
                                        Use the interactive selector below to add hair, skincare, or bridal rituals.
                                    </p>
                                </div>
                            )}

                            {/* Estimated Total Investment */}
                            <div className="p-4 rounded-xl bg-gradient-to-r from-rose-50 via-white to-amber-50 border border-rose-200/80 text-gray-900 flex items-center justify-between mb-5 shadow-2xs">
                                <div>
                                    <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Estimated Total</span>
                                    <span className="text-xs text-gray-400 font-light">Pay at salon after service</span>
                                </div>
                                <span className="text-xl sm:text-2xl font-serif font-bold text-rose-600 font-mono tabular-nums">
                                    ₹{totalEstimatedPrice.toLocaleString("en-IN")}
                                </span>
                            </div>

                            {/* In-Place Service Picker Trigger */}
                            <button
                                type="button"
                                onClick={() => setIsServicePickerOpen(!isServicePickerOpen)}
                                className="w-full press-tactile py-3 px-4 rounded-xl border border-rose-200/80 bg-rose-50/60 hover:bg-rose-100/70 text-rose-700 text-xs font-bold tracking-wide flex items-center justify-between transition-colors cursor-pointer"
                            >
                                <span className="flex items-center gap-2">
                                    <Plus className="w-3.5 h-3.5 text-rose-600" />
                                    <span>{isServicePickerOpen ? "Close Service Browser" : "+ Add More Rituals from Any Category"}</span>
                                </span>
                                {isServicePickerOpen ? <ChevronUp className="w-4 h-4 text-rose-400" /> : <ChevronDown className="w-4 h-4 text-rose-400" />}
                            </button>

                            {/* Interactive In-Place Service Selector Accordion */}
                            <AnimatePresence>
                                {isServicePickerOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                        className="overflow-hidden mt-4 pt-4 border-t border-gray-100"
                                    >
                                        <p className="text-xs text-gray-500 font-light mb-3">
                                            Tap any category chip to browse and checkmark additional rituals:
                                        </p>

                                        {/* Category Chips */}
                                        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none">
                                            {servicesList.map((svc) => (
                                                <button
                                                    key={svc.slug}
                                                    type="button"
                                                    onClick={() => setActivePickerCategory(svc.slug)}
                                                    className={`press-tactile flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                                                        activePickerCategory === svc.slug
                                                            ? "bg-rose-50 border border-rose-300 text-rose-700 font-bold shadow-2xs"
                                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                    }`}
                                                >
                                                    {svc.name}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Category Rituals List */}
                                        {(() => {
                                            const currentCat = servicesList.find((s) => s.slug === activePickerCategory) || servicesList[0];
                                            if (!currentCat) return null;

                                            return (
                                                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                                                    {currentCat.subcategories.map((sub) => (
                                                        <div key={sub.name} className="p-3 rounded-xl bg-gray-50/70 border border-gray-200/60">
                                                            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block mb-2">
                                                                {sub.name}
                                                            </span>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                                                {sub.items.map((item) => {
                                                                    const isChecked = isItemActive(currentCat.slug, sub.name, item.name);
                                                                    return (
                                                                        <div
                                                                            key={item.name}
                                                                            onClick={() => toggleItemSelection(currentCat, sub.name, item)}
                                                                            className={`p-2.5 rounded-lg border flex items-center justify-between text-xs cursor-pointer transition-all press-tactile ${
                                                                                isChecked
                                                                                    ? "bg-rose-50/80 border-rose-300 text-gray-900 shadow-2xs ring-1 ring-rose-300/60"
                                                                                    : "bg-white border-gray-200/70 text-gray-800 hover:border-gray-300"
                                                                            }`}
                                                                        >
                                                                            <div className="flex items-center gap-2 truncate">
                                                                                <div className={`w-3.5 h-3.5 rounded flex items-center justify-center ${
                                                                                    isChecked ? "bg-gradient-to-br from-rose-500 to-amber-500 text-white shadow-2xs" : "border border-gray-300 bg-white"
                                                                                }`}>
                                                                                    {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                                                                </div>
                                                                                <span className="truncate">{item.name}</span>
                                                                            </div>
                                                                            <span className={`text-[11px] font-mono tabular-nums ml-1 ${
                                                                                isChecked ? "text-rose-600 font-bold" : "text-gray-900 font-semibold"
                                                                            }`}>
                                                                                ₹{item.price.toLocaleString("en-IN")}
                                                                            </span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        })()}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* Right Column: Next-Gen Luxury Booking Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="lg:col-span-6"
                    >
                        <div className="bg-white/95 backdrop-blur-xl rounded-[1.75rem] border border-gray-200/80 p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] ring-1 ring-black/[0.02] sticky top-28">
                            {submitted ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200/80 shadow-2xs">
                                        <CheckCircle2 className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">Appointment Requested!</h3>
                                    <p className="text-gray-500 text-sm font-light leading-relaxed mb-6 max-w-sm mx-auto">
                                        Thank you, <span className="font-semibold text-gray-800">{formData.name}</span>. Our concierge team will contact you at <span className="font-semibold text-gray-800">{formData.phone}</span> shortly to finalize your slot.
                                    </p>
                                    <button
                                        onClick={() => {
                                            setSubmitted(false);
                                            setFormData({ name: "", phone: "", email: "", date: "", timeSlot: "Afternoon (1:00 PM – 5:00 PM)", message: "" });
                                            setSelectedItems([]);
                                            setSelectedPackage(null);
                                        }}
                                        className="press-tactile px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white text-xs font-semibold uppercase tracking-wider shadow-sm hover:shadow-md transition-all"
                                    >
                                        Book Another Session
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <h2 className="text-xl font-serif font-bold text-gray-900 mb-1">
                                            Guest Information
                                        </h2>
                                        <p className="text-gray-400 text-xs font-light">
                                            Provide your contact details to receive an instant booking confirmation.
                                        </p>
                                    </div>

                                    {/* Full Name */}
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600 mb-1.5">
                                            Full Name *
                                        </label>
                                        <div className="relative">
                                            <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="e.g. Aanya Sharma"
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200/80 bg-gray-50/60 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Phone & Email Row */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600 mb-1.5">
                                                Phone Number *
                                            </label>
                                            <div className="relative">
                                                <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                                <input
                                                    type="tel"
                                                    required
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    placeholder="+91 98765 43210"
                                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200/80 bg-gray-50/60 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600 mb-1.5">
                                                Email (Optional)
                                            </label>
                                            <div className="relative">
                                                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                                <input
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    placeholder="you@luxury.com"
                                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200/80 bg-gray-50/60 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Preferred Appointment Date */}
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600 mb-1.5">
                                            Preferred Appointment Date
                                        </label>
                                        <div className="relative">
                                            <Calendar className="w-4 h-4 text-rose-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                            <input
                                                type="date"
                                                value={formData.date}
                                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200/80 bg-gray-50/60 text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-all cursor-pointer font-medium"
                                            />
                                        </div>
                                    </div>

                                    {/* Upgraded Luxury Time Slot Selector */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600">
                                                Preferred Time Slot
                                            </label>
                                            <span className="text-[10px] text-rose-600 font-semibold">
                                                {formData.timeSlot.split(" (")[0]}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                            {[
                                                {
                                                    id: "Morning",
                                                    title: "Morning",
                                                    hours: "10:00 AM – 1:00 PM",
                                                    icon: SunMedium,
                                                },
                                                {
                                                    id: "Afternoon",
                                                    title: "Afternoon",
                                                    hours: "1:00 PM – 5:00 PM",
                                                    icon: Sun,
                                                },
                                                {
                                                    id: "Evening",
                                                    title: "Evening",
                                                    hours: "5:00 PM – 8:30 PM",
                                                    icon: Sunset,
                                                },
                                            ].map((slot) => {
                                                const isSelected = formData.timeSlot.startsWith(slot.id);
                                                const IconComponent = slot.icon;
                                                return (
                                                    <button
                                                        key={slot.id}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, timeSlot: `${slot.title} (${slot.hours})` })}
                                                        className={`press-tactile p-3 rounded-2xl border text-left transition-all duration-200 relative cursor-pointer ${
                                                            isSelected
                                                                ? "bg-rose-50/90 border-rose-300 text-gray-900 shadow-2xs ring-1 ring-rose-300/70"
                                                                : "bg-gray-50/70 hover:bg-white border-gray-200/80 text-gray-700 hover:border-gray-300"
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between mb-1.5">
                                                            <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
                                                                isSelected ? "bg-rose-500 text-white" : "bg-gray-100 text-gray-500"
                                                            }`}>
                                                                <IconComponent className="w-3.5 h-3.5" />
                                                            </div>
                                                            {isSelected && (
                                                                <span className="w-4 h-4 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 text-white flex items-center justify-center shadow-2xs">
                                                                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs font-bold text-gray-900">{slot.title}</p>
                                                        <p className="text-[10px] text-gray-500 font-mono mt-0.5">{slot.hours}</p>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Notes / Special Requests */}
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600 mb-1.5">
                                            Special Requests / Notes
                                        </label>
                                        <div className="relative">
                                            <MessageSquare className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                                            <textarea
                                                rows={2}
                                                value={formData.message}
                                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                placeholder="Allergies, specific hair texture, stylist request, etc..."
                                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200/80 bg-gray-50/60 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-all resize-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Luxury Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="press-tactile w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-rose-500/20 hover:shadow-lg hover:shadow-rose-500/30 transition-all duration-300 hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                    >
                                        {isSubmitting ? (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Send className="w-3.5 h-3.5" />
                                                <span>Confirm Appointment Request</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Curated Packages Section */}
                {packagesList.length > 0 && (
                    <motion.section
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="mt-20 pt-16 border-t border-gray-200/60"
                    >
                        <div className="text-center mb-10">
                            <span className="text-rose-600 text-[10px] sm:text-[11px] tracking-[0.35em] uppercase font-semibold">
                                All-Inclusive Bundles
                            </span>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-gray-900 mt-1">
                                Curated Luxury Packages
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {packagesList.map((pkg) => (
                                <motion.div
                                    key={pkg.id || pkg.name}
                                    whileHover={{ y: -4 }}
                                    className={`rounded-[1.75rem] p-6 border transition-all duration-300 relative overflow-hidden bg-white/95 backdrop-blur-xl ${
                                        selectedPackage === pkg.name
                                            ? "border-rose-400 ring-2 ring-rose-400/30 shadow-lg"
                                            : pkg.popular
                                            ? "border-rose-200 shadow-md ring-1 ring-black/[0.03]"
                                            : "border-gray-200/80 shadow-2xs"
                                    }`}
                                >
                                    {pkg.popular && (
                                        <div className="absolute top-4 right-4 bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-2xs flex items-center gap-1">
                                            <Star className="w-2.5 h-2.5 fill-white" />
                                            Popular
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-xl font-serif font-bold text-gray-900">{pkg.name}</h3>
                                            <div className="flex items-baseline gap-2 mt-1">
                                                <span className="text-2xl font-bold text-gray-900 font-mono tabular-nums">
                                                    ₹{pkg.price.toLocaleString("en-IN")}
                                                </span>
                                                {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                                                    <span className="text-xs text-gray-400 line-through font-mono tabular-nums">
                                                        ₹{pkg.originalPrice.toLocaleString("en-IN")}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2 border-t border-gray-100 pt-4">
                                            {(pkg.items || []).map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-2">
                                                    <Check className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                                                    <span className="text-xs text-gray-600">{String(item)}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleSelectPackage(pkg)}
                                            className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer press-tactile ${
                                                selectedPackage === pkg.name
                                                    ? "bg-rose-50 border border-rose-300 text-rose-700 shadow-2xs font-bold"
                                                    : pkg.popular
                                                    ? "bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 text-white shadow-2xs hover:shadow-md"
                                                    : "bg-gray-100 text-gray-700 hover:bg-rose-50 hover:text-rose-700"
                                            }`}
                                        >
                                            {selectedPackage === pkg.name ? "Package Selected" : "Book This Package"}
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>
                )}
            </div>
        </div>
    );
}

export default function ContactClientView(props: ContactClientViewProps) {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                </div>
            }
        >
            <ContactPageContent {...props} />
        </Suspense>
    );
}

