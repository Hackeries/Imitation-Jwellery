"use client";

import BestSeller from "@/app/components/BestSeller";
import CommonHeading from "@/app/components/CommonHeading";
import EmptyStateSection from "@/app/components/EmptyStateSection";
import Image from "next/image";
import { useWishlist, useRemoveFromWishlist } from "@/hooks/use-wishlist";
import type { WishlistItem } from "@/services/wishlist-service";
import { useMemo, useState } from "react";

export default function Wishlist() {
  const { data, isLoading } = useWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  const [removingId, setRemovingId] = useState<string | null>(null);

  const wishlistItems: WishlistItem[] = useMemo(
    () => data?.items ?? [],
    [data]
  );

  const isEmpty = !isLoading && wishlistItems.length === 0;

  const handleRemove = (productId: string) => {
    setRemovingId(productId);
    removeFromWishlist.mutate(productId, {
      onSettled: () => setRemovingId(null),
    });
  };

  return (
    <div className="productListPage gradientBg">
      <section className="max-w-full px-3 md:px-6 lg:px-10 py-6 lg:py-10">
        <CommonHeading level={1} title="Your Wishlist" />

        <div className="w-full max-w-[1560px] mx-auto">
          {/* Loading */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <div className="h-20 w-20 rounded-lg bg-muted" />
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="h-4 w-3/4 bg-muted rounded" />
                    <div className="h-3 w-1/3 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Wishlist Items */}
          {!isLoading && !isEmpty && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-y-8">
              {wishlistItems.map((item) => {
                const isRemoving = removingId === String(item.productId);

                return (
                  <div
                    key={item.productId}
                    className="flex items-start gap-4 p-3 rounded-xl hover:bg-muted/40 transition"
                  >
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.title || "Wishlist product"}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <h4 className="text-base font-medium text-foreground font-times line-clamp-2">
                        {item.title}
                      </h4>

                      <span className="text-sm text-foreground">
                        {item.price}
                      </span>

                      <button
                        type="button"
                        className="text-xs underline underline-offset-2 text-foreground/70 hover:text-foreground w-fit disabled:opacity-50"
                        onClick={() => handleRemove(String(item.productId))}
                        disabled={isRemoving}
                        aria-label="Remove item from wishlist"
                      >
                        {isRemoving ? "Removing..." : "Remove"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {isEmpty && (
            <EmptyStateSection
              image="/img/wishlist.webp"
              title="Your wishlist is empty"
              description="Save your favorite pieces here so you can easily find them later."
              buttonText="Browse Products"
              buttonHref="/"
            />
          )}
        </div>
      </section>

      <BestSeller />
    </div>
  );
}
