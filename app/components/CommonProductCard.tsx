"use client";

import Image from "next/image";
import Link from "next/link";
import { getImageUrl } from "@/lib/image-utils";
import { Heart, Loader2, Minus, Plus } from "lucide-react";
import { useState, useCallback, memo } from "react";
import { FALLBACK_IMAGE } from "@/constants";
import type { CommonProductCardProps } from "@/types/index";
import CommonButton from "./button/CommonButton";
import {
  useIsWishlisted,
  useAddToWishlist,
  useRemoveFromWishlist,
} from "@/hooks/use-wishlist";
import {
  useAddToCart,
  useCart,
  useUpdateCartQuantity,
  useRemoveFromCart,
} from "@/hooks/use-cart";

const isValidImageUrl = (url: string): boolean => {
  return !!url && url.length > 0;
};

function CommonProductCard({
  productId,
  title,
  price,
  priceNumber = 0,
  image,
  alwaysShowWishlistIcon = false,
  showAddToCart = true,
  onAddToCart,
  oldPrice,
  tag,
  inStock = true,
}: CommonProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const { isWishlisted } = useIsWishlisted(productId);
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const addToCartMutation = useAddToCart();
  const updateCartQuantity = useUpdateCartQuantity();
  const removeFromCart = useRemoveFromCart();
  const { data: cart } = useCart();

  const isInCart =
    cart?.items?.some(
      (item: { productId: string }) => item.productId === productId,
    ) ?? false;
  const cartQuantity =
    cart?.items?.find(
      (item: { productId: string }) => item.productId === productId,
    )?.quantity ?? 0;

  const imageSrc = imgError || !isValidImageUrl(image) ? FALLBACK_IMAGE : image;

  const handleWishlistToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();

      if (isWishlisted) {
        removeFromWishlist.mutate(productId);
      } else {
        addToWishlist.mutate({
          productId,
          title,
          price,
          image: imageSrc,
        });
      }
    },
    [
      isWishlisted,
      productId,
      title,
      price,
      imageSrc,
      addToWishlist,
      removeFromWishlist,
    ],
  );

  const handleAddToCart = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();

      if (!inStock) return;
      if (addToCartMutation.isPending) return;

      addToCartMutation.mutate({
        productId,
        name: title,
        price: priceNumber,
        image: imageSrc,
        quantity: 1,
      });
    },
    [
      addToCartMutation,
      productId,
      title,
      priceNumber,
      imageSrc,
      inStock,
    ],
  );

  const handleDecreaseQuantity = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (cartQuantity <= 1) {
        removeFromCart.mutate(productId);
      } else {
        updateCartQuantity.mutate({ productId, quantity: cartQuantity - 1 });
      }
    },
    [cartQuantity, productId, removeFromCart, updateCartQuantity],
  );

  const handleIncreaseQuantity = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      updateCartQuantity.mutate({ productId, quantity: cartQuantity + 1 });
    },
    [cartQuantity, productId, updateCartQuantity],
  );

  const handleImageError = useCallback(() => {
    setImgError(true);
    setImageLoaded(true);
  }, []);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const productUrl = `/product-details/${productId}`;

  const displayTag = !inStock
    ? { label: "Sold Out", variant: "secondary" as const }
    : tag;

  return (
    <div
      className={`group/card text-center commonProductCard h-full flex flex-col ${!inStock ? "opacity-90" : ""}`}
    >
      <div className="commonProductImgWrap relative h-[250px] md:h-[320px] w-full overflow-hidden rounded-2xl mb-4 bg-gray-100">
        {displayTag && (
          <span
            className={`
              productTag absolute top-3 left-3 z-[2]
              text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md font-semibold shadow-sm
              ${!inStock
                ? "bg-foreground text-background"
                : displayTag.variant === "secondary"
                  ? "bg-background text-foreground border border-foreground/20"
                  : "bg-[#fce9ca] text-foreground"
              }
            `}
          >
            {displayTag.label}
          </span>
        )}

        <button
          onClick={handleWishlistToggle}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          disabled={addToWishlist.isPending || removeFromWishlist.isPending}
          className={`
            wishlistButton absolute top-3 right-3 z-[2]
            h-9 w-9 rounded-full flex items-center justify-center
            shadow-sm cursor-pointer transition-opacity duration-300
            ${isWishlisted ? "bg-brand text-background opacity-100" : "bg-background text-foreground hover:bg-foreground/5 opacity-0 group-hover/card:opacity-100"}
            disabled:opacity-50
          `}
        >
          <Heart size={16} className={isWishlisted ? "fill-current" : ""} />
        </button>

        <Link href={productUrl} className="block h-full w-full relative">
          {!imageLoaded && (
            <div className="absolute inset-0 z-10 bg-gray-200 animate-pulse" />
          )}
          <Image
            key={imageSrc}
            src={getImageUrl(imageSrc)}
            alt={title}
            fill
            className={`object-cover transition-transform duration-700 group-hover/card:scale-105 ${!inStock ? "grayscale-[0.5]" : ""
              } ${imageLoaded ? "opacity-100" : "opacity-0"}`}
            onError={handleImageError}
            onLoad={handleImageLoad}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading="lazy"
          />
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center">
        <Link
          href={productUrl}
          className="commonProductTxtWrap no-underline hover:no-underline flex-1 flex flex-col items-center w-full"
        >
          <h4 className="font-times text-lg mb-2 line-clamp-2 leading-tight group-hover/card:text-brand transition-colors">
            {title}
          </h4>
          <div className="mb-4 flex items-center justify-center gap-2">
            <span className="commonProductPrice text-base font-medium text-foreground">
              {price}
            </span>
            {oldPrice && (
              <span className="commonProductOldPrice text-sm text-foreground/40 line-through">
                {oldPrice}
              </span>
            )}
          </div>
        </Link>

        {showAddToCart &&
          (isInCart && inStock ? (
            <div className="w-full mt-auto flex items-center justify-center h-10 rounded-full bg-background border-2 border-brand text-brand overflow-hidden">
              <button
                onClick={handleDecreaseQuantity}
                disabled={
                  updateCartQuantity.isPending || removeFromCart.isPending
                }
                className="flex items-center justify-center w-12 h-full hover:bg-brand/10 transition-colors disabled:opacity-50"
                aria-label="Decrease quantity"
              >
                <Minus size={16} />
              </button>
              <span className="flex-1 text-center font-medium text-base">
                {cartQuantity}
              </span>
              <button
                onClick={handleIncreaseQuantity}
                disabled={updateCartQuantity.isPending}
                className="flex items-center justify-center w-12 h-full hover:bg-brand/10 transition-colors disabled:opacity-50"
                aria-label="Increase quantity"
              >
                <Plus size={16} />
              </button>
            </div>
          ) : (
            <CommonButton
              onClick={handleAddToCart}
              disabled={addToCartMutation.isPending || !inStock}
              variant={!inStock ? "secondaryBtn" : "primaryBtn"}
              className={`w-full mt-auto justify-center h-10 ${!inStock
                ? "opacity-60 cursor-not-allowed bg-foreground/10 text-foreground"
                : ""
                }`}
            >
              {addToCartMutation.isPending ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={16} /> Adding...
                </>
              ) : !inStock ? (
                "Sold Out"
              ) : (
                "Add to Cart"
              )}
            </CommonButton>
          ))}
      </div>
    </div>
  );
}

export default memo(CommonProductCard);
