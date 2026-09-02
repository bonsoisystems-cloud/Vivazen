import prisma, { ImageCategory, Role } from "../lib/prisma";
import bcrypt from "bcryptjs";
const R2_IMAGE_BASE_URL = process.env.NEXT_PUBLIC_R2_IMAGE_BASE_URL || "https://pub-507869809f114df791179bd7ca34415b.r2.dev";

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Seed Users (Admin and Manager)
  const adminPassword = await bcrypt.hash("Admin@Vivazen2026!", 10);
  const managerPassword = await bcrypt.hash("Manager@Vivazen2026!", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@vivazen.com" },
    update: { password: adminPassword, role: Role.ADMIN, name: "Vivazen Admin" },
    create: {
      name: "Vivazen Admin",
      email: "admin@vivazen.com",
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: "manager@vivazen.com" },
    update: { password: managerPassword, role: Role.MANAGER, name: "Vivazen Manager" },
    create: {
      name: "Vivazen Manager",
      email: "manager@vivazen.com",
      password: managerPassword,
      role: Role.MANAGER,
    },
  });

  console.log("✅ Seeded users:", { admin: admin.email, manager: manager.email });

  // 2. Clear previous dynamic data to avoid duplicates if re-seeding
  await prisma.serviceItem.deleteMany({});
  await prisma.subCategory.deleteMany({});
  await prisma.serviceCategory.deleteMany({});
  await prisma.servicePackage.deleteMany({});
  await prisma.offer.deleteMany({});
  await prisma.heroSlide.deleteMany({});
  await prisma.interior.deleteMany({});
  await prisma.imageAsset.deleteMany({});

  // 3. Seed Hero Slides
  const heroSlides = [
    {
      image: `${R2_IMAGE_BASE_URL}/slider-1.jpg`,
      alt: "Hair Styling",
      tagline: "Where Beauty Meets Art",
      order: 1,
    },
    {
      image: `${R2_IMAGE_BASE_URL}/slider-7.jpg`,
      alt: "Bridal Makeup",
      tagline: "Your Dream, Our Expertise",
      order: 2,
    },
    {
      image: `${R2_IMAGE_BASE_URL}/slider-8.jpg`,
      alt: "Skin Care",
      tagline: "Radiance, Redefined",
      order: 3,
    },
  ];

  for (const slide of heroSlides) {
    await prisma.heroSlide.create({ data: slide });
    await prisma.imageAsset.create({
      data: {
        name: slide.alt,
        url: slide.image,
        category: ImageCategory.HERO,
        alt: slide.alt,
        detail: slide.tagline,
        order: slide.order,
      },
    });
  }
  console.log("✅ Seeded Hero Slides & Hero Images");

  // 4. Seed Interior Showcase
  const interiors = [
    {
      image: `${R2_IMAGE_BASE_URL}/gallery/interior/interior-1.jpg`,
      title: "The Grand Lounge",
      desc: "Our signature reception — where first impressions become lasting memories",
      order: 1,
    },
    {
      image: `${R2_IMAGE_BASE_URL}/gallery/interior/interior-2.jpg`,
      title: "Styling Studio",
      desc: "State-of-the-art stations for your perfect transformation",
      order: 2,
    },
    {
      image: `${R2_IMAGE_BASE_URL}/gallery/interior/interior-4.jpg`,
      title: "Relaxation Zone",
      desc: "A serene escape to unwind before and after your session",
      order: 3,
    },
    {
      image: `${R2_IMAGE_BASE_URL}/gallery/interior/interior-5.jpg`,
      title: "Treatment Suite",
      desc: "Private luxury suites for our most premium experiences",
      order: 4,
    },
  ];

  for (const item of interiors) {
    await prisma.interior.create({ data: item });
    await prisma.imageAsset.create({
      data: {
        name: item.title,
        url: item.image,
        category: ImageCategory.INTERIOR,
        alt: item.title,
        detail: item.desc,
        order: item.order,
      },
    });
  }
  console.log("✅ Seeded Interiors");

  // 5. Seed Offers
  const offers = [
    {
      image: `${R2_IMAGE_BASE_URL}/offer/offer-1.jpg`,
      badge: "NEW",
      badgeColor: "from-emerald-400 to-teal-500",
      title: "Glow Up Package",
      subtitle: "Hair + Skin",
      serviceSlug: "hair",
      subCategoryName: "Hair Cut",
      order: 1,
    },
    {
      image: `${R2_IMAGE_BASE_URL}/offer/offer-2.jpg`,
      badge: "HOT",
      badgeColor: "from-rose-500 to-red-500",
      title: "Bridal Luxe",
      subtitle: "Complete Makeover",
      serviceSlug: "bridal",
      subCategoryName: "Bridal Makeup",
      order: 2,
    },
    {
      image: `${R2_IMAGE_BASE_URL}/offer/offer-3.jpg`,
      badge: "NEW",
      badgeColor: "from-emerald-400 to-teal-500",
      title: "Color Fantasy",
      subtitle: "Hair Colouring",
      serviceSlug: "hair",
      subCategoryName: "Hair Color",
      order: 3,
    },
    {
      image: `${R2_IMAGE_BASE_URL}/offer/offer-4.jpg`,
      badge: "HOT",
      badgeColor: "from-rose-500 to-red-500",
      title: "Radiance Facial",
      subtitle: "Skin Treatment",
      serviceSlug: "skin",
      subCategoryName: "Bleach / Detan",
      order: 4,
    },
    {
      image: `${R2_IMAGE_BASE_URL}/offer/offer-5.jpg`,
      badge: "NEW",
      badgeColor: "from-emerald-400 to-teal-500",
      title: "Nail Artistry",
      subtitle: "Gel Extensions",
      serviceSlug: "nails",
      subCategoryName: "Nail Extensions",
      order: 5,
    },
  ];

  for (const offer of offers) {
    await prisma.offer.create({ data: offer });
    await prisma.imageAsset.create({
      data: {
        name: offer.title,
        url: offer.image,
        category: ImageCategory.OFFER,
        alt: offer.title,
        detail: offer.subtitle,
        order: offer.order,
      },
    });
  }
  console.log("✅ Seeded Offers");

  // 6. Seed Gallery Images into ImageAsset
  const galleryImages = [
    // Hair
    { url: `${R2_IMAGE_BASE_URL}/gallery/hair/hair-1.jpg`, alt: "Hair Styling", category: ImageCategory.GALLERY_HAIR, detail: "Expert hair styling & colour transformation" },
    { url: `${R2_IMAGE_BASE_URL}/gallery/hair/hair-2.jpg`, alt: "Hair Colour", category: ImageCategory.GALLERY_HAIR, detail: "Vibrant colour techniques by master stylists" },

    // Bridal
    { url: `${R2_IMAGE_BASE_URL}/gallery/bridal/bridal-1.jpg`, alt: "Bridal Look", category: ImageCategory.GALLERY_BRIDAL, detail: "Classic bridal makeup with soft glam finish" },
    { url: `${R2_IMAGE_BASE_URL}/gallery/bridal/bridal-2.jpg`, alt: "Bridal Elegance", category: ImageCategory.GALLERY_BRIDAL, detail: "Elegant bridal styling for the perfect look" },
    { url: `${R2_IMAGE_BASE_URL}/gallery/bridal/bridal-3.jpg`, alt: "Bridal Glam", category: ImageCategory.GALLERY_BRIDAL, detail: "Glamorous bridal transformation" },
    { url: `${R2_IMAGE_BASE_URL}/gallery/bridal/bridal-4.jpg`, alt: "Bridal Style", category: ImageCategory.GALLERY_BRIDAL, detail: "Timeless bridal beauty artistry" },
    { url: `${R2_IMAGE_BASE_URL}/gallery/bridal/bridal-5.jpg`, alt: "Bridal Beauty", category: ImageCategory.GALLERY_BRIDAL, detail: "Stunning bridal look with fresh flowers" },
    { url: `${R2_IMAGE_BASE_URL}/gallery/bridal/bridal-6.jpg`, alt: "Bridal Grace", category: ImageCategory.GALLERY_BRIDAL, detail: "Graceful bridal hair & makeup" },
    { url: `${R2_IMAGE_BASE_URL}/gallery/bridal/bridal-7.jpg`, alt: "Bridal Charm", category: ImageCategory.GALLERY_BRIDAL, detail: "Charming bridal ensemble styling" },
    { url: `${R2_IMAGE_BASE_URL}/gallery/bridal/bridal-8.jpg`, alt: "Bridal Radiance", category: ImageCategory.GALLERY_BRIDAL, detail: "Radiant bridal glow & look" },
    { url: `${R2_IMAGE_BASE_URL}/gallery/bridal/bridal-9.jpg`, alt: "Bridal Dream", category: ImageCategory.GALLERY_BRIDAL, detail: "Dream bridal makeover with HD finish" },
    { url: `${R2_IMAGE_BASE_URL}/gallery/bridal/bridal-10.jpg`, alt: "Bridal Shine", category: ImageCategory.GALLERY_BRIDAL, detail: "Shimmering bridal beauty look" },
    { url: `${R2_IMAGE_BASE_URL}/gallery/bridal/bridal-11.jpg`, alt: "Bridal Bloom", category: ImageCategory.GALLERY_BRIDAL, detail: "Blooming bridal glow with floral art" },
    { url: `${R2_IMAGE_BASE_URL}/gallery/bridal/bridal-12.jpg`, alt: "Bridal Aura", category: ImageCategory.GALLERY_BRIDAL, detail: "Enchanting bridal aura & styling" },
    { url: `${R2_IMAGE_BASE_URL}/gallery/bridal/bridal-13.jpeg`, alt: "Bridal Royal", category: ImageCategory.GALLERY_BRIDAL, detail: "Royal bridal makeup with dupatta draping" },
    { url: `${R2_IMAGE_BASE_URL}/gallery/bridal/bridal-14.jpg`, alt: "Bridal Diva", category: ImageCategory.GALLERY_BRIDAL, detail: "Show-stopping bridal diva look" },
    { url: `${R2_IMAGE_BASE_URL}/gallery/bridal/bridal-16.jpg`, alt: "Bridal Luxe", category: ImageCategory.GALLERY_BRIDAL, detail: "Luxurious bridal beauty package" },
    { url: `${R2_IMAGE_BASE_URL}/gallery/bridal/bridal-17.jpg`, alt: "Bridal Star", category: ImageCategory.GALLERY_BRIDAL, detail: "Star bridal look with mink lashes" },
    { url: `${R2_IMAGE_BASE_URL}/gallery/bridal/bridal-18.jpg`, alt: "Bridal Glow", category: ImageCategory.GALLERY_BRIDAL, detail: "Natural glow bridal finish" },
    { url: `${R2_IMAGE_BASE_URL}/gallery/bridal/bridal-19.jpg`, alt: "Bridal Spark", category: ImageCategory.GALLERY_BRIDAL, detail: "Sparkling bridal eye & lip art" },
    { url: `${R2_IMAGE_BASE_URL}/gallery/bridal/bridal-20.jpg`, alt: "Bridal Classic", category: ImageCategory.GALLERY_BRIDAL, detail: "Classic Indian bridal look" },
    { url: `${R2_IMAGE_BASE_URL}/gallery/bridal/bridal-22.jpg`, alt: "Bridal Bliss", category: ImageCategory.GALLERY_BRIDAL, detail: "Blissful bridal transformation" },
    { url: `${R2_IMAGE_BASE_URL}/gallery/bridal/bridal-23.jpg`, alt: "Bridal Finesse", category: ImageCategory.GALLERY_BRIDAL, detail: "Fine detailed bridal artistry" },
    { url: `${R2_IMAGE_BASE_URL}/gallery/bridal/bridal-24.jpg`, alt: "Bridal Jewel", category: ImageCategory.GALLERY_BRIDAL, detail: "Jewel-toned bridal styling" },
    { url: `${R2_IMAGE_BASE_URL}/gallery/bridal/bridal-26.jpg`, alt: "Bridal Rose", category: ImageCategory.GALLERY_BRIDAL, detail: "Rose-inspired bridal beauty" },
    { url: `${R2_IMAGE_BASE_URL}/gallery/bridal/bridal-27.jpg`, alt: "Bridal Crown", category: ImageCategory.GALLERY_BRIDAL, detail: "Crown-worthy bridal makeover" },

    // Nail
    { url: `${R2_IMAGE_BASE_URL}/gallery/nail/nail-1.jpg`, alt: "Nail Art", category: ImageCategory.GALLERY_NAIL, detail: "Creative nail art with premium gel" },
    { url: `${R2_IMAGE_BASE_URL}/gallery/nail/nail-2.jpg`, alt: "Nail Design", category: ImageCategory.GALLERY_NAIL, detail: "Patterned acrylic nail artistry" },

    // Skin
    { url: `${R2_IMAGE_BASE_URL}/gallery/skin/skin.jpg`, alt: "Skin Care", category: ImageCategory.GALLERY_SKIN, detail: "Rejuvenating skin care & facial treatments" },

    // Makeup
    { url: `${R2_IMAGE_BASE_URL}/gallery/makeup/makeup-1.jpg`, alt: "Party Makeup", category: ImageCategory.GALLERY_MAKEUP, detail: "Glamorous party makeup look" },
    { url: `${R2_IMAGE_BASE_URL}/gallery/makeup/makeup-2.jpg`, alt: "Glam Look", category: ImageCategory.GALLERY_MAKEUP, detail: "Full glam HD makeup transformation" },
    { url: `${R2_IMAGE_BASE_URL}/gallery/makeup/makeup-3.jpg`, alt: "Eye Makeup", category: ImageCategory.GALLERY_MAKEUP, detail: "Stunning eye makeup artistry" },
    { url: `${R2_IMAGE_BASE_URL}/gallery/makeup/makeup-4.jpg`, alt: "Engagement Look", category: ImageCategory.GALLERY_MAKEUP, detail: "Beautiful engagement makeup style" },
    { url: `${R2_IMAGE_BASE_URL}/gallery/makeup/makeup-5.jpg`, alt: "Reception Look", category: ImageCategory.GALLERY_MAKEUP, detail: "Elegant reception makeup look" },
    { url: `${R2_IMAGE_BASE_URL}/gallery/makeup/makeup-6.jpg`, alt: "Light Makeup", category: ImageCategory.GALLERY_MAKEUP, detail: "Subtle & natural light makeup" },
    { url: `${R2_IMAGE_BASE_URL}/gallery/makeup/2.jpg`, alt: "Exclusive Makeup", category: ImageCategory.GALLERY_MAKEUP, detail: "Exclusive airbrush party makeup" },
    { url: `${R2_IMAGE_BASE_URL}/gallery/makeup/3.jpeg`, alt: "Festive Look", category: ImageCategory.GALLERY_MAKEUP, detail: "Festive season glam makeup" },
    { url: `${R2_IMAGE_BASE_URL}/gallery/makeup/4.jpeg`, alt: "Soft Glam", category: ImageCategory.GALLERY_MAKEUP, detail: "Soft glam everyday makeup" },
    { url: `${R2_IMAGE_BASE_URL}/gallery/makeup/5.jpeg`, alt: "Bold Makeup", category: ImageCategory.GALLERY_MAKEUP, detail: "Bold statement makeup look" },
    { url: `${R2_IMAGE_BASE_URL}/gallery/makeup/6.jpeg`, alt: "Natural Beauty", category: ImageCategory.GALLERY_MAKEUP, detail: "Natural beauty enhancement makeup" },
    { url: `${R2_IMAGE_BASE_URL}/gallery/makeup/7.jpeg`, alt: "Evening Glam", category: ImageCategory.GALLERY_MAKEUP, detail: "Evening party glam look" },
    { url: `${R2_IMAGE_BASE_URL}/gallery/makeup/9.jpeg`, alt: "Celebrity Look", category: ImageCategory.GALLERY_MAKEUP, detail: "Celebrity-inspired makeup style" },
    { url: `${R2_IMAGE_BASE_URL}/gallery/makeup/11.jpg`, alt: "HD Makeup", category: ImageCategory.GALLERY_MAKEUP, detail: "High-definition flawless makeup" },
    { url: `${R2_IMAGE_BASE_URL}/gallery/makeup/12.jpg`, alt: "Smokey Eye", category: ImageCategory.GALLERY_MAKEUP, detail: "Classic smokey eye makeup art" },
  ];

  for (let i = 0; i < galleryImages.length; i++) {
    const img = galleryImages[i];
    await prisma.imageAsset.create({
      data: {
        name: img.alt,
        url: img.url,
        category: img.category,
        alt: img.alt,
        detail: img.detail,
        order: i + 1,
      },
    });
  }
  console.log(`✅ Seeded ${galleryImages.length} Gallery Image Assets`);

  // 7. Seed Service Categories, Subcategories, Items & Prices
  const servicesData = [
    {
      slug: "hair",
      name: "Hair",
      icon: `${R2_IMAGE_BASE_URL}/hair-icon.png`,
      desc: "Your hair is in safe hands as our expert hairdressers excel in all hair services",
      gradient: "from-rose-500/20 to-pink-500/20",
      order: 1,
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
      order: 2,
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
      order: 3,
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
      order: 4,
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
      order: 5,
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
      order: 6,
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

  for (const catData of servicesData) {
    const category = await prisma.serviceCategory.create({
      data: {
        slug: catData.slug,
        name: catData.name,
        icon: catData.icon,
        desc: catData.desc,
        gradient: catData.gradient,
        order: catData.order,
      },
    });

    // Also register the service icon in ImageAsset
    await prisma.imageAsset.create({
      data: {
        name: `${catData.name} Icon`,
        url: catData.icon,
        category: ImageCategory.SERVICE_ICON,
        alt: catData.name,
        detail: `Category icon for ${catData.name}`,
        order: catData.order,
      },
    });

    for (let sIdx = 0; sIdx < catData.subcategories.length; sIdx++) {
      const subData = catData.subcategories[sIdx];
      const subCategory = await prisma.subCategory.create({
        data: {
          categoryId: category.id,
          name: subData.name,
          order: sIdx + 1,
        },
      });

      for (let iIdx = 0; iIdx < subData.items.length; iIdx++) {
        const itemData = subData.items[iIdx];
        await prisma.serviceItem.create({
          data: {
            subCategoryId: subCategory.id,
            name: itemData.name,
            price: itemData.price,
            order: iIdx + 1,
          },
        });
      }
    }
  }
  console.log("✅ Seeded all Service Categories, Subcategories, and Items");

  // 8. Seed Packages
  const packages = [
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
      order: 1,
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
      order: 2,
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
      order: 3,
    },
  ];

  for (const pkg of packages) {
    await prisma.servicePackage.create({
      data: {
        name: pkg.name,
        originalPrice: pkg.originalPrice,
        price: pkg.price,
        items: pkg.items,
        order: pkg.order,
      },
    });
  }
  console.log("✅ Seeded Service Packages");

  console.log("🎉 Database seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    if ((prisma as any).$disconnect) {
      await (prisma as any).$disconnect();
    }
  });
