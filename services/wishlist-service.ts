import { getDeviceId, getLocal, setLocal } from "@/lib/device-storage";
import { getCommonHeaders } from "@/lib/api-utils";
import { FALLBACK_IMAGE } from "@/constants";

export type WishlistItem = {
  id: string;
  productId: string;
  title: string;
  price: string;
  image: string;
};

export type Wishlist = {
  items: WishlistItem[];
};

export type ProductLike = {
  productId: string;
  title: string;
  price: string;
  image: string;
};

interface PopulatedProduct {
  _id: string;
  name: string;
  price: number;
  thumbnail?: string;
  images?: string[];
}

interface BackendWishlistItem {
  _id?: string;
  productId?: string | PopulatedProduct;
  product?: PopulatedProduct;
  thumbnail?: string;
  addedAt?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8018";

const storageKey = () => `wishlist:${getDeviceId()}`;

const getLocalWishlist = (): Wishlist => {
  return getLocal<Wishlist>(storageKey(), { items: [] });
};

const saveLocalWishlist = (wishlist: Wishlist): void => {
  setLocal(storageKey(), wishlist);
};

const transformBackendItem = (item: BackendWishlistItem): WishlistItem => {
  const populatedProduct =
    typeof item.productId === "object" && item.productId !== null
      ? item.productId
      : item.product;

  const productIdStr =
    typeof item.productId === "string"
      ? item.productId
      : populatedProduct?._id || item._id || "";

  return {
    id: item._id || productIdStr,
    productId: productIdStr,
    title: populatedProduct?.name || "",
    price: populatedProduct?.price
      ? `Rs. ${populatedProduct.price.toLocaleString("en-IN")}`
      : "",
    image:
      item.thumbnail ||
      populatedProduct?.thumbnail ||
      populatedProduct?.images?.[0] ||
      FALLBACK_IMAGE,
  };
};

export const getWishlist = async (): Promise<Wishlist> => {
  const deviceId = getDeviceId();

  if (!deviceId || deviceId === "server") {
    return getLocalWishlist();
  }

  try {
    const url = `${API_BASE_URL}/api/v1/wishlist`;
    const response = await fetch(url, {
      credentials: "include",
      headers: getCommonHeaders(),
    });

    if (!response.ok) {
      return getLocalWishlist();
    }

    const data = await response.json();
    const backendWishlist =
      data?.data?.wishlist ?? data?.data ?? data?.wishlist;

    if (backendWishlist?.items && Array.isArray(backendWishlist.items)) {
      const wishlist: Wishlist = {
        items: backendWishlist.items.map(transformBackendItem),
      };
      saveLocalWishlist(wishlist);
      return wishlist;
    }

    return getLocalWishlist();
  } catch {
    return getLocalWishlist();
  }
};
export const addWishlistItem = async (
  product: ProductLike
): Promise<Wishlist> => {
  const wishlist = getLocalWishlist();
  const exists = wishlist.items.some((i) => i.productId === product.productId);

  if (!exists) {
    wishlist.items.push({
      id: product.productId,
      productId: product.productId,
      title: product.title,
      price: product.price,
      image: product.image,
    });
    saveLocalWishlist(wishlist);
  }

  const deviceId = getDeviceId();
  if (deviceId && deviceId !== "server") {
    const url = `${API_BASE_URL}/api/v1/wishlist/items`;
    fetch(url, {
      method: "POST",
      headers: getCommonHeaders(),
      credentials: "include",
      body: JSON.stringify({ productId: product.productId }),
    }).catch((err) => console.error("Wishlist sync error", err));
  }

  return wishlist;
};
export const removeWishlistItem = async (
  productId: string
): Promise<Wishlist> => {
  const wishlist = getLocalWishlist();

  const initialLength = wishlist.items.length;
  wishlist.items = wishlist.items.filter(
    (i) => i.id !== productId && i.productId !== productId
  );

  if (wishlist.items.length !== initialLength) {
    saveLocalWishlist(wishlist);
  }
  const deviceId = getDeviceId();
  if (deviceId && deviceId !== "server") {
    const url = `${API_BASE_URL}/api/v1/wishlist/items`;
    fetch(url, {
      method: "POST",
      headers: getCommonHeaders(),
      credentials: "include",
      body: JSON.stringify({ productId }),
    }).catch((err) => console.error("Wishlist remove sync error", err));
  }

  return wishlist;
};

export const clearWishlist = async (): Promise<Wishlist> => {
  const empty: Wishlist = { items: [] };
  saveLocalWishlist(empty);

  const deviceId = getDeviceId();
  if (deviceId && deviceId !== "server") {
    const url = `${API_BASE_URL}/api/v1/wishlist`;
    fetch(url, {
      method: "DELETE",
      headers: getCommonHeaders(),
      credentials: "include",
    }).catch(() => {});
  }

  return empty;
};

export const isProductInWishlist = (productId: string): boolean => {
  const wishlist = getLocalWishlist();
  return wishlist.items.some((i) => i.productId === productId);
};

export const syncWishlistOnLogin = async (): Promise<Wishlist> => {
  const localWishlist = getLocalWishlist();
  if (localWishlist.items.length > 0) {
    for (const item of localWishlist.items) {
      try {
        const url = `${API_BASE_URL}/api/v1/wishlist/items`;
        await fetch(url, {
          method: "POST",
          headers: getCommonHeaders(),
          credentials: "include",
          body: JSON.stringify({ productId: item.productId }),
        });
      } catch {}
    }
  }

  return getWishlist();
};
