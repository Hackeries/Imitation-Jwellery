import { getDeviceId } from "@/lib/device-storage";
import { getCommonHeaders } from "@/lib/api-utils";
import { FALLBACK_IMAGE } from "@/constants";

export interface RecommendedProduct {
  id: string;
  title: string;
  price: string;
  priceNumber: number;
  image: string;
  reason?: string;
  oldPrice?: string;
  tag?: { label: string; variant: "primary" | "secondary" };
}

interface BackendProduct {
  _id: string;
  name: string;
  description?: string;
  images?: string[];
  thumbnail?: string;
  price: number;
  mrp?: number;
  stockQty: number;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  categoryId?: string[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8018";

const transformProduct = (
  p: BackendProduct,
  reason?: string,
): RecommendedProduct => ({
  id: p._id,
  title: p.name,
  price: `Rs. ${p.price?.toLocaleString("en-IN") || "0"}`,
  priceNumber: p.price || 0,
  image: p.thumbnail || p.images?.[0] || FALLBACK_IMAGE,
  reason,
  oldPrice:
    p.mrp && p.mrp > p.price
      ? `Rs. ${p.mrp.toLocaleString("en-IN")}`
      : undefined,
  tag: p.isNewArrival
    ? { label: "New", variant: "secondary" }
    : p.isBestSeller
      ? { label: "Best Seller", variant: "primary" }
      : undefined,
});

export const fetchYouMayAlsoLike = async (
  limit = 5,
): Promise<RecommendedProduct[]> => {
  const url = `${API_BASE_URL}/api/v1/products/you-may-also-like?limit=${limit}`;

  try {
    const response = await fetch(url, {
      credentials: "include",
      headers: getCommonHeaders(),
    });

    if (!response.ok) return [];

    const data = await response.json();
    const items: BackendProduct[] = data?.data?.items ?? data?.data ?? [];

    return items.map((p) => transformProduct(p, "You May Also Like"));
  } catch {
    return [];
  }
};

export const fetchRecommendations = async (
  _productId?: string,
  limit = 6,
): Promise<RecommendedProduct[]> => {
  const url = `${API_BASE_URL}/api/v1/products?isBestSeller=true&limit=${limit}`;

  try {
    const response = await fetch(url, {
      credentials: "include",
      headers: getCommonHeaders(),
    });

    if (!response.ok) return [];

    const data = await response.json();
    const items: BackendProduct[] = data?.data?.items ?? [];

    return items.map((p) => transformProduct(p, "Best Seller"));
  } catch {
    return [];
  }
};

export const fetchSimilarProducts = async (
  productId: string,
  limit = 4,
): Promise<RecommendedProduct[]> => {
  try {
    const productUrl = `${API_BASE_URL}/api/v1/products/${productId}`;
    const productRes = await fetch(productUrl, { headers: getCommonHeaders() });

    if (!productRes.ok) return [];

    const productData = await productRes.json();
    const product: BackendProduct | null =
      productData?.data?.product ?? productData?.data ?? null;

    if (!product) return [];

    const categoryIds = product.categoryId;
    if (!categoryIds || categoryIds.length === 0) {
      return fetchRecommendations(productId, limit);
    }

    const categoryIdParam = Array.isArray(categoryIds)
      ? categoryIds.join(",")
      : categoryIds;

    const similarUrl = `${API_BASE_URL}/api/v1/products?categoryId=${categoryIdParam}&limit=${
      limit + 1
    }`;
    const response = await fetch(similarUrl, { headers: getCommonHeaders() });

    if (!response.ok) return [];

    const data = await response.json();
    const items: BackendProduct[] = data?.data?.items ?? [];

    const filteredItems = items
      .filter((p) => p._id !== productId)
      .slice(0, limit);

    return filteredItems.map((p) => transformProduct(p, "Similar Product"));
  } catch {
    return [];
  }
};

export const trackAddToCart = async (productId: string): Promise<void> => {
  const deviceId = getDeviceId();
  const url = `${API_BASE_URL}/api/v1/recommendation-events`;

  try {
    await fetch(url, {
      method: "POST",
      headers: {
        ...getCommonHeaders(),
        "X-Device-Id": deviceId || "",
      },
      credentials: "include",
      body: JSON.stringify({
        deviceId,
        productId,
        type: "add_to_cart",
      }),
    });
  } catch {}
};

export const trackPurchase = async (productIds: string[]): Promise<void> => {
  const deviceId = getDeviceId();
  const url = `${API_BASE_URL}/api/v1/recommendation-events`;

  for (const productId of productIds) {
    try {
      await fetch(url, {
        method: "POST",
        headers: {
          ...getCommonHeaders(),
          "X-Device-Id": deviceId || "",
        },
        credentials: "include",
        body: JSON.stringify({
          deviceId,
          productId,
          type: "purchase",
        }),
      });
    } catch {}
  }
};

export const fetchNewArrivals = async (
  limit = 6,
): Promise<RecommendedProduct[]> => {
  const url = `${API_BASE_URL}/api/v1/products?isNewArrival=true&limit=${limit}`;

  try {
    const response = await fetch(url, { headers: getCommonHeaders() });

    if (!response.ok) return [];

    const data = await response.json();
    const items: BackendProduct[] = data?.data?.items ?? [];

    return items.map((p) => transformProduct(p, "New Arrival"));
  } catch {
    return [];
  }
};
