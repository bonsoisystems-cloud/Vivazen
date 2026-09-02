"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { usePathname } from "next/navigation";

const ScrollProgress = () => {
    const pathname = usePathname();
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
    });

    if (pathname && pathname.startsWith("/admin")) {
        return null;
    }

    return (
        <motion.div
            className="fixed top-0 left-0 right-0 h-[3px] z-[100] origin-left"
            style={{
                scaleX,
                background: "linear-gradient(90deg, #f43f5e, #d946ef, #f59e0b, #f43f5e)",
                backgroundSize: "200% 100%",
            }}
        />
    );
};

export default ScrollProgress;
