"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import CommonHeading from "@/app/components/CommonHeading";
import CommonButton from "@/app/components/button/CommonButton";
import CommonInput from "@/app/components/input/CommonInput";
import HomeStoreFeature from "@/app/components/HomeStoreFeature";
import { ProductDetailSkeleton } from "@/app/components/skeleton";
import ProductReviews from "../ProductReviews";
import FaqSection from "../../faq/page";
import CommonProductCard from "@/app/components/CommonProductCard";
import { useProductDetail } from "@/hooks/use-product-detail";
import { useAddToCart, useCart, useUpdateCartQuantity, useRemoveFromCart } from "@/hooks/use-cart";
import {
  ChevronDown,
  Heart,
  Truck,
  Minus,
  Plus,
  Tag,
  Copy,
  Check,
  Loader2,
} from "lucide-react";
import {
  useAddToWishlist,
  useRemoveFromWishlist,
  useIsWishlisted,
} from "@/hooks/use-wishlist";
import { validatePincode } from "@/services/pincode-service";
import {
  useTrackProductView,
  useRecentViews,
  useYouMayAlsoLike,
  type RecommendedProduct,
} from "@/hooks/use-recommendations";
import { useCoupons } from "@/hooks/use-coupon";
import { Coupon } from "@/types/index";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { Disclosure, Transition } from "@headlessui/react";
import { FALLBACK_IMAGE } from "@/constants";
import { getImageUrl } from "@/lib/image-utils";

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const productId =
    typeof params.productId === "string" ? params.productId : "";

  const { data: product, isLoading, isError } = useProductDetail(productId);

  useTrackProductView(productId);

  const { data: recentViews = [] } = useRecentViews(productId);
  const { data: recommendations = [] } = useYouMayAlsoLike(5);
  const { data: coupons = [], isLoading: isCouponsLoading } = useCoupons();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isOrderingNow, setIsOrderingNow] = useState(false);
  const [isMainImageLoading, setIsMainImageLoading] = useState(true);

  const [pincode, setPincode] = useState("");
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);
  const [pincodeStatus, setPincodeStatus] = useState<null | "success" | "error">(null);
  const [pincodeMessage, setPincodeMessage] = useState("");

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const addToCart = useAddToCart();
  const { data: cart } = useCart();
  const updateCartQuantity = useUpdateCartQuantity();
  const removeFromCartMutation = useRemoveFromCart();

  const isInCart = cart?.items?.some(
    (item: { productId: string }) => item.productId === productId,
  ) ?? false;
  const cartQuantity = cart?.items?.find(
    (item: { productId: string }) => item.productId === productId,
  )?.quantity ?? 0;

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

  if (isLoading || isError) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <div className="p-10 text-center">
        <CommonHeading level={2} title="Product Not Found" />
        <p className="text-foreground/60 mb-6">
          We couldn&apos;t find this product. It may have been removed.
        </p>
        <CommonButton href="/product-list">Browse Products</CommonButton>
      </div>
    );
  }

  const images =
    product.images?.length > 0
      ? product.images
      : product.image
        ? [product.image]
        : [];
  const currentImage =
    images[selectedImageIndex] || product.image || FALLBACK_IMAGE;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;
    if (Math.abs(diff) < threshold) return;
    if (images.length <= 1) return;

    if (diff > 0 && selectedImageIndex < images.length - 1) {
      setIsMainImageLoading(true);
      setSelectedImageIndex(selectedImageIndex + 1);
    } else if (diff < 0 && selectedImageIndex > 0) {
      setIsMainImageLoading(true);
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

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
          toast.success("Added to cart", {
            description: `${product.title} has been added to your cart.`,
          });
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

  const handleImageSelect = (idx: number) => {
    if (selectedImageIndex !== idx) {
      setIsMainImageLoading(true);
      setSelectedImageIndex(idx);
    }
  };

  const handleCheckPincode = async () => {
    if (!pincode || pincode.length < 6) {
      toast.error("Please enter a valid pincode");
      return;
    }

    setIsCheckingPincode(true);
    setPincodeStatus(null);
    setPincodeMessage("");

    try {
      const result = await validatePincode(pincode);
      if (result.success) {
        setPincodeStatus("success");
        setPincodeMessage("Delivery available to this pincode.");
      } else {
        setPincodeStatus("error");
        setPincodeMessage(result.message || "Delivery not available.");
      }
    } catch (error) {
      setPincodeStatus("error");
      setPincodeMessage("Something went wrong. Please try again.");
    } finally {
      setIsCheckingPincode(false);
    }
  };

  const isOutOfStock = product.availability === "Out of Stock";

  return (
    <div className="productDetailsPage" key={productId}>
      <section className="px-3 md:px-8 lg:px-10 py-7 md:py-12">
        <div className="mx-auto max-w-3xl lg:max-w-full grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6 lg:gap-6">
          <div className="flex flex-col sm:flex-row gap-4 h-fit lg:sticky lg:top-20 transition-all">
            <div className="order-2 sm:order-1 flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible">
              {images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => handleImageSelect(idx)}
                  aria-label={`View image ${idx + 1}`}
                  className={`
                    relative w-16 h-16 sm:w-20 sm:h-20
                    rounded-md overflow-hidden border transition
                    flex-shrink-0
                    ${selectedImageIndex === idx ? "border-brand ring-0" : "border-foreground/20 hover:border-brand"}
                  `}
                >
                  <Image
                    src={getImageUrl(img)}
                    alt={`Product thumbnail ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>

            <div
              className="order-1 sm:order-2 relative flex-1 aspect-square rounded-xl overflow-hidden bg-gray-50 touch-pan-y"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {isMainImageLoading && (
                <div className="absolute inset-0 z-10 bg-gray-200 animate-pulse" />
              )}
              <Image
                src={getImageUrl(currentImage)}
                alt={product.title}
                fill
                className={`object-cover transition-opacity duration-300 ${isMainImageLoading ? "opacity-0" : "opacity-100"}`}
                onLoad={() => setIsMainImageLoading(false)}
                priority
              />

              {product.tag && (
                <span
                  className={`absolute top-4 left-4 z-10 text-xs px-3 py-1 rounded-full font-medium ${product.tag.variant === "secondary"
                    ? "bg-background text-foreground border"
                    : "bg-[#fce9ca] text-foreground"
                    }`}
                >
                  {product.tag.label}
                </span>
              )}

              <button
                onClick={handleWishlistToggle}
                aria-label={
                  isWishlisted ? "Remove from wishlist" : "Add to wishlist"
                }
                className={`
                  absolute top-4 right-4 z-10 h-10 w-10 rounded-full
                  flex items-center justify-center shadow-md transition
                  ${isWishlisted
                    ? "bg-brand text-background"
                    : "bg-background text-foreground hover:bg-brand hover:text-background"
                  }
                `}
              >
                <Heart
                  size={18}
                  className={isWishlisted ? "fill-current" : ""}
                />
              </button>

              {images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5 sm:hidden">
                  {images.map((_: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => handleImageSelect(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${selectedImageIndex === idx ? "bg-brand w-4" : "bg-foreground/30"
                        }`}
                      aria-label={`Go to image ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="border border-foreground/20 rounded-xl p-4 md:p-6 lg:p-8 [overflow-anchor:none]">
            <p className="uppercase text-xs tracking-wide mb-2">Privora</p>

            <CommonHeading
              level={2}
              title={product.title}
              noMargin
              className="text-left"
            />

            {product.description && (
              <p className="text-sm mb-4">{product.description}</p>
            )}

            <span className="text-xl font-semibold mb-6 block">
              {product.price}
              {product.oldPrice && (
                <span className="ml-2 text-base text-foreground/50 line-through">
                  {product.oldPrice}
                </span>
              )}
            </span>

            <div className="text-sm space-y-1.5 mb-6">
              <p>
                <strong className="inline-block w-28">Vendor:</strong>{" "}
                {product.vendor || "Privora"}
              </p>
              <p>
                <strong className="inline-block w-28">Type:</strong>{" "}
                {product.type || "Jewelry"}
              </p>
              {product.sku && (
                <p>
                  <strong className="inline-block w-28">SKU:</strong>{" "}
                  {product.sku}
                </p>
              )}
              <p>
                <strong className="inline-block w-28">Availability:</strong>{" "}
                {product.availability}
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
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                />
                <CommonButton
                  className="absolute right-0 top-0 bottom-0 h-full w-fit max-w-fit checkPinCodeBtn"
                  onClick={handleCheckPincode}
                  disabled={isCheckingPincode}
                >
                  {isCheckingPincode ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    "Check"
                  )}
                </CommonButton>
              </div>
              {pincodeStatus && (
                <p
                  className={`text-xs mt-2 font-medium ${pincodeStatus === "success"
                    ? "text-green-600"
                    : "text-red-500"
                    }`}
                >
                  {pincodeMessage}
                </p>
              )}
            </div>

            <div className="flex gap-4 mb-4">
              {isInCart && cartQuantity > 0 ? (
                <>
                  <div className="flex items-center border rounded-full overflow-hidden">
                    <button
                      onClick={() => {
                        if (cartQuantity <= 1) {
                          removeFromCartMutation.mutate(productId);
                        } else {
                          updateCartQuantity.mutate({ productId, quantity: cartQuantity - 1 });
                        }
                      }}
                      disabled={updateCartQuantity.isPending || removeFromCartMutation.isPending}
                      aria-label="Decrease quantity"
                      className="px-4 py-2 hover:bg-brand/10 transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-4 text-center min-w-[3rem] font-medium">{cartQuantity}</span>
                    <button
                      onClick={() => updateCartQuantity.mutate({ productId, quantity: cartQuantity + 1 })}
                      disabled={updateCartQuantity.isPending}
                      aria-label="Increase quantity"
                      className="px-4 py-2 hover:bg-brand/10 transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <CommonButton
                    variant="secondaryBtn"
                    className="flex-1"
                    onClick={handleAddToCart}
                    disabled={isOutOfStock || addToCart.isPending}
                  >
                    {addToCart.isPending ? "Adding..." : "Add to Cart"}
                  </CommonButton>
                </>
              ) : (
                <CommonButton
                  variant="secondaryBtn"
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || addToCart.isPending}
                >
                  {addToCart.isPending ? "Adding..." : "Add to Cart"}
                </CommonButton>
              )}
            </div>

            <CommonButton
              onClick={handleOrderNow}
              className="mb-6"
              disabled={isOutOfStock || isOrderingNow}
            >
              {isOutOfStock
                ? "Out of Stock"
                : isOrderingNow
                  ? "Processing..."
                  : "Order Now"}
            </CommonButton>

            {(isCouponsLoading || coupons.length > 0) && (
              <div className="bg-brand/10 p-4 rounded-md mb-6">
                <div className="flex items-center gap-2 font-medium mb-3 text-brand">
                  <Tag size={16} className="text-brand" />
                  <span>Best Offers</span>
                </div>
                <div className="space-y-3">
                  {isCouponsLoading ? (
                    <div className="flex items-center gap-3 bg-background p-3 rounded-md animate-pulse">
                      <div className="h-8 w-16 bg-foreground/10 rounded" />
                      <div className="flex-1">
                        <div className="h-4 w-20 bg-foreground/10 rounded mb-1" />
                        <div className="h-3 w-32 bg-foreground/10 rounded" />
                      </div>
                    </div>
                  ) : (
                    coupons
                      .slice(0, 3)
                      .map((coupon) => (
                        <CouponCard key={coupon._id} coupon={coupon} />
                      ))
                  )}
                </div>
              </div>
            )}

            <div className="mt-6">
              <Disclosure
                as="div"
                className="border-t border-foreground/20 py-4"
              >
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
                      leaveTo="opacity-0 -translate-y-1"
                    >
                      <Disclosure.Panel className="pt-3 text-sm text-foreground/80 whitespace-pre-line">
                        {product.detailDescription || product.description ||
                          "Premium quality jewelry perfect for festive occasions. Crafted with care using hypoallergenic materials, ensuring comfort and long-lasting shine."}
                      </Disclosure.Panel>
                    </Transition>
                  </>
                )}
              </Disclosure>

              <Disclosure
                as="div"
                className="border-t border-foreground/20 py-4"
              >
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
                      leaveTo="opacity-0 -translate-y-1"
                    >
                      <Disclosure.Panel className="pt-3 text-sm text-foreground/80">
                        Ships within 24–48 hours. Free delivery on all prepaid
                        orders. COD available in select locations. Tracking
                        details will be shared once the order is dispatched.
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
      ? `Min order: ₹${coupon.minCartAmount}`
      : "Apply at checkout");

  return (
    <div className="flex items-center justify-between gap-3 bg-background p-3 rounded-lg border border-brand/50 hover:border-brand transition-colors relative overflow-hidden shadow-sm">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="flex-shrink-0 border-2 border-dashed border-brand/60 rounded px-3 py-1.5 bg-brand/5">
          <span className="font-bold text-sm text-foreground tracking-wide">
            {coupon.code}
          </span>
        </div>

        <div className="min-w-0">
          <p className="text-base font-bold text-foreground leading-none mb-1">
            {getDiscountText()}
          </p>
          <p className="text-xs text-foreground/70 truncate">{description}</p>
        </div>
      </div>
      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 pl-3 border-l border-foreground/10 text-xs font-bold uppercase tracking-wider text-brand hover:opacity-80 transition-opacity"
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
