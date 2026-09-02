import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "About Us | Jaunpur's Best Beauty Salon & Spa — VivaZen",
    description:
        "Learn about VivaZen Beauty Salon & Spa — Jaunpur's leading premium unisex salon for hair, makeup, skin care, bridal services, and spa. Our story, team, values, and luxurious salon experience at Sapna Complex, Wajidpur Tiraha, Jaunpur.",
    keywords: [
        "about Vivazen salon",
        "best salon Jaunpur",
        "premium beauty salon Jaunpur",
        "Jaunpur salon story",
        "best unisex salon in Jaunpur",
        "best parlour in Jaunpur",
        "jaunpur best salon",
        "vivazen Jaunpur",
        "best spa in Jaunpur",
        "best beauty parlour in Jaunpur",
    ],
    openGraph: {
        title: "About VivaZen | Best Beauty Salon & Spa in Jaunpur",
        description: "Discover our story, values, and luxurious salon & spa spaces in Jaunpur, Uttar Pradesh.",
    },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
    return children;
}
