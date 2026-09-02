"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, GraduationCap, Briefcase, Phone, ChevronRight, Lock } from 'lucide-react';

const navLinks = [
    { label: "Services", href: "/services" },
    { label: "Gallery", href: "/gallery" },
    { label: "Academy", href: "/education" },
    { label: "Careers", href: "/career" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
];

/** Morphicons-style SVG Hamburger-to-Close morphing icon with spring physics */
const MorphingMenuIcon = ({ isOpen, isDark }: { isOpen: boolean; isDark: boolean }) => {
    const strokeColor = isDark ? "#1E171B" : "#ffffff";
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke={strokeColor}
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-colors duration-300"
        >
            <motion.line
                x1="4"
                y1="7"
                x2="20"
                y2="7"
                animate={isOpen ? { x1: 5, y1: 5, x2: 19, y2: 19 } : { x1: 4, y1: 7, x2: 20, y2: 7 }}
                transition={{ type: "spring", stiffness: 380, damping: 26 }}
            />
            <motion.line
                x1="4"
                y1="12"
                x2="20"
                y2="12"
                animate={isOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.18 }}
            />
            <motion.line
                x1="4"
                y1="17"
                x2="20"
                y2="17"
                animate={isOpen ? { x1: 5, y1: 19, x2: 19, y2: 5 } : { x1: 4, y1: 17, x2: 20, y2: 17 }}
                transition={{ type: "spring", stiffness: 380, damping: 26 }}
            />
        </svg>
    );
};

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

    // On sub-pages (non-homepage), always use the solid/dark navbar style
    const isHomepage = pathname === '/';
    const isDark = !isHomepage || scrolled;

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 40);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Lock body scroll when menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isMenuOpen]);

    if (pathname && pathname.startsWith("/admin")) {
        return null; // Do not show public header on staff/admin portal
    }

    return (
        <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${isDark ? 'h-16' : 'h-20'}`}>
            {/* Ultra-luxury Glassmorphic Background */}
            <div className={`absolute inset-0 transition-all duration-500 ${isDark
                ? 'bg-white/95 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.05)] border-b border-gray-200/80'
                : 'bg-transparent'
                }`} />

            {/* Subtle Rose-Gold Accent Line */}
            {/* <motion.div
                className="absolute bottom-0 left-0 right-0 h-[1.5px]"
                style={{
                    background: "linear-gradient(90deg, transparent, rgba(186,95,112,0.4) 50%, transparent)",
                }}
            /> */}

            <div className="max-w-7xl mx-auto px-6 lg:px-8 h-full flex items-center justify-between relative z-10">
                {/* Brand Logo */}
                <Link href="/" className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsMenuOpen(false)}>
                    <div className="flex flex-col">
                        <span className={`text-xl sm:text-2xl font-serif font-black tracking-tight leading-none transition-colors duration-300 ${isDark ? 'text-gray-900' : 'text-white drop-shadow-md'
                            }`}>
                            VIVAZEN
                        </span>
                        <span className={`text-[8.5px] uppercase tracking-[0.35em] font-medium transition-colors duration-300 mt-1 ${isDark ? 'text-rose-600 font-semibold' : 'text-rose-200/90'
                            }`}>
                            Beauty Salon &amp; Academy
                        </span>
                    </div>
                </Link>

                {/* Desktop Navigation Links */}
                <div className="hidden lg:flex items-center gap-7">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.label}
                                href={link.href}
                                className={`text-xs uppercase tracking-[0.2em] font-semibold transition-all duration-300 relative py-1 group ${isActive
                                    ? isDark ? 'text-rose-600' : 'text-white'
                                    : isDark ? 'text-gray-700 hover:text-gray-900' : 'text-white/85 hover:text-white'
                                    }`}
                            >
                                <span>{link.label}</span>
                                <span className={`absolute bottom-0 left-0 h-[2px] rounded-full bg-gradient-to-r from-rose-500 to-amber-400 transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'
                                    }`} />
                            </Link>
                        );
                    })}
                </div>

                {/* Right Action Buttons */}
                <div className="hidden sm:flex items-center gap-2.5">
                    {/* Salon Finder */}
                    <Link
                        href="/salon-finder"
                        className={`p-2.5 rounded-full border transition-all duration-300 ${isDark
                            ? 'border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                            : 'border-white/20 text-white hover:bg-white/10'
                            }`}
                        title="Find Salon Location"
                    >
                        <MapPin className="w-4 h-4" />
                    </Link>

                    {/* Staff / Admin Portal Access Button */}
                    {/* <Link
                        href="/admin/login"
                        className={`p-2.5 rounded-full border transition-all duration-300 ${isDark
                                ? 'border-gray-200 text-gray-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                                : 'border-white/20 text-white hover:bg-white/10'
                            }`}
                        title="Staff & Admin Portal Login"
                    >
                        <Lock className="w-3.5 h-3.5" />
                    </Link> */}

                    {/* Book Appointment CTA */}
                    <Link
                        href="/contact"
                        className="press-tactile group relative overflow-hidden px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] rounded-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-1.5"
                    >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Book Visit</span>
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="lg:hidden press-tactile p-2 rounded-xl text-gray-800 hover:bg-gray-100/50 transition-colors cursor-pointer"
                    aria-label="Toggle navigation menu"
                >
                    <MorphingMenuIcon isOpen={isMenuOpen} isDark={isDark} />
                </button>
            </div>

            {/* Mobile Drawer Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="lg:hidden fixed inset-x-0 top-16 bg-white/98 backdrop-blur-3xl border-b border-gray-200 shadow-2xl p-6 space-y-4 z-50 max-h-[calc(100vh-4rem)] overflow-y-auto"
                    >
                        <div className="space-y-1">
                            {navLinks.map((link) => {
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.label}
                                        href={link.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={`flex items-center justify-between p-3 rounded-2xl text-sm font-semibold transition-all ${isActive
                                            ? 'bg-rose-50 text-rose-700 font-bold'
                                            : 'text-gray-800 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span>{link.label}</span>
                                        <ChevronRight className={`w-4 h-4 ${isActive ? 'text-rose-600' : 'text-gray-400'}`} />
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Quick Salon Features */}
                        <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
                            <Link
                                href="/education"
                                onClick={() => setIsMenuOpen(false)}
                                className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 text-amber-900 font-semibold flex items-center gap-2"
                            >
                                <GraduationCap className="w-4 h-4 text-amber-600" />
                                <span>Academy</span>
                            </Link>
                            <Link
                                href="/career"
                                onClick={() => setIsMenuOpen(false)}
                                className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/60 text-rose-900 font-semibold flex items-center gap-2"
                            >
                                <Briefcase className="w-4 h-4 text-rose-600" />
                                <span>Careers</span>
                            </Link>
                        </div>

                        {/* Staff Portal Link in Mobile Menu */}
                        {/* <div className="pt-2 border-t border-gray-100">
                            <Link
                                href="/admin/login"
                                onClick={() => setIsMenuOpen(false)}
                                className="w-full py-2.5 px-3 rounded-xl bg-gray-50 hover:bg-rose-50 border border-gray-200 hover:border-rose-200 text-gray-700 hover:text-rose-800 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                            >
                                <Lock className="w-3.5 h-3.5 text-rose-600" />
                                <span>Staff &amp; Admin CRM Portal</span>
                            </Link>
                        </div> */}

                        <div className="pt-2 flex flex-col gap-2.5">
                            <Link
                                href="/contact"
                                onClick={() => setIsMenuOpen(false)}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 text-white text-center text-xs font-bold uppercase tracking-widest shadow-md"
                            >
                                Book Appointment
                            </Link>
                            <a
                                href="tel:+917617079955"
                                className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-700 text-center text-xs font-semibold flex items-center justify-center gap-1.5"
                            >
                                <Phone className="w-3.5 h-3.5 text-rose-600" />
                                <span>Call Concierge: +91 76170 79955</span>
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
