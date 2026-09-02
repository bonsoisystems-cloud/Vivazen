"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn } from "lucide-react";

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

interface GalleryClientViewProps {
    initialImages?: any[];
}

export default function GalleryClientView({ initialImages }: GalleryClientViewProps) {
    const [galleryList, setGalleryList] = useState<GalleryItem[]>(() => {
        if (!initialImages || initialImages.length === 0) return [];
        return initialImages
            .filter((item: any) => !item.category || item.category.startsWith("GALLERY_") || ["Hair", "Bridal", "Nail", "Skin", "Makeup", "Other"].includes(item.category))
            .map(mapGalleryItem);
    });
    const [loading, setLoading] = useState(() => !initialImages || initialImages.length === 0);
    const [activeCategory, setActiveCategory] = useState("All");
    const [lightbox, setLightbox] = useState<string | null>(null);

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

    useEffect(() => {
        if (lightbox) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [lightbox]);

    const filtered = activeCategory === "All"
        ? galleryList
        : galleryList.filter(img => img.category === activeCategory);

    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-violet-50/20 to-white relative overflow-hidden">
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-violet-100/30 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-gradient-to-tl from-rose-100/20 to-transparent rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <section className="pt-28 pb-10 px-6 text-center relative z-10">
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-violet-400/60" />
                        <span className="text-violet-500 text-[10px] tracking-[0.5em] uppercase font-semibold">Our Work</span>
                        <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-violet-400/60" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight text-gray-900 mb-3">
                        Our Portfolio
                    </h1>
                    <p className="text-gray-400 max-w-lg mx-auto text-base font-light tracking-wide">
                        A curated showcase of artistry and transformation.
                    </p>
                    <div className="mt-3 flex justify-center">
                        <div className="h-[3px] w-12 bg-gradient-to-r from-violet-400 to-purple-400 rounded-full" />
                    </div>
                </motion.div>
            </section>

            {/* Filter */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }} className="max-w-xl mx-auto mb-8 px-4 relative z-10">
                <div className="bg-gray-50 rounded-full p-1 flex flex-wrap justify-center gap-1 border border-gray-100">
                    {categories.map((cat) => (
                        <button key={cat} onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-2 rounded-full text-[10px] font-semibold uppercase tracking-[0.18em] transition-all duration-400 cursor-pointer ${activeCategory === cat ? "bg-gray-900 text-white shadow-md" : "text-gray-400 hover:text-gray-700 hover:bg-white"}`}
                        >{cat}</button>
                    ))}
                </div>
            </motion.div>

            {/* Grid */}
            <div className="max-w-6xl mx-auto px-4 pb-20 relative z-10">
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {Array.from({ length: 15 }).map((_, idx) => (
                            <div key={idx} className="aspect-square rounded-2xl bg-gray-100 animate-pulse" />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 bg-white/40 rounded-3xl border border-dashed border-gray-200">
                        <p className="text-gray-400 font-serif text-lg">No gallery images in this category yet.</p>
                        <p className="text-gray-400 text-xs mt-1">Staff can add portfolio images via the Image Vault.</p>
                    </div>
                ) : (
                    <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        <AnimatePresence mode="popLayout">
                            {filtered.map((img, idx) => (
                                <motion.div
                                    key={img.id || img.src + idx}
                                    layout
                                    initial={{ opacity: 0, scale: 0.85 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.85 }}
                                    transition={{ duration: 0.4, delay: Math.min(idx * 0.02, 0.2) }}
                                    className="relative group overflow-hidden rounded-2xl cursor-pointer aspect-square"
                                    onClick={() => setLightbox(img.src)}
                                >
                                    <Image src={img.src} alt={img.alt} fill sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                                    <div className="absolute bottom-0 inset-x-0 p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
                                        <span className="text-violet-300 text-[9px] tracking-[0.3em] uppercase font-semibold block mb-1">{img.category}</span>
                                        <span className="text-white font-serif text-sm font-bold block leading-tight">{img.alt}</span>
                                        <span className="text-white/60 text-[11px] font-light leading-snug mt-1 block">{img.detail}</span>
                                    </div>
                                    <div className="absolute top-3 right-3 w-8 h-8 bg-white/15 backdrop-blur-xl rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-400 scale-50 group-hover:scale-100">
                                        <ZoomIn className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <div className="absolute inset-0 rounded-2xl border-2 border-white/0 group-hover:border-white/20 transition-all duration-500 pointer-events-none" />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}

                {!loading && filtered.length > 0 && (
                    <div className="flex justify-center mt-6">
                        <span className="text-[11px] text-gray-400 font-light tracking-wider">
                            Showing <span className="font-semibold text-gray-600">{filtered.length}</span> {filtered.length === 1 ? "image" : "images"}
                            {activeCategory !== "All" && <> in <span className="font-semibold text-violet-500">{activeCategory}</span></>}
                        </span>
                    </div>
                )}
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {lightbox && (
                    <motion.div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-8"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLightbox(null)}>
                        <motion.div className="relative w-full max-w-3xl aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10"
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.3 }} onClick={(e) => e.stopPropagation()}>
                            <Image src={lightbox} alt="Gallery Preview" fill className="object-cover" />
                        </motion.div>
                        <button className="absolute top-4 right-4 md:top-6 md:right-6 w-12 h-12 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white hover:bg-white/40 hover:scale-110 transition-all duration-300 cursor-pointer border border-white/30 shadow-lg"
                            onClick={() => setLightbox(null)}>
                            <X className="w-5 h-5" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
