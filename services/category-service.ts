// services/category-service.ts

export interface Category {
  id: string;
  title: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  isActive: boolean;
  type: "category" | "collection" | "priceStrip";
}

interface BackendCategory {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  isActive: boolean;
  type: "category" | "collection" | "priceStrip";
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8018";

/* --------------------------------------------------
   INTERNAL CACHE
-------------------------------------------------- */
let categoryCache: Map<string, Category> | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 1000 * 60 * 10;

/* --------------------------------------------------
   TRANSFORM
-------------------------------------------------- */
const transformCategory = (backend: BackendCategory): Category => ({
  id: backend._id,
  title: backend.title,
  slug: backend.slug,
  description: backend.description,
  thumbnail: backend.thumbnail,
  isActive: backend.isActive,
  type: backend.type,
});

/* --------------------------------------------------
   FETCH CATEGORIES (FIXED ENDPOINT)
-------------------------------------------------- */
export const fetchCategories = async (): Promise<Category[]> => {
  try {
    // ✅ FIX: product-categories (plural)
    const url = `${API_BASE_URL}/api/v1/product-categories?isActive=true&type=category`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch categories ${res.status}`);
    }

    const json = await res.json();
    const items: BackendCategory[] = json?.data?.items ?? [];

    return items.map(transformCategory);
  } catch (err) {
    console.error("fetchCategories failed", err);
    return [];
  }
};

/* --------------------------------------------------
   CACHE HANDLING
-------------------------------------------------- */
const ensureCache = async (): Promise<Map<string, Category>> => {
  const now = Date.now();

  if (categoryCache && now - cacheTimestamp < CACHE_TTL) {
    return categoryCache;
  }

  const categories = await fetchCategories();
  const map = new Map<string, Category>();

  for (const cat of categories) {
    map.set(cat.slug.toLowerCase(), cat);
  }

  categoryCache = map;
  cacheTimestamp = now;
  return map;
};

/* --------------------------------------------------
   PUBLIC HELPERS
-------------------------------------------------- */
export const getCategoryBySlug = async (
  slug: string
): Promise<Category | null> => {
  const cache = await ensureCache();
  return cache.get(slug.toLowerCase()) ?? null;
};

export const getCategoryIdBySlug = async (
  slug: string
): Promise<string | null> => {
  const cat = await getCategoryBySlug(slug);
  return cat?.id ?? null;
};

export const clearCategoryCache = (): void => {
  categoryCache = null;
  cacheTimestamp = 0;
};

/* --------------------------------------------------
   DISPLAY NAME
-------------------------------------------------- */
export const getCategoryDisplayName = (slug: string): string => {
  const map: Record<string, string> = {
    pendant: "Pendant",
    necklace: "Necklace",
    earring: "Earring",
    bracelet: "Bracelet",
    "jewelry-set": "Jewelry Set",
    ring: "Ring",
  };

  return map[slug] || slug.replace(/-/g, " ");
};
