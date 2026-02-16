"use client";

import { Instagram } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { FALLBACK_SOCIAL_POSTS, COMPANY_INFO } from "@/constants";
import type { SocialPost } from "@/types/index";
import CommonHeading from "./CommonHeading";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";
import "swiper/css/pagination";

export default function HomeFollowOnSocialSection() {
  const socialPosts: SocialPost[] = FALLBACK_SOCIAL_POSTS;

  return (
    <section className="followOnInstaSec px-3 md:px-8 lg:px-10 py-7 md:py-12 lg:py-20">
      <CommonHeading level={1}>Follow us on Instagram</CommonHeading>

      <div className="max-w-[1560px] mx-auto commonSliderWrap">
        {socialPosts.length > 0 ? (
          <Swiper
            modules={[Navigation, Autoplay, Pagination]}
            navigation
            autoplay={{
              delay: 2500,
              disableOnInteraction: false,
            }}
            pagination
            spaceBetween={12}
            slidesPerView={2}
            breakpoints={{
              640: {
                slidesPerView: 3,
                spaceBetween: 16,
              },
              768: {
                slidesPerView: 4,
                spaceBetween: 20,
              },
              1024: {
                slidesPerView: 5,
                spaceBetween: 24,
              },
            }}
          >
            {socialPosts.map((post) => (
              <SwiperSlide key={post.id}>
                <div className="relative h-24 sm:h-32 md:h-40 lg:h-64 overflow-hidden rounded-2xl group">
                  <Image
                    src={post.image}
                    alt="Instagram post"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 20vw, (max-width: 768px) 25vw, 15vw"
                  />

                  <Link href={post.link}>
                    <div className="absolute inset-0 flex items-center justify-center bg-foreground/50 text-background opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Instagram className="h-7 w-7" />
                    </div>
                  </Link>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="text-center py-12">
            <Instagram className="h-12 w-12 mx-auto text-foreground/40 mb-4" />
            <p className="text-foreground/70 mb-4">
              Follow us on Instagram for the latest updates!
            </p>
            <Link
              href={COMPANY_INFO.INSTAGRAM_URL}
              className="inline-flex items-center gap-2 bg-brand text-background px-6 py-2 rounded-full hover:bg-brand/90 transition-colors"
            >
              <Instagram className="h-4 w-4" />
              Follow on Instagram
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
