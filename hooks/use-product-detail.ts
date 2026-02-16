import { useQuery } from "@tanstack/react-query";
import { fetchProductById } from "@/services/product-service";
import { Product } from "@/types/index";
export const useProductDetail = (productId: string) => {
  return useQuery<Product | null, Error>({
    queryKey: ["product", productId],
    queryFn: () => fetchProductById(productId),
    enabled: Boolean(productId),
    staleTime: 1000 * 60 * 5,
    retry: 2,
    throwOnError: false,
  });
};
