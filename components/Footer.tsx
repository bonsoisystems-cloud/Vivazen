"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Phone, Mail, MapPin, Instagram, Facebook, ArrowRight, ChevronDown, Lock } from 'lucide-react';

const footerNav = [
    {
        title: "Offerings",
        links: [
            { label: "Signature Hair Alchemy", href: "/services" },
            { label: "Dermatological Skincare", href: "/services" },
            { label: "Bridal & Special Occasions", href: "/services" },
            { label: "Hand & Foot Aesthetics", href: "/services" },
            { label: "Wellness Packages", href: "/services" },
        ],
    },
    {
        title: "The Maison",
        links: [
            { label: "The Philosophy", href: "/about" },
            { label: "Haute Couture Gallery", href: "/gallery" },
            { label: "Find Your Boutique", href: "/salon-finder" },
            { label: "Beauty Academy", href: "/education" },
            { label: "Careers & Castings", href: "/career" },
        ],
    },
];

const socialLinks = [
    { icon: Instagram, href: "https://www.instagram.com/vivazen_wellness_salon", label: "Instagram" },
    { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
    {
        icon: ({ className }: { className?: string }) => (
            <svg className={className} viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
            </svg>
        ),
        href: "https://tiktok.com",
        label: "TikTok",
    },
    {
        icon: ({ className }: { className?: string }) => (
            <svg className={className} viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
        ),
        href: "https://twitter.com",
        label: "X",
    },
];

const Footer = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-60px" });
    const [openSection, setOpenSection] = useState<string | null>(null);

    const toggleSection = (title: string) => {
        setOpenSection(openSection === title ? null : title);
    };

    const pathname = usePathname();
    if (pathname && pathname.startsWith("/admin")) {
        return null;
    }

    return (
        <footer ref={ref} className="bg-[#FAF7F5] border-t border-[#EAE3DE] text-[#2B2529] relative overflow-hidden font-sans">
            {/* Subtle Top Warm Rose Accent Line */}
            <div className="h-[1.5px] w-full bg-gradient-to-r from-transparent via-[#BA5F70]/40 to-transparent" />

            <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-12 pb-8">
                {/* Main 4-Column Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 pb-10">

                    {/* Brand Column */}
                    <div className="lg:col-span-4 space-y-4">
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5 }}
                        >
                            <Link href="/" className="inline-block">
                                <span className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-[#1E171B] block">
                                    VIVAZEN
                                </span>
                                <span className="text-[10px] uppercase tracking-[0.35em] text-[#853648] font-bold block mt-0.5">
                                    Beauty Salon &amp; Academy
                                </span>
                            </Link>

                            <p className="text-[#3A3236] text-xs font-normal leading-relaxed max-w-sm mt-3">
                                An artisanal sanctuary dedicated to couture hair design, dermatological skin therapies, and bespoke bridal beauty in Jaunpur.
                            </p>

                            {/* Social Icons */}
                            <div className="flex items-center gap-2 pt-3">
                                {socialLinks.map((item) => (
                                    <a
                                        key={item.label}
                                        href={item.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={item.label}
                                        className="w-8 h-8 rounded-full bg-[#F0E8E2] border border-[#DCD3CC] flex items-center justify-center text-[#4B4247] hover:text-[#853648] hover:border-[#BA5F70] hover:bg-white transition-all duration-200 shadow-2xs"
                                    >
                                        <item.icon className="w-3.5 h-3.5" />
                                    </a>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Navigation Columns */}
                    {footerNav.map((col, idx) => (
                        <div key={col.title} className="lg:col-span-2">
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.5, delay: 0.1 * (idx + 1) }}
                            >
                                {/* Mobile Accordion Header */}
                                <button
                                    className="md:hidden w-full flex items-center justify-between py-2 border-b border-[#EAE3DE] mb-2"
                                    onClick={() => toggleSection(col.title)}
                                >
                                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#853648]">{col.title}</h3>
                                    <ChevronDown className={`w-4 h-4 text-[#756A70] transition-transform duration-300 ${openSection === col.title ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Desktop Header */}
                                <h3 className="hidden md:block text-xs font-bold uppercase tracking-[0.2em] text-[#853648] mb-4">{col.title}</h3>

                                <ul className={`space-y-2.5 overflow-hidden transition-all duration-300 ${openSection === col.title || 'max-h-0 md:max-h-none'} ${openSection === col.title ? 'max-h-60 pb-3' : ''}`}>
                                    {col.links.map((link) => (
                                        <li key={link.label}>
                                            <Link
                                                href={link.href}
                                                className="text-[#3A3236] hover:text-[#1E171B] text-xs font-medium transition-colors inline-block hover:translate-x-0.5 duration-150"
                                            >
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        </div>
                    ))}

                    {/* Contact & Concierge Column */}
                    <div className="lg:col-span-4">
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: 0.25 }}
                        >
                            {/* Mobile Accordion */}
                            <button
                                className="md:hidden w-full flex items-center justify-between py-2 border-b border-[#EAE3DE] mb-2"
                                onClick={() => toggleSection("Contact")}
                            >
                                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#853648]">Salon Concierge</h3>
                                <ChevronDown className={`w-4 h-4 text-[#756A70] transition-transform duration-300 ${openSection === "Contact" ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Desktop Header */}
                            <h3 className="hidden md:block text-xs font-bold uppercase tracking-[0.2em] text-[#853648] mb-4">Salon Concierge</h3>

                            <div className={`space-y-3 overflow-hidden transition-all duration-300 ${openSection === "Contact" || 'max-h-0 md:max-h-none'} ${openSection === "Contact" ? 'max-h-60 pb-3' : ''}`}>
                                <div className="flex items-start gap-2.5">
                                    <div className="w-7 h-7 rounded-full bg-[#F0E8E2] border border-[#DCD3CC] flex items-center justify-center flex-shrink-0 mt-0.5 text-[#853648]">
                                        <MapPin className="w-3.5 h-3.5" />
                                    </div>
                                    <p className="text-[#3A3236] text-xs font-medium leading-relaxed">Sapna Complex, Wajidpur Tiraha, Jaunpur, UP 222002</p>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-full bg-[#F0E8E2] border border-[#DCD3CC] flex items-center justify-center flex-shrink-0 text-[#853648]">
                                        <Mail className="w-3.5 h-3.5" />
                                    </div>
                                    <p className="text-[#3A3236] text-xs font-medium">vivazenwellnessjnp@gmail.com</p>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-full bg-[#F0E8E2] border border-[#DCD3CC] flex items-center justify-center flex-shrink-0 text-[#853648]">
                                        <Phone className="w-3.5 h-3.5" />
                                    </div>
                                    <p className="text-[#3A3236] text-xs font-medium tabular-nums">+91 76170 79955</p>
                                </div>
                            </div>

                            {/* Newsletter Input Pill */}
                            <div className="mt-5 pt-4 border-t border-[#EAE3DE]">
                                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#4B4247] mb-2.5">Salon Updates &amp; Special Offers</p>
                                <div className="flex gap-2">
                                    <input
                                        type="email"
                                        placeholder="Enter your email address"
                                        className="bg-white border border-[#DCD3CC] rounded-xl px-3.5 py-2 text-xs text-[#1E171B] placeholder:text-[#756A70] focus:outline-none focus:border-[#BA5F70] focus:ring-1 focus:ring-[#BA5F70]/30 transition-all flex-1 min-w-0 shadow-2xs"
                                    />
                                    <button className="press-tactile px-4 py-2 rounded-xl bg-gradient-to-r from-[#BA5F70] to-[#AC5162] text-white text-xs font-bold uppercase tracking-wider shadow-xs hover:shadow-sm transition-all duration-200 flex items-center gap-1.5 flex-shrink-0 cursor-pointer">
                                        <span>Join</span>
                                        <ArrowRight className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Bottom Bar with Admin / Staff Portal Access */}
                <div className="border-t border-[#EAE3DE] pt-5 pb-1 flex flex-col md:flex-row items-center justify-between text-[11px] text-[#6E6469] uppercase tracking-[0.18em] gap-3">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#BA5F70]" />
                        &copy; {new Date().getFullYear()} <a href="https://bonsoi.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-[#1E171B] font-medium transition-colors">BONSOI Systems</a>. All rights reserved.
                    </div>
                    <div className="flex items-center gap-4 sm:gap-6 flex-wrap justify-center">
                        <Link href="/privacy" className="hover:text-[#1E171B] font-medium transition-colors">Privacy</Link>
                        <span className="w-0.5 h-0.5 rounded-full bg-[#C9BFB9]" />
                        <Link href="/terms" className="hover:text-[#1E171B] font-medium transition-colors">Terms</Link>
                        <span className="w-0.5 h-0.5 rounded-full bg-[#C9BFB9]" />
                        <Link href="/sitemap-page" className="hover:text-[#1E171B] font-medium transition-colors">Sitemap</Link>
                        <span className="w-0.5 h-0.5 rounded-full bg-[#C9BFB9]" />
                        <Link
                            href="/admin/login"
                            className="hover:text-[#853648] font-bold text-[#853648] transition-colors inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F0E8E2] border border-[#DCD3CC]"
                            title="Staff & Management Login"
                        >
                            <Lock className="w-3 h-3" />
                            <span>Staff Portal</span>
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
