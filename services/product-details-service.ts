// services/product-detail-service.ts

// frontend product detail shape
export interface ProductDetail {
  id: string;
  title: string;
  price: string;
  oldPrice?: string;
  description: string;
  image: string;
  images: string[];
  vendor: string;
  type: string;
  sku: string;
  availability: "Available" | "Out of Stock";
  tag?: {
    label: string;
    variant: "primary" | "secondary";
  };
}

// backend product shape
interface BackendProductDetail {
  _id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  thumbnail: string;
  categoryId: string[];
  price: number;
  mrp: number;
  currency: string;
  stockQty: number;
  isActive: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  tags?: string[];
}

// api base url
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8018";

import { formatPrice } from "@/lib/api-utils";

// convert backend product to frontend product
const transformProductDetail = (
  backendProduct: BackendProductDetail
): ProductDetail => {
  const product: ProductDetail = {
    id: backendProduct._id,
    title: backendProduct.name,
    price: formatPrice(backendProduct.price),
    description: backendProduct.description || "",
    image:
      backendProduct.thumbnail ||
      backendProduct.images?.[0] ||
      "/img/placeholder.webp",
    images:
      Array.isArray(backendProduct.images) && backendProduct.images.length > 0
        ? backendProduct.images
        : [backendProduct.thumbnail || "/img/placeholder.webp"],
    vendor: "Privora",
    type: "Jewelry",
    sku: backendProduct.sku || "",
    availability: backendProduct.stockQty > 0 ? "Available" : "Out of Stock",
  };

  // show old price if mrp is higher
  if (backendProduct.mrp && backendProduct.mrp > backendProduct.price) {
    product.oldPrice = formatPrice(backendProduct.mrp);
  }

  // show tag on product card
  if (backendProduct.isNewArrival) {
    product.tag = { label: "New Arrival", variant: "primary" };
  } else if (backendProduct.isBestSeller) {
    product.tag = { label: "Best Seller", variant: "secondary" };
  }

  return product;
};

// fetch single product details
export const fetchProductDetail = async (
  productId: string
): Promise<ProductDetail> => {
  if (!productId || productId === "undefined") {
    throw new Error("Invalid product id");
  }
  const url = `${API_BASE_URL}/api/v1/products/${productId}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch product details");
  }

  const responseData = await response.json();

  let backendProduct: BackendProductDetail | null = null;

  // handle different api response shapes
  if (responseData.data?.product) {
    backendProduct = responseData.data.product;
  } else if (responseData.data && responseData.data._id) {
    backendProduct = responseData.data;
  } else if (responseData.product) {
    backendProduct = responseData.product;
  } else if (responseData._id) {
    backendProduct = responseData;
  }

  if (!backendProduct) {
    throw new Error("Product not found");
  }

  return transformProductDetail(backendProduct);
};
