"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Scissors, Award, MapPin, Sparkles } from "lucide-react";

const stats = [
    { icon: Scissors, value: 12, suffix: "+", label: "Master Stylists", color: "from-amber-400 to-amber-600" },
    { icon: Award, value: 10, suffix: "+ Yrs", label: "Artisanal Excellence", color: "from-rose-400 to-rose-600" },
    { icon: MapPin, value: 4, suffix: "", label: "Luxury Boutiques", color: "from-amber-500 to-rose-500" },
    { icon: Sparkles, value: 2500, suffix: "+", label: "Monthly Guests", color: "from-rose-400 to-amber-500" },
];

function Counter({ target, suffix }: { target: number; suffix: string }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (!isInView) return;
        let start = 0;
        const duration = 1800;
        const steps = 60;
        const stepTime = duration / steps;
        const increment = target / steps;
        
        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                setCount(target);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, stepTime);
        return () => clearInterval(timer);
    }, [isInView, target]);

    return (
        <span ref={ref} className="tabular-nums font-serif tracking-tight">
            {count.toLocaleString()}{suffix}
        </span>
    );
}

const AnimatedCounter = () => {
    return (
        <section className="py-14 md:py-24 px-6 relative overflow-hidden bg-gradient-to-b from-white via-neutral-50/40 to-white">
            {/* Ambient luxury glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-amber-200/20 rounded-full blur-[140px] -translate-y-1/2" />
                <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-rose-200/20 rounded-full blur-[140px] -translate-y-1/2" />
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
                    {stats.map((stat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                            className="group text-center bg-white/80 backdrop-blur-xl rounded-[1.75rem] p-6 sm:p-8 border border-neutral-200/60 shadow-xs hover:border-amber-400/40 hover:shadow-lg transition-all duration-300 press-tactile"
                        >
                            <div className="relative mx-auto w-12 h-12 mb-4 flex items-center justify-center">
                                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${stat.color} opacity-10 group-hover:opacity-20 transition-all duration-300 group-hover:scale-110 transform`} />
                                <stat.icon className="w-5 h-5 text-neutral-800 group-hover:text-amber-700 transition-colors duration-300" strokeWidth={1.75} />
                            </div>
                            <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black mb-1.5 text-neutral-900">
                                <Counter target={stat.value} suffix={stat.suffix} />
                            </h3>
                            <p className="text-neutral-500 text-[11px] tracking-[0.22em] uppercase font-semibold">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default AnimatedCounter;
