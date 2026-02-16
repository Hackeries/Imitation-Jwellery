"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import CommonButton from "./button/CommonButton";
import CommonHeading from "./CommonHeading";

export default function HomeHeroSection() {
  return (
    <section className="relative bg-[#fdebcf] overflow-hidden homeHeroSlider">
      <style jsx global>{`
        .homeHeroSlider .swiper-pagination-bullet-active {
          background: #4E342E;
        }
      `}</style>
      <Swiper
        slidesPerView={1}
        loop
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{ clickable: true }}
        modules={[Autoplay, Pagination]}
        className="w-full"
      >
        {/* ================= SLIDE 1 ================= */}
        <SwiperSlide>
          <HeroSlide
            season="Privora"
            title="Discover Your Style"
            description="We're thrilled to share our latest arrival with you. Each piece is carefully chosen with love & we can't wait for you to discover something special. Dive in & find your next favourite piece today."
            image="/img/earring-1.webp"
          />
        </SwiperSlide>

        {/* ================= SLIDE 2 ================= */}
        <SwiperSlide>
          <HeroSlide
            season="Explore"
            title="Our Collection"
            description="Privora brings you a diverse range of jewelry from timeless everyday pieces to elegant occasion wear. Whether it's Indian or western styles, we ensure that every piece reflects elegance & authenticity for every moment."
            image="/img/jwelry1.webp"
          />
        </SwiperSlide>
      </Swiper>
    </section>
  );
}

/* ================= SLIDE COMPONENT ================= */

function HeroSlide({
  season,
  title,
  description,
  image,
}: {
  season: string;
  title: string;
  description: string;
  image: string;
}) {
  return (
    <div className="max-w-[1560px] mx-auto px-4 md:px-8 lg:px-16 py-10 md:py-20 grid grid-cols-1 lg:grid-cols-2 items-center gap-8 md:gap-10">

      {/* ================= LEFT CONTENT (Order 2 on mobile, Order 1 on desktop) ================= */}
      <div className="max-w-xl order-2 lg:order-1 flex flex-col items-center lg:items-start text-center lg:text-left">
        {season && (
          <p className="text-xs tracking-widest uppercase text-foreground/70 mb-3 md:mb-4">
            {season}
          </p>
        )}
        {title && <CommonHeading title={title} level={1} className="" noMargin />}
        <p className="text-base md:text-lg text-foreground/80 leading-relaxed mb-6 md:mb-8">
          {description}
        </p>
        <CommonButton
          href="/product-list" className="max-w-fit">
          SHOP NOW
        </CommonButton>
      </div>

      {/* ================= HERO IMAGE WITH CUSTOM SHAPE (Order 1 on mobile, Order 2 on desktop) ================= */}
      <div className="relative flex justify-center lg:justify-end order-1 lg:order-2 mb-4 lg:mb-0">

        {/* OUTER OUTLINE */}
        <div className="absolute inset-0 flex justify-center lg:justify-end">
          <div
            className="
        relative
        h-[360px] w-[280px]
        sm:h-[420px] sm:w-[360px]
        md:h-[480px] md:w-[420px]
        lg:h-[500px] lg:w-[460px]
        rounded-[100px_40px_100px_40px]
        md:rounded-[140px_50px_140px_50px]
        border border-foreground/30
        translate-x-4 translate-y-4
      "
          />
        </div>

        {/* INNER OUTLINE */}
        <div className="absolute inset-0 flex justify-center lg:justify-end">
          <div
            className="
        relative
        h-[360px] w-[280px]
        sm:h-[420px] sm:w-[360px]
        md:h-[480px] md:w-[420px]
        lg:h-[500px] lg:w-[460px]
        rounded-[100px_40px_100px_40px]
        md:rounded-[140px_50px_140px_50px]
        border border-foreground/30
        translate-x-2 translate-y-2
      "
          />
        </div>

        {/* IMAGE CONTAINER */}
        <div
          className="
      relative
      h-[360px] w-[280px]
      sm:h-[420px] sm:w-[360px]
      md:h-[480px] md:w-[420px]
      lg:h-[500px] lg:w-[460px]
      rounded-[100px_40px_100px_40px]
      md:rounded-[140px_50px_140px_50px]
      overflow-hidden
      bg-white
      z-10
    "
        >
          <Image
            src={image}
            alt={title}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
          />
        </div>
      </div>


    </div>
  );
}
