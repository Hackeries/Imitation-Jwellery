import { getDeviceId } from "@/lib/device-storage";
import { getCommonHeaders } from "@/lib/api-utils";
import { FALLBACK_IMAGE } from "@/constants";

export interface SearchResult {
  id: string;
  title: string;
  price: string;
  priceNumber: number;
  image: string;
  type: "product" | "category" | "collection";
}

export interface SearchResponse {
  products: SearchResult[];
  categories: { id: string; title: string; slug: string }[];
  totalResults: number;
}

interface BackendProduct {
  _id: string;
  name: string;
  price: number;
  thumbnail?: string;
  images?: string[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8018";

export const searchProducts = async (
  query: string,
  limit = 10
): Promise<SearchResult[]> => {
  if (!query.trim()) return [];

  const url = `${API_BASE_URL}/api/v1/products?search=${encodeURIComponent(
    query
  )}&limit=${limit}`;

  try {
    const response = await fetch(url, { headers: getCommonHeaders() });

    if (!response.ok) return [];

    const data = await response.json();
    const items = data?.data?.items ?? [];

    return items.map((p: BackendProduct) => ({
      id: p._id,
      title: p.name,
      price: `Rs. ${p.price?.toLocaleString("en-IN") || "0"}`,
      priceNumber: p.price || 0,
      image: p.thumbnail || p.images?.[0] || FALLBACK_IMAGE,
      type: "product" as const,
    }));
  } catch {
    return [];
  }
};

export const searchAll = async (query: string): Promise<SearchResponse> => {
  const emptyResponse: SearchResponse = {
    products: [],
    categories: [],
    totalResults: 0,
  };

  if (!query.trim()) return emptyResponse;

  try {
    const headers = getCommonHeaders();
    const q = encodeURIComponent(query);

    const [productsRes, categoriesRes] = await Promise.allSettled([
      fetch(`${API_BASE_URL}/api/v1/products?search=${q}&limit=10`, {
        headers,
      }),
      fetch(
        `${API_BASE_URL}/api/v1/product-categories?isActive=true&type=category`,
        { headers }
      ),
    ]);

    let products: SearchResult[] = [];
    if (productsRes.status === "fulfilled" && productsRes.value.ok) {
      const data = await productsRes.value.json();
      const items = data?.data?.items ?? [];
      products = items.map((p: BackendProduct) => ({
        id: p._id,
        title: p.name,
        price: `Rs. ${p.price?.toLocaleString("en-IN") || "0"}`,
        priceNumber: p.price || 0,
        image: p.thumbnail || p.images?.[0] || FALLBACK_IMAGE,
        type: "product" as const,
      }));
    }

    let categories: { id: string; title: string; slug: string }[] = [];
    if (categoriesRes.status === "fulfilled" && categoriesRes.value.ok) {
      const catData = await categoriesRes.value.json();
      const catItems = catData?.data?.items ?? [];
      categories = catItems
        .filter((c: { title: string }) =>
          c.title.toLowerCase().includes(query.toLowerCase())
        )
        .map((c: { _id: string; title: string; slug: string }) => ({
          id: c._id,
          title: c.title,
          slug: c.slug,
        }));
    }

    return {
      products,
      categories,
      totalResults: products.length + categories.length,
    };
  } catch {
    return emptyResponse;
  }
};
