"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { MapPin, Phone, Clock, Navigation, ArrowRight } from "lucide-react";

export default function SalonFinderPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-rose-50/20 to-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-rose-100/30 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-40 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-amber-100/20 to-transparent rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <section className="pt-28 pb-8 px-6 text-center relative z-10">
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-rose-400/60" />
                        <span className="text-rose-500 text-[10px] tracking-[0.5em] uppercase font-semibold">Find Us</span>
                        <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-rose-400/60" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight text-gray-900 mb-3">
                        Salon Finder
                    </h1>
                    <p className="text-gray-400 max-w-lg mx-auto text-base font-light tracking-wide">
                        Visit us for a premium beauty experience at our salon.
                    </p>
                    <div className="mt-3 flex justify-center">
                        <div className="h-[3px] w-12 bg-gradient-to-r from-rose-400 to-amber-400 rounded-full" />
                    </div>
                </motion.div>
            </section>

            <div className="max-w-6xl mx-auto px-4 md:px-6 pb-20 relative z-10">
                {/* Map + Info */}
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Map */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="md:col-span-2 bg-white/40 backdrop-blur-xl rounded-[2rem] border border-white/50 overflow-hidden shadow-sm"
                    >
                        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d900.0659828739772!2d82.68321308395024!3d25.736503027439273!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39903b4d8820e517%3A0x5cd99f3692abbee0!2sVivaZen%20Beauty%20Salon%20%7C%20Makeover%20%7C%20Jaunpur%20best%20Beauty%20Salon!5e0!3m2!1sen!2sin!4v1771350196521!5m2!1sen!2sin"
                                className="absolute inset-0 w-full h-full rounded-[2rem]"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                        </div>
                    </motion.div>

                    {/* Salon Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="flex flex-col gap-4"
                    >
                        {/* Address Card */}
                        <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/50 p-6 shadow-sm hover:shadow-lg transition-shadow duration-500">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-100 to-amber-100 flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-4.5 h-4.5 text-rose-600" />
                                </div>
                                <div>
                                    <h3 className="font-serif font-bold text-gray-900 mb-1">Address</h3>
                                    <p className="text-sm text-gray-500 font-light leading-relaxed">
                                        Vivazen Beauty Salon<br />
                                        Jaunpur, Uttar Pradesh, India
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Hours Card */}
                        <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/50 p-6 shadow-sm hover:shadow-lg transition-shadow duration-500">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-teal-100 flex items-center justify-center flex-shrink-0">
                                    <Clock className="w-4.5 h-4.5 text-amber-600" />
                                </div>
                                <div>
                                    <h3 className="font-serif font-bold text-gray-900 mb-1">Hours</h3>
                                    <div className="text-sm text-gray-500 font-light leading-relaxed space-y-0.5">
                                        <p>Mon – Sun: <span className="font-medium text-gray-700">10:00 AM – 8:00 PM</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Phone Card */}
                        <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/50 p-6 shadow-sm hover:shadow-lg transition-shadow duration-500">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-100 to-violet-100 flex items-center justify-center flex-shrink-0">
                                    <Phone className="w-4.5 h-4.5 text-teal-600" />
                                </div>
                                <div>
                                    <h3 className="font-serif font-bold text-gray-900 mb-1">Contact</h3>
                                    <p className="text-sm text-gray-500 font-light leading-relaxed">
                                        Call us to book an appointment or walk in anytime!
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Directions CTA */}
                        <a
                            href="https://www.google.com/maps/dir/?api=1&destination=25.736503027439273,82.68321308395024"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center justify-center gap-2 w-full px-6 py-4 bg-gray-900 text-white text-sm font-bold uppercase tracking-widest rounded-full shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-0.5 relative overflow-hidden"
                        >
                            <Navigation className="w-4 h-4 relative z-10" />
                            <span className="relative z-10">Get Directions</span>
                            <ArrowRight className="w-3.5 h-3.5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                            <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </a>

                        {/* Book CTA */}
                        <Link
                            href="/contact"
                            className="group flex items-center justify-center gap-2 w-full px-6 py-4 bg-white/60 backdrop-blur-xl border border-gray-200 text-gray-700 text-sm font-bold uppercase tracking-widest rounded-full hover:border-amber-300 hover:text-amber-700 transition-all duration-300"
                        >
                            <span>Book Appointment</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
                        </Link>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
