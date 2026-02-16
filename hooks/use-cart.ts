"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchCart,
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
} from "@/services/cart-service";
import { toast } from "sonner";
import { Cart } from "@/types/index";
import { NetworkError } from "@/lib/error-handler";

export const useCart = () => {
  return useQuery<Cart | null>({
    queryKey: ["cart"],
    queryFn: fetchCart,
    staleTime: 1000 * 60 * 5,
    retry: false,
    refetchOnWindowFocus: false,
    throwOnError: false,
  });
};

export const useCartCount = () => {
  const { data } = useCart();
  return data?.items?.length || 0;
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      quantity = 1,
    }: {
      productId: string;
      quantity?: number;
      name?: string;
      price?: number;
      image?: string;
    }) => addToCart(productId, quantity),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previousCart = queryClient.getQueryData<Cart | null>(["cart"]);

      if (previousCart) {
        const newItem = {
          productId: variables.productId,
          quantity: variables.quantity ?? 1,
          qty: variables.quantity ?? 1,
          price: variables.price ?? 0,
          unitPrice: variables.price ?? 0,
          name: variables.name ?? "",
          image: variables.image ?? "",
        };
        queryClient.setQueryData<Cart>(["cart"], {
          ...previousCart,
          items: [...previousCart.items, newItem],
        });
      }

      return { previousCart };
    },
    onError: (error, _vars, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(["cart"], context.previousCart);
      }
      const errorMessage = error instanceof Error ? error.message : "Failed to add to cart";
      if (error instanceof NetworkError && error.isNetworkError) {
        toast.error("Network Error", {
          description: "Cannot connect to server. Please check your connection.",
        });
      } else {
        toast.error(errorMessage);
      }
    },
    onSuccess: () => {
      toast.success("Added to cart");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};

export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => removeFromCart(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Removed from cart");
    },
    onError: (error) => {
      if (error instanceof NetworkError && error.isNetworkError) {
        toast.error("Network Error", {
          description: "Cannot connect to server. Please try again later.",
        });
      } else {
        toast.error(
          error instanceof Error ? error.message : "Failed to remove item",
        );
      }
    },
  });
};

export const useUpdateCartQuantity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      quantity,
    }: {
      productId: string;
      quantity: number;
    }) => updateCartItemQuantity(productId, quantity),
    onMutate: async ({ productId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previousCart = queryClient.getQueryData<Cart | null>(["cart"]);

      if (previousCart) {
        const updatedItems = previousCart.items.map((item) =>
          item.productId === productId
            ? { ...item, quantity, qty: quantity }
            : item,
        );
        const newSubtotal = updatedItems.reduce(
          (sum, item) => sum + item.unitPrice * item.quantity,
          0,
        );
        queryClient.setQueryData<Cart>(["cart"], {
          ...previousCart,
          items: updatedItems,
          subtotalAmount: newSubtotal,
          totalAmount:
            newSubtotal -
            previousCart.discountAmount +
            previousCart.shippingAmount,
          total:
            newSubtotal -
            previousCart.discountAmount +
            previousCart.shippingAmount,
        });
      }

      return { previousCart };
    },
    onError: (error, _vars, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(["cart"], context.previousCart);
      }
      if (error instanceof NetworkError && error.isNetworkError) {
        toast.error("Network Error", {
          description: "Cannot connect to server. Please try again later.",
        });
      } else {
        toast.error("Failed to update quantity");
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};
