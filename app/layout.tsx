import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackToTop from "../components/BackToTop";
import JsonLd from "../components/JsonLd";
import { R2_IMAGE_BASE_URL } from "../lib/constants";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

const SITE_URL = "https://vivazen.in";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "VivaZen | Best Beauty Salon & Spa in Jaunpur | Hair, Makeup, Bridal",
    template: "%s | VivaZen Beauty Salon & Spa Jaunpur",
  },
  description:
    "VivaZen — Jaunpur's best beauty salon & spa at Sapna Complex, Wajidpur Tiraha. Expert hair styling, bridal & party makeup, facials, waxing, keratin, laser hair removal, nail art, and spa services. Best parlour & salon near you in Jaunpur, Uttar Pradesh 222002.",
  keywords: [
    // ── Top-volume brand & location terms ──
    "spa Jaunpur",
    "spa in Jaunpur",
    "Jaunpur spa",
    "jaunpur spa centre",
    "jaunpur all spa centre",
    "spa near me",
    "spa near Jaunpur",
    "spa in Jaunpur Uttar Pradesh",
    "body spa in Jaunpur",
    "body spa Jaunpur",
    "body massage spa in Jaunpur Uttar Pradesh",
    "zen spa",
    "VivaZen",
    "vivazen parlour jaunpur",
    "viva beauty",
    "viva",
    // ── Salon near me variants ──
    "salon near me",
    "salons near me",
    "salon in Jaunpur",
    "best salon in Jaunpur",
    "salon Jaunpur",
    "best salon in Jaunpur Uttar Pradesh",
    "best salon near me",
    "unisex salon in Jaunpur",
    "best unisex salon in Jaunpur",
    "best women salon in Jaunpur",
    "best men salon in Jaunpur",
    "men salon near me",
    "ladies salon in Jaunpur",
    "hair salon near me",
    "hair salon in Jaunpur",
    "hair salon Jaunpur",
    // ── Beauty parlour / parlour near me ──
    "beauty parlour near me",
    "beauty parlour in Jaunpur",
    "beauty parlour Jaunpur",
    "Jaunpur beauty parlour",
    "Jaunpur parlour",
    "parlour in Jaunpur",
    "parlour near me",
    "ladies parlour near me",
    "parlour near me for hair cut",
    "ladies beauty parlour in Jaunpur",
    "best beauty parlour in Jaunpur",
    "best beauty parlour",
    "jaunpur best beauty parlour",
    "jaunpur best parlour",
    "jaunpur famous beauty parlour",
    "jaunpur sabse best parlour",
    // ── Makeup artist ──
    "makeup artist in Jaunpur",
    "makeup artist Jaunpur",
    "Jaunpur makeup artist",
    "best makeup artist in Jaunpur",
    "jaunpur best makeup artist",
    "professional makeup artists in Jaunpur",
    "makeup artist in Jaunpur Uttar Pradesh",
    // ── Services ──
    "facial",
    "facial Jaunpur",
    "wax",
    "waxing salon Jaunpur",
    "hair cutting",
    "hair cutting girls salon",
    "hair extensions",
    "hair extensions Jaunpur",
    "hair removal",
    "laser hair removal",
    "laser hair removal in Jaunpur",
    "tan removal",
    "keratin",
    "keratin treatment",
    "hair keratin in Jaunpur",
    "hair botox Jaunpur",
    "botox",
    "eyelashes",
    "nail extension near me",
    "massage",
    "massage Jaunpur",
    "massage centre Jaunpur",
    "massage parlour in Jaunpur",
    "massage parlour near me",
    "massage spa near me",
    "body massage Jaunpur",
    "spa body massage",
    // ── Hair-specific ──
    "hair spa Jaunpur",
    "hair patch salon Jaunpur",
    "hair weaving centre in Jaunpur",
    "top hair salon Jaunpur men",
    "hair salon near me for men",
    "haircutting saloon females Jaunpur",
    // ── Bridal & skin ──
    "bridal beauty parlour in Jaunpur Uttar Pradesh",
    "bridal makeup Jaunpur",
    "skin and hair clinic Jaunpur",
    "skin care clinic Jaunpur",
    "skin clinic Jaunpur",
    // ── Academy & training ──
    "beauty training Jaunpur",
    "viva beauty academy Jaunpur",
    "jaunpur beautician training contact number",
    // ── Location pins ──
    "VivaZen Sapna Complex Wajidpur Tiraha Jaunpur",
    "VivaZen opposite Shivagi Clinic near Wazidpur Husainabad Jaunpur",
    "Wajidpur Tiraha salon",
    "Sapna Complex Jaunpur salon",
    "new viva beauty spa near Kaushalya Hospital Uttar Pradesh",
  ],
  authors: [{ name: "VivaZen Beauty Salon" }],
  creator: "BONSOI Systems",
  publisher: "VivaZen Beauty Salon",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "VivaZen Beauty Salon & Spa",
    title: "VivaZen | Best Beauty Salon & Spa in Jaunpur — Hair, Makeup, Bridal",
    description:
      "Jaunpur's #1 premium beauty salon & spa. Expert hair, bridal & party makeup, facials, waxing, keratin, laser, nail art, body spa & massage. At Sapna Complex, Wajidpur Tiraha, Jaunpur 222002.",
    images: [
      {
        url: `${R2_IMAGE_BASE_URL}/slider-1.jpg`,
        width: 1200,
        height: 630,
        alt: "VivaZen Beauty Salon & Spa Jaunpur",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VivaZen | Best Salon & Spa in Jaunpur",
    description:
      "Premium hair, makeup, spa & bridal salon in Jaunpur, UP. Sapna Complex, Wajidpur Tiraha — book your appointment today!",
    images: [`${R2_IMAGE_BASE_URL}/slider-1.jpg`],
  },
  alternates: {
    canonical: SITE_URL,
  },
  verification: {
    google: "YOUR_GOOGLE_VERIFICATION_CODE",
  },
  category: "Beauty Salon",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} font-sans antialiased relative selection:bg-amber-100 selection:text-amber-900`}>
        <JsonLd />
        <Navbar />
        <main className="min-h-screen relative z-0">
          {children}
        </main>
        <Footer />
        <BackToTop />
      </body>
    </html>
  );
}
