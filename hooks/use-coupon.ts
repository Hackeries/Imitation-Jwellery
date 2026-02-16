"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { applyCoupon, removeCoupon, fetchCoupons } from "@/services/coupon-service";
import { toast } from "sonner";

export const useCoupons = () => {
  return useQuery({
    queryKey: ["coupons"],
    queryFn: fetchCoupons,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    throwOnError: false,
  });
};

export const useApplyCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ code, cartId }: { code: string; cartId: string }) =>
      applyCoupon(code, cartId),
    onSuccess: (data) => {
      toast.success(data.message || "Coupon applied successfully!");
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Invalid coupon code",
      );
    },
  });
};

export const useRemoveCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cartId: string) => removeCoupon(cartId),
    onSuccess: (data) => {
      toast.success(data.message || "Coupon removed");
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to remove coupon",
      );
    },
  });
};
