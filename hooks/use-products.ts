// hooks/use-products.ts

import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import {
  fetchProducts,
  type ProductFilters,
  type ProductListResponse,
} from "@/services/product-service";

export const useProducts = (filters: ProductFilters = {}) => {
  return useQuery<ProductListResponse, Error>({
    queryKey: ["products", "list", filters],
    queryFn: () => fetchProducts(filters),
    staleTime: 1000 * 60 * 5,
    placeholderData: (previousData) => previousData,
    retry: 2,
  });
};

// Infinite pagination for "Load More"
export const useProductsInfinite = (
  filters: Omit<ProductFilters, "page" | "limit"> = {}
) => {
  return useInfiniteQuery<ProductListResponse, Error>({
    queryKey: ["products", "infinite", filters],
    queryFn: ({ pageParam }) =>
      fetchProducts({ ...filters, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const current = lastPage?.meta?.currentPage ?? 1;
      const totalPages = lastPage?.meta?.totalPages ?? 1;
      const next = current + 1;
      return next <= totalPages ? next : undefined;
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
};

// NEW: Hook specifically for category-based product listing
export const useProductsByCategory = (
  categorySlug: string,
  additionalFilters: Omit<
    ProductFilters,
    "categorySlug" | "page" | "limit"
  > = {}
) => {
  const filters = {
    ...additionalFilters,
    categorySlug,
  };

  return useInfiniteQuery<ProductListResponse, Error>({
    queryKey: ["products", "category", categorySlug, additionalFilters],
    queryFn: ({ pageParam }) =>
      fetchProducts({ ...filters, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const current = lastPage?.meta?.currentPage ?? 1;
      const totalPages = lastPage?.meta?.totalPages ?? 1;
      const next = current + 1;
      return next <= totalPages ? next : undefined;
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
    enabled: !!categorySlug, // Only fetch when categorySlug is provided
  });
};
