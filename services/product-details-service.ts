import { formatPrice, getCommonHeaders } from "@/lib/api-utils";
import { FALLBACK_IMAGE } from "@/constants";

export interface ProductDetail {
  id: string;
  title: string;
  price: string;
  priceNumber: number;
  oldPrice?: string;
  description: string;
  image: string;
  images: string[];
  vendor: string;
  type: string;
  sku: string;
  availability: "Available" | "Out of Stock";
  stockQty: number;
  tag?: {
    label: string;
    variant: "primary" | "secondary";
  };
}

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8018";

const transformProductDetail = (
  backendProduct: BackendProductDetail
): ProductDetail => {
  const product: ProductDetail = {
    id: backendProduct._id,
    title: backendProduct.name,
    price: formatPrice(backendProduct.price),
    priceNumber: backendProduct.price,
    description: backendProduct.description || "",
    image:
      backendProduct.thumbnail ||
      backendProduct.images?.[0] ||
      FALLBACK_IMAGE,
    images:
      Array.isArray(backendProduct.images) && backendProduct.images.length > 0
        ? backendProduct.images
        : [backendProduct.thumbnail || FALLBACK_IMAGE],
    vendor: "Privora",
    type: "Jewelry",
    sku: backendProduct.sku || "",
    availability: backendProduct.stockQty > 0 ? "Available" : "Out of Stock",
    stockQty: backendProduct.stockQty || 0,
  };

  if (backendProduct.mrp && backendProduct.mrp > backendProduct.price) {
    product.oldPrice = formatPrice(backendProduct.mrp);
  }

  if (backendProduct.isNewArrival) {
    product.tag = { label: "New Arrival", variant: "primary" };
  } else if (backendProduct.isBestSeller) {
    product.tag = { label: "Best Seller", variant: "secondary" };
  }

  return product;
};

export const fetchProductDetail = async (
  productId: string
): Promise<ProductDetail> => {
  if (!productId || productId === "undefined") {
    throw new Error("Invalid product id");
  }

  const url = `${API_BASE_URL}/api/v1/products/${productId}`;

  const response = await fetch(url, {
    headers: getCommonHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch product details");
  }

  const responseData = await response.json();

  let backendProduct: BackendProductDetail | null = null;

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
