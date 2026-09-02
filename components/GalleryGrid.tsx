"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { X, ZoomIn, ArrowRight } from "lucide-react";

export interface GalleryItem {
    id?: string;
    src: string;
    alt: string;
    category: string;
    detail: string;
}

function mapGalleryItem(item: any): GalleryItem {
    let catName = "Other";
    if (item.category === "GALLERY_HAIR" || item.category === "Hair") catName = "Hair";
    else if (item.category === "GALLERY_BRIDAL" || item.category === "Bridal") catName = "Bridal";
    else if (item.category === "GALLERY_NAIL" || item.category === "Nail") catName = "Nail";
    else if (item.category === "GALLERY_SKIN" || item.category === "Skin") catName = "Skin";
    else if (item.category === "GALLERY_MAKEUP" || item.category === "Makeup") catName = "Makeup";

    return {
        id: item.id,
        src: item.url || item.src || "",
        alt: item.alt || item.name || "Gallery Image",
        category: catName,
        detail: item.detail || "",
    };
}

const categories = ["All", "Hair", "Bridal", "Nail", "Skin", "Makeup"];

interface GalleryGridProps {
    initialGallery?: any[];
}

const GalleryGrid = ({ initialGallery }: GalleryGridProps = {}) => {
    const [galleryList, setGalleryList] = useState<GalleryItem[]>(() => {
        if (!initialGallery || initialGallery.length === 0) return [];
        return initialGallery
            .filter((item: any) => !item.category || item.category.startsWith("GALLERY_") || ["Hair", "Bridal", "Nail", "Skin", "Makeup", "Other"].includes(item.category))
            .map(mapGalleryItem);
    });
    const [loading, setLoading] = useState(
        () => !initialGallery || initialGallery.length === 0
    );
    const [activeCategory, setActiveCategory] = useState("All");
    const [lightbox, setLightbox] = useState<string | null>(null);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-60px" });

    useEffect(() => {
        if (galleryList.length > 0) {
            setLoading(false);
            return;
        }

        async function fetchImages() {
            try {
                const res = await fetch("/api/images");
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && Array.isArray(data.data)) {
                        const galleryItems: GalleryItem[] = data.data
                            .filter((item: any) => item.category && item.category.startsWith("GALLERY_"))
                            .map(mapGalleryItem);

                        setGalleryList(galleryItems);
                    }
                }
            } catch (err) {
                console.error("Error fetching gallery images  :", err);
            } finally {
                setLoading(false);
            }
        }
        fetchImages();
    }, [galleryList.length]);

    // Lock body scroll when lightbox is open
    useEffect(() => {
        if (lightbox) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [lightbox]);

    if (!loading && galleryList.length === 0) {
        return null; // Database-driven
    }

    const allFiltered = activeCategory === "All"
        ? galleryList
        : galleryList.filter(img => img.category === activeCategory);
    const filtered = allFiltered.slice(0, 20);
    const hasMore = allFiltered.length > 20;

    return (
        <section ref={ref} className="py-14 md:py-24 px-4 bg-gradient-to-b from-white via-neutral-50/50 to-white" id="gallery">
            {/* Header */}
            <div className="max-w-5xl mx-auto px-6 mb-8 text-center">
                <motion.div initial={{ opacity: 0, y: 15 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <div className="h-[1px] w-10 bg-gradient-to-r from-transparent to-amber-500/60" />
                        <span className="text-amber-600 text-[10px] tracking-[0.35em] uppercase font-semibold">Haute Portfolio</span>
                        <div className="h-[1px] w-10 bg-gradient-to-l from-transparent to-amber-500/60" />
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black mb-3 tracking-tight text-neutral-900">
                        Artistry &amp; Transformations
                    </h2>
                    <p className="text-neutral-500 max-w-md mx-auto font-light tracking-wide text-sm sm:text-base">
                        A curated editorial showcase of master hair craft, couture bridal looks, and clinical radiance.
                    </p>
                    <div className="mt-4 flex justify-center">
                        <div className="h-[2px] w-12 bg-gradient-to-r from-amber-400 to-rose-400 rounded-full" />
                    </div>
                </motion.div>
            </div>

            {/* Filter Tabs */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.1 }} className="max-w-xl mx-auto mb-10 px-4">
                <div className="bg-neutral-100/80 backdrop-blur-md rounded-full p-1.5 flex flex-wrap justify-center gap-1.5 border border-neutral-200/60 shadow-xs">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`press-tactile px-4 py-2 rounded-full text-[11px] font-semibold uppercase tracking-[0.16em] transition-all duration-300 cursor-pointer ${activeCategory === cat ? "bg-neutral-950 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-900 hover:bg-white/60"}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Grid — Concentric cards with neutral image rings */}
            <motion.div layout className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
                {loading ? (
                    Array.from({ length: 10 }).map((_, idx) => (
                        <div key={idx} className="aspect-square rounded-[1.5rem] bg-neutral-100 animate-pulse border border-neutral-200/50" />
                    ))
                ) : (
                    <AnimatePresence mode="popLayout">
                        {filtered.map((img, idx) => (
                            <motion.div
                                key={img.id || img.src + idx}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.4, delay: Math.min(idx * 0.03, 0.3), ease: [0.16, 1, 0.3, 1] }}
                                className="relative group overflow-hidden rounded-[1.5rem] cursor-pointer aspect-square ring-1 ring-black/[0.06] shadow-xs hover:shadow-lg transition-all duration-500 hover:-translate-y-1 press-tactile"
                                onClick={() => setLightbox(img.src)}
                            >
                                {/* Image */}
                                <Image
                                    src={img.src}
                                    alt={img.alt}
                                    fill
                                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                                />

                                {/* Hover overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-400" />

                                {/* Hover details */}
                                <div className="absolute bottom-0 inset-x-0 p-4 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400 ease-out">
                                    <span className="text-amber-300 text-[9px] tracking-[0.25em] uppercase font-semibold block mb-0.5">
                                        {img.category}
                                    </span>
                                    <span className="text-white font-serif text-sm font-bold block leading-tight">
                                        {img.alt}
                                    </span>
                                    {img.detail && (
                                        <span className="text-neutral-300 text-[11px] font-light leading-snug mt-1 block line-clamp-2">
                                            {img.detail}
                                        </span>
                                    )}
                                </div>

                                {/* Zoom icon top-right */}
                                <div className="absolute top-3 right-3 w-8 h-8 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100 text-white border border-white/20">
                                    <ZoomIn className="w-3.5 h-3.5" />
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </motion.div>

            {/* Show More button with Tabular Numbers */}
            {!loading && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col items-center mt-10 gap-3"
                >
                    <span className="text-xs text-neutral-400 font-light tracking-wider tabular-nums">
                        Showing <span className="font-semibold text-neutral-800">{filtered.length}</span> of <span className="font-semibold text-neutral-800">{allFiltered.length}</span> creations
                        {activeCategory !== "All" && <> in <span className="font-semibold text-amber-600">{activeCategory}</span></>}
                    </span>
                    {hasMore && (
                        <Link
                            href="/gallery"
                            className="press-tactile group inline-flex items-center gap-2 mt-2 px-8 py-3.5 text-[11px] font-bold uppercase tracking-[0.22em] rounded-full bg-neutral-900 text-white shadow-md hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                        >
                            <span className="relative z-10">Explore Full Archive</span>
                            <ArrowRight className="w-3.5 h-3.5 relative z-10 group-hover:translate-x-0.5 transition-transform duration-300" />
                            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </Link>
                    )}
                </motion.div>
            )}

            {/* Lightbox with Spring Physics & Non-Zero Scale (UI Skills Rule #13) */}
            <AnimatePresence>
                {lightbox && (
                    <motion.div
                        className="fixed inset-0 z-[200] bg-neutral-950/90 backdrop-blur-2xl flex items-center justify-center p-4 md:p-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setLightbox(null)}
                    >
                        <motion.div
                            className="relative w-full max-w-4xl aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-white/10"
                            initial={{ scale: 0.96, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.96, opacity: 0 }}
                            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Image src={lightbox} alt="Gallery Preview" fill className="object-contain bg-black/60" />
                        </motion.div>
                        <button
                            className="press-tactile absolute top-6 right-6 w-11 h-11 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-200 border border-white/20 shadow-lg"
                            onClick={() => setLightbox(null)}
                            aria-label="Close Lightbox"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default GalleryGrid;
