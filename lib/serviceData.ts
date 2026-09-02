import { R2_IMAGE_BASE_URL } from "./constants";

export interface ServiceItem {
    name: string;
    price: number;
}

export interface SubCategory {
    name: string;
    items: ServiceItem[];
}

export interface ServiceInfo {
    slug: string;
    name: string;
    icon: string;
    desc: string;
    gradient: string;
    subcategories: SubCategory[];
}

export const services: ServiceInfo[] = [
    {
        slug: "hair",
        name: "Hair",
        icon: `${R2_IMAGE_BASE_URL}/hair-icon.png`,
        desc: "Your hair is in safe hands as our expert hairdressers excel in all hair services",
        gradient: "from-rose-500/20 to-pink-500/20",
        subcategories: [
            {
                name: "Hair Cut",
                items: [
                    { name: "Hair Cut - Opening Offer", price: 99 },
                    { name: "Hair Cut - Front/Fringe", price: 190 },
                    { name: "Hair Cut - 199", price: 199 },
                    { name: "Hair Cut - Junior Artist", price: 234 },
                    { name: "Trimming", price: 290 },
                    { name: "Hair Cut - Child Hair", price: 390 },
                    { name: "Hair Cut - Change of Style", price: 490 },
                    { name: "Hair Cut - Designer", price: 690 },
                ],
            },
            {
                name: "Hair Color",
                items: [
                    { name: "Highlight (Per Streak Line)", price: 220 },
                    { name: "Root Touch Up (1 Inch)", price: 990 },
                    { name: "Root Touch Up (2 Inch)", price: 1490 },
                    { name: "Global/Fashion (Boy Cut)", price: 1590 },
                    { name: "Global/Fashion (Shoulder Length)", price: 1990 },
                    { name: "Global/Fashion (Medium Hair)", price: 2690 },
                    { name: "Ombre Hair Colour", price: 2890 },
                    { name: "Global/Fashion (Long Hair)", price: 2990 },
                    { name: "Global/Fashion (Extra Long Hair)", price: 3490 },
                    { name: "Balyage Colour Global", price: 4490 },
                    { name: "Ombre Colour Global", price: 4490 },
                ],
            },
            {
                name: "Color & Treatment",
                items: [
                    { name: "Highlight & Treatment Per Streak Line", price: 390 },
                    { name: "Hair Colour With Treatment (Boy Cut)", price: 1980 },
                    { name: "Hair Colour With Treatment (Shoulder Length)", price: 2290 },
                    { name: "Highlight & Treatment Ombre Hair Color", price: 3590 },
                    { name: "Hair Colour With Treatment (Medium Hair)", price: 3680 },
                    { name: "Hair Colour With Treatment (Long Hair)", price: 3990 },
                    { name: "Hair Colour With Treatment (Extra Long Hair)", price: 4490 },
                    { name: "Balyage Color Global With Treatment", price: 5490 },
                    { name: "Ombre Color Global With Treatment", price: 5490 },
                ],
            },
            {
                name: "Hair Spa",
                items: [
                    { name: "Basic Hair Spa (Shoulder Length)", price: 760 },
                    { name: "Solder Length SPA", price: 811 },
                    { name: "Hair Spa Shoulder Length Premium", price: 990 },
                    { name: "Basic Hair Spa (Medium Length)", price: 1165 },
                    { name: "Basic Hair Spa (Long Hair)", price: 1390 },
                    { name: "Basic Hair Spa (Extra Long Hair)", price: 1590 },
                    { name: "Luxury Hair Spa (Shoulder Length)", price: 1990 },
                    { name: "Luxury Hair Spa (Medium Length)", price: 2690 },
                    { name: "Luxury Hair Spa (Long Length)", price: 2890 },
                    { name: "Luxury Hair Spa (Extra Long Hair)", price: 2990 },
                ],
            },
            {
                name: "Hair Styling",
                items: [
                    { name: "Hair Blow Dry / Blow Blast", price: 290 },
                    { name: "Hair Wash With Cond. & Blow Dry", price: 390 },
                    { name: "Ironing/Crimping/Curling (Shoulder Length)", price: 490 },
                    { name: "Braid With Accessories", price: 999 },
                    { name: "Ironing/Crimping/Curling (Long)", price: 1190 },
                    { name: "Ironing/Crimping/Curling (Extra Long)", price: 1590 },
                ],
            },
            {
                name: "Hair Straightening",
                items: [
                    { name: "Smoothening (Shoulder Length)", price: 4500 },
                    { name: "Rebounding (Solder Length)", price: 4900 },
                    { name: "Rebonding (Extra Long Hair)", price: 9900 },
                ],
            },
            {
                name: "Botox",
                items: [
                    { name: "Vegan Collagen Botox (Shoulder Length)", price: 7900 },
                    { name: "Vegan Collagen Botox (Mid Length)", price: 8900 },
                    { name: "Vegan Collagen Botox (Long Length)", price: 9900 },
                    { name: "Vegan Collagen Botox (Extra Long Hair)", price: 11900 },
                ],
            },
            {
                name: "Hair Treatments",
                items: [
                    { name: "Treatment - Smartbonds (Long)", price: 1290 },
                    { name: "Anti Hair Loss / Repairing Treatment", price: 1990 },
                    { name: "Treatment - Hair Loss", price: 2929 },
                    { name: "Nutrifier Dry Hair Treatment", price: 2990 },
                ],
            },
            {
                name: "Hair Accessories",
                items: [
                    { name: "Hair Accessories Basic", price: 390 },
                    { name: "Hair Accessories Advanced", price: 790 },
                    { name: "Hair Extension", price: 1000 },
                ],
            },
        ],
    },
    {
        slug: "nails",
        name: "Nail Art",
        icon: `${R2_IMAGE_BASE_URL}/nail.png`,
        desc: "Stay ahead of the trend with our beautiful nail art services",
        gradient: "from-pink-500/20 to-rose-500/20",
        subcategories: [
            {
                name: "Nail Extensions",
                items: [
                    { name: "Semi Nail Extension", price: 1590 },
                    { name: "Nail Extension", price: 2990 },
                ],
            },
            {
                name: "Manicure",
                items: [
                    { name: "Manicure Basic", price: 390 },
                    { name: "Manicure SPA", price: 690 },
                    { name: "Manicure Luxury", price: 990 },
                ],
            },
            {
                name: "Pedicure",
                items: [
                    { name: "Pedicure Basic", price: 490 },
                    { name: "Pedicure SPA", price: 790 },
                    { name: "Pedicure Luxury", price: 1190 },
                ],
            },
        ],
    },
    {
        slug: "skin",
        name: "Skin Care",
        icon: `${R2_IMAGE_BASE_URL}/skin.png`,
        desc: "It's time for your skin to shine from within through our specialised skin treatment solutions",
        gradient: "from-teal-500/20 to-cyan-500/20",
        subcategories: [
            {
                name: "Bleach / Detan",
                items: [
                    { name: "Bleach Or Detan - Underarms", price: 120 },
                    { name: "Bleach Or Detan - Face Basic", price: 190 },
                    { name: "Bleach Or Detan - Face & Neck", price: 290 },
                    { name: "Bleach Or Detan - Face Advance", price: 290 },
                    { name: "Detan Face & Neck", price: 290 },
                    { name: "Bleach Or Detan - Back Blouse Line", price: 340 },
                    { name: "Bleach Or Detan - Feet", price: 340 },
                    { name: "Bleach Or Detan - Neck & B. Line", price: 340 },
                    { name: "B. Line Back", price: 340 },
                    { name: "B. Line Front", price: 340 },
                    { name: "Half Arms", price: 390 },
                    { name: "Bleach Or Detan - Midriff", price: 390 },
                    { name: "Bleach Or Detan - Face & Neck Advance", price: 440 },
                    { name: "Bleach Or Detan - Half Legs", price: 440 },
                    { name: "Bleach Or Detan - Full Arms", price: 590 },
                    { name: "Bleach Or Detan - Full Back", price: 590 },
                    { name: "Bleach Or Detan - Full Front", price: 590 },
                    { name: "Bleach Or Detan - Face, Neck And B Line", price: 690 },
                    { name: "Face & Neck B. Line", price: 690 },
                    { name: "Bleach Or Detan - Full Legs", price: 790 },
                    { name: "Bleach Or Detan - Full Body", price: 2340 },
                ],
            },
            {
                name: "General Facials",
                items: [
                    { name: "Clean-up 299", price: 299 },
                    { name: "Facial - Fruit", price: 799 },
                    { name: "Fruit Facial", price: 799 },
                    { name: "Facial Reg - Regular Fruit", price: 890 },
                    { name: "Facial Reg - Regular Lotus", price: 990 },
                    { name: "Facial Reg - Pearl/Gold/Diamond/Chocolate", price: 1490 },
                    { name: "Facial Adv - Diamond", price: 1690 },
                    { name: "Facial Adv - De-Pigmentation", price: 1990 },
                    { name: "Facial Adv - Fairness", price: 2190 },
                    { name: "Facial Adv - Instafair", price: 2190 },
                    { name: "Facial Adv - Hydranourishment", price: 2290 },
                    { name: "Facial Adv - Glow Skin / Wine", price: 2290 },
                    { name: "Facial Adv - Gold Sheen", price: 2890 },
                    { name: "Facial Adv - Age Blocker Anti Aging", price: 2890 },
                    { name: "Facial Adv - Whitening Advanced", price: 2990 },
                    { name: "Facial Adv - Seaweed Whitening", price: 2990 },
                    { name: "Instant Glow", price: 2990 },
                    { name: "Facial Adv - Firming Acne", price: 3047 },
                    { name: "Facial Adv - Feather Touch", price: 3400 },
                ],
            },
            {
                name: "Advanced Skin Treatments",
                items: [
                    { name: "Face - CTM", price: 190 },
                    { name: "Deant Face & Neck", price: 459 },
                    { name: "Eye Treatment", price: 590 },
                    { name: "Luxury Cleanup", price: 1390 },
                    { name: "Skin Firming / Anti Acne Facial", price: 1990 },
                    { name: "Facial Pre Derma Spa", price: 4106 },
                    { name: "Facial Adv - Corrective Anti Aging", price: 5800 },
                ],
            },
            {
                name: "Body Polishing",
                items: [
                    { name: "Body Polishing", price: 2990 },
                    { name: "Body Polishing Excel", price: 3990 },
                    { name: "Body Polishing Luxury", price: 4990 },
                ],
            },
            {
                name: "Body Care",
                items: [
                    { name: "Body Massage (45 Mins)", price: 1990 },
                ],
            },
            {
                name: "Waxing",
                items: [
                    { name: "Wax - Underarms", price: 90 },
                    { name: "Wax - Face", price: 190 },
                    { name: "Wax - Half Arms", price: 290 },
                    { name: "Wax - Full Arms", price: 490 },
                    { name: "Wax - Half Legs", price: 390 },
                    { name: "Wax - Full Legs", price: 690 },
                    { name: "Wax - Full Body", price: 1990 },
                ],
            },
            {
                name: "Threading",
                items: [
                    { name: "Eyebrow Threading", price: 40 },
                    { name: "Upper Lip Threading", price: 30 },
                    { name: "Full Face Threading", price: 150 },
                    { name: "Forehead Threading", price: 30 },
                ],
            },
        ],
    },
    {
        slug: "bridal",
        name: "Bridal",
        icon: `${R2_IMAGE_BASE_URL}/bridal.png`,
        desc: "Get ready to look special on your big day with our stunning bridal looks",
        gradient: "from-violet-500/20 to-purple-500/20",
        subcategories: [
            {
                name: "Bridal Makeup",
                items: [
                    { name: "Makeup - Engagement", price: 7900 },
                    { name: "Makeup - Exclusive Engagement", price: 9100 },
                    { name: "Bridal Makeup", price: 9900 },
                    { name: "Makeup - Bridal", price: 10990 },
                    { name: "Luxury Engagement Makeup", price: 12900 },
                    { name: "Makeup - Exclusive Reception", price: 12900 },
                    { name: "Makeup - Advanced Bridal", price: 12990 },
                    { name: "Makeup - Special Bridal", price: 15990 },
                    { name: "Makeup - Exclusive Bridal", price: 18990 },
                    { name: "Luxury Bridal Makeup", price: 25990 },
                    { name: "Signature Makeup", price: 28990 },
                ],
            },
            {
                name: "Reception Makeup",
                items: [
                    { name: "Makeup - Reception", price: 9900 },
                    { name: "Luxury Reception Makeup", price: 16900 },
                ],
            },
            {
                name: "Bridal Add-ons",
                items: [
                    { name: "Dupatta Draping", price: 500 },
                    { name: "Nail Colour (Bridal)", price: 200 },
                    { name: "Quality Mink Eyelashes", price: 500 },
                    { name: "Fresh Flowers for Bridal Jooda", price: 1000 },
                ],
            },
        ],
    },
    {
        slug: "pre-bridal",
        name: "Pre-Bridal",
        icon: `${R2_IMAGE_BASE_URL}/pre-bridal.png`,
        desc: "Prep your skin and body before your wedding to look like a real life barbie",
        gradient: "from-amber-500/20 to-yellow-500/20",
        subcategories: [
            {
                name: "Pre-Bridal Facials",
                items: [
                    { name: "Facial Adv - Hydranourishment", price: 2290 },
                    { name: "Facial Adv - Gold Sheen", price: 2890 },
                    { name: "Facial Adv - Whitening Advanced", price: 2990 },
                    { name: "Facial Pre Derma Spa", price: 4106 },
                    { name: "Facial Adv - Corrective Anti Aging", price: 5800 },
                ],
            },
            {
                name: "Pre-Bridal Body",
                items: [
                    { name: "Body Massage (45 Mins)", price: 1990 },
                    { name: "Body Polishing", price: 2990 },
                    { name: "Body Polishing Excel", price: 3990 },
                    { name: "Body Polishing Luxury", price: 4990 },
                ],
            },
            {
                name: "Pre-Bridal Hair",
                items: [
                    { name: "Hair Spa Shoulder Length Premium", price: 990 },
                    { name: "Luxury Hair Spa (Shoulder Length)", price: 1990 },
                    { name: "Luxury Hair Spa (Long Length)", price: 2890 },
                ],
            },
        ],
    },
    {
        slug: "makeup",
        name: "Makeup",
        icon: `${R2_IMAGE_BASE_URL}/makeup.png`,
        desc: "Get ready to steal the spotlight with our Non-Bridal Party Makeup and Hair styles",
        gradient: "from-amber-500/20 to-orange-500/20",
        subcategories: [
            {
                name: "General Makeup",
                items: [
                    { name: "Makeup - Eye", price: 1100 },
                    { name: "Makeup - Light Makeup Face", price: 2300 },
                    { name: "Light Makeup", price: 3500 },
                    { name: "Makeup - Party Makeup", price: 4600 },
                    { name: "Makeup - Exclusive Party", price: 5800 },
                ],
            },
            {
                name: "Party & Event Makeup",
                items: [
                    { name: "Luxury Party Makeup", price: 8900 },
                    { name: "Luxury Engagement Makeup", price: 12900 },
                    { name: "Luxury Reception Makeup", price: 16900 },
                ],
            },
        ],
    },
];

export interface PackageInfo {
    name: string;
    originalPrice: string;
    price: string;
    items: string[];
}

export const packages: PackageInfo[] = [
    {
        name: "Advance Make Over Package",
        originalPrice: "4,070",
        price: "2,990",
        items: [
            "Threading",
            "Lotus Facial",
            "Body Massage",
            "Regular Hand Wax",
            "Hair SPA",
        ],
    },
    {
        name: "Special Make Over Package",
        originalPrice: "7,551",
        price: "4,990",
        items: [
            "Face Threading",
            "Diamond Facial",
            "Face Detan",
            "Body Polishing",
            "Full Arms Wax",
            "Hair Cut",
            "Hair SPA",
        ],
    },
    {
        name: "Exclusive Make Over Package",
        originalPrice: "19,740",
        price: "14,990",
        items: [
            "Face Threading",
            "Body Detan",
            "Premium Facial",
            "Waxing Body Italian",
            "Manicure SPA",
            "Pedicure SPA",
            "Body SPA",
            "Hair Cut Designer",
            "Hair SPA",
        ],
    },
];
