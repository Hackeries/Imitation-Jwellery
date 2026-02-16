import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import {
  fetchYouMayAlsoLike,
  fetchSimilarProducts,
  fetchRecommendations,
  type RecommendedProduct,
} from "@/services/recommendation-service";
import {
  fetchRecentViews,
  trackProductView,
} from "@/services/recent-view-service";

export const useYouMayAlsoLike = (limit = 5) => {
  return useQuery({
    queryKey: ["you-may-also-like", limit],
    queryFn: () => fetchYouMayAlsoLike(limit),
    staleTime: 1000 * 60 * 5,
    throwOnError: false,
  });
};

export const useSimilarProducts = (productId: string, limit = 4) => {
  return useQuery({
    queryKey: ["similar-products", productId, limit],
    queryFn: () => fetchSimilarProducts(productId, limit),
    enabled: !!productId,
    throwOnError: false,
  });
};

export const useRecentViews = (currentProductId?: string) => {
  return useQuery({
    queryKey: ["recent-views"],
    queryFn: () => fetchRecentViews(),
    select: (data) => {
      if (!currentProductId) return data;
      return data.filter((item) => item.id !== currentProductId);
    },
    throwOnError: false,
  });
};

export const useTrackProductView = (productId: string) => {
  const queryClient = useQueryClient();
  const trackedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!productId) return;
    if (trackedRef.current === productId) return;

    trackedRef.current = productId;
    trackProductView(productId)
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ["recent-views"] });
      })
      .catch((err) => console.error("Tracking error:", err));
  }, [productId, queryClient]);
};

export const useRecommendations = (limit = 6) => {
  return useQuery({
    queryKey: ["recommendations", limit],
    queryFn: () => fetchRecommendations(undefined, limit),
    staleTime: 1000 * 60 * 10,
    throwOnError: false,
  });
};

export type { RecommendedProduct };
