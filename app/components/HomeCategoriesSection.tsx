"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { getImageUrl } from "@/lib/image-utils";

import CommonButton from "./button/CommonButton";
import CommonHeading from "./CommonHeading";

// swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";

// swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/autoplay";

import { fetchCategories } from "@/services/category-service";

export default function HomeCategoriesSection() {
  // fetch categories from backend
  const { data: categories, isLoading } = useQuery({
    queryKey: ["home-categories"],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 10,
  });

  // only active product categories
  const visibleCategories = useMemo(() => categories?.filter(cat => cat.type === "category") ?? [], [categories]);

  return (
    <section className="px-3 md:px-8 lg:px-10 py-7 md:py-12 lg:py-20">
      <CommonHeading
        level={1}
        title="Welcome to Privora"
        description="Welcome to Privora. Here you'll find beautiful, minimalist designs that complement every occasion & style, from casual looks to traditional Indian wear. We are glad you're here."
      />

      <div className="max-w-[1560px] mx-auto commonSliderWrap">
        {isLoading ? (
          <div className="text-center py-10">Loading categories...</div>
        ) : (
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            navigation
            autoplay={{
              delay: 2500,
              disableOnInteraction: false,
            }}
            loop
            spaceBetween={16}
            slidesPerView={2}
            pagination
            breakpoints={{
              640: { slidesPerView: 2, spaceBetween: 16 },
              768: { slidesPerView: 3, spaceBetween: 20 },
              1024: { slidesPerView: 5, spaceBetween: 24 },
            }}>
            {visibleCategories.map(category => (
              <SwiperSlide key={category.id}>
                <Link href={`/${category.slug}`}>
                  <div className="productCategoryItem h-52 md:h-80 relative overflow-hidden rounded-2xl flex items-end justify-center p-6 cursor-pointer">
                    {category.thumbnail && (
                      <Image
                        src={getImageUrl(category.thumbnail)}
                        alt={category.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        loading="lazy"
                      />
                    )}

                    <CommonButton variant="secondaryBtn" className="relative z-10">
                      {category.title}
                    </CommonButton>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </section>
  );
}
