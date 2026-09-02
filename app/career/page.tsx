"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Briefcase, TrendingUp, Globe, Scissors } from "lucide-react";
import { R2_IMAGE_BASE_URL } from "../../lib/constants";

const benefits = [
    { icon: TrendingUp, title: "Growth", desc: "Clear career progression paths and continuous skill development." },
    { icon: Globe, title: "Global Exposure", desc: "International techniques and trends from across the world." },
    { icon: Scissors, title: "Creative Freedom", desc: "Express your artistry in a supportive, creative environment." },
    { icon: Briefcase, title: "Stability", desc: "Competitive compensation and long-term career opportunities." },
];

const roles = [
    "Senior Hair Stylist",
    "Makeup Artist",
    "Nail Technician",
    "Skin Care Specialist",
    "Bridal Consultant",
    "Salon Manager",
    "Junior Stylist (Trainee)",
    "Receptionist",
];

export default function CareerPage() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-60px" });

    return (
        <div ref={ref} className="min-h-screen bg-gradient-to-b from-white via-amber-50/20 to-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-amber-100/30 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-40 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-rose-100/30 to-transparent rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <section className="pt-28 pb-10 px-6 text-center relative z-10">
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-amber-400/60" />
                        <span className="text-amber-600 text-[10px] tracking-[0.5em] uppercase font-semibold">Join Us</span>
                        <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-amber-400/60" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight text-gray-900 mb-3">
                        Career at VIVAZEN
                    </h1>
                    <p className="text-gray-400 max-w-lg mx-auto text-base font-light tracking-wide">
                        Discover limitless earning opportunities and global prospects where your creativity blossoms.
                    </p>
                    <div className="mt-3 flex justify-center">
                        <div className="h-[3px] w-12 bg-gradient-to-r from-amber-400 to-rose-400 rounded-full" />
                    </div>
                </motion.div>
            </section>

            <div className="max-w-6xl mx-auto px-6 pb-20 relative z-10">
                {/* Hero Image + Intro */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className="grid md:grid-cols-2 gap-8 md:gap-12 items-center mb-16"
                >
                    <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden shadow-lg group">
                        <Image src={`${R2_IMAGE_BASE_URL}/gallery/nail/nail-2.jpg`} alt="Career at Vivazen" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    </div>
                    <div>
                        <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">Be Part of Something Beautiful</h2>
                        <div className="w-12 h-[3px] bg-gradient-to-r from-amber-400 to-rose-400 rounded-full mb-6" />
                        <p className="text-gray-500 leading-relaxed mb-4 font-light">
                            At VIVAZEN, we believe that great talent deserves an exceptional stage. Join a team of passionate artists and professionals who are redefining the beauty industry.
                        </p>
                        <p className="text-gray-500 leading-relaxed font-light">
                            Whether you&apos;re a seasoned professional or just starting your journey, we offer the training, tools, and platform to help you thrive. Be part of a renowned salon chain that values creativity, excellence, and growth.
                        </p>
                    </div>
                </motion.div>

                {/* Benefits */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="mb-16"
                >
                    <div className="text-center mb-8">
                        <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2">Why VIVAZEN?</h2>
                        <div className="w-12 h-[3px] bg-gradient-to-r from-amber-400 to-rose-400 rounded-full mx-auto" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {benefits.map((b, idx) => (
                            <motion.div
                                key={b.title}
                                initial={{ opacity: 0, y: 30 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.5, delay: 0.3 + idx * 0.1 }}
                                className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/50 p-5 text-center hover:shadow-lg transition-shadow duration-500 group"
                            >
                                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-amber-100 to-rose-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <b.icon className="w-5 h-5 text-amber-600" />
                                </div>
                                <h3 className="font-serif font-bold text-gray-900 mb-1">{b.title}</h3>
                                <p className="text-xs text-gray-400 font-light leading-relaxed">{b.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Open Roles */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7, delay: 0.3 }}
                    className="mb-16"
                >
                    <div className="text-center mb-8">
                        <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2">Open Positions</h2>
                        <div className="w-12 h-[3px] bg-gradient-to-r from-amber-400 to-rose-400 rounded-full mx-auto" />
                    </div>
                    <div className="bg-white/40 backdrop-blur-xl rounded-[2rem] border border-white/50 overflow-hidden">
                        {roles.map((role, idx) => (
                            <Link
                                key={role}
                                href="/contact"
                                className={`flex items-center justify-between px-6 py-4 hover:bg-rose-50/40 transition-colors duration-300 group ${idx !== roles.length - 1 ? "border-b border-gray-100" : ""}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-400 to-rose-400" />
                                    <span className="text-sm text-gray-700 font-medium group-hover:text-rose-600 transition-colors duration-300">{role}</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-rose-500 group-hover:translate-x-1 transition-all duration-300" />
                            </Link>
                        ))}
                    </div>
                </motion.div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7, delay: 0.4 }}
                    className="text-center bg-gradient-to-r from-gray-900 to-gray-800 rounded-[2rem] p-8 md:p-12 relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-rose-500/10" />
                    <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-3 relative z-10">Ready to Start Your Journey?</h2>
                    <p className="text-white/60 mb-6 font-light max-w-md mx-auto relative z-10">
                        Send us your details and we&apos;ll get in touch about opportunities.
                    </p>
                    <Link href="/contact" className="relative z-10 inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 text-sm font-bold uppercase tracking-widest rounded-full hover:bg-amber-50 transition-colors duration-300 shadow-lg group">
                        Apply Now
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
