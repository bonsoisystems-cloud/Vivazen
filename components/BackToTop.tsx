"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { usePathname } from "next/navigation";

const BackToTop = () => {
    const pathname = usePathname();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setVisible(window.scrollY > 400);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    if (pathname && pathname.startsWith("/admin")) {
        return null;
    }

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <AnimatePresence>
            {visible && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: 20 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 z-[90] w-14 h-14 rounded-full bg-gradient-to-br from-gray-900 to-gray-700 text-white shadow-[0_8px_30px_rgba(0,0,0,0.25)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)] flex items-center justify-center hover:scale-110 transition-all duration-300 group"
                    aria-label="Back to top"
                >
                    <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                    {/* Glow ring */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400/30 to-rose-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md -z-10" />
                </motion.button>
            )}
        </AnimatePresence>
    );
};

export default BackToTop;
