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

/* =========================
   CART QUERY
========================= */
export const useCart = () => {
  return useQuery<Cart, Error>({
    queryKey: ["cart"],
    queryFn: fetchCart,
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
    retry: 1,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};

/* =========================
   CART COUNT (NO REFETCH)
========================= */
export const useCartCount = () => {
  const qc = useQueryClient();
  const cart = qc.getQueryData<Cart>(["cart"]);

  return cart?.items?.reduce((sum, item) => sum + (item.quantity ?? 1), 0) ?? 0;
};

/* =========================
   CART TOTAL (NO REFETCH)
========================= */
export const useCartTotal = () => {
  const qc = useQueryClient();
  return qc.getQueryData<Cart>(["cart"])?.total ?? 0;
};

/* =========================
   ADD TO CART
========================= */
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

      const existing = prev.items.find((i) => i.productId === productId);

      const items = existing
        ? prev.items.map((i) =>
            i.productId === productId
              ? { ...i, quantity: i.quantity + quantity }
              : i
          )
        : [
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

      qc.setQueryData<Cart>(["cart"], {
        items,
        total: items.reduce((s, i) => s + i.price * i.quantity, 0),
      });

      return { prev };
    },

    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData<Cart>(["cart"], ctx.prev);
    },

    // 🔑 ALWAYS trust backend after success
    onSuccess: (cart) => {
      qc.setQueryData<Cart>(["cart"], cart);
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};

/* =========================
   REMOVE FROM CART
========================= */
export const useRemoveFromCart = () => {
  const qc = useQueryClient();

  return useMutation<Cart, Error, string, { prev?: Cart }>({
    mutationFn: removeFromCart,

    onMutate: async (cartItemId) => {
      await qc.cancelQueries({ queryKey: ["cart"] });

      const prev = qc.getQueryData<Cart>(["cart"]) ?? { items: [], total: 0 };

      const items = prev.items.filter((i) => i.id !== cartItemId);

      qc.setQueryData<Cart>(["cart"], {
        items,
        total: items.reduce((s, i) => s + i.price * i.quantity, 0),
      });

      return { prev };
    },

    onError: (_e, _id, ctx) => {
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

/* =========================
   UPDATE CART QUANTITY
========================= */
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

      const prev = qc.getQueryData<Cart>(["cart"]) ?? {
        items: [],
        total: 0,
      };

      const items =
        quantity <= 0
          ? prev.items.filter((i) => i.id !== cartItemId)
          : prev.items.map((i) =>
              i.id === cartItemId ? { ...i, quantity } : i
            );

      qc.setQueryData<Cart>(["cart"], {
        items,
        total: items.reduce((s, i) => s + i.price * i.quantity, 0),
      });

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


/* =========================
   CLEAR CART
========================= */
export const useClearCart = () => {
  const qc = useQueryClient();

  return useMutation<Cart, Error, void>({
    mutationFn: clearCart,

    onSuccess: (cart) => {
      qc.setQueryData<Cart>(["cart"], cart);
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};
