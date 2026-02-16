"use client";

import BestSeller from "@/app/components/BestSeller";
import CommonHeading from "@/app/components/CommonHeading";
import EmptyStateSection from "@/app/components/EmptyStateSection";
import { ProductListSkeleton } from "@/app/components/skeleton";
import Image from "next/image";
import Link from "next/link";
import { useWishlist, useRemoveFromWishlist } from "@/hooks/use-wishlist";
import { useAddToCart } from "@/hooks/use-cart";
import { toast } from "sonner";
import { Loader2, ShoppingCart, Trash2 } from "lucide-react";
import { getImageUrl } from "@/lib/image-utils";
import AnimatedSection from "@/app/components/AnimatedSection";
import AuthGuard from "@/app/components/AuthGuard";

export default function Wishlist() {
  const { data: wishlist, isLoading, isError } = useWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const addToCart = useAddToCart();
  const isLoggedIn = useIsLoggedIn();

  useEffect(() => { }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <LoginToContinueModal
        open={true}
        onClose={() => { }}
        forceLoginForm={true}
      />
    );
  }
  const handleRemove = (productId: string) => {
    removeFromWishlist.mutate(productId, {
      onSuccess: () => toast.success("Removed from wishlist"),
      onError: () => toast.error("Failed to remove item"),
    });
  };

  const handleAddToCart = (item: {
    productId: string;
    title: string;
    price: string;
    image: string;
  }) => {
    const priceNumber = parseFloat(
      item.price.replace(/[^0-9.]/g, "")
    );

    addToCart.mutate(
      {
        productId: item.productId,
        name: item.title,
        price: priceNumber,
        image: item.image,
        quantity: 1,
      },
      {
        onSuccess: () => {
          removeFromWishlist.mutate(item.productId);
        },
        onError: () => toast.error("Failed to add to cart"),
      }
    );
  };

  const wishlistItems = wishlist?.items ?? [];
  const isEmpty = wishlistItems.length === 0;

  if (isLoading) {
    return (
      <div className="productListPage gradientBg min-h-[50vh] py-12">
        <section className="max-w-full px-3 md:px-6 lg:px-10 py-6 md:py-6 lg:py-10">
          <CommonHeading level={1} title="Your Wishlist" />
          <ProductListSkeleton count={6} />
        </section>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="productListPage gradientBg">
        <section className="max-w-full px-3 md:px-6 lg:px-10 py-6 md:py-6 lg:py-10">
          <CommonHeading level={1} title="Your Wishlist" />
          <div className="text-center py-10 text-red-500">
            Failed to load wishlist. Please try again.
          </div>
        </section>
      </div>
    );
  }

  return (
    <>
      <div className="productListPage gradientBg">
        <AnimatedSection>
          <section className="max-w-full px-3 md:px-6 lg:px-10 py-6 md:py-6 lg:py-10">
            <CommonHeading level={1} title="Your Wishlist" />

            <div className="w-full max-w-[1560px] mx-auto">
              {!isEmpty && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-y-8">
                  {wishlistItems.map((item) => (
                    <div key={item.id} className="flex items-start gap-4">
                      {/* IMAGE */}
                      <Link
                        href={`/product-details/${item.productId}`}
                        className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted"
                      >
                        <Image
                          src={getImageUrl(item.image)}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </Link>

                      {/* CONTENT */}
                      <div className="flex flex-col gap-1 flex-1">
                        <Link
                          href={`/product-details/${item.productId}`}
                          className="text-base font-medium text-foreground font-times hover:underline"
                        >
                          {item.title}
                        </Link>

                        <span className="text-sm font-normal text-foreground">
                          {item.price}
                        </span>

                        <div className="flex items-center gap-3 mt-2">
                          <button
                            className="flex items-center gap-1 text-xs text-brand hover:underline"
                            onClick={() => handleAddToCart(item)}
                            disabled={addToCart.isPending}
                          >
                            <ShoppingCart size={14} />
                            Add to Cart
                          </button>

                          <button
                            className="flex items-center gap-1 text-xs text-foreground/70 cursor-pointer hover:text-red-500"
                            onClick={() => handleRemove(item.productId)}
                            disabled={removeFromWishlist.isPending}
                          >
                            <Trash2 size={14} />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {isEmpty && (
                <EmptyStateSection
                  image="/img/wishlist.webp"
                  title="Your wishlist is empty"
                  description="Save your favorite pieces here so you can easily find them later."
                  buttonText="Browse Products"
                  buttonHref="/product-list"
                />
              )}
            </div>
          </section>
          <BestSeller />
        </AnimatedSection>
      </div>

    </>
  );
}
