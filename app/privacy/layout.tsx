import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy — Vivazen Beauty Salon",
    description:
        "Read Vivazen Beauty Salon's Privacy Policy. Learn how we collect, use, and protect your personal information.",
    openGraph: {
        title: "Privacy Policy — Vivazen Beauty Salon",
        description: "How we collect, use, and protect your personal information.",
    },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
    return children;
}
