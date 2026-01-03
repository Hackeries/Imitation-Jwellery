import { useQuery } from "@tanstack/react-query";
import { fetchProductDetail } from "@/services/product-details-service";

// fetch single product details
export const useProductDetail = (productId?: string) => {
  return useQuery({
    queryKey: ["products", "detail", productId],

    queryFn: () => fetchProductDetail(productId as string),

    enabled: !!productId && productId !== "undefined",

    staleTime: 1000 * 60 * 10,
  });
};
