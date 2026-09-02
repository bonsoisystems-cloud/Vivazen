import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "VivaZen Beauty Academy | Beautician Training & Courses in Jaunpur",
    description:
        "VivaZen Academy Jaunpur offers professional beautician training and certified beauty courses — hair styling, bridal makeup, skin care, nail art, and complete beauty diploma programs. Best beauty training institute in Jaunpur, Uttar Pradesh.",
    keywords: [
        "beauty course Jaunpur",
        "hair styling course Jaunpur",
        "makeup training Jaunpur",
        "beauty academy Jaunpur",
        "salon training institute Jaunpur",
        "viva beauty academy Jaunpur",
        "beauty training Jaunpur",
        "jaunpur beautician training contact number",
        "makeup artist training Jaunpur",
        "professional makeup artists in Jaunpur",
        "best makeup artist in Jaunpur",
        "beautician course Jaunpur",
        "skin care course Jaunpur",
        "nail art course Jaunpur",
    ],
    openGraph: {
        title: "VivaZen Beauty Academy | Beautician Courses in Jaunpur",
        description: "Professional beautician training with certification at VivaZen Academy, Jaunpur. Enroll in hair, makeup, skin & nail art courses now.",
    },
};

export default function EducationLayout({ children }: { children: React.ReactNode }) {
    return children;
}
