import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Gallery | Hair, Bridal, Spa & Makeup Portfolio — VivaZen Jaunpur",
    description:
        "Browse VivaZen Beauty Salon & Spa Jaunpur's transformation portfolio — hair styling, bridal makeup, party makeup, nail art, skin care, waxing, and spa treatments. See our best work before booking.",
    keywords: [
        "salon gallery Jaunpur",
        "bridal makeup photos Jaunpur",
        "hair styling portfolio Jaunpur",
        "makeup before after Jaunpur",
        "best salon work Jaunpur",
        "spa gallery Jaunpur",
        "makeover photos Jaunpur",
        "jaunpur best makeup artist portfolio",
        "makeup artist portfolio Jaunpur",
    ],
    openGraph: {
        title: "Gallery | VivaZen Beauty Salon & Spa Jaunpur",
        description: "See our stunning transformations — hair, bridal, makeup, nails, spa & skin care at Jaunpur's best beauty parlour.",
    },
};

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
    return children;
}
