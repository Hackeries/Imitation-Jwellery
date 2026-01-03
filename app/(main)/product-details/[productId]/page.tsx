"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import CommonHeading from "@/app/components/CommonHeading";
import CommonButton from "@/app/components/button/CommonButton";
import HomeStoreFeature from "@/app/components/HomeStoreFeature";
import ProductReviews from "../ProductReviews";
import FaqSection from "../../faq/page";
import { useProductDetail } from "@/hooks/use-product-detail";
import { useAddToCart } from "@/hooks/use-cart";
import { Heart } from "lucide-react";
import {
  useAddToWishlist,
  useRemoveFromWishlist,
  useIsWishlisted,
} from "@/hooks/use-wishlist";
import { useState } from "react";

export default function ProductDetailsPage() {
  /* ================= ROUTE PARAM ================= */
  const params = useParams();

  /** MUST match folder name: [productId] */
  const productId =
    typeof params.productId === "string" ? params.productId : "";

  /* ================= API ================= */
  const { data: product, isLoading, isError } = useProductDetail(productId);

  /* ================= STATE ================= */
  const [quantity, setQuantity] = useState(1);

  /* ================= CART / WISHLIST ================= */
  const addToCart = useAddToCart();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const { isWishlisted } = useIsWishlisted(productId);

  /* ================= GUARDS ================= */
  if (!productId) {
    return <p className="p-10">Invalid product</p>;
  }

  if (isLoading) {
    return <p className="p-10">Loading product...</p>;
  }

  if (isError || !product) {
    return <p className="p-10">Product not found</p>;
  }

  /* ================= HANDLERS ================= */
  const handleAddToCart = () => {
    addToCart.mutate({
      productId: product.id,
      name: product.title,
      price: Number(product.price.replace(/[^0-9]/g, "")),
      image: product.image,
      quantity,
    });
  };

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist.mutate(product.id);
    } else {
      addToWishlist.mutate({
        productId: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
      });
    }
  };

  /* ================= UI ================= */
  return (
    <div className="productDetailsPage">
      <section className="px-3 md:px-8 lg:px-10 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* IMAGE */}
          <div className="relative aspect-square rounded-xl overflow-hidden">
            <Image
              src={product.image}
              alt={product.title}
              fill
              className="object-cover"
            />

            <button
              onClick={handleWishlistToggle}
              aria-label={
                isWishlisted ? "Remove from wishlist" : "Add to wishlist"
              }
              className={`absolute top-4 right-4 h-10 w-10 rounded-full flex items-center justify-center ${
                isWishlisted ? "bg-brand text-white" : "bg-white"
              }`}
            >
              <Heart size={18} className={isWishlisted ? "fill-current" : ""} />
            </button>
          </div>

          {/* INFO */}
          <div className="border rounded-xl p-6">
            <CommonHeading level={2} title={product.title} />
            <p className="text-xl font-semibold mb-4">{product.price}</p>

            {product.oldPrice && (
              <p className="line-through text-sm opacity-60 mb-4">
                {product.oldPrice}
              </p>
            )}

            <div className="flex items-center gap-4 mb-6">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                -
              </button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>

            <CommonButton onClick={handleAddToCart}>Add to Cart</CommonButton>
          </div>
        </div>
      </section>

      <FaqSection />
      <ProductReviews />
      <HomeStoreFeature />
    </div>
  );
}
