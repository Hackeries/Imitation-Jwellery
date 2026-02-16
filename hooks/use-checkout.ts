"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createOrderFromCart,
  applyCoupon,
  removeCoupon,
  type CheckoutPayload,
  type OrderCreatedResponse,
} from "@/services/checkout-service";
import { toast } from "sonner";
import { useState } from "react";

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<OrderCreatedResponse, Error, CheckoutPayload>({
    mutationFn: (payload) => createOrderFromCart(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

export const useApplyCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      couponCode,
      cartId,
    }: {
      couponCode: string;
      cartId: string;
    }) => applyCoupon(couponCode, cartId),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to apply coupon");
    },
  });
};

export const useRemoveCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cartId: string) => removeCoupon(cartId),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove coupon");
    },
  });
};

export const useCouponState = () => {
  const [couponCode, setCouponCode] = useState("");
  const applyMutation = useApplyCoupon();
  const removeMutation = useRemoveCoupon();

  return {
    couponCode,
    setCouponCode,
    applyCoupon: applyMutation,
    removeCoupon: removeMutation,
    isLoading: applyMutation.isPending || removeMutation.isPending,
  };
};
