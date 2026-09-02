import { R2_IMAGE_BASE_URL } from "../lib/constants";

export default function JsonLd() {
    const localBusiness = {
        "@context": "https://schema.org",
        "@type": ["BeautySalon", "HealthAndBeautyBusiness", "SpaOrBeautyService"],
        name: "VivaZen Beauty Salon & Spa",
        alternateName: [
            "Vivazen",
            "VivaZen Wellness Jaunpur",
            "Viva Beauty Spa Jaunpur",
            "VivaZen Parlour Jaunpur",
            "Best Salon in Jaunpur",
            "Best Spa in Jaunpur",
        ],
        description:
            "VivaZen — Jaunpur's best beauty salon & spa offering expert hair styling, bridal & party makeup, skin care, facials, waxing, laser hair removal, keratin treatments, nail art, body spa, and massage. Located at Sapna Complex, Wajidpur Tiraha, Jaunpur, Uttar Pradesh 222002.",
        url: "https://vivazen.in",
        telephone: "+917617079955",
        email: "vivazenwellnessjnp@gmail.com",
        image: `${R2_IMAGE_BASE_URL}/slider-1.jpg`,
        logo: `${R2_IMAGE_BASE_URL}/logo.png`,
        priceRange: "₹₹",
        currenciesAccepted: "INR",
        paymentAccepted: "Cash, UPI, Credit Card, Debit Card",
        address: {
            "@type": "PostalAddress",
            streetAddress: "Sapna Complex Building, Ground Floor, Wajidpur Tiraha, Opposite Shivangi Clinic, Husainabad",
            addressLocality: "Jaunpur",
            addressRegion: "Uttar Pradesh",
            postalCode: "222002",
            addressCountry: "IN",
        },
        geo: {
            "@type": "GeoCoordinates",
            latitude: 25.736503,
            longitude: 82.683213,
        },
        openingHoursSpecification: [
            {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday",
                ],
                opens: "10:00",
                closes: "21:00",
            },
        ],
        sameAs: [
            "https://www.instagram.com/vivazen_jaunpur",
            "https://www.facebook.com/vivazensalon",
        ],
        hasMap:
            "https://www.google.com/maps?q=VivaZen+Beauty+Salon+Jaunpur",
        areaServed: [
            { "@type": "City", name: "Jaunpur" },
            { "@type": "State", name: "Uttar Pradesh" },
            { "@type": "Place", name: "Wajidpur", containedIn: { "@type": "City", name: "Jaunpur" } },
            { "@type": "Place", name: "Husainabad", containedIn: { "@type": "City", name: "Jaunpur" } },
        ],
        makesOffer: [
            {
                "@type": "Offer",
                itemOffered: {
                    "@type": "Service",
                    name: "Spa & Body Massage",
                    description: "Relaxing body spa and massage services in Jaunpur. Rejuvenating spa treatments for complete wellness.",
                },
            },
            {
                "@type": "Offer",
                itemOffered: {
                    "@type": "Service",
                    name: "Hair Styling & Hair Cut",
                    description: "Expert hair cutting, styling, blow dry, and hair treatments for ladies and gents in Jaunpur",
                },
            },
            {
                "@type": "Offer",
                itemOffered: {
                    "@type": "Service",
                    name: "Hair Color & Treatment",
                    description: "Global hair color, highlights, ombre, balayage with treatment options in Jaunpur",
                },
            },
            {
                "@type": "Offer",
                itemOffered: {
                    "@type": "Service",
                    name: "Hair Spa, Botox & Keratin",
                    description: "Basic to luxury hair spa, keratin treatment, vegan collagen botox, and hair smoothening in Jaunpur",
                },
            },
            {
                "@type": "Offer",
                itemOffered: {
                    "@type": "Service",
                    name: "Bridal Makeup",
                    description: "Professional bridal, engagement, reception makeup with HD & airbrush options. Best makeup artist in Jaunpur",
                },
            },
            {
                "@type": "Offer",
                itemOffered: {
                    "@type": "Service",
                    name: "Party & Event Makeup",
                    description: "Party, event, and luxury makeup services by top makeup artists in Jaunpur",
                },
            },
            {
                "@type": "Offer",
                itemOffered: {
                    "@type": "Service",
                    name: "Skin Care, Facials & De-tan",
                    description: "General and advanced facials, bleach, de-tan, anti-aging treatments, body polishing, tan removal in Jaunpur",
                },
            },
            {
                "@type": "Offer",
                itemOffered: {
                    "@type": "Service",
                    name: "Laser Hair Removal",
                    description: "Safe, professional laser hair removal for face, body, and bikini line in Jaunpur, Uttar Pradesh",
                },
            },
            {
                "@type": "Offer",
                itemOffered: {
                    "@type": "Service",
                    name: "Waxing & Threading",
                    description: "Full body waxing, threading, and hair removal services. Best wax salon near you in Jaunpur",
                },
            },
            {
                "@type": "Offer",
                itemOffered: {
                    "@type": "Service",
                    name: "Nail Art & Extensions",
                    description: "Nail extensions, semi-extensions, manicure, pedicure, and nail art services in Jaunpur",
                },
            },
            {
                "@type": "Offer",
                itemOffered: {
                    "@type": "Service",
                    name: "Pre-Bridal Packages",
                    description: "Complete pre-bridal body, skin, and hair preparation packages at Jaunpur's best beauty parlour",
                },
            },
            {
                "@type": "Offer",
                itemOffered: {
                    "@type": "Service",
                    name: "Beauty Academy & Training",
                    description: "Beautician training and certification courses at VivaZen Beauty Academy, Jaunpur. Contact for enrolment.",
                },
            },
        ],
        aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.8",
            reviewCount: "250",
            bestRating: "5",
        },
    };

    const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "VivaZen Beauty Salon & Spa",
        url: "https://vivazen.in",
        potentialAction: {
            "@type": "SearchAction",
            target: "https://vivazen.in/services?q={search_term_string}",
            "query-input": "required name=search_term_string",
        },
    };

    const breadcrumb = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://vivazen.in" },
            { "@type": "ListItem", position: 2, name: "Services & Pricing", item: "https://vivazen.in/services" },
            { "@type": "ListItem", position: 3, name: "Gallery", item: "https://vivazen.in/gallery" },
            { "@type": "ListItem", position: 4, name: "About Us", item: "https://vivazen.in/about" },
            { "@type": "ListItem", position: 5, name: "Contact & Book", item: "https://vivazen.in/contact" },
            { "@type": "ListItem", position: 6, name: "Find Our Salon", item: "https://vivazen.in/salon-finder" },
            { "@type": "ListItem", position: 7, name: "Beauty Academy", item: "https://vivazen.in/education" },
        ],
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
            {
                "@type": "Question",
                name: "Where is VivaZen spa located in Jaunpur?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "VivaZen Beauty Salon & Spa is located at Sapna Complex, Ground Floor, Opposite Shivangi Clinic, Near Wajidpur Tiraha, Husainabad, Jaunpur, Uttar Pradesh 222002.",
                },
            },
            {
                "@type": "Question",
                name: "Which is the best salon in Jaunpur?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "VivaZen is widely considered the best salon in Jaunpur, offering premium hair styling, bridal makeup, spa, facials, waxing, laser hair removal, keratin treatments, and nail art with a 4.8-star rating.",
                },
            },
            {
                "@type": "Question",
                name: "Does VivaZen offer spa and body massage in Jaunpur?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes, VivaZen offers relaxing spa and body massage services in Jaunpur. Call +917617079955 to book your spa appointment.",
                },
            },
            {
                "@type": "Question",
                name: "Is VivaZen a unisex salon in Jaunpur?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes, VivaZen is a premium unisex salon in Jaunpur offering services for both women and men, including hair cutting, styling, color, and spa treatments.",
                },
            },
            {
                "@type": "Question",
                name: "What are the timings of VivaZen salon in Jaunpur?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "VivaZen Beauty Salon & Spa in Jaunpur is open all 7 days a week, from 10:00 AM to 9:00 PM.",
                },
            },
            {
                "@type": "Question",
                name: "Does VivaZen offer beauty training and courses in Jaunpur?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes, VivaZen Beauty Academy in Jaunpur offers professional beautician training and certification courses in hair styling, bridal makeup, skin care, and nail art. Contact +917617079955 for enrolment details.",
                },
            },
            {
                "@type": "Question",
                name: "Does VivaZen offer laser hair removal in Jaunpur?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes, VivaZen offers professional laser hair removal services in Jaunpur, Uttar Pradesh. Book a consultation at Sapna Complex, Wajidpur Tiraha.",
                },
            },
            {
                "@type": "Question",
                name: "Which is the best beauty parlour in Jaunpur?",
                acceptedAnswer: {
                    "@type": "Answer",
                    text: "VivaZen is Jaunpur's best beauty parlour, rated 4.8 stars by hundreds of clients. Services include bridal makeup, facials, hair treatments, waxing, nail art, and spa services.",
                },
            },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
        </>
    );
}
