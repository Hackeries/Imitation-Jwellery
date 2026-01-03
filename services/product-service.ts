// services/product-service.ts

import { getCategoryIdBySlug } from "./category-service";

// product shape used in frontend
export interface Product {
  id: string;
  title: string;
  price: string;
  oldPrice?: string;
  image: string;
  priceNumber: number;
  createdAtMs: number;
  isNewArrival: boolean;
  isBestSeller: boolean;
  stockQty: number;
  tag?: {
    label: string;
    variant: "primary" | "secondary";
  };
}

// api response shape
export interface ProductListResponse {
  data: Product[];
  meta: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
  };
}

// filters accepted by api
export interface ProductFilters {
  search?: string;
  categoryId?: string | string[];
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  page?: number;
  limit?: number;
}

// backend product shape
interface BackendProduct {
  _id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  thumbnail: string;
  price: number;
  mrp: number;
  currency: string;
  stockQty: number;
  isActive: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  tags?: string[];
  createdAt?: string;
}

// api base url
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8018";

// convert number to rupee format
const formatPrice = (price: number): string => {
  return `Rs. ${price.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// convert backend product to frontend product
const transformProduct = (backendProduct: BackendProduct): Product => {
  const priceNumber = Number(backendProduct.price) || 0;

  const createdAtMs = backendProduct.createdAt
    ? new Date(backendProduct.createdAt).getTime()
    : 0;

  let imageUrl = "/img/placeholder.webp";

  if (backendProduct.thumbnail) {
    imageUrl = backendProduct.thumbnail;
  } else if (backendProduct.images && backendProduct.images.length > 0) {
    imageUrl = backendProduct.images[0];
  }

  const product: Product = {
    id: backendProduct._id,
    title: backendProduct.name,
    price: formatPrice(priceNumber),
    image: imageUrl,
    priceNumber,
    createdAtMs,
    isNewArrival: Boolean(backendProduct.isNewArrival),
    isBestSeller: Boolean(backendProduct.isBestSeller),
    stockQty: Number(backendProduct.stockQty) || 0,
  };

  // show old price if mrp is higher
  if (backendProduct.mrp && backendProduct.mrp > priceNumber) {
    product.oldPrice = formatPrice(backendProduct.mrp);
  }

  // set badge tag
  if (backendProduct.isNewArrival) {
    product.tag = { label: "New Arrival", variant: "primary" };
  } else if (backendProduct.isBestSeller) {
    product.tag = { label: "Best Seller", variant: "secondary" };
  }

  return product;
};

// fetch products list
export const fetchProducts = async (
  filters: ProductFilters = {}
): Promise<ProductListResponse> => {
  const params = new URLSearchParams();

  let resolvedCategoryId = filters.categoryId;

  // resolve category id from slug
  if (filters.categorySlug && !filters.categoryId) {
    const categoryId = await getCategoryIdBySlug(filters.categorySlug);

    if (categoryId) {
      resolvedCategoryId = categoryId;
    } else {
      return {
        data: [],
        meta: {
          totalItems: 0,
          totalPages: 0,
          currentPage: 1,
        },
      };
    }
  }

  // apply filters
  if (filters.search) {
    params.append("search", String(filters.search));
  }

  if (resolvedCategoryId) {
    const ids = Array.isArray(resolvedCategoryId)
      ? resolvedCategoryId.join(",")
      : String(resolvedCategoryId);

    params.append("categoryId", ids);
  }

  if (filters.minPrice !== undefined) {
    params.append("minPrice", String(filters.minPrice));
  }

  if (filters.maxPrice !== undefined) {
    params.append("maxPrice", String(filters.maxPrice));
  }

  if (filters.isNewArrival !== undefined) {
    params.append("isNewArrival", String(filters.isNewArrival));
  }

  if (filters.isBestSeller !== undefined) {
    params.append("isBestSeller", String(filters.isBestSeller));
  }

  if (filters.page) {
    params.append("page", String(filters.page));
  }

  if (filters.limit) {
    params.append("limit", String(filters.limit));
  }

  const queryString = params.toString();

  const url = queryString
    ? `${API_BASE_URL}/api/v1/products?${queryString}`
    : `${API_BASE_URL}/api/v1/products`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  const responseData = await response.json();

  let backendProducts: BackendProduct[] = [];
  let pagination = {
    page: filters.page || 1,
    limit: filters.limit || 20,
    total: 0,
  };

  // handle different api response shapes
  if (
    responseData.data &&
    responseData.data.items &&
    Array.isArray(responseData.data.items)
  ) {
    backendProducts = responseData.data.items;
    pagination = responseData.data.pagination || pagination;
  } else if (responseData.data && Array.isArray(responseData.data)) {
    backendProducts = responseData.data;
  } else if (responseData.items && Array.isArray(responseData.items)) {
    backendProducts = responseData.items;
    pagination = responseData.pagination || pagination;
  } else if (Array.isArray(responseData)) {
    backendProducts = responseData;
  }

  const products = backendProducts.map(transformProduct);

  const totalItems = pagination.total || products.length;

  const limitValue = pagination.limit || 20;

  const totalPages = Math.ceil(totalItems / limitValue);

  const currentPage = pagination.page || 1;

  return {
    data: products,
    meta: {
      totalItems,
      totalPages,
      currentPage,
    },
  };
};
