import { getDeviceId, getLocal, setLocal } from "@/lib/device-storage";
import { getCommonHeaders } from "@/lib/api-utils";
import { API_BASE_URL, FALLBACK_IMAGE } from "@/constants";
import { Cart, BackendCartResponse } from "@/types/index";
import { handleFetchError, NetworkError } from "@/lib/error-handler";

const transformCart = (data: unknown): Cart | null => {
  if (!data || typeof data !== "object") return null;

  const cartData =
    (data as { cart?: BackendCartResponse }).cart ||
    (data as BackendCartResponse);

  if (!cartData || !Array.isArray(cartData.items)) return null;

  return {
    _id: cartData._id,
    status: cartData.status,
    subtotalAmount: cartData.subtotalAmount || 0,
    discountAmount: cartData.discountAmount || 0,
    shippingAmount: cartData.shippingAmount || 0,
    totalAmount: cartData.totalAmount || 0,
    id: cartData._id,
    total: cartData.totalAmount || 0,
    items: cartData.items.map((item) => {
      const product =
        typeof item.productId === "object" ? item.productId : null;
      const pid = product?._id || (item.productId as string);

      return {
        _id: item._id,
        id: item._id,
        productId: pid,
        name: product?.name || item.name || "Product",
        image: product?.thumbnail || item.image || FALLBACK_IMAGE,
        price: item.price ?? item.unitPrice ?? 0,
        unitPrice: item.unitPrice ?? item.price ?? 0,
        qty: item.qty ?? item.quantity ?? 1,
        quantity: item.qty ?? item.quantity ?? 1,
        packId: item.packId,
      };
    }),
  };
};

export const fetchCart = async (): Promise<Cart | null> => {
  const deviceId = getDeviceId();
  const url = `${API_BASE_URL}/api/v1/cart/device`;

  try {
    const data = await handleFetchError<{ data: BackendCartResponse }>(
      () =>
        fetch(url, {
          headers: {
            ...getCommonHeaders(),
            "X-Device-Id": deviceId || "",
          },
          credentials: "include",
          cache: "no-store",
        }),
      "Failed to fetch cart",
    );
    return transformCart(data?.data);
  } catch (error) {
    if (error instanceof NetworkError) {
      console.error("Network error fetching cart:", error.message);
      throw error;
    }
    console.error("Fetch cart error:", error);
    return null;
  }
};

export const addToCart = async (
  productId: string,
  quantity: number,
): Promise<Cart | null> => {
  const deviceId = getDeviceId();
  const url = `${API_BASE_URL}/api/v1/cart/items`;

  try {
    const data = await handleFetchError<{ data: BackendCartResponse }>(
      () =>
        fetch(url, {
          method: "POST",
          headers: {
            ...getCommonHeaders(),
            "X-Device-Id": deviceId || "",
          },
          credentials: "include",
          body: JSON.stringify({
            productId,
            qty: quantity,
          }),
        }),
      "Failed to add to cart",
    );
    return transformCart(data?.data);
  } catch (error) {
    if (error instanceof NetworkError) {
      console.error("Network error adding to cart:", error.message);
    }
    throw error;
  }
};

export const removeFromCart = async (
  productId: string,
): Promise<Cart | null> => {
  const deviceId = getDeviceId();
  const url = `${API_BASE_URL}/api/v1/cart/items/${productId}`;

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        ...getCommonHeaders(),
        "X-Device-Id": deviceId || "",
      },
      credentials: "include",
    });
    if (!response.ok && response.status === 0) {
      throw new NetworkError(
        "Cannot connect to the server. Please check your internet connection.",
        undefined,
        true,
      );
    }

    if (response.status === 204) {
      return null;
    }

    if (!response.ok) {
      throw new NetworkError(
        "Failed to remove from cart",
        response.status,
      );
    }

    const data = await response.json();
    return transformCart(data?.data);
  } catch (error) {
    if (error instanceof NetworkError) {
      console.error("Network error removing from cart:", error.message);
    }
    throw error;
  }
};

export const updateCartItemQuantity = async (
  productId: string,
  quantity: number,
): Promise<Cart | null> => {
  const deviceId = getDeviceId();
  const url = `${API_BASE_URL}/api/v1/cart/items/${productId}`;

  try {
    const data = await handleFetchError<{ data: BackendCartResponse }>(
      () =>
        fetch(url, {
          method: "PUT",
          headers: {
            ...getCommonHeaders(),
            "X-Device-Id": deviceId || "",
          },
          credentials: "include",
          body: JSON.stringify({
            qty: quantity,
          }),
        }),
      "Failed to update cart quantity",
    );
    return transformCart(data?.data);
  } catch (error) {
    if (error instanceof NetworkError) {
      console.error("Network error updating cart:", error.message);
    }
    throw error;
  }
};
