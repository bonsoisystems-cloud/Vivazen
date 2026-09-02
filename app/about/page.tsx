"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Award, Users, Star, ArrowRight } from "lucide-react";
import { R2_IMAGE_BASE_URL } from "../../lib/constants";

const values = [
    { icon: Heart, title: "Passion", desc: "Every service is crafted with genuine love for beauty and artistry." },
    { icon: Award, title: "Excellence", desc: "World-class training and premium products ensure top-tier results." },
    { icon: Users, title: "Community", desc: "We build lasting relationships with every client who walks in." },
    { icon: Star, title: "Innovation", desc: "Always evolving with the latest trends and techniques in beauty." },
];

export default function AboutPage() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-60px" });

    return (
        <div ref={ref} className="min-h-screen bg-gradient-to-b from-white via-amber-50/20 to-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-amber-100/30 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-40 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-rose-100/30 to-transparent rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <section className="pt-28 pb-10 px-6 text-center relative z-10">
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-amber-400/60" />
                        <span className="text-amber-600 text-[10px] tracking-[0.5em] uppercase font-semibold">Who We Are</span>
                        <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-amber-400/60" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight text-gray-900 mb-3">
                        About VIVAZEN
                    </h1>
                    <p className="text-gray-400 max-w-lg mx-auto text-base font-light tracking-wide">
                        Where artistry meets elegance — your ultimate beauty destination.
                    </p>
                    <div className="mt-3 flex justify-center">
                        <div className="h-[3px] w-12 bg-gradient-to-r from-amber-400 to-rose-400 rounded-full" />
                    </div>
                </motion.div>
            </section>

            <div className="max-w-6xl mx-auto px-6 pb-20 relative z-10">
                {/* Story Section */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className="grid md:grid-cols-2 gap-8 md:gap-12 items-center mb-16"
                >
                    <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden shadow-lg group">
                        <Image
                            src={`${R2_IMAGE_BASE_URL}/gallery/interior/interior-1.jpg`}
                            alt="Vivazen Salon Interior"
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    </div>
                    <div>
                        <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">Our Story</h2>
                        <div className="w-12 h-[3px] bg-gradient-to-r from-amber-400 to-rose-400 rounded-full mb-6" />
                        <p className="text-gray-500 leading-relaxed mb-4 font-light">
                            VIVAZEN was born from a simple yet powerful vision — to create a sanctuary where beauty, wellness, and luxury converge. Our journey began with a passion for transforming looks and lives, one client at a time.
                        </p>
                        <p className="text-gray-500 leading-relaxed mb-4 font-light">
                            Today, we are proud to be a premier destination for hair, skin, nails, and bridal services. Our team of world-class artists and therapists bring decades of combined experience, using only the finest products and latest techniques.
                        </p>
                        <p className="text-gray-500 leading-relaxed font-light">
                            From the moment you step through our doors, you enter a world of personalized attention, premium care, and unforgettable experiences. At VIVAZEN, beauty is not just a service — it&apos;s an art form.
                        </p>
                    </div>
                </motion.div>

                {/* Values */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="mb-16"
                >
                    <div className="text-center mb-8">
                        <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2">Our Values</h2>
                        <div className="w-12 h-[3px] bg-gradient-to-r from-amber-400 to-rose-400 rounded-full mx-auto" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {values.map((val, idx) => (
                            <motion.div
                                key={val.title}
                                initial={{ opacity: 0, y: 30 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.5, delay: 0.3 + idx * 0.1 }}
                                className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/50 p-5 text-center hover:shadow-lg transition-shadow duration-500 group"
                            >
                                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-amber-100 to-rose-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <val.icon className="w-5 h-5 text-amber-600" />
                                </div>
                                <h3 className="font-serif font-bold text-gray-900 mb-1">{val.title}</h3>
                                <p className="text-xs text-gray-400 font-light leading-relaxed">{val.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* The Sanctuary */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7, delay: 0.3 }}
                    className="mb-16"
                >
                    <div className="text-center mb-8">
                        <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2">The Sanctuary</h2>
                        <p className="text-gray-400 max-w-md mx-auto text-sm font-light">Step inside our luxurious salon spaces</p>
                        <div className="w-12 h-[3px] bg-gradient-to-r from-amber-400 to-rose-400 rounded-full mx-auto mt-3" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[1, 2, 4, 5, 6, 7].map((n) => (
                            <div key={n} className="relative aspect-[4/3] rounded-2xl overflow-hidden group">
                                <Image
                                    src={`${R2_IMAGE_BASE_URL}/gallery/interior/interior-${n}.jpg`}
                                    alt={`Salon Interior ${n}`}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                            </div>
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
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 via-transparent to-amber-500/10" />
                    <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-3 relative z-10">
                        Ready for Your Transformation?
                    </h2>
                    <p className="text-white/60 mb-6 font-light max-w-md mx-auto relative z-10">
                        Book your appointment today and experience the VIVAZEN difference.
                    </p>
                    <Link
                        href="/contact"
                        className="relative z-10 inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 text-sm font-bold uppercase tracking-widest rounded-full hover:bg-amber-50 transition-colors duration-300 shadow-lg group"
                    >
                        Book Now
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
