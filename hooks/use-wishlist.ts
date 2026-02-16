"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getWishlist,
  addWishlistItem,
  removeWishlistItem,
  clearWishlist,
  isProductInWishlist,
  syncWishlistOnLogin,
  type Wishlist,
  type ProductLike,
} from "@/services/wishlist-service";
import { useUserProfile, isAuthenticated } from "./use-auth";
import { useEffect } from "react";

export const useWishlist = () => {
  return useQuery<Wishlist>({
    queryKey: ["wishlist"],
    queryFn: getWishlist,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    throwOnError: false,
  });
};

export const useWishlistCount = () => {
  const { data } = useWishlist();
  return data?.items.length ?? 0;
};

export const useIsWishlisted = (productId: string) => {
  const { data } = useWishlist();

  const isWishlisted = !!data?.items.some(
    (item) => String(item.productId) === String(productId)
  );

  return { isWishlisted };
};

export const useIsWishlistedSync = (productId: string): boolean => {
  return isProductInWishlist(productId);
};

export const useSyncWishlistOnLogin = () => {
  const { data: user } = useUserProfile();
  const queryClient = useQueryClient();
  const loggedIn = isAuthenticated(user);

  useEffect(() => {
    if (loggedIn) {
      syncWishlistOnLogin().then((wishlist) => {
        queryClient.setQueryData(["wishlist"], wishlist);
      });
    }
  }, [loggedIn, queryClient]);
};

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
        const newItem = {
          id: product.productId,
          productId: product.productId,
          title: product.title,
          price: product.price,
          image: product.image,
        };

        queryClient.setQueryData<Wishlist>(["wishlist"], {
          items: [...previous.items, newItem],
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

export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeWishlistItem,

    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: ["wishlist"] });

      const previous = queryClient.getQueryData<Wishlist>(["wishlist"]) ?? {
        items: [],
      };

      queryClient.setQueryData<Wishlist>(["wishlist"], {
        items: previous.items.filter(
          (i) => String(i.productId) !== String(productId)
        ),
      });

      return { previous };
    },

    onError: (_e, _productId, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(["wishlist"], ctx.previous);
      }
    },

    onSuccess: (data) => {
      queryClient.setQueryData(["wishlist"], data);
    },

  });
};

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

export const useToggleWishlist = () => {
  const { data: wishlist } = useWishlist();
  const addMutation = useAddToWishlist();
  const removeMutation = useRemoveFromWishlist();

  const toggle = (product: ProductLike) => {
    const isInWishlist = wishlist?.items.some(
      (i) => String(i.productId) === String(product.productId)
    );

    if (isInWishlist) {
      removeMutation.mutate(product.productId);
    } else {
      addMutation.mutate(product);
    }
  };

  return {
    toggle,
    isLoading: addMutation.isPending || removeMutation.isPending,
  };
};

export type { Wishlist, ProductLike };
