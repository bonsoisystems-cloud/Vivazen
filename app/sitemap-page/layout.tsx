import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sitemap — Vivazen Beauty Salon",
    description:
        "Browse all pages on the Vivazen Beauty Salon website. Find links to our services, gallery, career opportunities, and more.",
    openGraph: {
        title: "Sitemap — Vivazen Beauty Salon",
        description: "Browse all pages on the Vivazen website.",
    },
};

export default function SitemapPageLayout({ children }: { children: React.ReactNode }) {
    return children;
}
