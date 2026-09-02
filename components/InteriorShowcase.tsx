"use client";

import { useState, useRef, useEffect } from "react";
import Image from 'next/image';
import { motion, AnimatePresence, useInView } from "framer-motion";
import { X, Maximize2, ArrowRight } from "lucide-react";

export interface InteriorItem {
    id?: string;
    src: string;
    title: string;
    desc: string;
}

function mapInterior(item: any): InteriorItem {
    return {
        id: item.id,
        src: item.image || item.src || "",
        title: item.title || "Sanctuary View",
        desc: item.desc || "",
    };
}

interface InteriorShowcaseProps {
    initialInteriors?: any[];
}

const InteriorShowcase = ({ initialInteriors }: InteriorShowcaseProps = {}) => {
    const [interiorsList, setInteriorsList] = useState<InteriorItem[]>(() =>
        initialInteriors && initialInteriors.length > 0 ? initialInteriors.map(mapInterior) : []
    );
    const [loading, setLoading] = useState(
        () => !initialInteriors || initialInteriors.length === 0
    );
    const [lightbox, setLightbox] = useState<number | null>(null);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-60px" });

    useEffect(() => {
        if (interiorsList.length > 0) {
            setLoading(false);
            return;
        }

        async function fetchInteriors() {
            try {
                const res = await fetch("/api/interiors");
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && Array.isArray(data.data) && data.data.length > 0) {
                        setInteriorsList(data.data.map(mapInterior));
                    }
                }
            } catch (err) {
                console.error("Error fetching interiors  :", err);
            } finally {
                setLoading(false);
            }
        }
        fetchInteriors();
    }, [interiorsList.length]);

    if (!loading && interiorsList.length === 0) {
        return null; // Database-driven: do not show if no items in DB
    }

    const featured = interiorsList[0];
    const sideItems = interiorsList.slice(1, 4);

    return (
        <section ref={ref} className="py-10 md:py-16 relative overflow-hidden" id="about">
            {/* Header */}
            <div className="max-w-5xl mx-auto px-6 mb-8 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7 }}
                >
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-amber-400/60" />
                        <span className="text-amber-500 text-[10px] tracking-[0.5em] uppercase font-semibold">Experience Luxury</span>
                        <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-amber-400/60" />
                    </div>
                    <h2 className="text-4xl md:text-6xl font-serif font-bold mb-3 tracking-tight text-gray-900">
                        The Sanctuary
                    </h2>
                    <p className="text-gray-400 max-w-md mx-auto font-light tracking-wide text-base leading-relaxed">
                        Every detail designed to elevate your senses.
                    </p>
                    <div className="mt-3 flex justify-center">
                        <div className="h-[3px] w-12 bg-gradient-to-r from-amber-400 to-rose-400 rounded-full" />
                    </div>
                </motion.div>
            </div>

            {/* Image Grid */}
            <div className="max-w-6xl mx-auto px-4 md:px-6">
                {loading ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        <div className="lg:col-span-7 h-[360px] rounded-[1.75rem] bg-neutral-100 animate-pulse border border-neutral-200/50" />
                        <div className="lg:col-span-5 grid grid-rows-3 gap-4">
                            <div className="h-[110px] rounded-2xl bg-neutral-100 animate-pulse border border-neutral-200/50" />
                            <div className="h-[110px] rounded-2xl bg-neutral-100 animate-pulse border border-neutral-200/50" />
                            <div className="h-[110px] rounded-2xl bg-neutral-100 animate-pulse border border-neutral-200/50" />
                        </div>
                    </div>
                ) : featured ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        {/* Large featured */}
                        <motion.div
                            initial={{ opacity: 0, x: -20, scale: 0.98 }}
                            animate={isInView ? { opacity: 1, x: 0, scale: 1 } : {}}
                            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                            className="lg:col-span-7 relative group cursor-pointer overflow-hidden rounded-[1.75rem] ring-1 ring-black/[0.06] shadow-sm hover:shadow-lg transition-shadow duration-500"
                            style={{ minHeight: '360px' }}
                            onClick={() => setLightbox(0)}
                        >
                            <Image src={featured.src} alt={featured.title} fill className="object-cover transition-all duration-[1.2s] group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                            <div className="absolute bottom-0 inset-x-0 p-6 md:p-8">
                                <span className="text-amber-300 text-[10px] tracking-[0.35em] uppercase font-semibold mb-1.5 block">Featured Space</span>
                                <h3 className="text-white font-serif text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">{featured.title}</h3>
                            </div>
                            <div className="absolute top-4 right-4 w-10 h-10 bg-black/30 backdrop-blur-xl rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100 border border-white/20">
                                <Maximize2 className="w-4 h-4 text-white" />
                            </div>
                        </motion.div>

                        {/* Side column */}
                        <div className="lg:col-span-5 grid grid-rows-3 gap-4">
                            {sideItems.map((item, idx) => (
                                <motion.div
                                    key={item.id || idx}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                                    transition={{ duration: 0.5, delay: 0.15 + idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                                    className="relative group cursor-pointer overflow-hidden rounded-2xl ring-1 ring-black/[0.06] shadow-xs hover:shadow-md transition-shadow duration-300"
                                    style={{ minHeight: '110px' }}
                                    onClick={() => setLightbox(idx + 1)}
                                >
                                    <Image src={item.src} alt={item.title} fill className="object-cover transition-all duration-700 group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
                                    <div className="absolute inset-y-0 left-0 flex flex-col justify-center p-5">
                                        <h3 className="text-white font-serif text-sm md:text-base font-bold tracking-wide">{item.title}</h3>
                                    </div>
                                    <div className="absolute bottom-3 right-3 w-7 h-7 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 border border-white/20">
                                        <ArrowRight className="w-3.5 h-3.5 text-white" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ) : null}
            </div>

            {/* Lightbox (UI Skills Rule #13: Avoid scale-zero entrance) */}
            <AnimatePresence>
                {lightbox !== null && interiorsList[lightbox] && (
                    <motion.div
                        className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 md:p-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setLightbox(null)}
                    >
                        <motion.div
                            className="relative w-full max-w-4xl aspect-video rounded-[1.75rem] overflow-hidden shadow-2xl ring-1 ring-white/15"
                            initial={{ scale: 0.96, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.96, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Image src={interiorsList[lightbox].src} alt={interiorsList[lightbox].title} fill className="object-cover" />
                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-6 sm:p-8">
                                <h3 className="text-white text-xl sm:text-2xl font-serif font-bold tracking-tight">{interiorsList[lightbox].title}</h3>
                                <p className="text-neutral-300 mt-1 text-xs sm:text-sm font-light max-w-lg">{interiorsList[lightbox].desc}</p>
                            </div>
                        </motion.div>
                        <button
                            className="press-tactile absolute top-5 right-5 w-11 h-11 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/20 transition-all"
                            onClick={() => setLightbox(null)}
                            aria-label="Close Preview"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default InteriorShowcase;
