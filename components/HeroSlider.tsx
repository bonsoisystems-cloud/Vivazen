"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from 'next/link';
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface SlideItem {
    id: number | string;
    src: string;
    alt: string;
    tagline: string;
}

function mapSlide(item: any, idx: number): SlideItem {
    return {
        id: item.id || idx + 1,
        src: item.image || item.src || "",
        alt: item.alt || "Hero Slide",
        tagline: item.tagline || "",
    };
}

const SLIDE_DURATION = 6000;

interface HeroSliderProps {
    initialSlides?: any[];
}

const HeroSlider = ({ initialSlides }: HeroSliderProps = {}) => {
    const [slidesList, setSlidesList] = useState<SlideItem[]>(() =>
        initialSlides && initialSlides.length > 0 ? initialSlides.map(mapSlide) : []
    );
    const [loading, setLoading] = useState(
        () => !initialSlides || initialSlides.length === 0
    );
    const [currentSlide, setCurrentSlide] = useState(0);
    const [progress, setProgress] = useState(0);
    const [direction, setDirection] = useState(1);

    useEffect(() => {
        if (slidesList.length > 0) {
            setLoading(false);
            return;
        }

        async function fetchHeroSlides() {
            try {
                const res = await fetch("/api/hero-slides");
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && Array.isArray(data.data) && data.data.length > 0) {
                        setSlidesList(data.data.map(mapSlide));
                    }
                }
            } catch (err) {
                console.error("Error fetching hero slides  :", err);
            } finally {
                setLoading(false);
            }
        }
        fetchHeroSlides();
    }, [slidesList.length]);

    const goTo = useCallback((idx: number) => {
        setDirection(idx > currentSlide ? 1 : -1);
        setCurrentSlide(idx);
        setProgress(0);
    }, [currentSlide]);

    const next = useCallback(() => {
        if (slidesList.length === 0) return;
        setDirection(1);
        setCurrentSlide((prev) => (prev + 1) % slidesList.length);
        setProgress(0);
    }, [slidesList.length]);

    const prev = useCallback(() => {
        if (slidesList.length === 0) return;
        setDirection(-1);
        setCurrentSlide((prev) => (prev - 1 + slidesList.length) % slidesList.length);
        setProgress(0);
    }, [slidesList.length]);

    // Auto-advance
    useEffect(() => {
        if (slidesList.length <= 1) return;
        const timer = setInterval(next, SLIDE_DURATION);
        return () => clearInterval(timer);
    }, [next, slidesList.length]);

    // Progress bar
    useEffect(() => {
        if (slidesList.length === 0) return;
        setProgress(0);
        const start = Date.now();
        const tick = () => {
            const elapsed = Date.now() - start;
            setProgress(Math.min(elapsed / SLIDE_DURATION, 1));
            if (elapsed < SLIDE_DURATION) requestAnimationFrame(tick);
        };
        const frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [currentSlide, slidesList.length]);

    const slideVariants = {
        enter: (dir: number) => ({ x: dir > 0 ? "8%" : "-8%", opacity: 0, scale: 1.05 }),
        center: { x: 0, opacity: 1, scale: 1 },
        exit: (dir: number) => ({ x: dir > 0 ? "-8%" : "8%", opacity: 0, scale: 0.95 }),
    };

    if (loading) {
        return (
            <section className="relative w-full h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                </div>
            </section>
        );
    }

    if (slidesList.length === 0) {
        return null;
    }

    const safeSlideIndex = currentSlide < slidesList.length ? currentSlide : 0;
    const current = slidesList[safeSlideIndex];

    return (
        <section className="relative w-full h-screen overflow-hidden bg-black">
            {/* Slides with AnimatePresence */}
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.div
                    key={safeSlideIndex}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="absolute inset-0"
                >
                    <div className="relative w-full h-full animate-ken-burns">
                        <Image
                            src={current.src}
                            alt={current.alt}
                            fill
                            className="object-cover object-[85%_center] lg:object-center"
                            priority={safeSlideIndex === 0}
                        />
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-black/70 z-10 pointer-events-none" />
            <div className="absolute inset-0 z-10 pointer-events-none"
                style={{ background: 'linear-gradient(to top, #ffffff 4%, rgba(255,255,255,0.7) 10%, rgba(255,255,255,0.15) 18%, rgba(255,255,255,0) 26%)' }}
            />

            {/* Hero Content */}
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6 max-w-5xl mx-auto">
                {/* Luxury Micro-Badge */}
                <motion.div
                    key={`sub-${safeSlideIndex}`}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                    className="flex items-center gap-2 mb-3 md:mb-4"
                >
                    <span className="w-6 h-[1px] bg-amber-400/80" />
                    <span className="text-amber-200/90 text-xs md:text-sm tracking-[0.3em] uppercase font-semibold drop-shadow-md">
                        The Luxury Destination
                    </span>
                    <span className="w-6 h-[1px] bg-amber-400/80" />
                </motion.div>

                {/* Main Hero Headline */}
                <motion.h1
                    key={`title-${safeSlideIndex}`}
                    initial={{ opacity: 0, y: 24, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-black tracking-tighter uppercase text-white drop-shadow-2xl mb-3 md:mb-5 leading-[0.95]"
                    style={{ textShadow: '0 8px 32px rgba(0,0,0,0.6)' }}
                >
                    VIVAZEN
                </motion.h1>

                {/* Typed Tagline with text-wrap balance */}
                <AnimatePresence mode="wait">
                    <motion.p
                        key={`tagline-${safeSlideIndex}`}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.45, delay: 0.35 }}
                        className="text-neutral-100 text-base sm:text-lg md:text-2xl font-light tracking-wide mb-8 md:mb-10 font-serif italic max-w-2xl leading-relaxed drop-shadow-lg"
                    >
                        {current.tagline}
                    </motion.p>
                </AnimatePresence>

                {/* Luxury Booking CTA with UI-Skills Press Feedback */}
                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                >
                    <Link
                        href="/contact"
                        className="press-tactile relative overflow-hidden bg-white text-neutral-950 px-10 md:px-12 py-4 text-xs font-semibold uppercase tracking-[0.25em] rounded-full shadow-2xl hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] transition-all duration-300 inline-flex items-center gap-3 group"
                    >
                        <span className="relative z-10 font-medium">Book Your Experience</span>
                        <span className="relative z-10 text-amber-600 group-hover:translate-x-1 transition-transform duration-300">→</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-amber-400 to-rose-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <span className="relative z-10 group-hover:text-white transition-colors duration-300"></span>
                    </Link>
                </motion.div>
            </div>

            {/* Navigation Arrows */}
            {slidesList.length > 1 && (
                <>
                    <button
                        onClick={prev}
                        className="press-tactile absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 md:w-13 md:h-13 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-xl border border-white/15 flex items-center justify-center text-white transition-all duration-300 group"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                    <button
                        onClick={next}
                        className="press-tactile absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 md:w-13 md:h-13 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-xl border border-white/15 flex items-center justify-center text-white transition-all duration-300 group"
                        aria-label="Next slide"
                    >
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                </>
            )}

            {/* Progress Indicator + Dots */}
            {slidesList.length > 1 && (
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-4">
                    <div className="flex gap-2.5 items-center bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                        {slidesList.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => goTo(idx)}
                                className="relative w-8 md:w-10 h-1 rounded-full overflow-hidden bg-white/25 transition-all"
                                aria-label={`Go to slide ${idx + 1}`}
                            >
                                {idx === safeSlideIndex ? (
                                    <motion.div
                                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-300 to-white rounded-full"
                                        style={{ width: `${progress * 100}%` }}
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-transparent hover:bg-white/40 transition-colors duration-200 rounded-full" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
};

export default HeroSlider;
