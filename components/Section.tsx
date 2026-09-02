"use client";

import Image from 'next/image';
import Link from 'next/link';
import { ReactNode, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface SectionProps {
    title: string;
    description: string | ReactNode;
    buttonText: string;
    buttonLink?: string;
    imageSrc: string;
    imageAlt: string;
    reversed?: boolean;
    dark?: boolean;
    className?: string;
    subtitle?: string;
    accentColor?: "rose" | "amber" | "violet" | "teal";
}

const accentMap = {
    rose: { gradient: "from-rose-500 to-amber-500", text: "text-rose-600" },
    amber: { gradient: "from-amber-500 to-amber-700", text: "text-amber-600" },
    violet: { gradient: "from-violet-500 to-rose-500", text: "text-violet-600" },
    teal: { gradient: "from-teal-500 to-emerald-600", text: "text-teal-600" },
};

const Section = ({
    title,
    description,
    buttonText,
    buttonLink = "#",
    imageSrc,
    imageAlt,
    reversed = false,
    className = "",
    subtitle,
    accentColor = "rose",
}: SectionProps) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-60px" });
    const accent = accentMap[accentColor];

    return (
        <section ref={ref} className={`w-full py-14 md:py-24 px-6 md:px-12 relative overflow-hidden ${className}`}>
            <div className={`max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 lg:gap-14 ${reversed ? 'md:flex-row-reverse' : ''}`}>

                {/* Image Side with Concentric Frame & Neutral Ring (UI Skills Rule #5 & #10) */}
                <motion.div
                    className="w-full md:w-1/2 relative group"
                    initial={{ opacity: 0, x: reversed ? 40 : -40 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className={`absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br ${accent.gradient} opacity-[0.06] group-hover:opacity-[0.12] blur-2xl transition-opacity duration-700 -z-10`} />

                    <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] ring-1 ring-black/[0.06] shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
                        <Image
                            src={imageSrc}
                            alt={imageAlt}
                            fill
                            className="object-cover transition-all duration-[1.4s] group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                </motion.div>

                {/* Text Side with Fluid Typography Scale */}
                <motion.div
                    className={`w-full md:w-1/2 flex flex-col items-start ${reversed ? 'md:pr-6' : 'md:pl-6'}`}
                    initial={{ opacity: 0, x: reversed ? -30 : 30 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                >
                    {subtitle && (
                        <motion.div
                            className="flex items-center gap-3 mb-3"
                            initial={{ opacity: 0, y: 10 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.4, delay: 0.2 }}
                        >
                            <div className={`h-[1.5px] w-6 bg-gradient-to-r ${accent.gradient} rounded-full`} />
                            <span className="text-neutral-400 text-[11px] tracking-[0.35em] uppercase font-semibold">{subtitle}</span>
                        </motion.div>
                    )}

                    <motion.h2
                        className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black uppercase mb-3 tracking-tight leading-[1.02] text-neutral-900"
                        initial={{ opacity: 0, y: 12 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5, delay: 0.25 }}
                    >
                        {title}
                    </motion.h2>

                    <motion.div
                        className="mb-5 overflow-hidden"
                        initial={{ width: 0 }}
                        animate={isInView ? { width: 44 } : {}}
                        transition={{ duration: 0.5, delay: 0.35 }}
                    >
                        <div className={`h-[2px] bg-gradient-to-r ${accent.gradient} rounded-full w-full`} />
                    </motion.div>

                    <motion.div
                        className="text-sm sm:text-base font-sans leading-relaxed text-neutral-500 mb-8 max-w-md font-light"
                        initial={{ opacity: 0, y: 12 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        {description}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5, delay: 0.45 }}
                    >
                        <Link
                            href={buttonLink}
                            className="press-tactile group relative inline-flex items-center gap-2.5 overflow-hidden px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.22em] rounded-full transition-all duration-300 shadow-md hover:shadow-lg bg-neutral-900 text-white"
                        >
                            <span className="relative z-10">{buttonText}</span>
                            <ArrowRight className="w-3.5 h-3.5 relative z-10 group-hover:translate-x-0.5 transition-transform duration-300" />
                            <div className={`absolute inset-0 bg-gradient-to-r ${accent.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

export default Section;
