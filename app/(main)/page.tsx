"use client";

import { lazy, Suspense } from "react";
import { useProductsInfinite } from "@/hooks/use-products";
import BestSeller from "../components/BestSeller";
import CommonHeading from "../components/CommonHeading";
import CommonProductCard from "../components/CommonProductCard";
import HomeCategoriesSection from "../components/HomeCategoriesSection";
import HomeHeroSection from "../components/HomeHeroSec";
import HomeStoreFeature from "../components/HomeStoreFeature";
import ProductFeatureStrip from "../components/ProductFeatureStrip";
import AnimatedSection from "../components/AnimatedSection";
import HomePageSkeleton from "../components/skeleton/HomePageSkeleton";
import { ErrorBoundary } from "../components/ErrorBoundary";

const HomeCustomerFeedbackLazy = lazy(
  () => import("../components/HomeCustomerFeedback"),
);
const HomeFeaturedCollectionSectionLazy = lazy(
  () => import("../components/HomeFeaturedCollectionSection"),
);
const HomeFollowOnSocialSectionLazy = lazy(
  () => import("../components/HomeFollowOnSocialSection"),
);

export default function Home() {
  const { data: newArrivalData, isLoading, isError } = useProductsInfinite({
    isNewArrival: true,
  });

  const apiProducts = newArrivalData?.pages
    ?.flatMap((page) => (Array.isArray(page.data) ? page.data : []))
    .slice(0, 5) ?? [];

  if (isLoading && !newArrivalData) {
    return <HomePageSkeleton />;
  }

  return (
    <>
      <div className="homepageWrap gradientBg">
        <AnimatedSection>
          <HomeHeroSection />
        </AnimatedSection>
        <AnimatedSection>
          <ProductFeatureStrip />
        </AnimatedSection>
        <AnimatedSection>
          <HomeCategoriesSection />
        </AnimatedSection>
        <AnimatedSection>
          <BestSeller />
        </AnimatedSection>
        <AnimatedSection>
          <ErrorBoundary>
            <Suspense
              fallback={
                <div className="px-3 md:px-8 lg:px-10 py-7 md:py-12 lg:py-20">
                  Loading...
                </div>
              }
            >
              <HomeCustomerFeedbackLazy />
            </Suspense>
          </ErrorBoundary>
        </AnimatedSection>
        <AnimatedSection>
          <section className="px-3 md:px-8 lg:px-10 py-7 md:py-12 lg:py-20">
            <CommonHeading
              level={1}
              title="New Arrival"
              description="Be first to explore our new arrivals"
            />
            {isError || apiProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-gray-400 font-light tracking-wide text-sm md:text-base italic">
                  We are currently refreshing our exquisite collection.
                  <br />
                  Please check back shortly.
                </p>
              </div>
            ) : (
              <div className="commonProductGrid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-6 lg:gap-8 max-w-[1560px] mx-auto">
                {apiProducts.map((product, index) => {
                  let visibilityClass = "block";

                  if (index === 3) {
                    visibilityClass = "block md:hidden lg:block";
                  } else if (index === 4) {
                    visibilityClass = "hidden md:hidden lg:block";
                  }

                  return (
                    <div key={product.id} className={visibilityClass}>
                      <CommonProductCard
                        productId={product.id}
                        title={product.title}
                        price={product.price}
                        priceNumber={product.priceNumber}
                        image={product.image}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </AnimatedSection>
        <AnimatedSection>
          <ErrorBoundary>
            <Suspense
              fallback={
                <div className="px-3 md:px-8 lg:px-10 py-7 md:py-12 lg:py-20">
                  Loading...
                </div>
              }
            >
              <HomeFeaturedCollectionSectionLazy />
            </Suspense>
          </ErrorBoundary>
        </AnimatedSection>
        <AnimatedSection>
          <ErrorBoundary>
            <Suspense
              fallback={
                <div className="px-3 md:px-8 lg:px-10 py-7 md:py-12 lg:py-20">
                  Loading...
                </div>
              }
            >
              <HomeFollowOnSocialSectionLazy />
            </Suspense>
          </ErrorBoundary>
        </AnimatedSection>
        <AnimatedSection>
          <HomeStoreFeature />
        </AnimatedSection>
      </div>
    </>
  );
}
