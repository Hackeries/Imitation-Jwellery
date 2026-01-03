"use client";

import type React from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import CommonButton from "./button/CommonButton";
import {
  useAddToWishlist,
  useRemoveFromWishlist,
  useIsWishlisted,
} from "@/hooks/use-wishlist";
import { useAddToCart } from "@/hooks/use-cart";

type ProductTagVariant = "primary" | "secondary";

type ProductTag = {
  label: string;
  variant?: ProductTagVariant;
};

type CommonProductCardProps = {
  title: string;
  price: string;
  image: string;

  /** MUST be string – backend uses string IDs */
  productId: string;

  oldPrice?: string;
  alwaysShowWishlistIcon?: boolean;
  showAddToCart?: boolean;
  onAddToCart?: () => void;
  tag?: ProductTag;
};

export default function CommonProductCard({
  title,
  price,
  image,
  productId,
  alwaysShowWishlistIcon = false,
  showAddToCart = true,
  onAddToCart,
  oldPrice,
  tag,
}: CommonProductCardProps) {
  /** wishlist state */
  const { isWishlisted } = useIsWishlisted(productId);

  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const addToCart = useAddToCart();

  /** toggle wishlist */
  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isWishlisted) {
      removeFromWishlist.mutate(productId);
    } else {
      addToWishlist.mutate({
        productId,
        title,
        price,
        image,
      });
    }
  };

  /** add to cart */
  const handleAddToCart = (e?: React.MouseEvent) => {
    e?.stopPropagation();

    const priceNumber = Number(price.replace(/[^0-9.]/g, ""));

    addToCart.mutate({
      productId,
      name: title,
      price: priceNumber,
      image,
      quantity: 1,
    });

    onAddToCart?.();
  };

  const shouldShowWishlistIcon = alwaysShowWishlistIcon || isWishlisted;

  return (
    <div className="group text-center commonProductCard">
      {/* IMAGE */}
      <div className="relative h-[250px] md:h-[320px] w-full overflow-hidden rounded-2xl mb-4">
        {/* Tag */}
        {tag && (
          <span
            className={`absolute top-3 left-3 z-[2] text-[11px] px-2 py-1 rounded-full font-medium ${
              tag.variant === "secondary"
                ? "bg-background text-foreground border"
                : "bg-[#fce9ca] text-foreground"
            }`}
          >
            {tag.label}
          </span>
        )}

        {/* Wishlist */}
        <button
          onClick={handleWishlistToggle}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={`
            absolute top-4 right-4 z-10 h-10 w-10 rounded-full
            flex items-center justify-center shadow-md transition
            ${
              isWishlisted
                ? "bg-brand text-background"
                : "bg-background text-foreground hover:bg-brand hover:text-background"
            }
            ${
              shouldShowWishlistIcon
                ? "opacity-100 scale-100"
                : "opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100"
            }
          `}
        >
          <Heart size={18} className={isWishlisted ? "fill-current" : ""} />
        </button>

        {/* Product link */}
        <Link href={`/product-details/${productId}`} className="block h-full">
          <Image
            src={image || "/img/placeholder.webp"}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
      </div>

      {/* TEXT */}
      <Link href={`/product-details/${productId}`}>
        <h4 className="font-times text-lg mb-2">{title}</h4>

        <div className="mb-4 flex justify-center gap-2">
          <span className="font-semibold">{price}</span>
          {oldPrice && (
            <span className="text-sm line-through opacity-50">{oldPrice}</span>
          )}
        </div>
      </Link>

      {/* CART */}
      {showAddToCart && (
        <CommonButton onClick={handleAddToCart} disabled={addToCart.isPending}>
          {addToCart.isPending ? "Adding..." : "Add to Cart"}
        </CommonButton>
      )}
    </div>
  );
}
