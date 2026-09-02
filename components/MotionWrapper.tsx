"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface MotionWrapperProps {
    children: React.ReactNode;
    delay?: number;
    className?: string;
    variant?: "fade-up" | "fade-in" | "scale-up" | "slide-left" | "slide-right";
}

const variants = {
    "fade-up": {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0 },
    },
    "fade-in": {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    },
    "scale-up": {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1 },
    },
    "slide-left": {
        hidden: { opacity: 0, x: -50 },
        visible: { opacity: 1, x: 0 },
    },
    "slide-right": {
        hidden: { opacity: 0, x: 50 },
        visible: { opacity: 1, x: 0 },
    },
};

export default function MotionWrapper({
    children,
    delay = 0,
    className = "",
    variant = "fade-up"
}: MotionWrapperProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={variants[variant]}
            transition={{ duration: 0.8, delay: delay, ease: [0.21, 0.47, 0.32, 0.98] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
