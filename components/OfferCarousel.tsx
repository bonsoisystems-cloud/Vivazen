"use client";

import { useRef, useEffect, useState } from "react";
import Image from 'next/image';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { Sparkles, Flame, ChevronLeft, ChevronRight } from "lucide-react";

export interface OfferItem {
    id: string;
    src: string;
    badge: string;
    badgeColor: string;
    title: string;
    subtitle: string;
    service: string;
    sub: string;
}

function mapOffer(item: any): OfferItem {
    return {
        id: item.id,
        src: item.image || item.src || "",
        badge: item.badge || "HOT",
        badgeColor: item.badgeColor || "from-rose-500 to-red-500",
        title: item.title,
        subtitle: item.subtitle || "",
        service: item.serviceSlug || item.service || "services",
        sub: item.subCategoryName || item.sub || "",
    };
}

interface OfferCarouselProps {
    initialOffers?: any[];
}

const OfferCarousel = ({ initialOffers }: OfferCarouselProps = {}) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, margin: "-60px" });
    const [offersList, setOffersList] = useState<OfferItem[]>(() =>
        initialOffers && initialOffers.length > 0 ? initialOffers.map(mapOffer) : []
    );
    const [loading, setLoading] = useState(
        () => !initialOffers || initialOffers.length === 0
    );
    const [isPaused, setIsPaused] = useState(false);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    useEffect(() => {
        if (offersList.length > 0) {
            setLoading(false);
            return;
        }

        async function fetchDynamicOffers() {
            try {
                const res = await fetch("/api/offers");
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && Array.isArray(data.data)) {
                        setOffersList(data.data.map(mapOffer));
                    }
                }
            } catch (err) {
                console.error("Error fetching offers  :", err);
            } finally {
                setLoading(false);
            }
        }
        fetchDynamicOffers();
    }, [offersList.length]);

    const checkScroll = () => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 10);
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    };

    const scrollBy = (dir: number) => {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollBy({ left: dir * 340, behavior: "smooth" });
    };

    useEffect(() => {
        const el = scrollRef.current;
        if (!el || offersList.length === 0) return;
        let animId: number;
        const speed = 0.5;
        const tick = () => {
            if (!isPaused && el) {
                el.scrollLeft += speed;
                if (el.scrollLeft >= el.scrollWidth - el.clientWidth) el.scrollLeft = 0;
            }
            animId = requestAnimationFrame(tick);
        };
        animId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(animId);
    }, [isPaused, offersList.length]);

    if (!loading && offersList.length === 0) {
        return null; // Don't render section if database has no active offers
    }

    return (
        <section
            ref={sectionRef}
            className="py-10 md:py-14 relative overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
        >
            {/* Header */}
            <div className="max-w-5xl mx-auto px-6 mb-8 text-center">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }}>
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-rose-400/60" />
                        <span className="text-rose-500 text-[10px] tracking-[0.5em] uppercase font-semibold">Limited Time</span>
                        <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-rose-400/60" />
                    </div>
                    <h2 className="text-4xl md:text-6xl font-serif font-bold mb-3 tracking-tight text-gray-900">
                        Exclusive Offers
                    </h2>
                    <p className="text-gray-400 max-w-md mx-auto font-light tracking-wide text-base">
                        Premium experiences at exceptional value. Tap any offer to book.
                    </p>
                    <div className="mt-3 flex justify-center">
                        <div className="h-[2px] w-12 bg-gradient-to-r from-amber-400 to-rose-400 rounded-full" />
                    </div>
                </motion.div>
            </div>

            {/* Carousel */}
            <div className="relative w-full">
                {offersList.length > 3 && (
                    <>
                        <button
                            onClick={() => scrollBy(-1)}
                            className={`press-tactile absolute left-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/90 backdrop-blur-xl shadow-lg border border-neutral-200/80 flex items-center justify-center transition-all duration-300 ${canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                            aria-label="Scroll Left"
                        >
                            <ChevronLeft className="w-4 h-4 text-neutral-800" />
                        </button>
                        <button
                            onClick={() => scrollBy(1)}
                            className={`press-tactile absolute right-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/90 backdrop-blur-xl shadow-lg border border-neutral-200/80 flex items-center justify-center transition-all duration-300 ${canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                            aria-label="Scroll Right"
                        >
                            <ChevronRight className="w-4 h-4 text-neutral-800" />
                        </button>
                    </>
                )}

                <div
                    ref={scrollRef}
                    onScroll={() => {
                        if (!scrollRef.current) return;
                        requestAnimationFrame(checkScroll);
                    }}
                    className="flex overflow-x-auto pb-4 gap-5 px-6 md:px-12 no-scrollbar mask-fade-x"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', touchAction: 'pan-y' }}
                >
                    {loading ? (
                        Array.from({ length: 4 }).map((_, idx) => (
                            <div key={idx} className="flex-none w-[240px] md:w-[280px] aspect-[3/4] rounded-[1.75rem] bg-neutral-100 animate-pulse border border-neutral-200/50" />
                        ))
                    ) : (
                        offersList.map((offer, idx) => (
                            <motion.div
                                key={offer.id || idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                                className="flex-none w-[240px] md:w-[280px] group cursor-pointer"
                            >
                                <Link href={`/contact?service=${offer.service}&sub=${encodeURIComponent(offer.sub)}&package=${encodeURIComponent(offer.title)}`}>
                                    <div className="relative aspect-[3/4] rounded-[1.75rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1.5 ring-1 ring-black/[0.06] press-tactile">
                                        <Image src={offer.src} alt={offer.title} fill className="object-cover transition-transform duration-[1.2s] group-hover:scale-105" />
                                        
                                        {/* Luxury Badge */}
                                        <div className={`absolute top-4 left-4 bg-gradient-to-r ${offer.badgeColor} text-white text-[9px] font-bold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 z-10`}>
                                            {offer.badge === "HOT" ? <Flame className="w-2.5 h-2.5" /> : <Sparkles className="w-2.5 h-2.5" />}
                                            {offer.badge}
                                        </div>

                                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-6">
                                            <p className="text-amber-200/90 text-[10px] tracking-[0.3em] uppercase font-semibold mb-1">{offer.subtitle}</p>
                                            <h3 className="text-lg font-serif font-bold text-white leading-snug">{offer.title}</h3>
                                            <span className="text-[11px] text-amber-300 uppercase tracking-wider font-semibold mt-2 inline-flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                Reserve Exclusive Rate →
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
};

export default OfferCarousel;
