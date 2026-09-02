import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contact & Book Appointment | VivaZen Salon & Spa Jaunpur",
    description:
        "Book an appointment at VivaZen Beauty Salon & Spa Jaunpur. Contact us for hair, makeup, bridal, skin care, nail art, spa & massage services. Located at Sapna Complex, Ground Floor, Opposite Shivangi Clinic, Wajidpur Tiraha, Jaunpur 222002. Call: +917617079955.",
    keywords: [
        "book salon appointment Jaunpur",
        "contact Vivazen salon",
        "salon booking Jaunpur",
        "beauty salon appointment Jaunpur",
        "vivazen contact number",
        "jaunpur spa contact number",
        "jaunpur spa centre contact",
        "massage parlour near me booking",
        "spa near me Jaunpur booking",
        "parlour near me Jaunpur",
        "saloon near by me Jaunpur",
        "VivaZen Sapna Complex Wajidpur Jaunpur",
        "near Wazidpur Tiraha salon",
        "jaunpur wajidpur tiraha",
    ],
    openGraph: {
        title: "Contact & Book | VivaZen Beauty Salon & Spa Jaunpur",
        description: "Book your appointment at Jaunpur's best beauty salon & spa. Call or fill the form. Sapna Complex, Wajidpur Tiraha, Jaunpur 222002.",
    },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
    return children;
}
