"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import {
  fetchOrders,
  fetchOrderDetails,
  fetchOrdersPaginated,
  cancelOrder,
  adminUpdateOrderStatus,
  type OrderStatus,
} from "@/services/orders-service";
import { toast } from "sonner";

export const useOrders = () => {
  return useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
    staleTime: 1000 * 60 * 5,
    throwOnError: false,
  });
};

export const useOrdersInfinite = (pageSize: number = 8) => {
  return useInfiniteQuery({
    queryKey: ["orders-infinite"],
    queryFn: async ({ pageParam = 1 }) => {
      const result = await fetchOrdersPaginated(pageParam, pageSize);
      return result;
    },
    getNextPageParam: (lastPage) => {
      const hasMore =
        lastPage.pagination &&
        lastPage.pagination.page * lastPage.pagination.limit <
          lastPage.pagination.total;
      return hasMore ? lastPage.pagination.page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5,
    throwOnError: false,
  });
};

export const useOrderDetails = (orderId: string) => {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: () => fetchOrderDetails(orderId),
    enabled: !!orderId,
    throwOnError: false,
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => cancelOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order cancelled successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to cancel order");
    },
  });
};

export const useAdminUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      status,
    }: {
      orderId: string;
      status: OrderStatus;
    }) => adminUpdateOrderStatus(orderId, status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", variables.orderId] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update status");
    },
  });
};
