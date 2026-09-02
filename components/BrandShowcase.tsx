"use client";

import { motion } from "framer-motion";

export interface BrandItem {
    id: string;
    name: string;
    category: "Hair Care" | "Skincare" | "Makeup" | "Tools & Nails";
    origin: string;
    tagline: string;
    svg: React.ReactNode;
}

export const brandsList: BrandItem[] = [
    // 1. Loreal
    {
        id: "loreal",
        name: "L'Oréal Professionnel",
        category: "Hair Care",
        origin: "Paris, France",
        tagline: "Hair Color & Couture Spa",
        svg: (
            <svg viewBox="0 0 200 40" fill="currentColor" className="w-full h-7">
                <text x="50%" y="52%" textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-playfair), Georgia, serif" fontSize="19" fontWeight="800" letterSpacing="0.14em">
                    L&apos;ORÉAL
                </text>
                <text x="50%" y="86%" textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-sans), sans-serif" fontSize="6.5" fontWeight="600" letterSpacing="0.3em">
                    PROFESSIONNEL PARIS
                </text>
            </svg>
        ),
    },
    // 2. Schwarzkopf
    {
        id: "schwarzkopf",
        name: "Schwarzkopf",
        category: "Hair Care",
        origin: "Germany",
        tagline: "Professional Hair Alchemy",
        svg: (
            <svg viewBox="0 0 200 40" fill="currentColor" className="w-full h-7">
                <text x="50%" y="52%" textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-serif), serif" fontSize="18" fontWeight="800" letterSpacing="0.12em">
                    Schwarzkopf
                </text>
                <text x="50%" y="86%" textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-sans), sans-serif" fontSize="6.5" fontWeight="600" letterSpacing="0.3em">
                    PROFESSIONAL
                </text>
            </svg>
        ),
    },
    // 3. OLAPLEX
    {
        id: "olaplex",
        name: "OLAPLEX",
        category: "Hair Care",
        origin: "California, USA",
        tagline: "Patented Bond Repair",
        svg: (
            <svg viewBox="0 0 200 40" fill="currentColor" className="w-full h-7">
                <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-sans), sans-serif" fontSize="21" fontWeight="900" letterSpacing="0.24em">
                    OLAPLEX.
                </text>
            </svg>
        ),
    },
    // 4. Beauty Garage
    {
        id: "beauty-garage",
        name: "Beauty Garage",
        category: "Hair Care",
        origin: "USA / Global",
        tagline: "Keratin & Botoplexx Therapy",
        svg: (
            <svg viewBox="0 0 200 40" fill="currentColor" className="w-full h-7">
                <text x="50%" y="52%" textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-sans), sans-serif" fontSize="17" fontWeight="800" letterSpacing="0.16em">
                    BEAUTY GARAGE
                </text>
                <text x="50%" y="86%" textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-sans), sans-serif" fontSize="6.5" fontWeight="600" letterSpacing="0.32em">
                    PROFESSIONAL
                </text>
            </svg>
        ),
    },
    // 5. SHILLS
    {
        id: "shills",
        name: "SHILLS",
        category: "Hair Care",
        origin: "Taiwan / Global",
        tagline: "Advanced Hair & Beauty",
        svg: (
            <svg viewBox="0 0 200 40" fill="currentColor" className="w-full h-7">
                <text x="50%" y="52%" textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-sans), sans-serif" fontSize="20" fontWeight="900" letterSpacing="0.22em">
                    SHILLS
                </text>
                <text x="50%" y="86%" textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-sans), sans-serif" fontSize="6.5" fontWeight="600" letterSpacing="0.28em">
                    PROFESSIONAL
                </text>
            </svg>
        ),
    },
    // 6. RICA
    {
        id: "rica",
        name: "RICA",
        category: "Hair Care",
        origin: "Sicily, Italy",
        tagline: "Natural Liposoluble Wax",
        svg: (
            <svg viewBox="0 0 200 40" fill="currentColor" className="w-full h-7">
                <text x="50%" y="52%" textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-serif), serif" fontSize="22" fontWeight="900" letterSpacing="0.26em">
                    RICA
                </text>
                <text x="50%" y="86%" textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-sans), sans-serif" fontSize="6.5" fontWeight="600" letterSpacing="0.3em">
                    MADE IN ITALY
                </text>
            </svg>
        ),
    },
    // 7. O3+
    {
        id: "o3-plus",
        name: "O3+",
        category: "Skincare",
        origin: "Italy / India",
        tagline: "Derma Radiance & D-Tan",
        svg: (
            <svg viewBox="0 0 200 40" fill="currentColor" className="w-full h-7">
                <text x="50%" y="52%" textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-sans), sans-serif" fontSize="22" fontWeight="900" letterSpacing="0.12em">
                    O3+
                </text>
                <text x="50%" y="86%" textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-sans), sans-serif" fontSize="6.5" fontWeight="600" letterSpacing="0.3em">
                    PROFESSIONAL DERMA CARE
                </text>
            </svg>
        ),
    },
    // 8. Casmara
    {
        id: "casmara",
        name: "Casmara",
        category: "Skincare",
        origin: "Valencia, Spain",
        tagline: "Algae Peel-Off Masks",
        svg: (
            <svg viewBox="0 0 200 40" fill="currentColor" className="w-full h-7">
                <text x="50%" y="52%" textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-serif), serif" fontSize="20" fontWeight="700" letterSpacing="0.22em">
                    CASMARA
                </text>
                <text x="50%" y="86%" textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-sans), sans-serif" fontSize="6.5" fontWeight="600" letterSpacing="0.3em">
                    SPAIN • BEAUTY WITHOUT LIMITS
                </text>
            </svg>
        ),
    },
    // 9. Kanpeki
    {
        id: "kanpeki",
        name: "Kanpeki",
        category: "Skincare",
        origin: "Tokyo, Japan",
        tagline: "Japanese Bio-Cellular Skincare",
        svg: (
            <svg viewBox="0 0 200 40" fill="currentColor" className="w-full h-7">
                <text x="50%" y="52%" textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-sans), sans-serif" fontSize="19" fontWeight="700" letterSpacing="0.24em">
                    kanpeki
                </text>
                <text x="50%" y="86%" textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-sans), sans-serif" fontSize="6.5" fontWeight="600" letterSpacing="0.32em">
                    LABS JAPAN
                </text>
            </svg>
        ),
    },
    // 10. Lotus
    {
        id: "lotus",
        name: "Lotus Professional",
        category: "Skincare",
        origin: "India",
        tagline: "Phyto-Rx Clinical Care",
        svg: (
            <svg viewBox="0 0 200 40" fill="currentColor" className="w-full h-7">
                <text x="50%" y="52%" textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-serif), serif" fontSize="19" fontWeight="800" letterSpacing="0.22em">
                    LOTUS
                </text>
                <text x="50%" y="86%" textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-sans), sans-serif" fontSize="6.5" fontWeight="600" letterSpacing="0.32em">
                    PROFESSIONAL
                </text>
            </svg>
        ),
    },
    // 11. Vedic Line
    {
        id: "vedic-line",
        name: "Vedic Line",
        category: "Skincare",
        origin: "India",
        tagline: "Ayurvedic Spa Formulations",
        svg: (
            <svg viewBox="0 0 200 40" fill="currentColor" className="w-full h-7">
                <text x="50%" y="52%" textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-serif), serif" fontSize="18" fontWeight="700" letterSpacing="0.18em">
                    VEDIC LINE
                </text>
                <text x="50%" y="86%" textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-sans), sans-serif" fontSize="6.5" fontWeight="600" letterSpacing="0.3em">
                    AYURVEDIC RADIANCE
                </text>
            </svg>
        ),
    },
    // 12. Ozone
    {
        id: "ozone",
        name: "Ozone",
        category: "Skincare",
        origin: "India",
        tagline: "Organic Bio-Actives",
        svg: (
            <svg viewBox="0 0 200 40" fill="currentColor" className="w-full h-7">
                <text x="50%" y="52%" textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-sans), sans-serif" fontSize="20" fontWeight="900" letterSpacing="0.26em">
                    OZONE
                </text>
                <text x="50%" y="86%" textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-sans), sans-serif" fontSize="6.5" fontWeight="600" letterSpacing="0.3em">
                    PROFESSIONAL CARE
                </text>
            </svg>
        ),
    },
    // 13. MAC
    {
        id: "mac",
        name: "M·A·C Cosmetics",
        category: "Makeup",
        origin: "Toronto / New York",
        tagline: "Backstage Runway Authority",
        svg: (
            <svg viewBox="0 0 200 40" fill="currentColor" className="w-full h-7">
                <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-sans), sans-serif" fontSize="21" fontWeight="900" letterSpacing="0.38em">
                    M · A · C
                </text>
            </svg>
        ),
    },
    // 14. NARS
    {
        id: "nars",
        name: "NARS",
        category: "Makeup",
        origin: "New York / Paris",
        tagline: "Audacious High-Pigment Luxury",
        svg: (
            <svg viewBox="0 0 200 40" fill="currentColor" className="w-full h-7">
                <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-serif), serif" fontSize="23" fontWeight="900" letterSpacing="-0.02em">
                    NARS
                </text>
            </svg>
        ),
    },
    // 15. Bobbi Brown
    {
        id: "bobbi-brown",
        name: "Bobbi Brown",
        category: "Makeup",
        origin: "New York, USA",
        tagline: "Couture Glow & Natural Glam",
        svg: (
            <svg viewBox="0 0 200 40" fill="currentColor" className="w-full h-7">
                <text x="50%" y="52%" textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-sans), sans-serif" fontSize="17" fontWeight="800" letterSpacing="0.18em">
                    BOBBI BROWN
                </text>
                <text x="50%" y="86%" textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-sans), sans-serif" fontSize="6.5" fontWeight="600" letterSpacing="0.34em">
                    NEW YORK
                </text>
            </svg>
        ),
    },
    // 16. ANASTASIA BEVERLY HILLS
    {
        id: "abh",
        name: "Anastasia Beverly Hills",
        category: "Makeup",
        origin: "Beverly Hills, USA",
        tagline: "Golden Ratio Arch & Sculpt",
        svg: (
            <svg viewBox="0 0 200 40" fill="currentColor" className="w-full h-7">
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-serif), serif" fontSize="15" fontWeight="800" letterSpacing="0.16em">
                    ANASTASIA
                </text>
                <text x="50%" y="84%" textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-sans), sans-serif" fontSize="6.5" fontWeight="600" letterSpacing="0.32em">
                    BEVERLY HILLS
                </text>
            </svg>
        ),
    },
    // 17. Huda Beauty
    {
        id: "huda-beauty",
        name: "Huda Beauty",
        category: "Makeup",
        origin: "Dubai, UAE",
        tagline: "Flawless Complexion & Eyes",
        svg: (
            <svg viewBox="0 0 200 40" fill="currentColor" className="w-full h-7">
                <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-sans), sans-serif" fontSize="18" fontWeight="900" letterSpacing="0.28em">
                    HUDABEAUTY
                </text>
            </svg>
        ),
    },
    // 18. Kryolan
    {
        id: "kryolan",
        name: "Kryolan",
        category: "Makeup",
        origin: "Berlin, Germany",
        tagline: "HD Cinematic Makeup",
        svg: (
            <svg viewBox="0 0 200 40" fill="currentColor" className="w-full h-7">
                <text x="50%" y="52%" textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-sans), sans-serif" fontSize="19" fontWeight="900" letterSpacing="0.18em">
                    KRYOLAN
                </text>
                <text x="50%" y="86%" textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-sans), sans-serif" fontSize="6.5" fontWeight="600" letterSpacing="0.3em">
                    PROFESSIONAL MAKE-UP
                </text>
            </svg>
        ),
    },
    // 19. Tarte
    {
        id: "tarte",
        name: "Tarte",
        category: "Makeup",
        origin: "New York, USA",
        tagline: "High-Performance Naturals",
        svg: (
            <svg viewBox="0 0 200 40" fill="currentColor" className="w-full h-7">
                <text x="50%" y="52%" textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-serif), serif" fontSize="21" fontWeight="700" letterSpacing="0.14em">
                    tarte
                </text>
                <text x="50%" y="86%" textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-sans), sans-serif" fontSize="6.5" fontWeight="600" letterSpacing="0.25em">
                    HIGH-PERFORMANCE NATURALS
                </text>
            </svg>
        ),
    },
    // 20. Forever 52
    {
        id: "forever-52",
        name: "Forever 52",
        category: "Makeup",
        origin: "Paris / Global",
        tagline: "HD Bridal Perfection",
        svg: (
            <svg viewBox="0 0 200 40" fill="currentColor" className="w-full h-7">
                <text x="50%" y="52%" textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-sans), sans-serif" fontSize="19" fontWeight="900" letterSpacing="0.14em">
                    FOREVER52
                </text>
                <text x="50%" y="86%" textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-sans), sans-serif" fontSize="6.5" fontWeight="600" letterSpacing="0.32em">
                    PROFESSIONAL PARIS
                </text>
            </svg>
        ),
    },
    // 21. PAC Cosmetics
    {
        id: "pac",
        name: "PAC Cosmetics",
        category: "Makeup",
        origin: "India / International",
        tagline: "Professional Artist Cosmetics",
        svg: (
            <svg viewBox="0 0 200 40" fill="currentColor" className="w-full h-7">
                <text x="50%" y="52%" textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-sans), sans-serif" fontSize="22" fontWeight="900" letterSpacing="0.22em">
                    PAC
                </text>
                <text x="50%" y="86%" textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-sans), sans-serif" fontSize="6.5" fontWeight="600" letterSpacing="0.28em">
                    PROFESSIONAL ARTIST
                </text>
            </svg>
        ),
    },
    // 22. IKONIC
    {
        id: "ikonic",
        name: "IKONIC",
        category: "Tools & Nails",
        origin: "Global",
        tagline: "Titanium Styling Irons & Dryers",
        svg: (
            <svg viewBox="0 0 200 40" fill="currentColor" className="w-full h-7">
                <text x="50%" y="52%" textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-sans), sans-serif" fontSize="20" fontWeight="900" letterSpacing="0.26em">
                    IKONIC
                </text>
                <text x="50%" y="86%" textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-sans), sans-serif" fontSize="6.5" fontWeight="600" letterSpacing="0.3em">
                    PROFESSIONAL
                </text>
            </svg>
        ),
    },
    // 23. Mr Barber
    {
        id: "mr-barber",
        name: "Mr Barber",
        category: "Tools & Nails",
        origin: "Global",
        tagline: "Precision Heat & Ceramic Tools",
        svg: (
            <svg viewBox="0 0 200 40" fill="currentColor" className="w-full h-7">
                <text x="50%" y="52%" textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-sans), sans-serif" fontSize="18" fontWeight="800" letterSpacing="0.2em">
                    MR. BARBER
                </text>
                <text x="50%" y="86%" textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-sans), sans-serif" fontSize="6.5" fontWeight="600" letterSpacing="0.3em">
                    SALON HARDWARE
                </text>
            </svg>
        ),
    },
    // 24. LICK
    {
        id: "lick",
        name: "LICK",
        category: "Tools & Nails",
        origin: "Global",
        tagline: "Haute Nail Couture & Gels",
        svg: (
            <svg viewBox="0 0 200 40" fill="currentColor" className="w-full h-7">
                <text x="50%" y="52%" textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-sans), sans-serif" fontSize="21" fontWeight="900" letterSpacing="0.26em">
                    LICK
                </text>
                <text x="50%" y="86%" textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-sans), sans-serif" fontSize="6.5" fontWeight="600" letterSpacing="0.32em">
                    NAIL COUTURE
                </text>
            </svg>
        ),
    },
];

const BrandShowcase = () => {
    return (
        <section className="py-14 md:py-20 bg-gradient-to-b from-white via-neutral-50/50 to-white relative overflow-hidden" id="brand-partners">
            {/* Ambient Warm Champagne Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[300px] bg-amber-100/20 rounded-full blur-[140px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                {/* Haute Couture Header */}
                <div className="text-center max-w-2xl mx-auto mb-10">
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <div className="h-[1px] w-10 bg-gradient-to-r from-transparent to-amber-500/60" />
                        <span className="text-amber-600 text-[10px] sm:text-[11px] font-semibold tracking-[0.35em] uppercase">
                            Global Beauty Houses
                        </span>
                        <div className="h-[1px] w-10 bg-gradient-to-l from-transparent to-amber-500/60" />
                    </div>

                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black tracking-tight text-neutral-900 mb-3 leading-tight">
                        Our Official Product Partners
                    </h2>
                    <p className="text-neutral-500 font-light text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
                        We formulate and style exclusively with 24 world-renowned luxury beauty, clinical skincare, and bridal couture houses.
                    </p>
                    <div className="mt-4 flex justify-center">
                        <div className="h-[2px] w-12 bg-gradient-to-r from-amber-400 to-rose-400 rounded-full" />
                    </div>
                </div>

                {/* Single-Line Infinite Luxury Marquee (All 24 Brands) */}
                <div className="relative overflow-hidden mask-fade-x py-3">
                    <motion.div
                        className="flex gap-4 sm:gap-5 w-max items-center"
                        animate={{ x: ["0%", "-50%"] }}
                        transition={{ repeat: Infinity, duration: 48, ease: "linear" }}
                    >
                        {[...brandsList, ...brandsList].map((brand, i) => (
                            <div
                                key={`${brand.id}-${i}`}
                                className="w-[210px] sm:w-[240px] h-24 flex-none bg-white/85 backdrop-blur-xl rounded-2xl px-5 py-3.5 border border-neutral-200/70 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-amber-400/50 hover:shadow-[0_10px_28px_rgba(0,0,0,0.06)] hover:bg-white transition-all duration-300 group flex flex-col items-center justify-between text-neutral-700 hover:text-neutral-950 cursor-default ring-1 ring-black/[0.03] press-tactile"
                            >
                                {/* Vector SVG Logo */}
                                <div className="w-full h-8 flex items-center justify-center text-neutral-800 group-hover:text-amber-700 transition-colors">
                                    {brand.svg}
                                </div>

                                {/* Bottom Metadata Tag */}
                                <div className="w-full flex items-center justify-between border-t border-neutral-100 pt-1.5 mt-1 text-[9px] text-neutral-400 group-hover:text-neutral-600 transition-colors">
                                    <span className="font-semibold tracking-[0.2em] uppercase text-amber-600/90 truncate">
                                        {brand.category}
                                    </span>
                                    <span className="font-light truncate ml-1 text-neutral-400">
                                        {brand.origin}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* Subtle Luxury Authenticity Badge */}
                <div className="mt-8 pt-5 border-t border-neutral-200/50 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 gap-2 text-center sm:text-left">
                    <p className="font-light tracking-wide">
                        <span className="font-semibold text-neutral-700">100% Verified Authenticity:</span> Sourced directly through certified international distributor networks.
                    </p>
                    <span className="text-amber-700/90 font-semibold tracking-[0.18em] uppercase text-[10px] whitespace-nowrap">
                        24 Certified Brand Partners
                    </span>
                </div>
            </div>
        </section>
    );
};

export default BrandShowcase;
