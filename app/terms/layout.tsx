import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms & Conditions — Vivazen Beauty Salon",
    description:
        "Read Vivazen Beauty Salon's Terms and Conditions. Understand the guidelines for using our services and website.",
    openGraph: {
        title: "Terms & Conditions — Vivazen Beauty Salon",
        description: "Guidelines for using our services and website.",
    },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
    return children;
}
