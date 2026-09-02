"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote, CheckCircle2 } from "lucide-react";

interface TestimonialItem {
    id: string;
    name: string;
    role?: string;
    avatar: string;
    rating: number;
    text: string;
    color: string;
    relativeTime?: string;
}

const GRADIENTS = [
    "from-rose-400 to-pink-500",
    "from-amber-400 to-orange-500",
    "from-violet-400 to-purple-500",
    "from-teal-400 to-cyan-500",
    "from-rose-500 to-amber-500",
];

const TestimonialSlider = () => {
    const [testimonialsList, setTestimonialsList] = useState<TestimonialItem[]>([]);
    const [current, setCurrent] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [loading, setLoading] = useState(true);

    // Fetch live real 5-star reviews from database
    useEffect(() => {
        async function fetchReviews() {
            try {
                const res = await fetch("/api/crm/google-reviews?rating=5&public=true");
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && Array.isArray(data.data) && data.data.length > 0) {
                        const mapped: TestimonialItem[] = data.data.map((r: any, idx: number) => {
                            const initials = (r.authorName || "Client")
                                .split(" ")
                                .filter(Boolean)
                                .map((n: string) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase();

                            return {
                                id: r.id,
                                name: r.authorName,
                                role: "Verified Patron",
                                avatar: initials || "VZ",
                                rating: r.rating || 5,
                                text: r.text,
                                color: GRADIENTS[idx % GRADIENTS.length],
                                relativeTime: r.relativeTime || "Recently",
                            };
                        });
                        setTestimonialsList(mapped);
                    }
                }
            } catch (err) {
                console.error("Error fetching reviews for testimonials:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchReviews();
    }, []);

    const next = useCallback(() => {
        setTestimonialsList((list) => {
            if (list.length === 0) return list;
            setCurrent((prev) => (prev + 1) % list.length);
            return list;
        });
    }, []);

    const prev = useCallback(() => {
        setTestimonialsList((list) => {
            if (list.length === 0) return list;
            setCurrent((prev) => (prev - 1 + list.length) % list.length);
            return list;
        });
    }, []);

    useEffect(() => {
        if (isPaused || testimonialsList.length <= 1) return;
        const timer = setInterval(next, 5000);
        return () => clearInterval(timer);
    }, [isPaused, next, testimonialsList.length]);

    // If no real reviews exist in database yet, do not show any placeholder
    if (loading || testimonialsList.length === 0) {
        return null;
    }

    const t = testimonialsList[current % testimonialsList.length];

    return (
        <section
            className="py-14 md:py-20 px-6 relative overflow-hidden bg-gradient-to-b from-white via-rose-50/15 to-white"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Ambient Warm Lighting */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-rose-100/20 rounded-full blur-[140px]" />
            </div>

            {/* Header */}
            <div className="max-w-4xl mx-auto mb-10 md:mb-12 text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="flex items-center justify-center gap-3 mb-2.5">
                        <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-rose-400/60" />
                        <span className="text-rose-600 text-[10px] sm:text-[11px] tracking-[0.35em] uppercase font-semibold">
                            Client Appreciation
                        </span>
                        <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-rose-400/60" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold tracking-tight text-gray-900 mb-2">
                        Words of Appreciation
                    </h2>
                    <p className="text-gray-500 text-xs sm:text-sm font-light max-w-md mx-auto">
                        Authentic experiences shared by our cherished patrons
                    </p>
                    <div className="flex justify-center mt-3">
                        <div className="h-[2px] w-10 bg-gradient-to-r from-rose-400 to-amber-400 rounded-full" />
                    </div>
                </motion.div>
            </div>

            {/* Testimonial Card */}
            <div className="max-w-3xl mx-auto relative z-10">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={t.id || current}
                        initial={{ opacity: 0, y: 15, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="bg-white/95 backdrop-blur-2xl rounded-[2rem] p-7 md:p-10 border border-gray-200/80 shadow-[0_8px_32px_rgba(244,63,94,0.06)] relative overflow-hidden"
                    >
                        {/* Quote icon */}
                        <Quote className="absolute top-6 right-6 w-14 h-14 text-rose-500/[0.06]" strokeWidth={1} />

                        {/* Top Meta Row: Stars & Verified Badge */}
                        <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
                            <div className="flex items-center gap-1">
                                {Array.from({ length: t.rating }).map((_, i) => (
                                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                                ))}
                                <span className="text-xs font-bold text-gray-800 ml-1.5 font-mono">5.0</span>
                            </div>

                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50/80 border border-rose-200/80 text-[11px] font-medium text-rose-800">
                                <span>Verified Experience</span>
                                <CheckCircle2 className="w-3 h-3 text-rose-600" />
                            </span>
                        </div>

                        {/* Text */}
                        <p className="text-base sm:text-lg md:text-xl font-serif text-gray-800 leading-relaxed mb-6 italic">
                            &ldquo;{t.text}&rdquo;
                        </p>

                        {/* Author */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 flex-wrap gap-3">
                            <div className="flex items-center gap-3.5">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-xs shadow-xs`}>
                                    {t.avatar}
                                </div>
                                <div>
                                    <h4 className="font-serif font-bold text-gray-900 text-base">{t.name}</h4>
                                    <p className="text-gray-400 text-[11px] tracking-wider uppercase font-medium">{t.role || "Verified Patron"}</p>
                                </div>
                            </div>

                            {t.relativeTime && (
                                <span className="text-xs text-gray-400 font-light font-mono">
                                    {t.relativeTime}
                                </span>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Navigation (shown if multiple reviews exist) */}
                {testimonialsList.length > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-7">
                        <button
                            onClick={prev}
                            className="press-tactile w-10 h-10 rounded-full bg-white border border-gray-200/80 shadow-xs flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 text-gray-700 transition-all cursor-pointer"
                            aria-label="Previous review"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        {/* Indicator Pills */}
                        <div className="flex gap-1.5 items-center bg-white px-3 py-1.5 rounded-full border border-gray-200/60 shadow-2xs">
                            {testimonialsList.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrent(idx)}
                                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                                        idx === current % testimonialsList.length
                                            ? "w-6 bg-gradient-to-r from-rose-500 to-amber-500"
                                            : "w-1.5 bg-gray-300 hover:bg-gray-400"
                                    }`}
                                    aria-label={`Go to review ${idx + 1}`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={next}
                            className="press-tactile w-10 h-10 rounded-full bg-white border border-gray-200/80 shadow-xs flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 text-gray-700 transition-all cursor-pointer"
                            aria-label="Next review"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

export default TestimonialSlider;
