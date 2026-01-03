// services/wishlist-service.ts
// Wishlist API with local fallback (device based)

export type WishlistItem = {
  id: string; // wishlist item _id
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

// ================= CONFIG =================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8018";

// ================= DEVICE ID =================

// get or create device id (used by backend)
const getDeviceId = (): string => {
  if (typeof window === "undefined") return "server";

  const key = "deviceId";
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

// ================= LOCAL STORAGE =================

const localKey = () => `wishlist:${getDeviceId()}`;

const getLocalWishlist = (): Wishlist => {
  if (typeof window === "undefined") return { items: [] };

  const raw = localStorage.getItem(localKey());
  return raw ? (JSON.parse(raw) as Wishlist) : { items: [] };
};

const saveLocalWishlist = (wishlist: Wishlist): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(localKey(), JSON.stringify(wishlist));
  } catch {
    // ignore
  }
};

// ================= BACKEND TYPES =================

interface BackendWishlistItem {
  _id: string;
  productId:
    | string
    | {
        _id: string;
        name: string;
        price: number;
        thumbnail?: string;
      };
  thumbnail?: string;
  addedAt?: string;
}

// ================= TRANSFORM =================

const transformWishlistItem = (
  item: BackendWishlistItem,
  localItems: WishlistItem[]
): WishlistItem => {
  const productId =
    typeof item.productId === "object" ? item.productId._id : item.productId;

  const localMatch = localItems.find((l) => l.productId === productId);

  if (typeof item.productId === "object") {
    return {
      id: item._id,
      productId,
      title: item.productId.name || localMatch?.title || "Product",
      price: `Rs. ${item.productId.price.toLocaleString("en-IN")}`,
      image:
        item.productId.thumbnail ||
        item.thumbnail ||
        localMatch?.image ||
        "/img/placeholder.webp",
    };
  }

  return {
    id: item._id,
    productId,
    title: localMatch?.title || "Product",
    price: localMatch?.price || "Rs. 0",
    image: localMatch?.image || "/img/placeholder.webp",
  };
};

// ================= API =================

// GET /wishlist
export const getWishlist = async (): Promise<Wishlist> => {
  const deviceId = getDeviceId();
  const localWishlist = getLocalWishlist();

  // SSR safety
  if (deviceId === "server") return localWishlist;

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/wishlist?deviceId=${deviceId}`
    );

    // backend failed → keep local
    if (!response.ok) return localWishlist;

    const data = await response.json();
    const backendItems: BackendWishlistItem[] =
      data?.data?.wishlist?.items ?? [];

    /**
     * 🚨 CRITICAL FIX
     * Backend may return empty even when local has data.
     * NEVER wipe local state in that case.
     */
    if (!backendItems.length) {
      return localWishlist;
    }

    const items = backendItems.map((item) =>
      transformWishlistItem(item, localWishlist.items)
    );

    const wishlist: Wishlist = { items };
    saveLocalWishlist(wishlist);

    return wishlist;
  } catch {
    return localWishlist;
  }
};

// POST /wishlist/items
export const addWishlistItem = async (
  product: ProductLike
): Promise<Wishlist> => {
  const deviceId = getDeviceId();
  const localWishlist = getLocalWishlist();

  const exists = localWishlist.items.some(
    (i) => i.productId === product.productId
  );

  // optimistic local update
  if (!exists) {
    localWishlist.items.push({
      id: product.productId, // temp id (replaced after fetch)
      productId: product.productId,
      title: product.title,
      price: product.price,
      image: product.image,
    });
    saveLocalWishlist(localWishlist);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/wishlist/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deviceId,
        productId: product.productId,
      }),
    });

    if (!response.ok) return localWishlist;

    // refetch to get real wishlistItem _id
    return getWishlist();
  } catch {
    return localWishlist;
  }
};

// DELETE /wishlist/items/:wishlistItemId
export const removeWishlistItem = async (
  wishlistItemId: string
): Promise<Wishlist> => {
  const deviceId = getDeviceId();
  const localWishlist = getLocalWishlist();

  // optimistic local remove
  localWishlist.items = localWishlist.items.filter(
    (i) => i.id !== wishlistItemId
  );
  saveLocalWishlist(localWishlist);

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/wishlist/items/${wishlistItemId}?deviceId=${deviceId}`,
      { method: "DELETE" }
    );

    if (!response.ok) return localWishlist;

    return getWishlist();
  } catch {
    return localWishlist;
  }
};

// DELETE /wishlist
export const clearWishlist = async (): Promise<Wishlist> => {
  const deviceId = getDeviceId();
  const emptyWishlist: Wishlist = { items: [] };

  saveLocalWishlist(emptyWishlist);

  try {
    await fetch(`${API_BASE_URL}/api/v1/wishlist?deviceId=${deviceId}`, {
      method: "DELETE",
    });
  } catch {
    // ignore
  }

  return emptyWishlist;
};
