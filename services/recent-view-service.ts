import { getCommonHeaders, formatPrice } from "@/lib/api-utils";
import { getDeviceId, getLocal, setLocal } from "@/lib/device-storage";
import { FALLBACK_IMAGE } from "@/constants";

export interface RecentViewProduct {
  id: string;
  title: string;
  price: string;
  priceNumber: number;
  image: string;
  slug?: string;
  oldPrice?: string;
  tag?: { label: string; variant: "primary" | "secondary" };
}

interface BackendProductData {
  _id: string;
  name: string;
  price: number;
  mrp?: number;
  thumbnail?: string;
  images?: string[];
  slug?: string;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
}

interface BackendRecentView {
  _id: string;
  product?: BackendProductData;
  productId?: BackendProductData;
  viewedAt: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8018";

const transformRecentView = (
  item: BackendRecentView,
): RecentViewProduct | null => {
  const p = item.product || item.productId;

  if (!p) return null;

  return {
    id: p._id,
    title: p.name,
    price: formatPrice(p.price),
    priceNumber: p.price,
    image: p.thumbnail || p.images?.[0] || FALLBACK_IMAGE,
    slug: p.slug,
    oldPrice: p.mrp && p.mrp > p.price ? formatPrice(p.mrp) : undefined,
    tag: p.isNewArrival
      ? { label: "New", variant: "secondary" }
      : p.isBestSeller
        ? { label: "Best Seller", variant: "primary" }
        : undefined,
  };
};

export const fetchRecentViews = async (): Promise<RecentViewProduct[]> => {
  const deviceId = getDeviceId();
  const url = `${API_BASE_URL}/api/v1/recent-views?limit=5`;

  try {
    const response = await fetch(url, {
      credentials: "include",
      headers: {
        ...getCommonHeaders(),
        "X-Device-Id": deviceId || "",
      },
    });

    if (!response.ok) return [];

    const data = await response.json();
    const items: BackendRecentView[] = data?.data?.items ?? data?.data ?? [];

    return items
      .map(transformRecentView)
      .filter((item): item is RecentViewProduct => item !== null);
  } catch {
    return [];
  }
};

export const trackProductView = async (productId: string): Promise<void> => {
  const deviceId = getDeviceId();
  const url = `${API_BASE_URL}/api/v1/recent-views/track`;

  try {
    await fetch(url, {
      method: "POST",
      headers: {
        ...getCommonHeaders(),
        "X-Device-Id": deviceId || "",
      },
      credentials: "include",
      body: JSON.stringify({
        productId,
      }),
    });
  } catch (error) {
    console.error("Error tracking view:", error);
  }
};

export const clearRecentViews = async (): Promise<void> => {
  const deviceId = getDeviceId();
  const url = `${API_BASE_URL}/api/v1/recent-views`;

  try {
    await fetch(url, {
      method: "DELETE",
      headers: {
        ...getCommonHeaders(),
        "X-Device-Id": deviceId || "",
      },
      credentials: "include",
    });
  } catch {}
};
