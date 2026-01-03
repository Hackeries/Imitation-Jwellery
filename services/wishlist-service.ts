// services/wishlist-service.ts
// API-driven wishlist service with localStorage fallback

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8018";

const getDeviceId = (): string => {
  const key = "deviceId";
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem(key);
  if (!id) {
    id = `device-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
    try {
      localStorage.setItem(key, id);
    } catch {
      // localStorage not available
    }
  }
  return id;
};

const localKey = () => `wishlist:${getDeviceId()}`;

// Helper to get wishlist from localStorage
const getLocalWishlist = (): Wishlist => {
  if (typeof window === "undefined") return { items: [] };
  const raw = localStorage.getItem(localKey());
  return raw ? (JSON.parse(raw) as Wishlist) : { items: [] };
};

// Helper to save wishlist to localStorage
const saveLocalWishlist = (wl: Wishlist): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(localKey(), JSON.stringify(wl));
  } catch {
    // localStorage not available
  }
};

// Backend wishlist response types
interface BackendWishlistItem {
  _id?: string;
  productId:
    | string
    | { _id: string; name: string; price: number; thumbnail?: string };
  thumbnail?: string;
  addedAt?: string;
}

interface BackendWishlist {
  _id?: string;
  items: BackendWishlistItem[];
}

// Transform backend wishlist item to frontend format
const transformWishlistItem = (
  item: BackendWishlistItem,
  localItems: WishlistItem[]
): WishlistItem => {
  const productId =
    typeof item.productId === "object" ? item.productId._id : item.productId;

  // Try to find matching local item for title/price
  const localMatch = localItems.find((l) => l.productId === productId);

  if (typeof item.productId === "object") {
    return {
      id: item._id || productId,
      productId: productId,
      title: item.productId.name || localMatch?.title || "Product",
      price: `Rs. ${item.productId.price?.toLocaleString("en-IN") || "0"}`,
      image:
        item.productId.thumbnail ||
        item.thumbnail ||
        localMatch?.image ||
        "/img/placeholder.webp",
    };
  }

  return {
    id: item._id || productId,
    productId: productId,
    title: localMatch?.title || `Product ${productId.slice(0, 6)}`,
    price: localMatch?.price || "Rs. 0",
    image: item.thumbnail || localMatch?.image || "/img/placeholder.webp",
  };
};

/**
 * Get wishlist - tries API first, falls back to localStorage
 */
export const getWishlist = async (): Promise<Wishlist> => {
  const deviceId = getDeviceId();
  const localWishlist = getLocalWishlist();

  // For SSR, return empty
  if (deviceId === "server") return { items: [] };

  try {
    const url = `${API_BASE_URL}/api/v1/wishlist? deviceId=${deviceId}`;
    const response = await fetch(url);

    if (!response.ok) {
      // API not available, use localStorage
      return localWishlist;
    }

    const data = await response.json();
    const backendWishlist: BackendWishlist | null =
      data.data?.wishlist || data.data || null;

    if (!backendWishlist || !Array.isArray(backendWishlist.items)) {
      return localWishlist;
    }

    // Transform and merge with local data for title/price info
    const items = backendWishlist.items.map((item) =>
      transformWishlistItem(item, localWishlist.items)
    );

    const wishlist: Wishlist = { items };

    // Sync to localStorage
    saveLocalWishlist(wishlist);

    return wishlist;
  } catch {
    // API error, use localStorage fallback
    return localWishlist;
  }
};

/**
 * Add item to wishlist
 */
export const addWishlistItem = async (
  product: ProductLike
): Promise<Wishlist> => {
  const deviceId = getDeviceId();
  const localWishlist = getLocalWishlist();

  // Optimistically add to local first
  if (!localWishlist.items.some((i) => i.productId === product.productId)) {
    localWishlist.items.push({
      id: product.productId,
      productId: product.productId,
      title: product.title,
      price: product.price,
      image: product.image,
    });
    saveLocalWishlist(localWishlist);
  }

  try {
    const url = `${API_BASE_URL}/api/v1/wishlist/items`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deviceId,
        productId: product.productId,
      }),
    });

    if (!response.ok) {
      // API failed, return local state
      return localWishlist;
    }

    // Refetch to get synced state
    return getWishlist();
  } catch {
    // API error, return local state
    return localWishlist;
  }
};

/**
 * Remove item from wishlist
 */
export const removeWishlistItem = async (
  idOrProductId: string
): Promise<Wishlist> => {
  const deviceId = getDeviceId();
  const localWishlist = getLocalWishlist();

  // Find the item to get its ID
  const item = localWishlist.items.find(
    (i) => i.id === idOrProductId || i.productId === idOrProductId
  );

  // Optimistically remove from local
  localWishlist.items = localWishlist.items.filter(
    (i) => i.id !== idOrProductId && i.productId !== idOrProductId
  );
  saveLocalWishlist(localWishlist);

  try {
    const itemId = item?.id || idOrProductId;
    const url = `${API_BASE_URL}/api/v1/wishlist/items/${itemId}? deviceId=${deviceId}`;
    const response = await fetch(url, { method: "DELETE" });

    if (!response.ok) {
      return localWishlist;
    }

    return getWishlist();
  } catch {
    return localWishlist;
  }
};

/**
 * Clear entire wishlist
 */
export const clearWishlist = async (): Promise<Wishlist> => {
  const deviceId = getDeviceId();
  const emptyWishlist: Wishlist = { items: [] };

  // Clear local immediately
  saveLocalWishlist(emptyWishlist);

  try {
    const url = `${API_BASE_URL}/api/v1/wishlist?deviceId=${deviceId}`;
    await fetch(url, { method: "DELETE" });
  } catch {
    // Ignore API errors
  }

  return emptyWishlist;
};
