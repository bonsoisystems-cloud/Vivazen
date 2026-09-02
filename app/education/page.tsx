"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Palette, Award, Clock } from "lucide-react";
import { R2_IMAGE_BASE_URL } from "../../lib/constants";

const programs = [
    {
        title: "Professional Hair Styling",
        duration: "6 Months",
        desc: "Master cutting, colouring, styling, and advanced techniques like rebounding and keratin treatments.",
        icon: "✂️",
    },
    {
        title: "Bridal & Party Makeup",
        duration: "4 Months",
        desc: "Learn HD, airbrush, and traditional bridal makeup along with hairstyling and dupatta draping.",
        icon: "💄",
    },
    {
        title: "Skin Care & Therapy",
        duration: "3 Months",
        desc: "Facials, peels, anti-ageing treatments, waxing, threading, and spa therapies.",
        icon: "✨",
    },
    {
        title: "Nail Art & Design",
        duration: "2 Months",
        desc: "Manicure, pedicure, acrylic extensions, gel polish, and artistic nail designs.",
        icon: "💅",
    },
    {
        title: "Complete Beauty Course",
        duration: "12 Months",
        desc: "A comprehensive program covering all beauty services — hair, skin, nails, and makeup.",
        icon: "🌟",
    },
    {
        title: "Advanced Bridal Masterclass",
        duration: "1 Month",
        desc: "Intensive masterclass for professionals looking to specialize in premium bridal looks.",
        icon: "👰",
    },
];

const highlights = [
    { icon: BookOpen, title: "Expert Faculty", desc: "Learn from industry veterans with decades of experience." },
    { icon: Palette, title: "Hands-on Training", desc: "Real clients, real experience from day one of the program." },
    { icon: Award, title: "Certification", desc: "Nationally recognized certificates upon successful completion." },
    { icon: Clock, title: "Flexible Hours", desc: "Weekend and evening batches available for working professionals." },
];

export default function EducationPage() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-60px" });

    return (
        <div ref={ref} className="min-h-screen bg-gradient-to-b from-white via-teal-50/20 to-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-teal-100/30 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-40 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-100/20 to-transparent rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <section className="pt-28 pb-10 px-6 text-center relative z-10">
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-teal-400/60" />
                        <span className="text-teal-600 text-[10px] tracking-[0.5em] uppercase font-semibold">Learn & Grow</span>
                        <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-teal-400/60" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight text-gray-900 mb-3">
                        VIVAZEN Academy
                    </h1>
                    <p className="text-gray-400 max-w-lg mx-auto text-base font-light tracking-wide">
                        For six decades, education has been at the heart of our achievements. We continue this tradition with innovative and esteemed learning.
                    </p>
                    <div className="mt-3 flex justify-center">
                        <div className="h-[3px] w-12 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full" />
                    </div>
                </motion.div>
            </section>

            <div className="max-w-6xl mx-auto px-6 pb-20 relative z-10">
                {/* Intro */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className="grid md:grid-cols-2 gap-8 md:gap-12 items-center mb-16"
                >
                    <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden shadow-lg group">
                        <Image src={`${R2_IMAGE_BASE_URL}/gallery/nail/nail-1.jpg`} alt="Vivazen Academy" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    </div>
                    <div>
                        <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">Transform Your Passion Into a Career</h2>
                        <div className="w-12 h-[3px] bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full mb-6" />
                        <p className="text-gray-500 leading-relaxed mb-4 font-light">
                            VIVAZEN Academy offers comprehensive training programs designed to turn your passion for beauty into a rewarding career. Our courses are taught by industry experts who bring real-world experience to the classroom.
                        </p>
                        <p className="text-gray-500 leading-relaxed font-light">
                            With hands-on training, modern facilities, and nationally recognized certifications, our graduates are prepared to excel in any salon environment — or even start their own beauty business.
                        </p>
                    </div>
                </motion.div>

                {/* Highlights */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="mb-16"
                >
                    <div className="text-center mb-8">
                        <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2">Why Choose Our Academy</h2>
                        <div className="w-12 h-[3px] bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full mx-auto" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {highlights.map((h, idx) => (
                            <motion.div
                                key={h.title}
                                initial={{ opacity: 0, y: 30 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.5, delay: 0.3 + idx * 0.1 }}
                                className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/50 p-5 text-center hover:shadow-lg transition-shadow duration-500 group"
                            >
                                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <h.icon className="w-5 h-5 text-teal-600" />
                                </div>
                                <h3 className="font-serif font-bold text-gray-900 mb-1">{h.title}</h3>
                                <p className="text-xs text-gray-400 font-light leading-relaxed">{h.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Programs */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7, delay: 0.3 }}
                    className="mb-16"
                >
                    <div className="text-center mb-8">
                        <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2">Our Programs</h2>
                        <div className="w-12 h-[3px] bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full mx-auto" />
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {programs.map((prog, idx) => (
                            <motion.div
                                key={prog.title}
                                initial={{ opacity: 0, y: 30 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.5, delay: 0.4 + idx * 0.08 }}
                                className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/50 p-6 hover:shadow-lg transition-shadow duration-500 group"
                            >
                                <div className="text-3xl mb-3">{prog.icon}</div>
                                <h3 className="text-lg font-serif font-bold text-gray-900 mb-1">{prog.title}</h3>
                                <div className="flex items-center gap-1.5 mb-3">
                                    <Clock className="w-3 h-3 text-teal-500" />
                                    <span className="text-[11px] text-teal-600 font-semibold uppercase tracking-wider">{prog.duration}</span>
                                </div>
                                <p className="text-sm text-gray-400 font-light leading-relaxed">{prog.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7, delay: 0.5 }}
                    className="text-center bg-gradient-to-r from-gray-900 to-gray-800 rounded-[2rem] p-8 md:p-12 relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 via-transparent to-cyan-500/10" />
                    <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-3 relative z-10">Ready to Begin Your Beauty Journey?</h2>
                    <p className="text-white/60 mb-6 font-light max-w-md mx-auto relative z-10">
                        Enroll today and take the first step toward a rewarding career in beauty.
                    </p>
                    <Link href="/contact" className="relative z-10 inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 text-sm font-bold uppercase tracking-widest rounded-full hover:bg-teal-50 transition-colors duration-300 shadow-lg group">
                        Enroll Now
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
