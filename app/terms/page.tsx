"use client";

import { motion } from "framer-motion";

const sections = [
    {
        title: "Acceptance of Terms",
        content: [
            "By accessing and using Vivazen's website and services, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please do not use our services.",
        ],
    },
    {
        title: "Appointments & Bookings",
        content: [
            "Appointments can be scheduled through our website, phone, or in person. We recommend booking in advance, especially for bridal and special occasion services.",
            "We kindly request at least 2 hours' notice for cancellations. Repeated no-shows may result in a booking deposit requirement for future appointments.",
        ],
    },
    {
        title: "Services & Pricing",
        content: [
            "All services and prices listed on our website are subject to change without prior notice. Final pricing will be confirmed at the time of booking or during your consultation.",
            "Additional charges may apply for extra services, products used, or extended session times beyond the standard duration.",
        ],
    },
    {
        title: "Payment",
        content: [
            "We accept cash, UPI, and major digital payment methods. Full payment is expected at the time of service unless a prior arrangement has been made.",
            "For bridal and premium packages, a non-refundable deposit may be required at the time of booking.",
        ],
    },
    {
        title: "Health & Safety",
        content: [
            "Please inform our staff of any allergies, skin conditions, or medical concerns before your treatment. We perform patch tests upon request for chemical services.",
            "Vivazen is not liable for adverse reactions to treatments when prior conditions were not disclosed by the client.",
        ],
    },
    {
        title: "Intellectual Property",
        content: [
            "All content on this website, including text, images, logos, and design, is the property of Vivazen Beauty Salon and is protected by applicable intellectual property laws. Reproduction without written permission is prohibited.",
        ],
    },
    {
        title: "Limitation of Liability",
        content: [
            "Vivazen strives to provide the highest quality services. However, we are not liable for any indirect, incidental, or consequential damages arising from the use of our services or website.",
        ],
    },
    {
        title: "Changes to Terms",
        content: [
            "Vivazen reserves the right to modify these Terms and Conditions at any time. Changes will be posted on this page with an updated revision date. Continued use of our services constitutes acceptance of the revised terms.",
        ],
    },
    {
        title: "Contact",
        content: [
            "For questions about these terms, contact us at vivazenwellnessjnp@gmail.com or call +91 76170 79955.",
        ],
    },
];

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-amber-50/20 to-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-amber-100/30 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-40 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-rose-100/30 to-transparent rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <section className="pt-28 pb-10 px-6 text-center relative z-10">
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-amber-400/60" />
                        <span className="text-amber-600 text-[10px] tracking-[0.5em] uppercase font-semibold">Legal</span>
                        <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-amber-400/60" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight text-gray-900 mb-3">
                        Terms &amp; Conditions
                    </h1>
                    <p className="text-gray-400 max-w-lg mx-auto text-base font-light tracking-wide">
                        Guidelines for using our services and website.
                    </p>
                    <div className="mt-3 flex justify-center">
                        <div className="h-[3px] w-12 bg-gradient-to-r from-amber-400 to-rose-400 rounded-full" />
                    </div>
                </motion.div>
            </section>

            {/* Content */}
            <div className="max-w-3xl mx-auto px-6 pb-20 relative z-10">
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-gray-400 text-sm font-light mb-10"
                >
                    Last updated: February 2026
                </motion.p>

                <div className="space-y-8">
                    {sections.map((section, idx) => (
                        <motion.div
                            key={section.title}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.15 + idx * 0.05 }}
                            className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/50 p-6 md:p-8"
                        >
                            <h2 className="text-xl font-serif font-bold text-gray-900 mb-3">{section.title}</h2>
                            <div className="w-10 h-[2px] bg-gradient-to-r from-amber-400 to-rose-400 rounded-full mb-4" />
                            {section.content.map((para, pIdx) => (
                                <p key={pIdx} className="text-gray-500 leading-relaxed font-light mb-3 last:mb-0">
                                    {para}
                                </p>
                            ))}
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
