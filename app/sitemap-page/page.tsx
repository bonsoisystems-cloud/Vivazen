"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const sitemapGroups = [
    {
        title: "Main Pages",
        links: [
            { label: "Home", href: "/" },
            { label: "About Us", href: "/about" },
            { label: "Contact", href: "/contact" },
            { label: "Salon Finder", href: "/salon-finder" },
        ],
    },
    {
        title: "Services",
        links: [
            { label: "All Services", href: "/services" },
            { label: "Hair Styling", href: "/services" },
            { label: "Bridal", href: "/services" },
            { label: "Makeup", href: "/services" },
            { label: "Skin Care", href: "/services" },
            { label: "Nail Art", href: "/services" },
        ],
    },
    {
        title: "Gallery & Showcase",
        links: [
            { label: "Gallery", href: "/gallery" },
        ],
    },
    {
        title: "Careers & Education",
        links: [
            { label: "Careers", href: "/career" },
            { label: "Academy", href: "/education" },
        ],
    },
    {
        title: "Legal",
        links: [
            { label: "Privacy Policy", href: "/privacy" },
            { label: "Terms & Conditions", href: "/terms" },
        ],
    },
];

export default function SitemapPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-amber-50/20 to-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-amber-100/30 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-40 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-rose-100/30 to-transparent rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <section className="pt-28 pb-10 px-6 text-center relative z-10">
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-amber-400/60" />
                        <span className="text-amber-600 text-[10px] tracking-[0.5em] uppercase font-semibold">Navigation</span>
                        <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-amber-400/60" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight text-gray-900 mb-3">
                        Sitemap
                    </h1>
                    <p className="text-gray-400 max-w-lg mx-auto text-base font-light tracking-wide">
                        Browse all pages on the Vivazen website.
                    </p>
                    <div className="mt-3 flex justify-center">
                        <div className="h-[3px] w-12 bg-gradient-to-r from-amber-400 to-rose-400 rounded-full" />
                    </div>
                </motion.div>
            </section>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-6 pb-20 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sitemapGroups.map((group, idx) => (
                        <motion.div
                            key={group.title}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 + idx * 0.08 }}
                            className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/50 p-6 md:p-8"
                        >
                            <h2 className="text-lg font-serif font-bold text-gray-900 mb-2">{group.title}</h2>
                            <div className="w-10 h-[2px] bg-gradient-to-r from-amber-400 to-rose-400 rounded-full mb-5" />
                            <ul className="space-y-3">
                                {group.links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-gray-500 font-light hover:text-gray-900 transition-colors duration-300 flex items-center gap-2 group"
                                        >
                                            <ArrowRight className="w-3.5 h-3.5 text-amber-400 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                                            <span>{link.label}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
