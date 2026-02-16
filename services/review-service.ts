import { API_BASE_URL } from "@/constants";
import { getCommonHeaders } from "@/lib/api-utils";
import { uploadService } from "./upload-service";

export interface ReviewItem {
  _id: string;
  productId: {
    _id: string;
    title: string;
    image: string;
  };
  customerId: {
    _id: string;
    fullName: string;
  };
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
  createdAt: string;
  isApproved: boolean;
}

export interface RatingDistribution {
  "1_star": number;
  "2_star": number;
  "3_star": number;
  "4_star": number;
  "5_star": number;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: RatingDistribution;
}

export interface ReviewsResponse {
  items: ReviewItem[];
  summary: ReviewSummary;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface CreateReviewPayload {
  productId: string;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
}

export interface BulkReviewPayload {
  orderId: string;
  products: Array<{
    productId: string;
    rating: number;
    title?: string;
    comment?: string;
    images?: string[];
  }>;
}

export const reviewService = {
  getProductReviews: async (
    productId: string,
    page = 1,
    limit = 5,
  ): Promise<ReviewsResponse> => {
    const res = await fetch(
      `${API_BASE_URL}/api/v1/reviews/products/${productId}?page=${page}&limit=${limit}`,
      {
        headers: getCommonHeaders(),
        credentials: "include",
        cache: "no-store",
      },
    );

    if (!res.ok) throw new Error("Failed to fetch reviews");

    const json = await res.json();
    return json.data;
  },

  getOrderReviews: async (orderId: string): Promise<ReviewItem[]> => {
    const res = await fetch(`${API_BASE_URL}/api/v1/reviews/order/${orderId}`, {
      headers: getCommonHeaders(),
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) return [];

    const json = await res.json();
    return json.data || [];
  },

  createReview: async (payload: CreateReviewPayload) => {
    // Strip undefined/empty optional fields to satisfy additionalProperties: false + minLength validators
    const cleanPayload: Record<string, unknown> = {
      productId: payload.productId,
      rating: payload.rating,
    };
    if (payload.title && payload.title.trim().length >= 5) {
      cleanPayload.title = payload.title.trim();
    }
    if (payload.comment && payload.comment.trim().length >= 10) {
      cleanPayload.comment = payload.comment.trim();
    }
    if (payload.images && payload.images.length > 0) {
      cleanPayload.images = payload.images;
    }

    const res = await fetch(`${API_BASE_URL}/api/v1/reviews/single`, {
      method: "POST",
      headers: getCommonHeaders(),
      credentials: "include",
      body: JSON.stringify(cleanPayload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to submit review");
    }

    return data.data;
  },

  submitBulkReviews: async (payload: BulkReviewPayload) => {
    const cleanPayload: BulkReviewPayload = {
      orderId: payload.orderId,
      products: payload.products.map((product) => {
        const cleanProduct: any = {
          productId: product.productId,
          rating: product.rating,
        };
        
        if (product.title && product.title.trim().length >= 5) {
          cleanProduct.title = product.title.trim();
        }
        
        if (product.comment && product.comment.trim().length >= 10) {
          cleanProduct.comment = product.comment.trim();
        }
        
        if (product.images && product.images.length > 0) {
          cleanProduct.images = product.images;
        }
        
        return cleanProduct;
      }),
    };

    const res = await fetch(`${API_BASE_URL}/api/v1/reviews/bulk`, {
      method: "POST",
      headers: getCommonHeaders(),
      credentials: "include",
      body: JSON.stringify(cleanPayload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to submit bulk reviews");
    }

    return data.data;
  },

  uploadImage: async (file: File): Promise<string> => {
    return uploadService.uploadImage(file);
  },
};
