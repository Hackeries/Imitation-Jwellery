// services/cart-service.ts

// cart item used in frontend
export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

// cart shape used in frontend
export interface Cart {
  items: CartItem[];
  total: number;
}

// backend cart item shape
interface BackendCartItem {
  _id: string;
  productId:
    | {
        _id: string;
        name: string;
        price: number;
        thumbnail?: string;
        images?: string[];
      }
    | string;
  qty: number;
  unitPrice: number;
  thumbnail?: string;
}

// backend cart response
interface BackendCart {
  _id: string;
  deviceId: string;
  items: BackendCartItem[];
  subtotalAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  status: string;
}

// api base url
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8018";

// get or create device id
const getDeviceId = (): string => {
  const key = "deviceId";

  if (typeof window === "undefined") return "server";

  let id = localStorage.getItem(key);

  if (!id) {
    id = `device-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
    try {
      localStorage.setItem(key, id);
    } catch {
      // ignore storage error
    }
  }

  return id;
};

// convert backend item to frontend item
const transformCartItem = (backendItem: BackendCartItem): CartItem => {
  const product =
    typeof backendItem.productId === "object" ? backendItem.productId : null;

  let imageUrl = "/img/placeholder.webp";

  if (product?.thumbnail) {
    imageUrl = product.thumbnail;
  } else if (backendItem.thumbnail) {
    imageUrl = backendItem.thumbnail;
  } else if (product?.images?.length) {
    imageUrl = product.images[0];
  }

  return {
    id: backendItem._id,
    productId:
      product?._id ??
      (typeof backendItem.productId === "string" ? backendItem.productId : ""),
    name: product?.name ?? "Product",
    price:
      typeof backendItem.unitPrice === "number"
        ? backendItem.unitPrice
        : product?.price ?? 0,
    quantity: typeof backendItem.qty === "number" ? backendItem.qty : 1,
    image: imageUrl,
  };
};

// calculate cart total
const calculateTotal = (items: CartItem[]): number =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0);

// fetch cart for device
export const fetchCart = async (): Promise<Cart> => {
  const deviceId = getDeviceId();

  // skip fetch on server
  if (deviceId === "server") {
    return { items: [], total: 0 };
  }

  const url = `${API_BASE_URL}/api/v1/cart/${deviceId}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        return { items: [], total: 0 };
      }
      throw new Error("Failed to fetch cart");
    }

    const responseData = await response.json();

    const backendCart: BackendCart | null =
      responseData?.data?.cart || responseData?.data || null;

    if (!backendCart || !Array.isArray(backendCart.items)) {
      return { items: [], total: 0 };
    }

    const items = backendCart.items.map(transformCartItem);

    return {
      items,
      total: backendCart.totalAmount || calculateTotal(items),
    };
  } catch (error) {
    console.error("Error fetching cart", error);
    return { items: [], total: 0 };
  }
};

// add item to cart
export const addToCart = async (
  productId: string,
  name: string,
  price: number,
  image: string,
  quantity = 1
): Promise<Cart> => {
  const deviceId = getDeviceId();
  const url = `${API_BASE_URL}/api/v1/cart/items`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      deviceId,
      productId,
      qty: quantity || 1,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to add to cart");
  }

  const responseData = await response.json();

  const backendCart: BackendCart | null =
    responseData?.data?.cart || responseData?.data || null;

  if (!backendCart || !Array.isArray(backendCart.items)) {
    return {
      items: [
        {
          id: productId,
          productId,
          name,
          price,
          quantity: quantity || 1,
          image,
        },
      ],
      total: price * (quantity || 1),
    };
  }

  const items = backendCart.items.map(transformCartItem);

  return {
    items,
    total: backendCart.totalAmount || calculateTotal(items),
  };
};

// remove item from cart
export const removeFromCart = async (cartItemId: string): Promise<Cart> => {
  const deviceId = getDeviceId();
  const url = `${API_BASE_URL}/api/v1/cart/items/${cartItemId}?deviceId=${deviceId}`;

  const response = await fetch(url, { method: "DELETE" });

  if (!response.ok) {
    throw new Error("Failed to remove from cart");
  }

  return fetchCart();
};

// update cart item quantity
export const updateCartQuantity = async (
  cartItemId: string,
  quantity: number
): Promise<Cart> => {
  const deviceId = getDeviceId();

  // remove item if quantity is zero
  if (quantity <= 0) {
    return removeFromCart(cartItemId);
  }

  const url = `${API_BASE_URL}/api/v1/cart/items/${cartItemId}`;

  const response = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      deviceId,
      qty: quantity,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to update cart");
  }

  const responseData = await response.json();

  const backendCart: BackendCart | null =
    responseData?.data?.cart || responseData?.data || null;

  if (!backendCart || !Array.isArray(backendCart.items)) {
    return fetchCart();
  }

  const items = backendCart.items.map(transformCartItem);

  return {
    items,
    total: backendCart.totalAmount || calculateTotal(items),
  };
};

// clear full cart
export const clearCart = async (): Promise<Cart> => {
  const deviceId = getDeviceId();
  const url = `${API_BASE_URL}/api/v1/cart?deviceId=${deviceId}`;

  try {
    await fetch(url, { method: "DELETE" });
  } catch {
    // ignore clear error
  }

  return { items: [], total: 0 };
};
