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

export const useWishlist = () => {
  return useQuery<Wishlist, Error>({
    queryKey: ["wishlist"],
    queryFn: getWishlist,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: 1,
    refetchOnWindowFocus: true,
  });
};

export const useWishlistCount = () => {
  const { data } = useWishlist();
  return data?.items?.length ?? 0;
};

export const useIsWishlisted = (productId: string | number) => {
  const { data } = useWishlist();
  const isWishlisted = Boolean(
    data?.items?.some((i) => i.productId === String(productId))
  );
  return { data: isWishlisted, isWishlisted };
};

export const useAddToWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Wishlist,
    Error,
    ProductLike,
    { previousWishlist?: Wishlist }
  >({
    mutationFn: (product) => addWishlistItem(product),
    onMutate: async (product) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["wishlist"] });

      // Snapshot the previous value
      const previousWishlist = queryClient.getQueryData<Wishlist>([
        "wishlist",
      ]) ?? { items: [] };

      // Optimistically update to the new value
      const exists = previousWishlist.items.some(
        (i) => i.productId === product.productId
      );
      if (!exists) {
        const optimisticWishlist: Wishlist = {
          items: [
            ...previousWishlist.items,
            {
              id: product.productId,
              productId: product.productId,
              title: product.title,
              price: product.price,
              image: product.image,
            },
          ],
        };
        queryClient.setQueryData<Wishlist>(["wishlist"], optimisticWishlist);
      }

      return { previousWishlist };
    },
    onError: (_err, _product, context) => {
      // Roll back to the previous value on error
      if (context?.previousWishlist) {
        queryClient.setQueryData<Wishlist>(
          ["wishlist"],
          context.previousWishlist
        );
      }
    },
    onSuccess: (updatedWishlist) => {
      // Update with the actual server response
      queryClient.setQueryData<Wishlist>(["wishlist"], updatedWishlist);
    },
    onSettled: () => {
      // Invalidate to refetch in background
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });
};

export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation<Wishlist, Error, string, { previousWishlist?: Wishlist }>({
    mutationFn: (idOrProductId) => removeWishlistItem(idOrProductId),
    onMutate: async (idOrProductId) => {
      await queryClient.cancelQueries({ queryKey: ["wishlist"] });

      const previousWishlist = queryClient.getQueryData<Wishlist>([
        "wishlist",
      ]) ?? { items: [] };

      // Optimistically remove the item
      const optimisticWishlist: Wishlist = {
        items: previousWishlist.items.filter(
          (i) => i.id !== idOrProductId && i.productId !== idOrProductId
        ),
      };
      queryClient.setQueryData<Wishlist>(["wishlist"], optimisticWishlist);

      return { previousWishlist };
    },
    onError: (_err, _id, context) => {
      if (context?.previousWishlist) {
        queryClient.setQueryData<Wishlist>(
          ["wishlist"],
          context.previousWishlist
        );
      }
    },
    onSuccess: (updatedWishlist) => {
      queryClient.setQueryData<Wishlist>(["wishlist"], updatedWishlist);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });
};

export const useClearWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation<Wishlist, Error, void, { previousWishlist?: Wishlist }>({
    mutationFn: () => clearWishlist(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["wishlist"] });
      const previousWishlist = queryClient.getQueryData<Wishlist>(["wishlist"]);
      queryClient.setQueryData<Wishlist>(["wishlist"], { items: [] });
      return { previousWishlist };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousWishlist) {
        queryClient.setQueryData<Wishlist>(
          ["wishlist"],
          context.previousWishlist
        );
      }
    },
    onSuccess: (updatedWishlist) => {
      queryClient.setQueryData<Wishlist>(["wishlist"], updatedWishlist);
    },
  });
};

// Re-export types for convenience
export type { Wishlist, ProductLike };
