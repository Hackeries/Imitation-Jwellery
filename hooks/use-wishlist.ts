"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getWishlist,
  addWishlistItem,
  removeWishlistItem,
  clearWishlist,
  type Wishlist,
  type ProductLike,
} from "@/services/wishlist-service";

/* =======================
   Base wishlist query
======================= */

export const useWishlist = () => {
  return useQuery<Wishlist>({
    queryKey: ["wishlist"],
    queryFn: getWishlist,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    retry: 1,
  });
};

/* =======================
   Wishlist count
======================= */

export const useWishlistCount = () => {
  const queryClient = useQueryClient();
  const data = queryClient.getQueryData<Wishlist>(["wishlist"]);
  return data?.items.length ?? 0;
};

/* =======================
   Check wishlisted
======================= */

export const useIsWishlisted = (productId: string) => {
  const queryClient = useQueryClient();
  const data = queryClient.getQueryData<Wishlist>(["wishlist"]);

  const isWishlisted = !!data?.items.find(
    (item) => String(item.productId) === String(productId)
  );

  return { isWishlisted };
};

/* =======================
   Add to wishlist
======================= */

export const useAddToWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addWishlistItem,

    onMutate: async (product) => {
      await queryClient.cancelQueries({ queryKey: ["wishlist"] });

      const previous = queryClient.getQueryData<Wishlist>(["wishlist"]) ?? {
        items: [],
      };

      if (
        !previous.items.some(
          (i) => String(i.productId) === String(product.productId)
        )
      ) {
        queryClient.setQueryData<Wishlist>(["wishlist"], {
          items: [
            ...previous.items,
            {
              id: product.productId,
              productId: product.productId,
              title: product.title,
              price: product.price,
              image: product.image,
            },
          ],
        });
      }

      return { previous };
    },

    onError: (_e, _p, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(["wishlist"], ctx.previous);
      }
    },

    onSuccess: (data) => {
      queryClient.setQueryData(["wishlist"], data);
    },
  });
};

/* =======================
   Remove from wishlist
======================= */

export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeWishlistItem,

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["wishlist"] });

      const previous = queryClient.getQueryData<Wishlist>(["wishlist"]) ?? {
        items: [],
      };

      queryClient.setQueryData<Wishlist>(["wishlist"], {
        items: previous.items.filter(
          (i) =>
            String(i.productId) !== String(id) && String(i.id) !== String(id)
        ),
      });

      return { previous };
    },

    onError: (_e, _id, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(["wishlist"], ctx.previous);
      }
    },

    onSuccess: (data) => {
      queryClient.setQueryData(["wishlist"], data);
    },
  });
};

/* =======================
   Clear wishlist
======================= */

export const useClearWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearWishlist,

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["wishlist"] });

      const previous = queryClient.getQueryData<Wishlist>(["wishlist"]);

      queryClient.setQueryData<Wishlist>(["wishlist"], { items: [] });

      return { previous };
    },

    onError: (_e, _v, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(["wishlist"], ctx.previous);
      }
    },

    onSuccess: (data) => {
      queryClient.setQueryData(["wishlist"], data);
    },
  });
};

/* =======================
   Exports
======================= */

export type { Wishlist, ProductLike };
