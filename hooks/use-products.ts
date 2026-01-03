// hooks/use-products.ts

import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import {
  fetchProducts,
  type ProductFilters,
  type ProductListResponse,
} from "@/services/product-service";
import { getCategoryIdBySlug } from "@/services/category-service";

/* -----------------------------------------
   NORMAL PRODUCT LIST
----------------------------------------- */
export const useProducts = (filters: ProductFilters = {}) => {
  return useQuery<ProductListResponse, Error>({
    queryKey: ["products", "list", filters],
    queryFn: () => fetchProducts(filters),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
    retry: 2,
  });
};

/* -----------------------------------------
   EXISTING HOME PAGE HOOK (RESTORED)
----------------------------------------- */
export const useProductsInfinite = (
  filters: Omit<ProductFilters, "page" | "limit"> = {}
) => {
  return useInfiniteQuery<ProductListResponse, Error>({
    queryKey: ["products", "infinite", filters],

    queryFn: ({ pageParam }) =>
      fetchProducts({
        ...filters,
        page: pageParam as number,
      }),

    initialPageParam: 1,

    getNextPageParam: (lastPage) => {
      const current = lastPage?.meta?.currentPage ?? 1;
      const total = lastPage?.meta?.totalPages ?? 1;
      return current < total ? current + 1 : undefined;
    },

    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
};

/* -----------------------------------------
   INTERNAL HOOK TO RESOLVE CATEGORY ID
----------------------------------------- */
const useCategoryId = (slug: string) => {
  return useQuery<string | null>({
    queryKey: ["category-id", slug],
    queryFn: () => getCategoryIdBySlug(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 10,
  });
};

/* -----------------------------------------
   CATEGORY PAGE HOOK (SAFE + CORRECT)
----------------------------------------- */
export const useProductsByCategory = (
  categorySlug: string,
  additionalFilters: Omit<ProductFilters, "categoryId" | "page" | "limit"> = {}
) => {
  const { data: categoryId, isLoading } = useCategoryId(categorySlug);

  // convert null → undefined for TS
  const resolvedCategoryId: string | undefined = categoryId ?? undefined;

  return useInfiniteQuery<ProductListResponse, Error>({
    queryKey: [
      "products",
      "category",
      categorySlug,
      resolvedCategoryId,
      additionalFilters,
    ],

    queryFn: ({ pageParam }) =>
      fetchProducts({
        ...additionalFilters,
        categoryId: resolvedCategoryId,
        page: pageParam as number,
      }),

    initialPageParam: 1,

    getNextPageParam: (lastPage) => {
      const current = lastPage?.meta?.currentPage ?? 1;
      const total = lastPage?.meta?.totalPages ?? 1;
      return current < total ? current + 1 : undefined;
    },

    staleTime: 1000 * 60 * 5,
    retry: 2,

    enabled: !!resolvedCategoryId && !isLoading,
  });
};
