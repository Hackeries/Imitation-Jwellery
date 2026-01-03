"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchCart,
  addToCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
  type Cart,
} from "@/services/cart-service";

export const useCart = () => {
  return useQuery<Cart, Error>({
    queryKey: ["cart"],
    queryFn: fetchCart,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};

export const useCartCount = () => {
  const { data } = useCart();
  return data?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
};

export const useCartTotal = () => {
  const { data } = useCart();
  return data?.total ?? 0;
};

export const useAddToCart = () => {
  const qc = useQueryClient();

  return useMutation<
    Cart,
    Error,
    {
      productId: string;
      name: string;
      price: number;
      image: string;
      quantity?: number;
    },
    { prev?: Cart }
  >({
    mutationFn: ({ productId, name, price, image, quantity = 1 }) =>
      addToCart(productId, name, price, image, quantity),
    onMutate: async ({ productId, name, price, image, quantity = 1 }) => {
      await qc.cancelQueries({ queryKey: ["cart"] });
      const prev = qc.getQueryData<Cart>(["cart"]) ?? { items: [], total: 0 };

      // Optimistic update
      const existingIndex = prev.items.findIndex(
        (i) => i.productId === productId
      );
      let newItems;
      if (existingIndex >= 0) {
        newItems = prev.items.map((item, idx) =>
          idx === existingIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newItems = [
          ...prev.items,
          {
            id: `temp-${productId}`,
            productId,
            name,
            price,
            quantity,
            image,
          },
        ];
      }

      const newTotal = newItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      qc.setQueryData<Cart>(["cart"], { items: newItems, total: newTotal });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData<Cart>(["cart"], ctx.prev);
    },
    onSuccess: (cart) => {
      qc.setQueryData<Cart>(["cart"], cart);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};

export const useRemoveFromCart = () => {
  const qc = useQueryClient();

  return useMutation<Cart, Error, string, { prev?: Cart }>({
    mutationFn: (cartItemId: string) => removeFromCart(cartItemId),
    onMutate: async (cartItemId) => {
      await qc.cancelQueries({ queryKey: ["cart"] });
      const prev = qc.getQueryData<Cart>(["cart"]) ?? { items: [], total: 0 };

      // Optimistic removal
      const newItems = prev.items.filter((i) => i.id !== cartItemId);
      const newTotal = newItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      qc.setQueryData<Cart>(["cart"], { items: newItems, total: newTotal });
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData<Cart>(["cart"], ctx.prev);
    },
    onSuccess: (cart) => {
      qc.setQueryData<Cart>(["cart"], cart);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};

export const useUpdateCartQuantity = () => {
  const qc = useQueryClient();

  return useMutation<
    Cart,
    Error,
    { cartItemId: string; quantity: number },
    { prev?: Cart }
  >({
    mutationFn: ({ cartItemId, quantity }) =>
      updateCartQuantity(cartItemId, quantity),
    onMutate: async ({ cartItemId, quantity }) => {
      await qc.cancelQueries({ queryKey: ["cart"] });
      const prev = qc.getQueryData<Cart>(["cart"]) ?? { items: [], total: 0 };

      // Optimistic update
      let newItems;
      if (quantity <= 0) {
        newItems = prev.items.filter((i) => i.id !== cartItemId);
      } else {
        newItems = prev.items.map((item) =>
          item.id === cartItemId ? { ...item, quantity } : item
        );
      }

      const newTotal = newItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      qc.setQueryData<Cart>(["cart"], { items: newItems, total: newTotal });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData<Cart>(["cart"], ctx.prev);
    },
    onSuccess: (cart) => {
      qc.setQueryData<Cart>(["cart"], cart);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};

export const useClearCart = () => {
  const qc = useQueryClient();

  return useMutation<Cart, Error, void>({
    mutationFn: () => clearCart(),
    onSuccess: (cart) => {
      qc.setQueryData<Cart>(["cart"], cart);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};
