import Image from "next/image";
import Link from "next/link";
import MotionWrapper from "../components/MotionWrapper";
import { R2_IMAGE_BASE_URL } from "../lib/constants";
import prisma from "@/lib/prisma";
import HeroSlider from "../components/HeroSlider";
import ServiceCards from "../components/ServiceCards";
import InteriorShowcase from "../components/InteriorShowcase";
import OfferCarousel from "../components/OfferCarousel";
import AnimatedCounter from "../components/AnimatedCounter";
import TestimonialSlider from "../components/TestimonialSlider";
import GalleryGrid from "../components/GalleryGrid";
import BrandShowcase from "../components/BrandShowcase";
import { GraduationCap, Briefcase, ArrowRight, Sparkles, Star } from "lucide-react";

// ISR: Cache page and revalidate in the background every 60 seconds (prevents constant DB hitting)
export const revalidate = 60;

// Helper to prevent slow database queries from blocking the page
async function withTimeout<T>(promise: Promise<T>, ms = 3000, fallback: T): Promise<T> {
  let timeoutHandle: any;
  const timeoutPromise = new Promise<T>((resolve) => {
    timeoutHandle = setTimeout(() => resolve(fallback), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutHandle);
  });
}

export default async function Home() {
  // Parallel SSR data fetching with timeout guard
  const [heroSlides, services, interiors, offers, galleryImages] = await Promise.all([
    withTimeout(
      prisma.heroSlide.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" },
      }),
      2500,
      []
    ).catch(() => []),
    withTimeout(
      prisma.serviceCategory.findMany({
        orderBy: { order: "asc" },
        include: {
          subcategories: {
            orderBy: { order: "asc" },
            include: {
              items: {
                orderBy: { order: "asc" },
              },
            },
          },
        },
      }),
      3000,
      []
    ).catch(() => []),
    withTimeout(
      prisma.interior.findMany({
        orderBy: { order: "asc" },
      }),
      2000,
      []
    ).catch(() => []),
    withTimeout(
      prisma.offer.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" },
      }),
      2000,
      []
    ).catch(() => []),
    withTimeout(
      prisma.imageAsset.findMany({
        orderBy: { order: "asc" },
      }),
      2000,
      []
    ).catch(() => []),
  ]);

  return (
    <div className="flex flex-col relative bg-white overflow-x-hidden">
      {/* 1. Hero Dynamic Cinematic Carousel */}
      <HeroSlider initialSlides={heroSlides} />

      {/* 2. Partner Brand Authority Carousel */}
      <BrandShowcase />

      {/* 3. Luxury Services & Rituals Menu */}
      <div className="relative w-full bg-gradient-to-b from-white via-rose-50/15 to-white overflow-hidden">
        <ServiceCards initialServices={services} />
      </div>

      {/* 4. Find Your Salon & Philosophy Enclave */}
      <div className="relative w-full bg-gradient-to-b from-white via-rose-50/20 to-white overflow-hidden">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-rose-100/25 rounded-full blur-[140px] pointer-events-none" />

        {/* Find Your Salon Pin Banner */}
        <section className="w-full pt-12 pb-6 px-6 text-center flex flex-col items-center justify-center relative z-10">
          <MotionWrapper variant="scale-up" className="max-w-xs w-full relative mb-6 animate-float">
            <Link href="/salon-finder" className="block cursor-pointer">
              <Image
                src={`${R2_IMAGE_BASE_URL}/find-salon-pin.png`}
                alt="Find Your Salon"
                width={500}
                height={500}
                className="w-full h-auto object-contain drop-shadow-2xl rounded-[2.5rem] hover:scale-105 transition-transform duration-500"
              />
            </Link>
          </MotionWrapper>

          <MotionWrapper variant="fade-up" delay={0.15}>
            <Link
              href="/salon-finder"
              className="inline-block relative overflow-hidden bg-gray-900 text-white px-8 py-3 text-[11px] font-bold uppercase tracking-[0.2em] rounded-full shadow-md hover:shadow-lg transition-all duration-300 group hover:-translate-y-0.5"
            >
              <span className="relative z-10 flex items-center gap-2">
                Locate Nearest Boutique
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </Link>
          </MotionWrapper>
        </section>

        {/* Brand Philosophy Intro */}
        <section className="pt-6 pb-12 px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <MotionWrapper variant="fade-up">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-rose-400/60" />
                <span className="text-rose-600 text-[10px] tracking-[0.35em] uppercase font-semibold">
                  Artistry In Harmony
                </span>
                <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-rose-400/60" />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-gray-900 tracking-tight mb-2.5">
                Bespoke Beauty &amp; Rejuvenation
              </h2>
              <div className="flex justify-center mb-4">
                <div className="h-[2px] w-10 bg-gradient-to-r from-rose-400 to-amber-400 rounded-full" />
              </div>
              <p className="text-gray-600 font-light text-sm sm:text-base leading-relaxed">
                Step into an enclave where architectural elegance converges with holistic well-being. VivaZen is an artisanal sanctuary crafted to rejuvenate your inner radiance and refine your aesthetic signature.
              </p>
            </MotionWrapper>
          </div>
        </section>
      </div>

      {/* 5. Metrics Animated Counters */}
      <AnimatedCounter />

      {/* 6. Education Academy & Career Casting Cards */}
      <section className="py-14 md:py-20 px-6 max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Academy Card */}
          <div className="relative overflow-hidden rounded-[2rem] p-8 md:p-10 bg-gradient-to-br from-[#FFF9F6] to-[#FFF0EB] border border-amber-200/70 shadow-[0_8px_30px_rgba(245,158,11,0.04)] group hover:shadow-xl transition-all duration-500">
            <div className="absolute top-0 right-0 w-44 h-44 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-700 mb-5">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-amber-700">Certified Diplomas</span>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mt-1 mb-3">VivaZen Beauty Academy</h3>
            <p className="text-gray-600 text-xs sm:text-sm font-light leading-relaxed mb-6">
              Master professional hair design, clinical skincare, and bridal makeup artistry with industry-accredited certifications and 100% placement support.
            </p>
            <Link
              href="/education"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800 hover:text-amber-900 group-hover:translate-x-1 transition-all"
            >
              <span>Explore Academy Courses</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Careers Card */}
          <div className="relative overflow-hidden rounded-[2rem] p-8 md:p-10 bg-gradient-to-br from-[#FFF8F9] to-[#FEEFF2] border border-rose-200/70 shadow-[0_8px_30px_rgba(244,63,94,0.04)] group hover:shadow-xl transition-all duration-500">
            <div className="absolute top-0 right-0 w-44 h-44 bg-rose-200/20 rounded-full blur-3xl pointer-events-none" />
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-400/30 flex items-center justify-center text-rose-700 mb-5">
              <Briefcase className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-rose-700">Join Our Team</span>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mt-1 mb-3">Careers &amp; Castings</h3>
            <p className="text-gray-600 text-xs sm:text-sm font-light leading-relaxed mb-6">
              Elevate your craft alongside award-winning stylists. We are hiring master hair artists, dermatologists, nail technicians, and front desk concierges.
            </p>
            <Link
              href="/career"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-800 hover:text-rose-900 group-hover:translate-x-1 transition-all"
            >
              <span>Apply for Open Roles</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. The Sanctuary — Spaces & Ambience */}
      <InteriorShowcase initialInteriors={interiors} />

      {/* 8. Exclusive Seasonal Offerings */}
      <OfferCarousel initialOffers={offers} />

      {/* 9. Haute Couture Gallery Grid */}
      <GalleryGrid initialGallery={galleryImages} />

      {/* 10. Client Testimonials */}
      <TestimonialSlider />
    </div>
  );
}
