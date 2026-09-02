import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Career — Join Our Team",
    description:
        "Join Vivazen Beauty Salon Jaunpur. We're hiring hair stylists, makeup artists, nail technicians, and salon staff. Grow your career in the beauty industry.",
    keywords: [
        "salon jobs Jaunpur",
        "beauty salon career Jaunpur",
        "hair stylist job Jaunpur",
        "makeup artist job Jaunpur",
    ],
    openGraph: {
        title: "Career at Vivazen | Salon Jobs in Jaunpur",
        description: "Explore career opportunities at Jaunpur's leading beauty salon.",
    },
};

export default function CareerLayout({ children }: { children: React.ReactNode }) {
    return children;
}
