import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  reviewService,
  CreateReviewPayload,
  ReviewsResponse,
  ReviewItem,
  BulkReviewPayload,
} from "@/services/review-service";
import { toast } from "sonner";

export const useProductReviews = (productId: string, limit = 5) => {
  return useInfiniteQuery<ReviewsResponse>({
    queryKey: ["reviews", productId, limit],
    queryFn: ({ pageParam = 1 }) =>
      reviewService.getProductReviews(productId, pageParam as number, limit),
    getNextPageParam: (lastPage) => {
      const { page, limit, total } = lastPage.pagination;
      const hasMore = page * limit < total;
      return hasMore ? page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!productId,
    staleTime: 1000 * 60 * 2,
    throwOnError: false,
  });
};

export const useOrderReviews = (orderId: string) => {
  return useQuery<ReviewItem[]>({
    queryKey: ["reviews", "order", orderId],
    queryFn: () => reviewService.getOrderReviews(orderId),
    enabled: !!orderId,
    throwOnError: false,
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      payload,
      files,
    }: {
      payload: Omit<CreateReviewPayload, "images">;
      files: File[];
    }) => {
      let imageUrls: string[] = [];

      if (files && files.length > 0) {
        try {
          const uploadPromises = files.map((file) =>
            reviewService.uploadImage(file),
          );
          imageUrls = await Promise.all(uploadPromises);
        } catch {
          throw new Error("Failed to upload images. Please try again.");
        }
      }

      return reviewService.createReview({ ...payload, images: imageUrls });
    },
    onSuccess: (_, variables) => {
      toast.success("Review submitted successfully!");
      queryClient.invalidateQueries({
        queryKey: ["reviews", variables.payload.productId],
      });
      queryClient.invalidateQueries({
        queryKey: ["reviews", "order"],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit review");
    },
  });
};

export const useCreateBulkReviews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      products,
      filesByProductId,
    }: {
      orderId: string;
      products: Array<{
        productId: string;
        rating: number;
        title?: string;
        comment?: string;
      }>;
      filesByProductId: Record<string, File[]>;
    }) => {
      const productsWithImages = await Promise.all(
        products.map(async (product) => {
          let imageUrls: string[] = [];

          const files = filesByProductId[product.productId] || [];
          if (files.length > 0) {
            try {
              const uploadPromises = files.map((file) =>
                reviewService.uploadImage(file),
              );
              imageUrls = await Promise.all(uploadPromises);
            } catch {
              throw new Error(
                `Failed to upload images for product ${product.productId}`,
              );
            }
          }

          return { ...product, images: imageUrls };
        }),
      );

      return reviewService.submitBulkReviews({
        orderId,
        products: productsWithImages,
      });
    },
    onSuccess: (_, variables) => {
      toast.success("Reviews submitted successfully!");
      queryClient.invalidateQueries({
        queryKey: ["reviews", "order", variables.orderId],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit reviews");
    },
  });
};
