"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Sparkles,
    ArrowRight,
    Check,
    X,
    IndianRupee,
    Eye,
    CheckCircle2
} from "lucide-react";

export interface ServiceItemDetail {
    id?: string;
    name: string;
    price: number;
    description?: string;
}

export interface ServiceSubCategoryDetail {
    id?: string;
    name: string;
    items: ServiceItemDetail[];
}

export interface ServiceCardItem {
    id?: string;
    slug: string;
    name: string;
    icon: string;
    desc: string;
    gradient: string;
    subcategories?: ServiceSubCategoryDetail[];
}

export interface SelectedRitual {
    id: string;
    categorySlug: string;
    categoryName: string;
    subName: string;
    itemName: string;
    price: number;
}

function mapService(cat: any): ServiceCardItem {
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

interface ServiceCardsProps {
    initialServices?: any[];
}

const ServiceCards = ({ initialServices }: ServiceCardsProps = {}) => {
    const router = useRouter();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    const [servicesList, setServicesList] = useState<ServiceCardItem[]>(() =>
        initialServices && initialServices.length > 0 ? initialServices.map(mapService) : []
    );
    const [loading, setLoading] = useState(
        () => !initialServices || initialServices.length === 0
    );

    const [quickViewService, setQuickViewService] = useState<ServiceCardItem | null>(null);
    const [selectedRituals, setSelectedRituals] = useState<SelectedRitual[]>([]);

    useEffect(() => {
        if (servicesList.length > 0) {
            setLoading(false);
            return;
        }

        async function fetchDynamicServices() {
            try {
                const res = await fetch("/api/services");
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && Array.isArray(data.data)) {
                        setServicesList(data.data.map(mapService));
                    }
                }
            } catch (err) {
                console.error("Error fetching services:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchDynamicServices();
    }, [servicesList.length]);

    // Toggle Ritual Selection
    const toggleRitual = (service: ServiceCardItem, subName: string, item: ServiceItemDetail) => {
        const ritualId = `${service.slug}-${subName}-${item.name}`.toLowerCase();
        setSelectedRituals(prev => {
            const exists = prev.some(r => r.id === ritualId);
            if (exists) {
                return prev.filter(r => r.id !== ritualId);
            } else {
                return [...prev, {
                    id: ritualId,
                    categorySlug: service.slug,
                    categoryName: service.name,
                    subName,
                    itemName: item.name,
                    price: item.price,
                }];
            }
        });
    };

    const isRitualSelected = (serviceSlug: string, subName: string, itemName: string) => {
        const ritualId = `${serviceSlug}-${subName}-${itemName}`.toLowerCase();
        return selectedRituals.some(r => r.id === ritualId);
    };

    const removeRitual = (id: string) => {
        setSelectedRituals(prev => prev.filter(r => r.id !== id));
    };

    const clearAll = () => {
        setSelectedRituals([]);
    };

    const totalPrice = selectedRituals.reduce((acc, r) => acc + (r.price || 0), 0);

    const handleProceedToBooking = () => {
        if (selectedRituals.length === 0) return;
        try {
            sessionStorage.setItem("vivazen_selected_services", JSON.stringify(selectedRituals));
        } catch (e) {
            console.error("sessionStorage error:", e);
        }
        router.push("/contact");
    };

    if (!loading && servicesList.length === 0) {
        return null;
    }

    return (
        <section ref={ref} className="py-14 md:py-20 px-4 sm:px-6 relative overflow-hidden bg-gradient-to-b from-white via-rose-50/20 to-white" id="services">
            {/* Ambient Background Warm Glow */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[300px] bg-rose-100/20 rounded-full blur-[140px] pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Section Header */}
                <div className="max-w-2xl mx-auto mb-10 md:mb-12 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className="flex items-center justify-center gap-3 mb-2.5">
                            <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-rose-400/60" />
                            <span className="text-rose-600 text-[10px] sm:text-[11px] tracking-[0.35em] uppercase font-semibold">
                                Bespoke Salon Menu
                            </span>
                            <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-rose-400/60" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold tracking-tight text-gray-900 mb-2 leading-tight">
                            Curated Salon Rituals
                        </h2>
                        <p className="text-gray-500 max-w-lg mx-auto text-xs sm:text-sm font-light leading-relaxed">
                            Discover tailored experiences across hair couture, derma skincare, and bridal alchemy.
                        </p>
                        <div className="mt-3.5 flex justify-center">
                            <div className="h-[2px] w-10 bg-gradient-to-r from-rose-400 to-amber-400 rounded-full" />
                        </div>
                    </motion.div>
                </div>

                {/* Compact, Ultra-Luxury Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                    {loading ? (
                        Array.from({ length: 8 }).map((_, idx) => (
                            <div key={idx} className="h-64 rounded-2xl bg-gray-100 animate-pulse border border-gray-200/50" />
                        ))
                    ) : (
                        servicesList.map((service, idx) => {
                            const selectedInThisCategory = selectedRituals.filter(r => r.categorySlug === service.slug);
                            const totalRitualsCount = (service.subcategories || []).reduce((sum, s) => sum + s.items.length, 0);

                            return (
                                <motion.div
                                    key={service.id || service.slug || idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                                    transition={{ duration: 0.4, delay: idx * 0.04, ease: [0.16, 1, 0.3, 1] }}
                                    className="h-full"
                                >
                                    <div className="relative h-full bg-white rounded-2xl p-5 border border-gray-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_32px_rgba(244,63,94,0.09)] hover:border-rose-300 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden group">

                                        {/* Subtle top ambient glow */}
                                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-[0.08] transition-opacity duration-500 rounded-full blur-2xl pointer-events-none`} />

                                        <div>
                                            {/* Card Top Row: Icon & Ritual Count */}
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-50 to-amber-50 border border-rose-200/60 flex items-center justify-center p-2.5 relative group-hover:scale-105 transition-transform duration-300 shadow-2xs">
                                                    <Image src={service.icon} alt={service.name} fill className="object-contain p-2" />
                                                </div>

                                                {selectedInThisCategory.length > 0 ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-300 text-rose-700 text-[11px] font-bold shadow-2xs">
                                                        <Check className="w-3 h-3 text-rose-600 stroke-[3]" />
                                                        <span>{selectedInThisCategory.length} Selected</span>
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-500 bg-gray-100/90 px-2 py-0.5 rounded-full border border-gray-200/60 font-mono">
                                                        {totalRitualsCount} Rituals
                                                    </span>
                                                )}
                                            </div>

                                            {/* Title & Description */}
                                            <h3 className="text-base sm:text-lg font-serif font-bold text-gray-900 mb-1.5 group-hover:text-rose-600 transition-colors duration-200 leading-snug">
                                                {service.name}
                                            </h3>
                                            <p className="text-gray-500 text-xs leading-relaxed font-light line-clamp-2 mb-4">
                                                {service.desc}
                                            </p>
                                        </div>

                                        {/* Interactive Action Row */}
                                        <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
                                            <Link
                                                href={`/services?cat=${service.slug}`}
                                                className="press-tactile flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 text-white text-[11px] font-bold uppercase tracking-wider shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer"
                                            >
                                                <span>Explore</span>
                                                <ArrowRight className="w-3 h-3" />
                                            </Link>

                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setQuickViewService(service);
                                                }}
                                                className="press-tactile inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 text-[11px] font-semibold tracking-wide transition-colors cursor-pointer"
                                                title="Quick select rituals in modal"
                                            >
                                                <Eye className="w-3.5 h-3.5 text-rose-600" />
                                                <span>Quick</span>
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Light Theme Luxury Quick-Select Modal */}
            <AnimatePresence>
                {quickViewService && (
                    <div
                        onClick={(e) => {
                            if (e.target === e.currentTarget) setQuickViewService(null);
                        }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 15 }}
                            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                            className="bg-white rounded-[2rem] max-w-2xl w-full max-h-[85vh] shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-gray-200 flex flex-col overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-rose-50/50 to-amber-50/30">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-11 h-11 rounded-xl bg-white shadow-xs border border-rose-100 flex items-center justify-center relative ring-1 ring-rose-200/50">
                                        <Image src={quickViewService.icon} alt={quickViewService.name} fill className="object-contain p-2" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg sm:text-xl font-serif font-bold text-gray-900">
                                            {quickViewService.name} Rituals
                                        </h3>
                                        <p className="text-xs text-gray-500 font-light">
                                            Select any services to add them to your personalized session
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setQuickViewService(null)}
                                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-colors press-tactile cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 divide-y divide-gray-100">
                                {(quickViewService.subcategories || []).map((sub) => (
                                    <div key={sub.name} className="pt-4 first:pt-0">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-xs font-bold uppercase tracking-widest text-rose-700">
                                                {sub.name}
                                            </h4>
                                            <span className="text-[10px] text-gray-400 font-mono">{sub.items.length} options</span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                            {sub.items.map((item) => {
                                                const selected = isRitualSelected(quickViewService.slug, sub.name, item.name);
                                                return (
                                                    <div
                                                        key={item.name}
                                                        onClick={() => toggleRitual(quickViewService, sub.name, item)}
                                                        className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-2.5 press-tactile ${selected
                                                                ? "bg-rose-50/80 border-rose-300 text-gray-900 shadow-2xs ring-1 ring-rose-300/60"
                                                                : "bg-gray-50/70 border-gray-200/80 hover:bg-white hover:border-gray-300 text-gray-800"
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <div className={`w-4 h-4 rounded-md flex items-center justify-center transition-colors flex-shrink-0 ${selected ? "bg-gradient-to-br from-rose-500 to-amber-500 text-white shadow-2xs" : "border border-gray-300 bg-white"
                                                                }`}>
                                                                {selected && <Check className="w-3 h-3 stroke-[3]" />}
                                                            </div>
                                                            <span className="text-xs font-medium truncate">
                                                                {item.name}
                                                            </span>
                                                        </div>

                                                        <span className={`text-xs font-bold font-mono tabular-nums flex items-center gap-0.5 flex-shrink-0 ${selected ? "text-rose-600" : "text-gray-900"
                                                            }`}>
                                                            <IndianRupee className="w-3 h-3 opacity-70" />
                                                            {item.price.toLocaleString("en-IN")}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50/80 flex items-center justify-between">
                                <div className="text-xs text-gray-500 font-light">
                                    <span>Selected in category: </span>
                                    <span className="font-bold text-rose-600 font-mono">
                                        {selectedRituals.filter(r => r.categorySlug === quickViewService.slug).length}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setQuickViewService(null)}
                                        className="press-tactile px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white text-xs font-bold shadow-sm hover:shadow-md transition-all cursor-pointer"
                                    >
                                        Done
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Floating Luxury Concierge Bar */}
            <AnimatePresence>
                {selectedRituals.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed bottom-6 inset-x-0 z-40 px-4 pointer-events-none"
                    >
                        <div className="max-w-xl mx-auto bg-white/95 backdrop-blur-2xl rounded-2xl p-4 border border-rose-200/80 shadow-[0_20px_50px_rgba(244,63,94,0.18)] pointer-events-auto ring-1 ring-rose-300/40">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                                        <Sparkles className="w-5 h-5 animate-pulse" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
                                                {selectedRituals.length} {selectedRituals.length === 1 ? "Ritual" : "Rituals"} Chosen
                                            </span>
                                            <button
                                                onClick={clearAll}
                                                className="text-[10px] text-gray-400 hover:text-gray-700 underline font-light cursor-pointer"
                                            >
                                                Clear
                                            </button>
                                        </div>
                                        <p className="text-sm font-bold text-gray-900 font-mono flex items-center gap-0.5">
                                            <IndianRupee className="w-3.5 h-3.5 opacity-70" />
                                            {totalPrice.toLocaleString("en-IN")}
                                            <span className="text-[10px] text-gray-500 font-normal ml-1 font-sans">est. total</span>
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleProceedToBooking}
                                    className="press-tactile flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 text-white text-xs font-bold uppercase tracking-wider shadow-sm hover:shadow-md transition-all cursor-pointer flex-shrink-0"
                                >
                                    <span>Proceed to Booking</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default ServiceCards;
