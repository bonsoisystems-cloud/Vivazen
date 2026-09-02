"use client";

import { motion } from "framer-motion";

const sections = [
    {
        title: "Information We Collect",
        content: [
            "When you visit our salon or use our website, we may collect personal information such as your name, email address, phone number, and appointment preferences.",
            "We also collect non-personal information like browser type, device information, and browsing patterns to improve your experience on our website.",
        ],
    },
    {
        title: "How We Use Your Information",
        content: [
            "We use your personal information to schedule and manage appointments, send booking confirmations and reminders, and provide personalized beauty recommendations.",
            "Your information also helps us improve our services, communicate promotional offers (with your consent), and respond to your inquiries.",
        ],
    },
    {
        title: "Information Sharing",
        content: [
            "We do not sell, trade, or rent your personal information to third parties. We may share your data with trusted service providers who assist us in operating our website and conducting our business, as long as they agree to keep your information confidential.",
        ],
    },
    {
        title: "Data Security",
        content: [
            "We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.",
        ],
    },
    {
        title: "Cookies",
        content: [
            "Our website uses cookies to enhance your browsing experience. Cookies are small files stored on your device that help us understand how you use our site. You can choose to disable cookies through your browser settings, though this may affect some features.",
        ],
    },
    {
        title: "Your Rights",
        content: [
            "You have the right to access, correct, or delete your personal information at any time. You may also opt out of receiving marketing communications by contacting us directly or using the unsubscribe link in our emails.",
        ],
    },
    {
        title: "Contact Us",
        content: [
            "If you have any questions or concerns about this Privacy Policy, please reach out to us at vivazenwellnessjnp@gmail.com or call us at +91 76170 79955.",
        ],
    },
];

export default function PrivacyPage() {
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
                        Privacy Policy
                    </h1>
                    <p className="text-gray-400 max-w-lg mx-auto text-base font-light tracking-wide">
                        How we handle and protect your personal information.
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
