import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { JEWELRY_SET_SLUGS } from "@/constants";
import { type ProductFilters, type ProductListResponse, type Product } from "@/types/index";
import { fetchProducts } from "@/services/product-service";

export const useProducts = (filters: ProductFilters = {}) => {
  return useQuery<Product[]>({
    queryKey: ["products", "list", filters],
    queryFn: async () => {
      const response = await fetchProducts(filters);
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
    throwOnError: false,
  });
};

export const useProductsInfinite = (filters: Omit<ProductFilters, "page" | "limit"> = {}) => {
   return useInfiniteQuery<ProductListResponse, Error>({
     queryKey: ["products", "infinite", filters.search, filters.categoryId, filters.categorySlug, filters.minPrice, filters.maxPrice, filters.isNewArrival, filters.isBestSeller, filters.inStock, filters.sort],

     queryFn: ({ pageParam }) => {
       const page = pageParam as number;

       return fetchProducts({
         search: filters.search,
         categoryId: filters.categoryId,
         categorySlug: filters.categorySlug,
         minPrice: filters.minPrice,
         maxPrice: filters.maxPrice,
         isNewArrival: filters.isNewArrival,
         isBestSeller: filters.isBestSeller,
         inStock: filters.inStock,
         sort: filters.sort,
         page,
         limit: 20,
       });
     },

     initialPageParam: 1,

     getNextPageParam: lastPage =>
       lastPage.meta.currentPage < lastPage.meta.totalPages ? lastPage.meta.currentPage + 1 : undefined,

     staleTime: 1000 * 60 * 5,
     retry: 2,
     throwOnError: false,
   });
 };

export const useProductsByCategory = (
  categorySlug: string,
  filters: Pick<ProductFilters, "minPrice" | "maxPrice" | "inStock" | "sort"> = {},
) => {
  const slugsToQuery = categorySlug === "jewelry-set" ? JEWELRY_SET_SLUGS.join(",") : categorySlug;

  return useInfiniteQuery<ProductListResponse, Error>({
    queryKey: ["products", "category", categorySlug, filters],

    queryFn: ({ pageParam }) => {
      const page = pageParam as number;

      return fetchProducts({
        categorySlug: slugsToQuery,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        inStock: filters.inStock,
        sort: filters.sort,
        page,
        limit: 20,
      });
    },

    initialPageParam: 1,

    getNextPageParam: lastPage =>
      lastPage.meta.currentPage < lastPage.meta.totalPages ? lastPage.meta.currentPage + 1 : undefined,

    enabled: Boolean(categorySlug),

    staleTime: 1000 * 60 * 5,
    retry: 2,
    throwOnError: false,
  });
};
