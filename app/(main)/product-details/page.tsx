"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import CommonHeading from "@/app/components/CommonHeading";
import CommonButton from "@/app/components/button/CommonButton";
import CommonInput from "@/app/components/input/CommonInput";
import HomeStoreFeature from "@/app/components/HomeStoreFeature";
import { ProductDetailSkeleton } from "@/app/components/skeleton";
import { getImageUrl } from "@/lib/image-utils";
import {
  FALLBACK_IMAGE,
  FALLBACK_NEW_ARRIVAL_PRODUCTS,
} from "@/constants";
import ProductReviews from "./ProductReviews";
import FaqSection from "../faq/page";
import CommonProductCard from "@/app/components/CommonProductCard";
import { useProductDetail } from "@/hooks/use-product-detail";
import { useAddToCart } from "@/hooks/use-cart";
import { ChevronDown, Heart, Truck, Minus, Plus, Tag, Copy, Check } from "lucide-react";
import { useAddToWishlist, useRemoveFromWishlist, useIsWishlisted } from "@/hooks/use-wishlist";

import {
  useTrackProductView,
  useRecentViews,
  useYouMayAlsoLike,
  type RecommendedProduct,
} from "@/hooks/use-recommendations";
import { useCoupons } from "@/hooks/use-coupon";
import { Coupon } from "@/types/index";
import { useState } from "react";
import { toast } from "sonner";
import { Disclosure, Transition } from "@headlessui/react";

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const productId = typeof params.productId === "string" ? params.productId : "";

  const { data: product, isLoading, isError } = useProductDetail(productId);

  useTrackProductView(productId);

  const { data: recentViews = [] } = useRecentViews(productId);
  const { data: recommendations = [] } = useYouMayAlsoLike(5);
  const { data: coupons = [], isLoading: isCouponsLoading } = useCoupons();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isOrderingNow, setIsOrderingNow] = useState(false);

  const addToCart = useAddToCart();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const { isWishlisted } = useIsWishlisted(productId);

  if (!productId) {
    return (
      <div className="p-10 text-center">
        <p className="text-foreground/60">Invalid product</p>
      </div>
    );
  }

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (isError || !product) {
    return (
      <div className="p-10 text-center">
        <CommonHeading level={2} title="Product Not Found" />
        <p className="text-foreground/60 mb-6">We couldn&apos;t find this product. It may have been removed.</p>
        <CommonButton href="/product-list">Browse Products</CommonButton>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart.mutate(
      {
        productId: product.id,
        name: product.title,
        price: product.priceNumber,
        image: product.image,
        quantity: 1,
      },
      {
        onSuccess: () => {
          // Toast will be shown by CommonProductCard or handled by global success
        },
        onError: () => {
          toast.error("Failed to add to cart");
        },
      },
    );
  };

  const handleOrderNow = () => {
    setIsOrderingNow(true);
    addToCart.mutate(
      {
        productId: product.id,
        name: product.title,
        price: product.priceNumber,
        image: product.image,
        quantity: 1,
      },
      {
        onSuccess: () => {
          router.push("/checkout");
        },
        onError: () => {
          toast.error("Failed to add to cart");
          setIsOrderingNow(false);
        },
      },
    );
  };

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist.mutate(product.id, {
        onSuccess: () => toast.success("Removed from wishlist"),
      });
    } else {
      addToWishlist.mutate(
        {
          productId: product.id,
          title: product.title,
          price: product.price,
          image: product.image,
        },
        {
          onSuccess: () => toast.success("Added to wishlist!"),
        },
      );
    }
  };

  const images = product.images.length > 0 ? product.images : [product.image];
  const currentImage = images[selectedImageIndex] || product.image;
  const isOutOfStock = product.availability === "Out of Stock";

  return (
    <div className="productDetailsPage" key={productId}>
      <section className="px-3 md:px-8 lg:px-10 py-7 md:py-12">
        <div className="mx-auto max-w-3xl lg:max-w-full grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6 lg:gap-6">
          <div className="flex flex-col sm:flex-row gap-4 h-fit lg:sticky lg:top-20 transition-all">
            <div className="order-2 sm:order-1 flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  aria-label={`View image ${idx + 1}`}
                  className={`
                    relative w-16 h-16 sm:w-20 sm:h-20
                    rounded-md overflow-hidden border transition
                    flex-shrink-0
                    ${selectedImageIndex === idx ? "border-brand ring-0" : "border-foreground/20 hover:border-brand"}
                  `}>
                  <Image src={img} alt={`Product thumbnail ${idx + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>

            <div className="order-1 sm:order-2 relative flex-1 aspect-square rounded-xl overflow-hidden">
              <Image
                src={getImageUrl(currentImage || FALLBACK_IMAGE)}
                alt={product.title}
                fill
                className="object-cover transition-opacity duration-300"
              />

              {product.tag && (
                <span
                  className={`absolute top-4 left-4 z-10 text-xs px-3 py-1 rounded-full font-medium ${product.tag.variant === "secondary"
                    ? "bg-background text-foreground border"
                    : "bg-[#fce9ca] text-foreground"
                    }`}>
                  {product.tag.label}
                </span>
              )}

              <button
                onClick={handleWishlistToggle}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                className={`
                  absolute top-4 right-4 z-10 h-10 w-10 rounded-full
                  flex items-center justify-center shadow-md transition
                  ${isWishlisted
                    ? "bg-brand text-background"
                    : "bg-background text-foreground hover:bg-brand hover:text-background"
                  }
                `}>
                <Heart size={18} className={isWishlisted ? "fill-current" : ""} />
              </button>
            </div>
          </div>

          <div className="border border-foreground/20 rounded-xl p-4 md:p-6 lg:p-8 [overflow-anchor:none]">
            <p className="uppercase text-xs tracking-wide mb-2">Privora</p>

            <CommonHeading level={2} title={product.title} noMargin className="text-left" />

            {product.description && <p className="text-sm mb-4">{product.description}</p>}

            <span className="text-xl font-semibold mb-6 block">
              {product.price}
              {product.oldPrice && (
                <span className="ml-2 text-base text-foreground/50 line-through">{product.oldPrice}</span>
              )}
            </span>

            <div className="text-sm space-y-1.5 mb-6">
              <p>
                <strong className="inline-block w-28">Vendor:</strong> {product.vendor || "Privora"}
              </p>
              <p>
                <strong className="inline-block w-28">Type:</strong> {product.type || "Jewelry"}
              </p>
              {product.sku && (
                <p>
                  <strong className="inline-block w-28">SKU:</strong> {product.sku}
                </p>
              )}
              <p>
                <strong className="inline-block w-28">Availability:</strong> {product.availability}
              </p>
            </div>

            <div className="border border-foreground/20 rounded-md p-4 mb-6">
              <div className="flex items-center gap-2 mb-2 text-sm font-medium">
                <Truck size={16} /> Estimated Delivery Time
              </div>

              <div className="flex flex-col md:flex-row relative gap-2">
                <CommonInput
                  name="pincode"
                  placeholder="Enter pincode"
                  type="number"
                  className="!rounded-full"
                  noMargin
                />
                <CommonButton className="absolute right-0 top-0 h-[45px] w-fit max-w-fit checkPinCodeBtn">
                  Check
                </CommonButton>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-4">
              <CommonButton
                variant="secondaryBtn"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={isOutOfStock || addToCart.isPending}>
                {addToCart.isPending ? "Adding..." : "Add to Cart"}
              </CommonButton>
            </div>

            <CommonButton onClick={handleOrderNow} className="mb-6" disabled={isOutOfStock || isOrderingNow}>
              {isOutOfStock ? "Out of Stock" : isOrderingNow ? "Processing..." : "Order Now"}
            </CommonButton>

            {coupons.length > 0 && (
              <div className="border border-brand/20 rounded-xl p-4 mb-6 bg-brand/5">
                <div className="flex items-center gap-2 font-medium mb-3 text-foreground">
                  <Tag size={16} className="text-brand" />
                  <span>Best Offers</span>
                </div>
                <div className="space-y-3">
                  {coupons.slice(0, 3).map(coupon => (
                    <CouponCard key={coupon._id} coupon={coupon} />
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6">
              <Disclosure as="div" className="border-t border-foreground/20 py-4">
                {({ open }) => (
                  <>
                    <Disclosure.Button className="flex w-full items-center justify-between font-medium text-left">
                      <span>Description</span>
                      <ChevronDown
                        size={18}
                        className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                      />
                    </Disclosure.Button>

                    <Transition
                      enter="transition duration-200 ease-out"
                      enterFrom="opacity-0 -translate-y-1"
                      enterTo="opacity-100 translate-y-0"
                      leave="transition duration-150 ease-in"
                      leaveFrom="opacity-100 translate-y-0"
                      leaveTo="opacity-0 -translate-y-1">
                      <Disclosure.Panel className="pt-3 text-sm text-foreground/80">
                        {product.description ||
                          "Premium quality jewelry perfect for festive occasions. Crafted with care using hypoallergenic materials, ensuring comfort and long-lasting shine."}
                      </Disclosure.Panel>
                    </Transition>
                  </>
                )}
              </Disclosure>

              <Disclosure as="div" className="border-t border-foreground/20 py-4">
                {({ open }) => (
                  <>
                    <Disclosure.Button className="flex w-full items-center justify-between font-medium text-left">
                      <span>Shipping Information</span>
                      <ChevronDown
                        size={18}
                        className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                      />
                    </Disclosure.Button>

                    <Transition
                      enter="transition duration-200 ease-out"
                      enterFrom="opacity-0 -translate-y-1"
                      enterTo="opacity-100 translate-y-0"
                      leave="transition duration-150 ease-in"
                      leaveFrom="opacity-100 translate-y-0"
                      leaveTo="opacity-0 -translate-y-1">
                      <Disclosure.Panel className="pt-3 text-sm text-foreground/80">
                        Ships within 24–48 hours. Free delivery on all prepaid orders. COD available in select
                        locations. Tracking details will be shared once the order is dispatched.
                      </Disclosure.Panel>
                    </Transition>
                  </>
                )}
              </Disclosure>
            </div>
          </div>
        </div>
      </section>

      <FaqSection />

      {recentViews.length > 0 && (
        <section className="px-3 md:px-8 lg:px-10 py-8 md:py-10">
          <CommonHeading level={1} title="Recently viewed" />
          <div className="max-w-[1560px] mx-auto commonProductGrid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-10">
            {recentViews.map((p: RecommendedProduct) => (
              <CommonProductCard
                key={p.id}
                productId={p.id}
                title={p.title}
                price={p.price}
                image={p.image}
                oldPrice={p.oldPrice}
                tag={p.tag}
              />
            ))}
          </div>
        </section>
      )}

      {recommendations.length > 0 && (
        <section className="px-3 md:px-8 lg:px-10 py-8 md:py-10">
          <CommonHeading level={1} title="You may also like" />
          <div className="max-w-[1560px] mx-auto commonProductGrid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-10">
            {recommendations.map((p: RecommendedProduct) => (
              <CommonProductCard
                key={p.id}
                productId={p.id}
                title={p.title}
                price={p.price}
                image={p.image}
                oldPrice={p.oldPrice}
                tag={p.tag}
              />
            ))}
          </div>
        </section>
      )}

      <ProductReviews productId={productId} />
      <HomeStoreFeature />
    </div>
  );
}

function CouponCard({ coupon }: { coupon: Coupon }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    toast.success("Code Copied!", { description: coupon.code });
    setTimeout(() => setCopied(false), 2000);
  };

  const getDiscountText = () => {
    if (coupon.type === "FREE_SHIPPING" || coupon.freeShipping) {
      return "Free Shipping";
    }
    if (coupon.type === "PERCENT") {
      return `${coupon.value}% OFF`;
    }
    if (coupon.type === "FLAT") {
      return `₹${coupon.value} OFF`;
    }
    return `₹${coupon.value} OFF`;
  };

  const description =
    coupon.description ||
    (coupon.minCartAmount && coupon.minCartAmount > 0
      ? `On orders above ₹${coupon.minCartAmount}`
      : "Apply at checkout");

  return (
    <div className="relative flex items-stretch bg-background border-2 border-brand/30 rounded-lg overflow-hidden">
      {/* Left: Coupon Code with dashed border */}
      <div className="flex items-center justify-center px-4 py-3 border-r-2 border-dashed border-brand/40 bg-brand/5">
        <span className="font-bold text-sm text-brand tracking-wide whitespace-nowrap">{coupon.code}</span>
      </div>

      {/* Middle: Discount Info */}
      <div className="flex-1 px-4 py-3 min-w-0">
        <p className="font-bold text-foreground text-sm">{getDiscountText()}</p>
        <p className="text-xs text-foreground/60 truncate">{description}</p>
      </div>

      {/* Right: Copy Button */}
      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 px-4 py-3 border-l border-foreground/10 hover:bg-foreground/5 transition-colors">
        {copied ? <Check size={16} className="text-brand" /> : <Copy size={16} className="text-foreground/60" />}
        <span className="text-xs font-medium text-foreground/70">{copied ? "Copied" : "Copy"}</span>
      </button>
    </div>
  );
}
