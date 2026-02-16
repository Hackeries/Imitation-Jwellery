"use client";

import Image from "next/image";
import CommonHeading from "./CommonHeading";
import CommonButton from "./button/CommonButton";
import CommonProductCard from "./CommonProductCard";
import { useProductsInfinite } from "@/hooks/use-products";
import { useMemo, useEffect, useState } from "react";



// Client-only video component to prevent hydration issues
function ClientVideo({ src, className }: { src: string; className: string }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // Return a placeholder div with same dimensions during SSR
    return <div className={className} />;
  }

  return (
    <video
      src={src}
      autoPlay
      playsInline
      loop
      muted
      className={className}
    />
  );
}

export default function HomeFeaturedCollectionSection() {
  // Fetch New Arrivals (Trending)
  const { data: newArrivalData, isError: newArrivalError } = useProductsInfinite({ isNewArrival: true });
  // Fetch Best Sellers
  const { data: bestSellerData, isError: bestSellerError } = useProductsInfinite({ isBestSeller: true });

  const trendingProducts = useMemo(() => {
    if (newArrivalError) return [];
    const apiProducts =
      newArrivalData?.pages
        ?.flatMap((p) => (Array.isArray(p.data) ? p.data : []))
        .slice(0, 2) ?? [];
    return apiProducts;
  }, [newArrivalData, newArrivalError]);

  const bestSellerProducts = useMemo(() => {
    if (bestSellerError) return [];
    const apiProducts =
      bestSellerData?.pages
        ?.flatMap((p) => (Array.isArray(p.data) ? p.data : []))
        .slice(0, 2) ?? [];
    return apiProducts;
  }, [bestSellerData, bestSellerError]);

  return (
    <section className="px-3 md:px-8 lg:px-10 py-7 md:py-12 lg:py-20">
      <CommonHeading
        level={1}
        title="Featured Collection"
        description="Your next favourite piece awaits in our featured collection."
      />

      <div className="flex flex-col gap-10 max-w-[1560px] mx-auto">
        {/* ROW 1: Trending */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-10 items-start">
          <div className="lg:col-span-1">
            <div className="relative h-[280px] md:h-[480px] rounded-2xl overflow-hidden">
              <ClientVideo
                src="/video/jewelryWoman.mp4"
                className="object-cover absolute top-0 left-0 w-full h-full"
              />
              <div className="absolute inset-0 bg-black/30" />
              <div className="absolute bottom-3 md:bottom-8 left-3 md:left-8 text-background max-w-5/6 md:max-w-xs">
                <h3 className="text-lg md:text-3xl font-times mb-1 md:mb-2 uppercase">
                  Trending Now
                </h3>
                <p className="mb-3 md:mb-6 text-sm">
                  Jewelry That Reflects Your Inner Sparkle
                </p>
                <CommonButton
                  variant="secondaryBtn"
                  className="bg-background text-foreground"
                  href="/product-list?filter=new-arrival"
                >
                  Discover Now
                </CommonButton>
              </div>
            </div>
          </div>
          {/* DYNAMIC PRODUCTS */}
          <div className="commonProductGrid grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-10">
            {trendingProducts.length > 0 ? (
              trendingProducts.map((product) => (
                <CommonProductCard
                  key={product.id}
                  productId={product.id}
                  title={product.title}
                  price={product.price}
                  priceNumber={product.priceNumber}
                  image={product.image}
                />
              ))
            ) : (
              <div className="col-span-2 flex items-center justify-center h-64 text-foreground/60">
                <p>No trending products available at the moment.</p>
              </div>
            )}
          </div>
        </div>

        {/* ROW 2: Best Sellers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-10 items-start">
          {/* DYNAMIC PRODUCTS */}
          <div className="commonProductGrid grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-10">
            {bestSellerProducts.length > 0 ? (
              bestSellerProducts.map((product) => (
                <CommonProductCard
                  key={product.id}
                  productId={product.id}
                  title={product.title}
                  price={product.price}
                  priceNumber={product.priceNumber}
                  image={product.image}
                />
              ))
            ) : (
              <div className="col-span-2 flex items-center justify-center h-64 text-foreground/60">
                <p>No best sellers available at the moment.</p>
              </div>
            )}
          </div>
          <div className="lg:col-span-1 featuredCollectionBestSellerVdo">
            <div className="relative h-[280px] md:h-[480px] rounded-2xl overflow-hidden">
              <ClientVideo
                src="/video/jewelryWoman2.mp4"
                className="object-cover absolute top-0 left-0 w-full h-full"
              />
              <div className="absolute inset-0 bg-black/30" />
              <div className="absolute bottom-3 md:bottom-8 left-3 md:left-[unset] md:right-8 text-left md:text-right text-background max-w-5/6 md:max-w-xs">
                <h3 className="text-3xl font-times mb-2 uppercase">
                  Best Sellers
                </h3>
                <p className="mb-3 md:mb-6 text-sm">Glow with Privora</p>
                <CommonButton
                  variant="secondaryBtn"
                  className="bg-background text-foreground"
                  href="/product-list?filter=best-seller"
                >
                  Discover Now
                </CommonButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
