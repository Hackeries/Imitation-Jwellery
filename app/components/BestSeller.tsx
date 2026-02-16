"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { fetchProducts } from "@/services/product-service";
import CommonHeading from "./CommonHeading";
import CommonProductCard from "./CommonProductCard";
import { ProductCardSkeleton } from "./skeleton";

export default function BestSeller() {
  const { data: productsData, isLoading, isError } = useQuery({
    queryKey: ["products", "best-seller"],
    queryFn: () => fetchProducts({ isBestSeller: true, page: 1, limit: 5 }),
    throwOnError: false,
  });

  const products = useMemo(() => productsData?.data || [], [productsData?.data]);

  return (
    <section className="px-3 md:px-8 lg:px-10 py-7 md:py-12 lg:py-20 bg-[#fce9ca]/30">
      <CommonHeading
        level={2}
        title="Best Sellers"
        description="Our most loved pieces, chosen by many, perfect for you"
      />

      <div className="commonProductGrid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-6 lg:gap-8 max-w-[1560px] mx-auto">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, index) => {
            let visibilityClass = "block";

            if (index === 3) {
              visibilityClass = "block md:hidden lg:block";
            } else if (index === 4) {
              visibilityClass = "hidden md:hidden lg:block";
            }

            return (
              <div key={`skeleton-${index}`} className={visibilityClass}>
                <ProductCardSkeleton />
              </div>
            );
          })
        ) : isError || products.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
            <p className="text-gray-400 font-light tracking-wide text-sm md:text-base italic">
              Our best sellers are being curated for you.
              <br />
              Please check back shortly.
            </p>
          </div>
        ) : (
          products.map((product, index) => {
            let visibilityClass = "block";

            if (index === 3) {
              visibilityClass = "block md:hidden lg:block";
            } else if (index === 4) {
              visibilityClass = "hidden md:hidden lg:block";
            }

            const productId = product._id || product.id || `bs-${index}`;

            return (
              <div key={productId} className={visibilityClass}>
                <CommonProductCard
                  productId={productId}
                  title={product.title}
                  price={product.price}
                  priceNumber={product.priceNumber}
                  image={product.image}
                />
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
