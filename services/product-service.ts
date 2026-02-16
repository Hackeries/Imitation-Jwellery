import { getCategoryIdBySlug } from "./category-service";
import { getCommonHeaders, formatPrice } from "@/lib/api-utils";
import { FALLBACK_IMAGE } from "@/constants";
import {
  Product,
  ProductListResponse,
  ProductFilters,
  BackendProduct,
} from "@/types/index";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8018";

const transformProduct = (p: BackendProduct): Product => {
  const priceNumber = Number(p.price) || 0;
  const image =
    p.thumbnail ||
    (p.images && p.images.length > 0 ? p.images[0] : FALLBACK_IMAGE);
  const stockQty = Number(p.stockQty) || 0;

  const product: Product = {
    id: p._id,
    title: p.name,
    description: p.description,
    price: formatPrice(priceNumber),
    image,
    images: p.images || [],
    priceNumber,
    createdAtMs: p.createdAt ? new Date(p.createdAt).getTime() : 0,
    isNewArrival: Boolean(p.isNewArrival),
    isBestSeller: Boolean(p.isBestSeller),
    stockQty,
    availability: stockQty > 0 ? "In Stock" : "Out of Stock",
    sku: p.sku,
    vendor: p.vendor,
    type: p.type,
    detailDescription: p.detailDescription,
  };

  if (p.mrp && p.mrp > priceNumber) {
    product.oldPrice = formatPrice(p.mrp);
  }

  if (p.isNewArrival) {
    product.tag = { label: "New Arrival", variant: "primary" };
  } else if (p.isBestSeller) {
    product.tag = { label: "Best Seller", variant: "secondary" };
  }

  return product;
};

export const fetchProducts = async (
  filters: ProductFilters = {},
): Promise<ProductListResponse> => {
  const emptyResponse: ProductListResponse = {
    data: [],
    meta: { totalItems: 0, totalPages: 0, currentPage: 1 },
  };

  try {
    const params = new URLSearchParams();

    if (filters.categorySlug && !filters.categoryId) {
      const slugs = Array.isArray(filters.categorySlug)
        ? filters.categorySlug
        : filters.categorySlug.split(",").map((s) => s.trim());

      const categoryIds = await Promise.all(
        slugs.map((slug) => getCategoryIdBySlug(slug)),
      );
      const validIds = categoryIds.filter((id): id is string => id !== null);

      if (validIds.length > 0) {
        params.append("categoryId", validIds.join(","));
      } else {
        return emptyResponse;
      }
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (key === "categorySlug") return;

      if (key === "sort") {
        let backendSortValue = String(value);
        
        if (value === "az") backendSortValue = "name-asc";
        else if (value === "za") backendSortValue = "name-desc";
        else if (value === "date-asc" || value === "date-desc") backendSortValue = "created";

        params.append("sortBy", backendSortValue);
        return;
      }

      if (Array.isArray(value)) {
        if (value.length > 0) params.append(key, value.join(","));
      } else {
        params.append(key, String(value));
      }
    });

    const page = filters.page || 1;
    const limit = filters.limit || 20;

    if (!params.has("page")) params.append("page", String(page));
    if (!params.has("limit")) params.append("limit", String(limit));

    const url = `${API_BASE_URL}/api/v1/products?${params.toString()}`;

    const res = await fetch(url, {
      headers: getCommonHeaders(),
      cache: "no-store",
    });

    if (!res.ok) {
      return emptyResponse;
    }

    const json = await res.json();
    let items: BackendProduct[] = json?.data?.items ?? [];

    if (filters.inStock !== undefined) {
      items = items.filter((item) => {
        const stockQty = Number(item.stockQty) || 0;
        return filters.inStock ? stockQty > 0 : stockQty <= 0;
      });
    }

    const meta = json?.data?.meta || {};

    return {
      data: items.map(transformProduct),
      meta: {
        totalItems: meta.totalItems || items.length,
        totalPages:
          meta.totalPages ||
          Math.ceil((meta.totalItems || items.length) / limit),
        currentPage: meta.currentPage || page,
      },
    };
  } catch {
    return emptyResponse;
  }
};

export const fetchNewArrivals = async (limit = 10): Promise<Product[]> => {
  const response = await fetchProducts({
    isNewArrival: true,
    limit,
    sort: "newest",
  });
  return response.data;
};

export const fetchBestSellers = async (limit = 10): Promise<Product[]> => {
  const response = await fetchProducts({ isBestSeller: true, limit });
  return response.data;
};

export const searchProducts = async (
  query: string,
  limit = 20,
): Promise<Product[]> => {
  const response = await fetchProducts({ search: query, limit });
  return response.data;
};

export const fetchProductById = async (
  productId: string,
): Promise<Product | null> => {
  try {
    const url = `${API_BASE_URL}/api/v1/products/${productId}`;

    const res = await fetch(url, {
      headers: getCommonHeaders(),
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    const json = await res.json();
    const backendProduct: BackendProduct = json?.data?.product ?? json?.data;

    if (!backendProduct || !backendProduct._id) {
      return null;
    }

    return transformProduct(backendProduct);
  } catch {
    return null;
  }
};
