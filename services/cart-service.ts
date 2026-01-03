// services/cart-service.ts

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image:  string;
}

export interface Cart {
  items: CartItem[];
  total:  number;
}

interface BackendCartItem {
  _id: string;
  productId: 
    | {
        _id: string;
        name: string;
        price: number;
        thumbnail?:  string;
        images?: string[];
      }
    | string;
  qty: number;
  unitPrice: number;
  thumbnail?: string;
}

interface BackendCart {
  _id: string;
  deviceId: string;
  items: BackendCartItem[];
  subtotalAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount:  number;
  currency: string;
  status: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8018";

const getDeviceId = (): string => {
  const key = "deviceId";
  if (typeof window === "undefined") return "server";

  let id = localStorage.getItem(key);
  if (!id) {
    id = `device-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
    try {
      localStorage. setItem(key, id);
    } catch {
      // localStorage not available
    }
  }
  return id;
};

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


const calculateTotal = (items:  CartItem[]): number =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0);

/**
 * Fetch cart for current device
 */
export const fetchCart = async (): Promise<Cart> => {
  const deviceId = getDeviceId();

  if (deviceId === "server") {
    return { items: [], total:  0 };
  }

  const url = `${API_BASE_URL}/api/v1/cart/${deviceId}`;

  try {
    const response = await fetch(url);

    if (!response. ok) {
      if (response.status === 404) {
        return { items:  [], total: 0 };
      }
      throw new Error(`Failed to fetch cart: ${response.status}`);
    }

    const responseData = await response.json();
    
    // Backend returns:  { success: true, data:  { cart: {... } }, message: "..." }
    const backendCart:  BackendCart | null =
      responseData?. data?.cart || responseData?.data || null;

    if (!backendCart || !Array.isArray(backendCart.items)) {
      return { items: [], total:  0 };
    }

    const items = backendCart. items.map(transformCartItem);
    return { 
      items, 
      total: backendCart.totalAmount || calculateTotal(items) 
    };
  } catch (error) {
    console. error("Error fetching cart:", error);
    return { items:  [], total: 0 };
  }
};

/**
 * Add item to cart
 * Backend expects: POST /api/v1/cart/items with body { deviceId, productId, qty }
 */
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
    headers: { "Content-Type":  "application/json" },
    body:  JSON.stringify({ 
      deviceId, 
      productId, 
      qty: quantity 
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Add to cart failed:", response.status, errorText);
    throw new Error(`Failed to add to cart: ${response.status}`);
  }

  const responseData = await response. json();
  
  // Backend returns:  { success: true, data: { cart:  {...} }, message: "Item added to cart" }
  const backendCart:  BackendCart | null = 
    responseData?. data?.cart || responseData?.data || null;

  if (! backendCart || ! Array.isArray(backendCart.items)) {
    // Return a fallback with the item we just added
    return {
      items: [
        {
          id: productId,
          productId,
          name,
          price,
          quantity,
          image,
        },
      ],
      total: price * quantity,
    };
  }

  const items = backendCart.items.map(transformCartItem);
  return { 
    items, 
    total:  backendCart.totalAmount || calculateTotal(items) 
  };
};

/**
 * Remove item from cart
 * Backend expects: DELETE /api/v1/cart/items/: itemId? deviceId=xxx
 */
export const removeFromCart = async (cartItemId: string): Promise<Cart> => {
  const deviceId = getDeviceId();
  const url = `${API_BASE_URL}/api/v1/cart/items/${cartItemId}? deviceId=${deviceId}`;

  const response = await fetch(url, { method: "DELETE" });

  if (!response.ok) {
    throw new Error(`Failed to remove from cart: ${response.status}`);
  }

  // Refetch to get latest server state
  return fetchCart();
};

/**
 * Update item quantity
 * Backend expects:  PUT /api/v1/cart/items/:itemId with body { deviceId, qty }
 */
export const updateCartQuantity = async (
  cartItemId:  string,
  quantity: number
): Promise<Cart> => {
  const deviceId = getDeviceId();

  if (quantity <= 0) {
    return removeFromCart(cartItemId);
  }

  const url = `${API_BASE_URL}/api/v1/cart/items/${cartItemId}`;

  const response = await fetch(url, {
    method:  "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON. stringify({ deviceId, qty: quantity }),
  });

  if (!response. ok) {
    throw new Error(`Failed to update cart item: ${response.status}`);
  }

  const responseData = await response.json();
  const backendCart: BackendCart | null = 
    responseData?.data?.cart || responseData?.data || null;

  if (!backendCart || !Array.isArray(backendCart. items)) {
    return fetchCart();
  }

  const items = backendCart.items.map(transformCartItem);
  return { 
    items, 
    total: backendCart.totalAmount || calculateTotal(items) 
  };
};

/**
 * Clear entire cart
 * Backend expects: DELETE /api/v1/cart?deviceId=xxx
 */
export const clearCart = async (): Promise<Cart> => {
  const deviceId = getDeviceId();
  const url = `${API_BASE_URL}/api/v1/cart?deviceId=${deviceId}`;

  try {
    await fetch(url, { method: "DELETE" });
  } catch {
    // Ignore errors
  }

  return { items: [], total:  0 };
};